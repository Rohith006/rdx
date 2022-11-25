export const groupDataExtract = (data) => {
  const datum =
    data?.grouped &&
    Object.entries(data?.grouped).map(([category, plugs], index) => plugs);
  let arr = [];
  datum.map((item) => arr.push(...item));
  return arr;
};
