import React, { Fragment } from 'react'
import ReactTable from 'react-table'

const getColumns = (data, onChangeHandler, isSelectedAll) => {
  const columns = []

  // Table header
  columns.push({
    Header: 'Day',
    accessor: 'name',
    maxWidth: 45,
  })

  for (let hour = 0; hour < 24; hour++) {
    const hourStr = hour.toString()

    columns.push({
      Header: hourStr.padStart(2, '0'),
      maxWidth: 29,
      Cell: (props) =>
        renderCheckboxField(props, data, onChangeHandler, isSelectedAll),
    })
  }

  // Table foot
  columns.push({
    Header: 'Action',
    maxWidth: 45,
    Cell: (props) =>
      renderCheckboxField(props, data, onChangeHandler, isSelectedAll),
  })

  return columns
}

const rows = [
  { id: 1, name: 'Mon' },
  { id: 2, name: 'Tue' },
  { id: 3, name: 'Wed' },
  { id: 4, name: 'Thu' },
  { id: 5, name: 'Fri' },
  { id: 6, name: 'Sat' },
  { id: 0, name: 'Sun' },
]

const DayPartingDesk = (props) => {
  return (
    <Fragment>
      {/* Select All checkbox*/}
      <div className="checkbox-control" style={{ marginBottom: '15px' }}>
        <input
          type="checkbox"
          id="select-all"
          checked={props.isSelectedAll}
          onChange={(e) => props.onSelectAllDays(e.target.checked)}
        />
        <label htmlFor="select-all">
          <div className="checkbox-control__indicator" />
          <span>Select All</span>
        </label>
      </div>
      {/* Scheduler table*/}
      <ReactTable
        manual
        minRows={0}
        pageSize={1}
        data={rows}
        columns={getColumns(
          props.data || [],
          props.onChangeHandler,
          props.isSelectedAll,
        )}
        pages={0}
        className="day-parting-desk"
        showPagination={false}
      />
    </Fragment>
  )
}

const renderCheckboxField = (
  input,
  dayParting,
  onChangeHandler,
  isSelectedAll,
) => {
  let checked = isSelectedAll

  if (dayParting && Object.keys(dayParting).length) {
    const hours = dayParting[input.original.name]

    if (hours) {
      checked =
        hours.includes(input.column.Header) ||
        (input.column.Header === 'Action' && hours.length === 24)
    }
  }

  return (
    <div className="checkbox-control">
      <input
        type="checkbox"
        id={input.original.id}
        name="time"
        checked={checked}
        onChange={(e) => onChangeHandler(input, e.target.checked)}
      />
      <label htmlFor={input.original.name}>
        <div className="checkbox-control__indicator" />
      </label>
    </div>
  )
}

export default DayPartingDesk
