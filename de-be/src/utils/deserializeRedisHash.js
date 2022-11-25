export default (obj) => {
  obj = {...obj};

  Object.keys(obj).forEach((key) => {
    if (obj[key] === 'null') {
      obj[key] = null;
    } else if (obj[key] === 'false') {
      obj[key] = false;
    } else if (obj[key] === 'true') {
      obj[key] = true;
    } else if (!isNaN(obj[key])) {
      obj[key] = +obj[key];
    }
  });

  return obj;
};
