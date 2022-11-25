export const toFixedSummary = (summary) => {
  summary = {...summary};

  for (const key in summary) {
    if (!isNaN(summary[key]) && (summary[key] + '').split('.')[1] && (summary[key] + '').split('.')[1].length > 2) {
      summary[key] = parseFloat(summary[key].toFixed(2));
    }
  }

  return summary;
};
