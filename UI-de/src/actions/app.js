import {CHANGE_PAGINATION_VALUE, RESET_FORM_STATE, SET_ACTION_VALUE_EDIT} from '../constants/app';

export const setFormStateValueToEdit = () => ({type: SET_ACTION_VALUE_EDIT});
export const resetFormState = () => ({type: RESET_FORM_STATE});
export const changePaginationData = (limit, offset, page) => async (dispatch) => {
  dispatch({
    type: CHANGE_PAGINATION_VALUE,
    payload: {limit, offset, page},
  });
};
