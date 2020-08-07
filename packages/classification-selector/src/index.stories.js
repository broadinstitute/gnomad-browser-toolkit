import React from 'react'
import TestWrapper from './TestWrapper'
import { ClassificationType } from './types'

export default { title: 'Classification viewer' }

const simpleClassifications = [
  {
    name: 'simple classification',
    type: ClassificationType.Simple,
    categories: [
      { name: 'simple category 1', itemCount: 5 },
      { name: 'simple category 2', itemCount: 3 },
      { name: 'simple category 3', itemCount: 2 },
    ],
    getFilterPredicate: name => ({ simpleCategory }) => name === simpleCategory,
  },
]
const hierarchicalClassifications = [
  {
    name: 'hierarchical classification',
    type: ClassificationType.Hierarchical,
    categories: [
      { path: ['category 1-1--1'], itemCount: 2 },
      { path: ['category 1-1--2', 'category 1-2--1'], itemCount: 2 },
      { path: ['category 1-1--2', 'category 1-2--2'], itemCount: 2 },
      { path: ['category 1-1--2', 'category 1-2--3', 'category 1-3--1'], itemCount: 2 },
      { path: ['category 1-1--2', 'category 1-2--3', 'category 1-3--2'], itemCount: 1 },
      {
        path: ['category 2-1--1', 'category 2-2--1', 'category 2-3--2', 'category 2-4--1'],
        itemCount: 1,
      },
    ],
    getFilterPredicate: (name, level) => ({ hierarchicalClassification }) => {
      return hierarchicalClassification[level - 1] === name
    },
  },
]
const items = [
  {
    name: 'item a',
    simpleCategory: 'simple category 1',
    hierarchicalClassification: ['category 1-1--1'],
  },
  {
    name: 'item b',
    simpleCategory: 'simple category 1',
    hierarchicalClassification: ['category 1-1--2', 'category 1-2--1'],
  },
  {
    name: 'item c',
    simpleCategory: 'simple category 1',
    hierarchicalClassification: ['category 1-1--2', 'category 1-2--2'],
  },
  {
    name: 'item d',
    simpleCategory: 'simple category 2',
    hierarchicalClassification: ['category 1-1--2', 'category 1-2--3', 'category 1-3--1'],
  },
  {
    name: 'item e',
    simpleCategory: 'simple category 3',
    hierarchicalClassification: ['category 1-1--2', 'category 1-2--3', 'category 1-3--2'],
  },
  {
    name: 'item f',
    simpleCategory: 'simple category 1',
    hierarchicalClassification: [
      'category 2-1--1',
      'category 2-2--1',
      'category 2-3--2',
      'category 2-4--1',
    ],
  },
  {
    name: 'item g',
    simpleCategory: 'simple category 2',
    hierarchicalClassification: ['category 1-1--1'],
  },
  {
    name: 'item h',
    simpleCategory: 'simple category 3',
    hierarchicalClassification: ['category 1-1--2', 'category 1-2--1'],
  },
  {
    name: 'item i',
    simpleCategory: 'simple category 1',
    hierarchicalClassification: ['category 1-1--2', 'category 1-2--2'],
  },
  {
    name: 'item j',
    simpleCategory: 'simple category 2',
    hierarchicalClassification: ['category 1-1--2', 'category 1-2--3', 'category 1-3--1'],
  },
]

export const simpleClassification = () => (
  <TestWrapper items={items} classifications={simpleClassifications} />
)

export const hierarchicalClassification = () => (
  <TestWrapper items={items} classifications={hierarchicalClassifications} />
)

export const multipleClassifications = () => (
  <TestWrapper
    items={items}
    classifications={[...hierarchicalClassifications, ...simpleClassifications]}
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
  />
)
