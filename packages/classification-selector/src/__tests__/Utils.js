import { generateNodeId, parseNodeId, getDisplayedHierarchicalCategories } from '../Utils'
import { ClassificationType } from '../types'

describe('simple classification node id generator/parser', () => {
  test('simple classification at category level', () => {
    const inputs = {
      type: 'category',
      classificationType: ClassificationType.Simple,
      classification: 'simple-classification',
      category: 'category 1',
    }
    expect(parseNodeId(generateNodeId(inputs))).toEqual(inputs)
  })
  test('simple classification at classification level', () => {
    const inputs = {
      type: 'classification',
      classificationType: ClassificationType.Simple,
      classification: 'simple-classification',
    }
    expect(parseNodeId(generateNodeId(inputs))).toEqual(inputs)
  })
})

describe('simple classification node id generator/parser', () => {
  test('hierarchical classification at category level 1', () => {
    const inputs = {
      type: 'category',
      classificationType: ClassificationType.Hierarchical,
      classification: 'hierarchical-classification',
      path: ['category 1-1--1'],
    }
    expect(parseNodeId(generateNodeId(inputs))).toEqual(inputs)
  })
  test('hierarchical classification at category level 2', () => {
    const inputs = {
      type: 'category',
      classificationType: ClassificationType.Hierarchical,
      classification: 'hierarchical-classification',
      path: ['category 1-1--1', 'category 1-1--2'],
    }
    expect(parseNodeId(generateNodeId(inputs))).toEqual(inputs)
  })
  test('hierarchical classification at classification level', () => {
    const inputs = {
      type: 'classification',
      classificationType: ClassificationType.Hierarchical,
      classification: 'hierarchical-classification',
    }
    expect(parseNodeId(generateNodeId(inputs))).toEqual(inputs)
  })
})

describe('getDisplayedHierarchicalCategories', () => {
  test('One category of depth one', () => {
    const classification = {
      name: 'hierarchical classification',
      type: ClassificationType.Hierarchical,
      categories: [{ path: ['category 2-1--1'], itemCount: 1, color: '#f0027f' }],
    }
    const expected = [
      {
        nodeId: generateNodeId({
          type: 'category',
          classificationType: ClassificationType.Hierarchical,
          classification: 'hierarchical classification',
          path: ['category 2-1--1'],
        }),
        name: 'category 2-1--1',
        itemCount: 1,
        hasChildren: false,
        color: '#f0027f',
      },
    ]
    const { categoriesAsList: actual } = getDisplayedHierarchicalCategories(classification)
    expect(actual).toEqual(expected)
  })
  test('Only one deep path', () => {
    const classification = {
      name: 'hierarchical classification',
      type: ClassificationType.Hierarchical,
      categories: [
        {
          path: ['category 2-1--1', 'category 2-2--1', 'category 2-3--2', 'category 2-4--1'],
          itemCount: 1,
          color: '#f0027f',
        },
      ],
    }
    const expected = [
      {
        nodeId: generateNodeId({
          type: 'category',
          classificationType: ClassificationType.Hierarchical,
          classification: 'hierarchical classification',
          path: ['category 2-1--1'],
        }),
        name: 'category 2-1--1',
        itemCount: 1,
        hasChildren: true,
        children: [
          {
            nodeId: generateNodeId({
              type: 'category',
              classificationType: ClassificationType.Hierarchical,
              classification: 'hierarchical classification',
              path: ['category 2-1--1', 'category 2-2--1'],
            }),
            name: 'category 2-2--1',
            itemCount: 1,
            hasChildren: true,
            children: [
              {
                nodeId: generateNodeId({
                  type: 'category',
                  classificationType: ClassificationType.Hierarchical,
                  classification: 'hierarchical classification',
                  path: ['category 2-1--1', 'category 2-2--1', 'category 2-3--2'],
                }),
                name: 'category 2-3--2',
                itemCount: 1,
                hasChildren: true,
                children: [
                  {
                    nodeId: generateNodeId({
                      type: 'category',
                      classificationType: ClassificationType.Hierarchical,
                      classification: 'hierarchical classification',
                      path: [
                        'category 2-1--1',
                        'category 2-2--1',
                        'category 2-3--2',
                        'category 2-4--1',
                      ],
                    }),
                    name: 'category 2-4--1',
                    itemCount: 1,
                    hasChildren: false,
                    color: '#f0027f',
                  },
                ],
              },
            ],
          },
        ],
      },
    ]
    const { categoriesAsList: actual } = getDisplayedHierarchicalCategories(classification)
    expect(actual).toEqual(expected)
  })

  test('Multiple one-deep paths', () => {
    const classification = {
      name: 'hierarchical classification',
      type: ClassificationType.Hierarchical,
      categories: [
        { path: ['category 1-1--1'], itemCount: 2, color: '#7fc97f' },
        { path: ['category 1-1--2'], itemCount: 7, color: '#fdc086' },
        { path: ['category 2-1--1'], itemCount: 1, color: '#f0027f' },
      ],
    }
    const expected = [
      {
        nodeId: generateNodeId({
          type: 'category',
          classificationType: ClassificationType.Hierarchical,
          classification: 'hierarchical classification',
          path: ['category 1-1--1'],
        }),
        name: 'category 1-1--1',
        itemCount: 2,
        hasChildren: false,
        color: '#7fc97f',
      },
      {
        nodeId: generateNodeId({
          type: 'category',
          classificationType: ClassificationType.Hierarchical,
          classification: 'hierarchical classification',
          path: ['category 1-1--2'],
        }),
        name: 'category 1-1--2',
        itemCount: 7,
        hasChildren: false,
        color: '#fdc086',
      },
      {
        nodeId: generateNodeId({
          type: 'category',
          classificationType: ClassificationType.Hierarchical,
          classification: 'hierarchical classification',
          path: ['category 2-1--1'],
        }),
        name: 'category 2-1--1',
        itemCount: 1,
        hasChildren: false,
        color: '#f0027f',
      },
    ]
    const { categoriesAsList: actual } = getDisplayedHierarchicalCategories(classification)
    expect(actual).toEqual(expected)
  })
  test('General case', () => {
    const classification = {
      name: 'hierarchical classification',
      type: ClassificationType.Hierarchical,
      categories: [
        { path: ['category 1-1--1'], itemCount: 2, color: '#7fc97f' },
        { path: ['category 1-1--2', 'category 1-2--1'], itemCount: 2, color: '#beaed4' },
        { path: ['category 1-1--2', 'category 1-2--2'], itemCount: 2, color: '#fdc086' },
        {
          path: ['category 1-1--2', 'category 1-2--3', 'category 1-3--1'],
          itemCount: 2,
          color: '#ffff99',
        },
        {
          path: ['category 1-1--2', 'category 1-2--3', 'category 1-3--2'],
          itemCount: 1,
          color: '#386cb0',
        },
        {
          path: ['category 2-1--1', 'category 2-2--1', 'category 2-3--2', 'category 2-4--1'],
          itemCount: 1,
          color: '#f0027f',
        },
      ],
    }

    const expected = [
      {
        nodeId: generateNodeId({
          type: 'category',
          classificationType: ClassificationType.Hierarchical,
          classification: 'hierarchical classification',
          path: ['category 1-1--1'],
        }),
        name: 'category 1-1--1',
        itemCount: 2,
        hasChildren: false,
        color: '#7fc97f',
      },
      {
        nodeId: generateNodeId({
          type: 'category',
          classificationType: ClassificationType.Hierarchical,
          classification: 'hierarchical classification',
          path: ['category 1-1--2'],
        }),
        name: 'category 1-1--2',
        itemCount: 7,
        hasChildren: true,
        children: [
          {
            nodeId: generateNodeId({
              type: 'category',
              classificationType: ClassificationType.Hierarchical,
              classification: 'hierarchical classification',
              path: ['category 1-1--2', 'category 1-2--1'],
            }),
            name: 'category 1-2--1',
            itemCount: 2,
            hasChildren: false,
            color: '#beaed4',
          },
          {
            nodeId: generateNodeId({
              type: 'category',
              classificationType: ClassificationType.Hierarchical,
              classification: 'hierarchical classification',
              path: ['category 1-1--2', 'category 1-2--2'],
            }),
            name: 'category 1-2--2',
            itemCount: 2,
            hasChildren: false,
            color: '#fdc086',
          },
          {
            nodeId: generateNodeId({
              type: 'category',
              classificationType: ClassificationType.Hierarchical,
              classification: 'hierarchical classification',
              path: ['category 1-1--2', 'category 1-2--3'],
            }),
            name: 'category 1-2--3',
            itemCount: 3,
            hasChildren: true,
            children: [
              {
                nodeId: generateNodeId({
                  type: 'category',
                  classificationType: ClassificationType.Hierarchical,
                  classification: 'hierarchical classification',
                  path: ['category 1-1--2', 'category 1-2--3', 'category 1-3--1'],
                }),
                name: 'category 1-3--1',
                itemCount: 2,
                hasChildren: false,
                color: '#ffff99',
              },
              {
                nodeId: generateNodeId({
                  type: 'category',
                  classificationType: ClassificationType.Hierarchical,
                  classification: 'hierarchical classification',
                  path: ['category 1-1--2', 'category 1-2--3', 'category 1-3--2'],
                }),
                name: 'category 1-3--2',
                itemCount: 1,
                hasChildren: false,
                color: '#386cb0',
              },
            ],
          },
        ],
      },
      {
        nodeId: generateNodeId({
          type: 'category',
          classificationType: ClassificationType.Hierarchical,
          classification: 'hierarchical classification',
          path: ['category 2-1--1'],
        }),
        name: 'category 2-1--1',
        itemCount: 1,
        hasChildren: true,
        children: [
          {
            nodeId: generateNodeId({
              type: 'category',
              classificationType: ClassificationType.Hierarchical,
              classification: 'hierarchical classification',
              path: ['category 2-1--1', 'category 2-2--1'],
            }),
            name: 'category 2-2--1',
            itemCount: 1,
            hasChildren: true,
            children: [
              {
                nodeId: generateNodeId({
                  type: 'category',
                  classificationType: ClassificationType.Hierarchical,
                  classification: 'hierarchical classification',
                  path: ['category 2-1--1', 'category 2-2--1', 'category 2-3--2'],
                }),
                name: 'category 2-3--2',
                itemCount: 1,
                hasChildren: true,
                children: [
                  {
                    nodeId: generateNodeId({
                      type: 'category',
                      classificationType: ClassificationType.Hierarchical,
                      classification: 'hierarchical classification',
                      path: [
                        'category 2-1--1',
                        'category 2-2--1',
                        'category 2-3--2',
                        'category 2-4--1',
                      ],
                    }),
                    name: 'category 2-4--1',
                    itemCount: 1,
                    hasChildren: false,
                    color: '#f0027f',
                  },
                ],
              },
            ],
          },
        ],
      },
    ]
    const { categoriesAsList: actual } = getDisplayedHierarchicalCategories(classification)
    expect(actual).toEqual(expected)
  })
})
