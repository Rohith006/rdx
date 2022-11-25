import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { confirmAlert } from 'react-confirm-alert'
import { AgGridReact } from 'ag-grid-react'

import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-balham.css'
import 'react-confirm-alert/src/react-confirm-alert.css'

import CustomConfirm from '../common/Views/Confirm'
import { SvgDelete, SvgEdit } from '../common/Icons'
import { REMOVED, ADMIN, OWNER } from '../../constants/user'
import localization from '../../localization'
import { ADD_ADMINS, DELETE_USERS } from '../../constants/app'
import PaginationContainer from '../UI/ShowLinesDropdown'
import { changePaginationData } from '../../actions/app'
import { loadAllUsers } from '../../actions/users'
import PendingContainer from '../UI/PendingContainer2'
export default class Grid extends Component {
  constructor(props) {
    super(props)
    this.state = {
      frameworkComponents: {
        renderEditor: (props) => <RenderEditor {...this.props} {...props} />,
        userRenderer: this.userRenderer.bind(this),
        statusRenderer: this.statusRenderer.bind(this),
      },
      gridOptions: {
        pagination: true,
        rowHeight: 52,
        paginationPageSize: 10,
        paginationNumberFormatter: function (params) {
          return params.value.toLocaleString()
        },
        onGridReady: (params) => {
          this.gridApi = params.api
        },
        domLayout: 'autoHeight',
        suppressRowClickSelection: false,
        suppressDragLeaveHidesColumns: true,
        rowSelection: 'multiple',
        onCellClicked: (e) => {
          if (!this.props.auth.currentUser.permissions.includes(ADD_ADMINS))
            return
          switch (e.colDef.field) {
            case 'userEditor': {
              break
            }
            default: {
              this.props.history.push(`/users/${e.data.id}/edit`)
              break
            }
          }
        },
        onSelectionChanged: this.onSelectionChanged.bind(this),
      },
      columnDefs: [
        {
          headerName: localization.users.table.email,
          field: 'email',
          headerClass: 'ag-grid-header-cell',
        },
        {
          headerName: localization.users.table.name,
          field: 'name',
          headerClass: 'ag-grid-header-cell',
          cellRenderer: this.props.auth.currentUser.permissions.includes(
            ADD_ADMINS,
          )
            ? 'userRenderer'
            : '',
        },
        {
          headerName: localization.users.table.role,
          field: 'role',
          headerClass: 'ag-grid-header-cell',
        },
        {
          headerName: localization.users.table.status,
          field: 'status',
          cellRenderer: 'statusRenderer',
          headerClass: 'ag-grid-header-cell',
        },
        {
          headerName: localization.users.table.skype,
          field: 'skype',
          headerClass: 'ag-grid-header-cell',
        },
        {
          headerName: 'Action',
          field: 'userEditor',
          cellRenderer: 'renderEditor',
          width: 85,
        },
      ],
    }
  }

  render() {
    const { users,isRequestPending } = this.props
    return (
      <PendingContainer isPending={isRequestPending}>
        <div
          className="ag-theme-balham users"
          style={{
            boxSizing: 'border-box',
            width: '100%',
            borderTop: '1px solid rgba(68, 68, 68, 0.3)',
          }}
        >
          <AgGridReact
            columnDefs={this.state.columnDefs}
            rowData={users}
            deltaRowDataMode
            getRowNodeId={(data) => data.id}
            suppressRowClickSelection
            rowSelection="multiple"
            enableColResize
            enableSorting
            groupHeaders
            onFirstDataRendered={(params) => params.api.sizeColumnsToFit()}
            frameworkComponents={this.state.frameworkComponents}
            gridOptions={this.state.gridOptions}
            enableFilter
            resizable
            animateRows
            paginationNumberFormatter={this.state.paginationNumberFormatter}
          />
        </div>
      </PendingContainer>
    )
  }

  onSelectionChanged(event) {
    const rowCount = event.api.getSelectedNodes().length
    this.setState({
      rowSelected: rowCount > 0,
    })
  }

  userRenderer(params) {
    return (
      <Link to={`/users/${params.node.data.id}/edit`} className="adv-pub-name">
        {params.node.data.name}
      </Link>
    )
  }

  statusRenderer(params) {
    return (
      <span className={`status ${params.value.toLowerCase()}`}>
        {params.value.replace(/_/g, ' ').toLowerCase()}
      </span>
    )
  }
}

class RenderEditor extends Component {
  constructor(props) {
    super(props)
    this.onEdit = this.onEdit.bind(this)
    this.onDelete = this.onDelete.bind(this)
    this.submit = this.submit.bind(this)
  }

  submit() {
    const { data } = this.props
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <CustomConfirm
            onConfirm={this.onDelete}
            onClose={onClose}
            msg={localization.formatString(
              localization.confirm.deactivateUser,
              data.name,
            )}
          />
        )
      },
    })
  }

  async onDelete() {
    const { data } = this.props
    const obj = {}
    obj.ids = [data.id]
    obj.status = REMOVED
    // await this.props.actions.deleteAdmin(obj);
    await this.props.actions.updateAdminStatus(obj)
    this.props.actions.loadAdmins()
  }

  onEdit() {
    const { data, history } = this.props
    history.push(`/users/${data.id}/edit`)
  }

  render() {
    const { auth, data } = this.props
    return auth.currentUser.role === ADMIN &&
      data.role.toUpperCase() === OWNER ? null : (
      <div className="icon_cover">
        {!this.props.auth.currentUser.permissions.includes(
          ADD_ADMINS,
        ) ? null : (
          <span className="editor-control" onClick={this.onEdit}>
            <SvgEdit />
          </span>
        )}
        {!this.props.auth.currentUser.permissions.includes(
          DELETE_USERS,
        ) ? null : (
          <span className="editor-control ml2" onClick={this.submit}>
            <SvgDelete />
          </span>
        )}
      </div>
    )
  }
}

// const mapDispatchToProps = (dispatch) => ({
//   actions: bindActionCreators(
//     {
//       loadAllUsers,
//       changePaginationData,
//     },
//     dispatch,
//   ),
// })
