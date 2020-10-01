import React from 'react'
import TestWrapper from './TestWrapper'
import { ClassificationType } from './types'

export default { title: 'Classification viewer' }

const simpleClassifications = [
  {
    name: 'simple classification',
    type: ClassificationType.Simple,
    categories: [
      { name: 'simple category 1', itemCount: 5, color: '#7fc97f' },
      { name: 'simple category 2', itemCount: 3, color: '#beaed4' },
      { name: 'simple category 3', itemCount: 2, color: '#fdc086' },
    ],
    getCategoryValueOfItem: ({ simpleCategory }) => simpleCategory,
  },
]
const hierarchicalClassifications = [
  {
    name: 'hierarchical classification',
    type: ClassificationType.Hierarchical,
    categories: [
      { path: ['category 1-1--1'], itemCount: 2, color: '#7fc97f' },
      { path: ['category 1-1--2', 'category 1-2--1'], itemCount: 3, color: '#beaed4' },
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
    getPathValueOfItem: item => item.hierarchicalClassifications,
  },
]
const items = [
  {
    name: 'item a',
    simpleCategory: 'simple category 1',
    hierarchicalClassifications: [['category 1-1--1'], ['category 1-1--2', 'category 1-2--1']],
  },
  {
    name: 'item b',
    simpleCategory: 'simple category 1',
    hierarchicalClassifications: [['category 1-1--2', 'category 1-2--1']],
  },
  {
    name: 'item c',
    simpleCategory: 'simple category 1',
    hierarchicalClassifications: [['category 1-1--2', 'category 1-2--2']],
  },
  {
    name: 'item d',
    simpleCategory: 'simple category 2',
    hierarchicalClassifications: [['category 1-1--2', 'category 1-2--3', 'category 1-3--1']],
  },
  {
    name: 'item e',
    simpleCategory: 'simple category 3',
    hierarchicalClassifications: [['category 1-1--2', 'category 1-2--3', 'category 1-3--2']],
  },
  {
    name: 'item f',
    simpleCategory: 'simple category 1',
    hierarchicalClassifications: [
      ['category 2-1--1', 'category 2-2--1', 'category 2-3--2', 'category 2-4--1'],
    ],
  },
  {
    name: 'item g',
    simpleCategory: 'simple category 2',
    hierarchicalClassifications: [['category 1-1--1']],
  },
  {
    name: 'item h',
    simpleCategory: 'simple category 3',
    hierarchicalClassifications: [['category 1-1--2', 'category 1-2--1']],
  },
  {
    name: 'item i',
    simpleCategory: 'simple category 1',
    hierarchicalClassifications: [['category 1-1--2', 'category 1-2--2']],
  },
  {
    name: 'item j',
    simpleCategory: 'simple category 2',
    hierarchicalClassifications: [['category 1-1--2', 'category 1-2--3', 'category 1-3--1']],
  },
]

export const simpleClassification = () => (
  <TestWrapper
    items={items}
    classifications={simpleClassifications}
    shouldAutoExpandFirstClassification={false}
  />
)

export const hierarchicalClassification = () => (
  <TestWrapper items={items} classifications={hierarchicalClassifications} />
)

export const multipleClassifications = () => (
  <TestWrapper
    items={items}
    classifications={[...hierarchicalClassifications, ...simpleClassifications]}
    shouldAutoExpandFirstClassification={false}
  />
)

const selectAllSelectNoneSimpleClassificationItems = [
  {
    name: 'item a',
    simpleCategory: 'simple category 1',
  },
  {
    name: 'item b',
    simpleCategory: 'simple category 2',
  },
  {
    name: 'item c',
    simpleCategory: 'simple category 3',
  },
]

export const selectAllOrNoneSimpleClassification = () => (
  <TestWrapper
    items={selectAllSelectNoneSimpleClassificationItems}
    classifications={[...simpleClassifications]}
    shouldAutoExpandFirstClassification={false}
  />
)

export const selectAllOrSelectNoneHierarchicalClassification = () => (
  <TestWrapper
    items={items}
    classifications={hierarchicalClassifications}
    shouldAutoExpandFirstClassification={false}
  />
)

export const autoExpand = () => (
  <TestWrapper
    items={items}
    classifications={simpleClassifications}
    shouldAutoExpandFirstClassification
  />
)
