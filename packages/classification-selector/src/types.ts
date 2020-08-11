export enum ClassificationType {
  Simple,
  Hierarchical,
}

export interface Predicate<Item> {
  (item: Item): boolean
}

export interface SimpleCategory {
  name: string
  itemCount: number
  color: string
}
export interface SimpleClassification<Item> {
  name: string
  type: ClassificationType.Simple
  getFilterPredicate: (category: string) => Predicate<Item>
  categories: SimpleCategory[]
}

export interface HierarchicalCategory {
  path: string[]
  itemCount: number
  color: string
}
export interface HierarchicalClassification<Item> {
  name: string
  type: ClassificationType.Hierarchical
  getFilterPredicate: (category: string, level: number) => Predicate<Item>
  categories: HierarchicalCategory[]
}

export type Classification<Item> = HierarchicalClassification<Item> | SimpleClassification<Item>
