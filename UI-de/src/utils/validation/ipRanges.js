import isIp from 'is-ip';

export default (value) => {
  if (!value) {
    return true;
  }
  const strArr = value.split('\n');
  if (!strArr.length) return false;
  for (const str of strArr) {
    const ips = str.split('-');
    if (!ips.length || ips.length > 2) return false;
    if (!isIp.v4(ips[0]) || !isIp.v4(ips[1])) return false;
  }
  return true;
};
