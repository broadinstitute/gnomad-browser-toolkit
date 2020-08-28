import { ClassificationType, HierarchicalClassification, SimpleClassification } from './types'

export type SimpleNodeIdGeneratorInputs = {
  classification: string
  classificationType: ClassificationType.Simple
} & ({ type: 'classification' } | { type: 'category'; category: string })

export type HierarchicalIdGeneratorInputs = {
  classification: string
  classificationType: ClassificationType.Hierarchical
} & ({ type: 'category'; path: string[] } | { type: 'classification' })

// This assumes that the $ character doesn't appear in any word:
const hierarchicalNodeIdMajorSeparator = '$$$'
const hierarchicalNodeIdMinorSeparator = '$$'

export const generateNodeId = (
  input: SimpleNodeIdGeneratorInputs | HierarchicalIdGeneratorInputs
): string => {
  if (input.classificationType === ClassificationType.Simple) {
    const categoryPhrase = input.type === 'classification' ? '' : input.category
    return `simple$${input.classification}$${categoryPhrase}`
  }
  let categoryPhrase: string
  if (input.type === 'classification') {
    categoryPhrase = ''
  } else {
    categoryPhrase = input.path.map(elem => elem + hierarchicalNodeIdMinorSeparator).join('')
  }
  return `hierarchical${hierarchicalNodeIdMajorSeparator}${input.classification}${hierarchicalNodeIdMajorSeparator}${categoryPhrase}`
}

const simpleNodeIdPattern = /^simple\$([^$]+)\$([^$]*)$/
const hierarchicalNodeIdPattern = /^hierarchical\${3}([^$]+)\${3}(([^$]*\${2})*)$/
export const parseNodeId = (
  input: string
): SimpleNodeIdGeneratorInputs | HierarchicalIdGeneratorInputs => {
  if (input.startsWith('simple') === true) {
    const matched = input.match(simpleNodeIdPattern)
    if (matched === null) {
      throw new Error(`Cannot parse simple node id ${input}`)
    } else {
      const classification = matched[1]
      const rawCategory = matched[2]
      if (rawCategory === '') {
        return {
          classification,
          classificationType: ClassificationType.Simple,
          type: 'classification',
        }
      }
      return {
        classification,
        classificationType: ClassificationType.Simple,
        type: 'category',
        category: rawCategory,
      }
    }
  } else if (input.startsWith('hierarchical') === true) {
    const matched = input.match(hierarchicalNodeIdPattern)
    if (matched === null) {
      throw new Error(`Cannot parse hierarchical node id ${input}`)
    } else {
      const classification = matched[1]
      const rawCategory = matched[2]

      if (rawCategory === '') {
        return {
          classification,
          classificationType: ClassificationType.Hierarchical,
          type: 'classification',
        }
      }
      if (rawCategory !== '') {
        const path = rawCategory.split(hierarchicalNodeIdMinorSeparator).filter(elem => elem !== '')
        return {
          classification,
          classificationType: ClassificationType.Hierarchical,
          type: 'category',
          path,
        }
      }
      throw new Error(`Cannot parse hierarchical node id ${input}`)
    }
  } else {
    throw new Error(`Invalid node id ${input}`)
  }
}

interface DisplayedSimpleClassification {
  nodeId: string
  name: string
  categories: {
    name: string
    nodeId: string
    color: string
    // The label shown to the user in the TreeView
    displayedLabel: string
  }[]
}

export const getDisplayedSimpleClassification = <Item>({
  name: classificationName,
  categories,
}: SimpleClassification<Item>): DisplayedSimpleClassification => {
  const classificationNodeId = generateNodeId({
    type: 'classification',
    classificationType: ClassificationType.Simple,
    classification: classificationName,
  })

  const processedCategories = categories.map(({ name: categoryName, itemCount, color }) => {
    const nodeId = generateNodeId({
      type: 'category',
      classificationType: ClassificationType.Simple,
      classification: classificationName,
      category: categoryName,
    })
    return {
      name: categoryName,
      displayedLabel: `${categoryName} (${itemCount})`,
      nodeId,
      color,
    }
  })

  return {
    nodeId: classificationNodeId,
    name: classificationName,
    categories: processedCategories,
  }
}

interface DisplayedHierarchicalCategoryShared {
  nodeId: string
  name: string
  itemCount: number
}
interface DisplayedHierarchicalCategoryBranch extends DisplayedHierarchicalCategoryShared {
  hasChildren: true
  children: DisplayedHierarchicalCategory[]
}
interface DisplayedHierarchicalCategoryLeaf extends DisplayedHierarchicalCategoryShared {
  hasChildren: false
  color: string
}

export type DisplayedHierarchicalCategory =
  | DisplayedHierarchicalCategoryBranch
  | DisplayedHierarchicalCategoryLeaf
interface DisplayedHierarchicalClassification {
  nodeId: string
  name: string
  categories: DisplayedHierarchicalCategory[]
  leafCategories: DisplayedHierarchicalCategory[]
  branchCategories: DisplayedHierarchicalCategory[]
}

export const getDisplayedHierarchicalCategories = <Item>({
  name: classificationName,
  categories,
}: HierarchicalClassification<Item>) => {
  const result: DisplayedHierarchicalCategory[] = []
  let leafCategories: DisplayedHierarchicalCategory[] = []
  const branchCategories: DisplayedHierarchicalCategory[] = []
  const categoryLookup = new Map<string, DisplayedHierarchicalCategory>()
  for (const category of categories) {
    if (category.path.length === 1) {
      const nodeId = generateNodeId({
        type: 'category',
        classificationType: ClassificationType.Hierarchical,
        classification: classificationName,
        path: category.path,
      })
      const item: DisplayedHierarchicalCategory = {
        nodeId,
        name: category.path[0],
        itemCount: category.itemCount,
        hasChildren: false,
        color: category.color,
      }
      categoryLookup.set(nodeId, item)
      result.push(item)
      leafCategories.push(item)
    } else {
      for (let i = category.path.length - 1; i > 0; i -= 1) {
        const childIndex = i
        const childNodeId = generateNodeId({
          type: 'category',
          classificationType: ClassificationType.Hierarchical,
          classification: classificationName,
          path: category.path.slice(0, childIndex + 1),
        })
        const foundChild = categoryLookup.get(childNodeId)
        let child: DisplayedHierarchicalCategory
        if (foundChild === undefined) {
          if (childIndex === category.path.length - 1) {
            child = {
              nodeId: childNodeId,
              name: category.path[childIndex],
              itemCount: category.itemCount,
              hasChildren: false,
              color: category.color,
            }
            categoryLookup.set(childNodeId, child)
            leafCategories.push(child)
          } else {
            throw new Error(
              `This child with nodeId ${childNodeId} should have been previously created as a parent in a previous loop iteration`
            )
          }
        } else {
          child = foundChild
        }

        const parentIndex = i - 1
        const parentNodeId = generateNodeId({
          type: 'category',
          classificationType: ClassificationType.Hierarchical,
          classification: classificationName,
          path: category.path.slice(0, parentIndex + 1),
        })
        const foundParent = categoryLookup.get(parentNodeId)
        let parent: DisplayedHierarchicalCategory
        if (foundParent === undefined) {
          parent = {
            nodeId: parentNodeId,
            name: category.path[parentIndex],
            itemCount: 0,
            hasChildren: true,
            children: [],
          }
          if (parentIndex === 0) {
            result.push(parent)
          }
          categoryLookup.set(parentNodeId, parent)
          branchCategories.push(parent)
        } else {
          parent = foundParent
        }
        if (parent.hasChildren === true) {
          const found = parent.children.find(({ nodeId }) => nodeId === childNodeId)
          if (found === undefined) {
            parent.children.push(child)
          }
        } else {
          // Convert the leaf to a branch:
          ;((parent as unknown) as DisplayedHierarchicalCategoryBranch).hasChildren = true
          ;((parent as unknown) as DisplayedHierarchicalCategoryBranch).children = [child]
          delete parent.color
          // Also remove from list of leaves and add to list of branches:
          leafCategories = leafCategories.filter(({ nodeId }) => nodeId !== parentNodeId)
          branchCategories.push(parent)
        }
        parent.itemCount += category.itemCount
      }
    }
  }
  return {
    categoriesAsList: result,
    categoriesLookup: categoryLookup,
    leafCategories,
    branchCategories,
  }
}

export const serializeHierarchicalPath = (path: string[]) => path.join('$-$')

export const getDisplayedHierarchicalClassification = <Item>(
  classification: HierarchicalClassification<Item>
): DisplayedHierarchicalClassification => {
  const result = getDisplayedHierarchicalCategories(classification)
  return {
    name: classification.name,
    nodeId: generateNodeId({
      type: 'classification',
      classification: classification.name,
      classificationType: ClassificationType.Hierarchical,
    }),
    categories: result.categoriesAsList,
    leafCategories: result.leafCategories,
    branchCategories: result.branchCategories,
  }
}
