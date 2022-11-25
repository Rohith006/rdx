// import normalizeGroupBy from '../normalizeGroupBy';

export default (reports, {groupName, currentReport}) => {
  const currentReportOrderValue = currentReport[groupName];
  let currentReportPlace;

  reports.forEach((report, i) => {
    if (report.index === currentReport.index) {
      currentReportPlace = i;
    }
  });

  const valueAfter = (reports[currentReportPlace + 1] ? reports[currentReportPlace + 1][groupName] : '');
  const valueBefore = (reports[currentReportPlace - 1] ? reports[currentReportPlace - 1][groupName] : '');

  let count = 0;
  if (currentReportOrderValue !== valueBefore && currentReportOrderValue === valueAfter) {
    for (let i = currentReportPlace + 1; i < reports.length; i++) {
      if ((reports[i] ? reports[i][groupName] : '') === (reports[i - 1] ? reports[i - 1][groupName] : '')) {
        count++;
      } else {
        break;
      }
    }
  }

  return (count + 1) || 1;
};

// experimental
// export default (reports, groupBy) => {
//     let normalizedGroupBy = normalizeGroupBy(groupBy);
//
//     let groupNamesSpanRules = normalizedGroupBy.map(groupName => {
//         let groupNameData = reports.map(report => report[groupName]);
//         let uniqueOrderValues = [...new Set(groupNameData)];
//         return uniqueOrderValues.map(uniqueOrderValue => {
//             let index;
//             reports.forEach((report, i) => {
//                 if(report[groupName] === uniqueOrderValue) {
//                     index = i;
//                 }
//             });
//
//             let spanLength = reports.filter(report => report[groupName] === uniqueOrderValue).length;
//
//             return {
//                 groupName,
//                 index,
//                 spanLength
//             };
//         });
//     });
//
//     return groupNamesSpanRules;
// }
// experimental

// experimental
// export default (reports, { groupName, currentReport, normalizedGroupBy }) => {
// let parentGroupName = normalizedGroupBy[normalizedGroupBy.indexOf(groupName) - 1];
// let parentGroupValues = reports.map(report => report[parentGroupName]);
// let uniqueParentGroupValuesCount = [...new Set(parentGroupValues)].length;
// let currentReportOrderValue = currentReport[groupName];
//
// let currentReportPlace;
//
// reports.forEach((report, i) => {
//     if(report.index === currentReport.index) {
//         currentReportPlace = i;
//     }
// });
//
// let valueAfter = (reports[currentReportPlace + 1] ? reports[currentReportPlace + 1][groupName] : '');
// let valueBefore = (reports[currentReportPlace - 1] ? reports[currentReportPlace - 1][groupName] : '');
//
// let count;
// if(currentReportOrderValue !== valueBefore && currentReportOrderValue === valueAfter) {
//     count = _.get(reports.filter(report => report[groupName] === currentReportOrderValue), 'length', null);
//     if(uniqueParentGroupValuesCount) {
//         count = count / uniqueParentGroupValuesCount;
//     }
// }

// return count || 1;
// };
// experimental
