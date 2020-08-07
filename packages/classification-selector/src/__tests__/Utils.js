import { generateNodeId, parseNodeId } from '../Utils'
import { ClassificationType } from '../types'

describe('node id generators and parsers', () => {
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
  test('hierarchical classification at category level', () => {
    const inputs = {
      type: 'category',
      classificationType: ClassificationType.Hierarchical,
      classification: 'hierarchical-classification',
      category: 'category 1-2--1',
      level: 2,
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
