import {normalizeGroupBy} from '../normalizers';
import getRowSpanLength from './getRowSpanLength';
import {ADVERTISERS, PUBLISHERS, CAMPAIGNS} from '../../constants/reports';

export default function(reports) {
  const {groupBy, tableType} = this.state;

  const normalizedGroupBy = normalizeGroupBy(groupBy);
  const spanColumns = normalizedGroupBy.slice(0, -1);

  // pinned rows
  if ([ADVERTISERS, PUBLISHERS, CAMPAIGNS].includes(tableType) && groupBy.length > 1) {
    spanColumns.push('id');
  }

  if (tableType === CAMPAIGNS && groupBy.length > 1) {
    spanColumns.push('advertiserId');
  }
  // pinned rows

  spanColumns.forEach((groupName) => {
    const allColumns = this.columnApi.getAllColumns();
    const col = allColumns.find((column) => column.colDef.field === groupName);
    if (col) {
      const colDef = col.getColDef();

      colDef.rowSpan = (params) => getRowSpanLength(reports, {groupName: groupName, currentReport: params.data});

      colDef.cellClassRules = {'cell-span': (params) => {
        return true;
      }};
      this.gridApi.refreshHeader();
    }
  });
};
