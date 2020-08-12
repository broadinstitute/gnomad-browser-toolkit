import ClassificationViewer from './ClassificationViewer'
import useClassificationSelectorState from './useClassificationSelectorState'

export type {
  Classification,
  Predicate,
  HierarchicalClassification,
  SimpleClassification,
  SimpleCategory,
  HierarchicalCategory,
} from './types'
export { useClassificationSelectorState }
export { ClassificationType } from './types'

export default ClassificationViewer
