/* eslint-disable react/prop-types */
import React, { PropTypes } from 'react'

import css from './styles.css'

const getHeader = field => <th key={`${field.title}-header-cell`}>{field.title}</th>

const abstractCellStyle = {
  paddingLeft: 20,
  paddingRight: 20,
}

const normalCellStyles = {
  string: {
    ...abstractCellStyle,
  },
  integer: {
    ...abstractCellStyle,
  },
  float: {
    ...abstractCellStyle,
  },
}

const specialCellStyles = {
  filter: {
    ...normalCellStyles.string,
  },
}

const tableCellStyles = {
  ...normalCellStyles,
  ...specialCellStyles,
}

const getFilterBackgroundColor = (filter) => {
  switch (filter) {
    case 'PASS':
      return '#85C77D'
    default:
      return '#F1FF87'
  }
}
const formatFitler = (filters, index) => filters.split('|').map(filter => (
  <span
    key={`${filter}${index}`}
    style={{
      border: '1px solid #000',
      marginLeft: 10,
      padding: '1px 2px 1px 2px',
      backgroundColor: getFilterBackgroundColor(filter),
    }}
  >
    {filter}
  </span>
))

const getDataCell = (dataKey, cellDataType, dataRow, i) => {
  switch (cellDataType) {
    case 'string':
      return (
        <td
          style={tableCellStyles[cellDataType]}
          key={`cell-${dataKey}-${i}`}
        >
          {dataRow[dataKey]}
        </td>
      )
    case 'float':
      return (
        <td
          style={tableCellStyles[cellDataType]}
          key={`cell-${dataKey}-${i}`}
        >
          {dataRow[dataKey].toPrecision(3)}
        </td>
      )
    case 'integer':
      return (
        <td
          style={tableCellStyles[cellDataType]}
          key={`cell-${dataKey}-${i}`}
        >
          {dataRow[dataKey]}
        </td>
      )
    case 'filter':
      return (
        <td
          style={tableCellStyles[cellDataType]}
          key={`cell-${dataKey}-${i}`}
        >
          {formatFitler(dataRow[dataKey], i)}
        </td>
      )
    default:
      return (
        <td
          style={tableCellStyles[cellDataType]}
          key={`cell-${dataKey}-${i}`}
        >
          {dataRow[dataKey]}
        </td>
      )
  }
}

const getDataRow = (tableConfig, dataRow, i) => {
  const cells = tableConfig.fields.map((field, i) =>
    getDataCell(field.dataKey, field.dataType, dataRow, i))
  return (
    <tr style={{ backgroundColor: '#e0e0e0' }} key={`row-${i}`}>
      {cells}
    </tr>
  )
}

const GenericTableTrack = ({
  title,
  width,
  height,
  tableConfig,
  tableData,
}) => {
  const headers = tableConfig.fields.map(field => getHeader(field))
  const rows = tableData.map((rowData, i) => getDataRow(tableConfig, rowData, i))

  return (
    <div className={css.track}>
      <div style={{ width: 1100 }}>
        <h3>{title}</h3>
        <table
          className={css.genericTableTrack}
          style={{
            // width: '100%',
            height,
          }}
        >
          <thead>
            <tr>
              {headers}
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
      </div>
    </div>
  )
}
GenericTableTrack.propTypes = {
  height: PropTypes.number.isRequired,
  width: PropTypes.number, // eslint-disable-line
  leftPanelWidth: PropTypes.number, // eslint-disable-line
  xScale: PropTypes.func, // eslint-disable-line
  positionOffset: PropTypes.func,  // eslint-disable-line
  tableConfig: PropTypes.object.isRequired,
  tableData: PropTypes.array.isRequired,
}

export default GenericTableTrack
