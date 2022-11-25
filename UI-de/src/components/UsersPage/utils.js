import {PERMISSIONS} from '../../constants/app';
import {ADMIN} from '../../constants/user';
import localization from '../../localization';
import {validateUserForm} from '../../utils/common';


export const validate = (values) => {
  const errors = validateUserForm(values);
  if (!values.role) {
    errors.role = localization.validate.required;
  }
  return errors;
};

export const getPermissions = (values) => {
  const permissions = [];
  if (values.role === ADMIN) {
    PERMISSIONS.forEach((item) => permissions.push(item));
  } else {
    for (const key in values) {
      if (Object.prototype.hasOwnProperty.call(values, key)) {
        if (PERMISSIONS.includes(key) && values[key]) {
          permissions.push(key);
        }
      }
    }
  }
  return permissions;
};
