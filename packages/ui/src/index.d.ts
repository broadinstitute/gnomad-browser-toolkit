import React from 'react'
import { FixedSizeList, FixedSizeListProps } from 'react-window'
import { StyledComponent } from 'styled-components'

export interface ColumnRenderer<RowDatum, CellData> {
  (rowDatum: RowDatum, columnKey: string, cellData: CellData): React.ReactNode
}

export interface GridPropsColumn<RowDatum, CellData> {
  heading?: string
  key: string
  isRowHeader?: boolean
  isSortable?: boolean
  minWidth?: number
  tooltip?: string
  render: ColumnRenderer<RowDatum, CellData>
}
export interface GridProps<RowDatum, CellData> {
  columns: GridPropsColumn<RowDatum, CellData>[]
  cellData?: CellData
  data: RowDatum[]
  numRowsRendered?: number
  onHoverRow?: (rowIndex: number) => void
  onRequestSort?: (columnKey: string) => void
  onScroll?: FixedSizeListProps['onScroll']
  onVisibleRowsChange?: (range: {startIndex: number, stopIndex: number}) => void
  rowHeight?: number
  rowKey?: (rowDatum: RowDatum) => string
  shouldHighlightRow?: (rowDatum: RowDatum) => boolean
  sortKey?: string
  sortOrder?: 'ascending' | 'descending'
}

export class Grid<RowDatum, CellData = {}> extends React.Component<GridProps<RowDatum, CellData>> {}

interface Option<OptionValue extends boolean | number | string> {
  disabled?: boolean
  label?: string
  value: OptionValue
}
export interface SegmentedControlProps<OptionValue extends boolean | number | string> {
  backgroundColor?: string
  borderColor?: string
  disabled?: boolean
  id: string
  onChange: (value: OptionValue) => void
  options: Option<OptionValue>[]
  textColor?: string
  value: OptionValue
}

export class SegmentedControl<
  OptionValue extends boolean | number | string
> extends React.Component<SegmentedControlProps<OptionValue>> {}

export interface CheckboxProps {
  checked: boolean
  disabled?: boolean
  id: string
  label: string
  onChange: (isChecked: boolean) => void
}

export class Checkbox extends React.Component<CheckboxProps> {}

export const Link: StyledComponent<'a', any, {}, never>

interface SearchBoxItem<Value> {
  label: string
  value: Value
}

export interface SearchBoxProps<Value, Item extends SearchBoxItem<Value>> {
  fetchSearchResults: (query: string) => Promise<Item[]>
  id?: string
  onSelect: (itemValue: Value, item: Item) => void
  placeholder?: string
  width?: number
}

export class SearchBox<
  Value,
  Item extends SearchBoxItem<Value> = SearchBoxItem<Value>
> extends React.Component<SearchBoxProps<Value, Item>> {}
