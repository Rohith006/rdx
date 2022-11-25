import React, {Component} from 'react';
import {AgGridReact} from 'ag-grid-react';
import localization from '../../localization/index';
import {SvgDelete} from '../common/Icons';

export default class GridList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      frameworkComponents: {
        renderEditor: this.props.renderEditor ? (props) => <this.props.renderEditor {...this.props} {...props}/> : (props) => <RenderEditor {...this.props} {...props}/>,
      },
      gridOptions: {
        rowHeight: 52,
        suppressRowClickSelection: false,
        localeText: {noRowsToShow: localization.table.noRowsToShow},
        suppressDragLeaveHidesColumns: true,
        rowSelection: 'multiple',
        domLayout: 'autoHeight',
      },
    };
  }

  render() {
    const {users, renderComponents} = this.props;
    const frameworkComponents = Object.assign(this.state.frameworkComponents, renderComponents);

    return (
      <div className="list-table w100 mt2">
        <div className="ag-theme-balham"
          style={{
            width: '100%',
            overflowY: 'auto',
          }}>
          <AgGridReact
            columnDefs={this.props.columnDefs}
            rowData={users}
            suppressRowClickSelection
            rowSelection="multiple"
            enableColResize
            enableSorting
            groupHeaders
            onFirstDataRendered={(params) => params.api.sizeColumnsToFit()}
            frameworkComponents={frameworkComponents}
            gridOptions={this.state.gridOptions}
          >
          </AgGridReact>
        </div>
      </div>
    );
  }
}

class RenderEditor extends Component {
  constructor(props) {
    super(props);
    this.onDelete = this.onDelete.bind(this);
  }

  async onDelete() {
    const {data, campaign} = this.props;
    const obj = {
      id: data.id,
      campaignId: campaign.id,
      publisherId: data.publisherId,
    };
    await this.props.remove(obj);
  }

  render() {
    return (
      <div className="icon_cover">
        <span className="editor" onClick={this.onDelete}> <SvgDelete/></span>
      </div>
    );
  }
}
