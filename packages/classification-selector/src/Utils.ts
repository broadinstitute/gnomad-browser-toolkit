import { ClassificationType } from './types'

export type SimpleNodeIdGeneratorInputs = {
  classification: string
  classificationType: ClassificationType.Simple
} & ({ type: 'classification' } | { type: 'category'; category: string })

export type HierarchicalIdGeneratorInputs = {
  classification: string
  classificationType: ClassificationType.Hierarchical
} & ({ type: 'category'; category: string; level: number } | { type: 'classification' })

// This assumes that the $ character doesn't appear in any word:
export const generateNodeId = (
  input: SimpleNodeIdGeneratorInputs | HierarchicalIdGeneratorInputs
): string => {
  if (input.classificationType === ClassificationType.Simple) {
    const categoryPhrase = input.type === 'classification' ? '' : input.category
    return `simple$${input.classification}$${categoryPhrase}`
  }
  const categoryPhrase = input.type === 'classification' ? '' : input.category
  const levelPhrase = input.type === 'classification' ? '' : input.level
  return `hierarchical$${input.classification}$level$${levelPhrase}$${categoryPhrase}`
}

const simpleNodeIdPattern = /^simple\$([^$]+)\$([^$]*)$/
const hierarchicalNodeIdPattern = /^hierarchical\$([^$]+)\$level\$([^$]*)\$([^$]*)$/
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
      const rawLevel = matched[2]
      const parsedLevel = Number.parseInt(rawLevel, 10)
      const rawCategory = matched[3]

      if (Number.isNaN(parsedLevel) === true && rawCategory === '') {
        return {
          classification,
          classificationType: ClassificationType.Hierarchical,
          type: 'classification',
        }
      }
      if (Number.isNaN(parsedLevel) === false && rawCategory !== '') {
        return {
          classification,
          classificationType: ClassificationType.Hierarchical,
          type: 'category',
          category: rawCategory,
          level: parsedLevel,
        }
      }
      throw new Error(`Cannot parse hierarchical node id ${input}`)
    }
  } else {
    throw new Error(`Invalid node id ${input}`)
  }
}

// export const generateSimpleNodeId = (input: SimpleNodeIdGeneratorInputs) => {
// }

// export const parseSimpleNodeId = (input: string): SimpleNodeIdGeneratorInputs => {
// }

// export const generateHierarchicalNodeId = (input: HierarchicalIdGeneratorInputs) => {
// }

// export const parseHierarchicalNodeId = (input: string): HierarchicalIdGeneratorInputs => {
// }
