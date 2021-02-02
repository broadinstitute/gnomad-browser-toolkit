/* eslint-disable max-classes-per-file */
/* eslint-disable react/prefer-stateless-function */

import React from 'react'
import { FixedSizeListProps } from 'react-window'
import { StyledComponent, ThemedStyledFunction } from 'styled-components'

/* Start of components exported by Button.js */
export const BaseButton: StyledComponent<
  'button',
  unknown,
  {
    type: 'button'
  },
  'type'
>
export const Button: StyledComponent<
  'button',
  unknown,
  {
    type: 'button'
  } & {
    backgroundColor: string
    borderColor: string
  },
  'type' | 'backgroundColor' | 'borderColor'
>
export const PrimaryButton: StyledComponent<
  'button',
  unknown,
  {
    type: 'button'
  } & {
    backgroundColor: string
    borderColor: string
    textColor: string
  },
  'type' | 'backgroundColor' | 'borderColor' | 'textColor'
>
export const TextButton: StyledComponent<
  'button',
  unknown,
  {
    type: 'button'
  },
  'type'
>
/* End of components exported by Button.js */

/* Start of components exported by CategoryFilterControl.js */
export interface FilterControlCategory {
  id: string
  label: string
  className?: string
  color: string
}
export interface CategoryFilterControlProps {
  categories: FilterControlCategory[]
  categorySelections: { [categoryId: string]: boolean }
  className?: string
  id: string
  onChange: (categorySelections: { [categoryId: string]: boolean }) => void
  style: React.CSSProperties
}
export const CategoryFilterControl: React.ComponentType<CategoryFilterControlProps>
/* End of components exported by CategoryFilterControl.js */

/* Start of components exported by Badge.js */
export interface BadgeProps {
  children: React.ReactNode
  level?: 'error' | 'info' | 'success' | 'warning'
  tooltip?: string
}
export const Badge: React.ComponentType<BadgeProps>
/* End of components exported by Badge.js */

/* Start of components exported by Checkbox.js */
export interface CheckboxProps {
  checked: boolean
  disabled?: boolean
  id: string
  label: string
  onChange: (isChecked: boolean) => void
}

export const Checkbox: React.ComponentType<CheckboxProps>
/* End of components exported by Checkbox.js */

/* Start of components exported by Combobox.js */
export interface ComboboxOption {
  label: string
}
export interface ComboboxProps<Option extends ComboboxOption> {
  id?: string
  onChange: (value: string) => void
  onSelect: (option: Option) => void
  options: Option[]
  placeholder?: string
  renderOption: (option: Option) => React.ReactNode
  value: string
  width?: string
}
export class Combobox<Option extends ComboboxOption = ComboboxOption> extends React.Component<
  ComboboxProps<Option>
> {}
/* End of components exported by Combobox.js */

/* Start of components exported by Grid.js */
export interface GridColumnRenderer<RowDatum, CellDatum> {
  (rowDatum: RowDatum, columnKey: string, cellData: CellDatum): React.ReactNode
}

export interface GridColumn<RowDatum, CellDatum> {
  heading?: string
  key: string
  isRowHeader?: boolean
  isSortable?: boolean
  minWidth?: number
  tooltip?: string
  render: GridColumnRenderer<RowDatum, CellDatum>
}
export interface GridProps<RowDatum, CellDatum> {
  columns: GridColumn<RowDatum, CellDatum>[]
  cellData?: CellDatum
  data: RowDatum[]
  numRowsRendered?: number
  onHoverRow?: (rowIndex: number) => void
  onRequestSort?: (columnKey: string) => void
  onScroll?: FixedSizeListProps['onScroll']
  onVisibleRowsChange?: (range: { startIndex: number; stopIndex: number }) => void
  rowHeight?: number
  rowKey?: (rowDatum: RowDatum) => string
  shouldHighlightRow?: (rowDatum: RowDatum) => boolean
  sortKey?: string
  sortOrder?: 'ascending' | 'descending'
}

export class Grid<RowDatum, CellData = unknown> extends React.Component<
  GridProps<RowDatum, CellData>
> {}
/* End of components exported by Grid.js */

/* Start of components exported by Input.js */
export const Input: StyledComponent<'input', unknown, unknown, never>
/* End of components exported by Input.js */

/* Start of components exported by KeyboardShortcut.js */
export interface KeyboardShortcutProps {
  keys: string[]
  handler: () => void
}
export const KeyboardShortcut: React.ComponentType<KeyboardShortcutProps>
/* End of components exported by KeyboardShortcut.js */

/* Start of components exported by Link.js */
export const Link: StyledComponent<'a', unknown, unknown, never>
export const ExternalLink: ThemedStyledFunction<
  'a',
  unknown,
  {
    rel: 'noopener noreferrer'
    target: '_blank'
  },
  'target' | 'rel'
>
/* End of components exported by Link.js */

/* Start of components exported by List.js */
export const List: StyledComponent<'ul', unknown, unknown, never>
export const ListItem: StyledComponent<'li', unknown, unknown, never>
export const OrderedList: StyledComponent<'ol', unknown, unknown, never>
/* End of components exported by List.js */

/* Start of components exported by Modal.js */
export interface ModalProps {
  children?: React.ReactNode
  footer?: React.ReactNode
  id?: string
  onRequestClose: React.MouseEventHandler
  size: 'small' | 'medium' | 'large'
  title: string
}
export const Modal: React.ComponentType<ModalProps>
/* End of components exported by Modal.js */

/* Start of components exported by Page.js */
export const Page: StyledComponent<'div', unknown, unknown, never>
export interface PageHeadingProps {
  className?: string
  renderPageControl?: () => React.ReactNode
  children: React.ReactNode
}
export const PageHeading: React.ComponentType<PageHeadingProps>
/* End of components exported by Page.js */

/* Start of components exported by Searchbox.js */
interface SearchboxItem<Value> {
  label: string
  value: Value
}

export interface SearchboxProps<Value> {
  fetchSearchResults: (query: string) => Promise<SearchboxItem<Value>[]>
  id?: string
  onSelect: (itemValue: Value, item: SearchboxItem<Value>) => void
  placeholder?: string
  width?: number
}

export class Searchbox<Value> extends React.Component<SearchboxProps<Value>> {}
/* End of components exported by Searchbox.js */

/* Start of components exported by SearchInput.js */
export interface SearchInputProps {
  placeholder?: string
  onChange: (value: string) => void
  value?: string
}
export const SearchInput: React.ComponentType<SearchInputProps>
/* End of components exported by SearchInput.js */

/* Start of components exported by SegmentedControl.js */
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
/* End of components exported by SegmentedControl.js */

/* Start of components exported by Select.js */
export const Select: StyledComponent<'select', unknown, unknown, never>
/* End of components exported by Select.js */

/* Start of components exported by Table.js */
export const BaseTable: StyledComponent<'table', unknown, unknown, never>
/* End of components exported by Table.js */

/* Start of components exported by Tabs.js */
export interface Tab {
  id: string
  label: string
  render: () => React.ReactNode
}
export interface TabsProps {
  activeTabId?: string
  tabs: Tab[]
  onChange: (tabId: string) => void
}
export const Tabs: React.ComponentType<TabsProps>
/* End of components exported by Tabs.js */

/* Start of components exported by DefaultTooltip.js */
export interface DefaultTooltipProps {
  tooltip: string | React.ReactNode
}
export const DefaultTooltip: React.ComponentType<DefaultTooltipProps>
/* End of components exported by DefaultTooltip.js */

/* Start of components exported by TooltipAnchor.js */
export interface TooltipAnchorProps {
  children: React.ReactNode
  tooltipComponent?: React.ElementType
}
export const TooltipAnchor: React.ComponentType<TooltipAnchorProps>
/* End of components exported by TooltipAnchor.js */

/* Start of components exported by TooltipHint.js */
export const TooltipHint: StyledComponent<'span', unknown, unknown, never>
/* End of components exported by TooltipHint.js */
