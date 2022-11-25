import axios from "axios";
import { reset } from "redux-form";
import { NotificationManager } from "react-notifications";
import {
  ADMIN,
  ACCOUNT_MANAGER,
  USERS_REQUEST_PENDING,
  USERS_REQUEST_FULFILLED,
  LOAD_USERS,
  DELETE_ADVERTISER,
  DELETE_PUBLISHER,
  UPDATE_PUBLISHER_STATUS,
  UPDATE_ADVERTISER_STATUS,
  GET_USER_BY_ID,
  FILTER_BY_NAME,
  SET_MANAGERS,
  SET_ADMINS,
  RESET_CURRENT_USER,
  SET_CURRENT_PUBLISHER,
  LOAD_ADVERTISERS,
  LOAD_PUBLISHERS,
  LOAD_ADVERTISER_DETAILS,
  RESET_CURRENT_ADVERTISER,
  UPDATE_PUBLISHER,
  RESET_CURRENT_PUBLISHER,
  OWNER,
  LOAD_PUBLISHER_LIST_DROPDOWN,
} from "../constants/user";
import querystring from "querystring";

export const loadPublishersListDropdown = () => async (dispatch) => {
  const { data } = await axios("/publishers/publishers-list-dropdown");
  try {
    dispatch({
      type: LOAD_PUBLISHER_LIST_DROPDOWN,
      payload: data,
    });
  } catch (e) {
    console.error(e);
  }
};

export const clearPublishers = () => async (dispatch) => {
  return dispatch({
    type: LOAD_PUBLISHERS,
    data: {
      usersList: [],
      count: 0,
      active: 0,
      pending: 0,
      paused: 0,
    },
  });
};

export const loadAdvertiserDetails = (advertiserId) => async (dispatch) => {
  dispatch({ type: USERS_REQUEST_PENDING });

  const params = { id: advertiserId };

  try {
    const { data } = await axios.get("/database/load/advertiser-details", {
      params,
    });

    dispatch({ type: LOAD_ADVERTISER_DETAILS, payload: data });
  } catch (error) {
    NotificationManager.error(error.response.data.error);
  } finally {
    dispatch({ type: USERS_REQUEST_FULFILLED });
  }
};

export const loadPublisherDetails = (id) => async (dispatch) => {
  dispatch({ type: USERS_REQUEST_PENDING });

  const params = { id: ~~id };

  try {
    const { data } = await axios.get("/database/load/publisher-details", {
      params,
    });

    dispatch({ type: SET_CURRENT_PUBLISHER, payload: data });
  } catch (error) {
    NotificationManager.error(error.response.data.error);
  } finally {
    dispatch({ type: USERS_REQUEST_FULFILLED });
  }
};

export const loadAdvertisers = (params) => async (dispatch) => {
  dispatch({
    type: USERS_REQUEST_PENDING,
  });
  const newParams = {};
  if (params) {
    newParams.limit = params.limit;
    newParams.offset = params.offset;
    if (params.selectedCountry) {
      newParams.selectedCountry = params.selectedCountry.value;
    }
    if (params.startDate) {
      newParams.startDate = params.startDate;
    }
    if (params.endDate) {
      newParams.endDate = params.endDate;
    }
    if (params.selectedStatus) {
      newParams.selectedStatus = params.selectedStatus.value;
    }
    if (params.selectedManager) {
      newParams.selectedManager = params.selectedManager.value;
    }
  } else {
    newParams.isName = true;
  }

  const paramsStr = newParams ? querystring.stringify(newParams) : "";

  try {
    const { data } = await axios.get(
      `/advertisers/advertisers-list?${paramsStr}`
    );

    dispatch({
      type: LOAD_ADVERTISERS,
      data: {
        usersList: data.users,
        count: data.count,
        active: data.active,
        pending: data.pending,
        paused: data.paused,
      },
    });
    dispatch({
      type: USERS_REQUEST_FULFILLED,
    });
    return data.users;
  } catch (e) {
    console.error(e);

    dispatch({
      type: USERS_REQUEST_FULFILLED,
    });
  }
};

export const loadPublishers = (params) => async (dispatch) => {
  dispatch({
    type: USERS_REQUEST_PENDING,
  });

  const newParams = {};
  if (params) {
    newParams.limit = params.limit;
    newParams.offset = params.offset;
    if (params.selectedTypeName) {
      newParams.selectedTypeName = params.selectedTypeName.value;
    }
    if (params.startDate) {
      newParams.startDate = params.startDate;
    }
    if (params.endDate) {
      newParams.endDate = params.endDate;
    }
    if (params.selectedStatus) {
      newParams.selectedStatus = params.selectedStatus.value;
    }
    if (params.selectedInventory) {
      newParams.selectedInventory = params.selectedInventory.value;
    }
    if (params.selectedManager) {
      newParams.selectedManager = params.selectedManager.value;
    }
    if (params.selectedProtocol) {
      newParams.selectedProtocol = params.selectedProtocol.value;
    }
    if (params.isName) {
      newParams.isName = params.isName;
    }
  } else {
    newParams.isName = true;
  }

  const paramsStr = newParams ? querystring.stringify(newParams) : "";

  try {
    const { data } = await axios.get(
      `/publishers/publishers-list?${paramsStr}`
    );
    dispatch({
      type: LOAD_PUBLISHERS,
      data: {
        usersList: data.users,
        count: data.count,
        active: data.active,
        pending: data.pending,
        paused: data.paused,
      },
    });
    dispatch({
      type: USERS_REQUEST_FULFILLED,
    });
    return data.users;
  } catch (e) {
    console.error(e);

    dispatch({
      type: USERS_REQUEST_FULFILLED,
    });
  }
};

export const loadAdmins = () => async (dispatch) => {
  dispatch({
    type: USERS_REQUEST_PENDING,
  });

  try {
    const { data } = await axios.get("/database/load/admins");
    dispatch({
      type: SET_ADMINS,
      payload: data,
    });
    dispatch({
      type: SET_MANAGERS,
    });
    dispatch({
      type: USERS_REQUEST_FULFILLED,
    });
  } catch (e) {
    console.error(e);

    dispatch({
      type: USERS_REQUEST_FULFILLED,
    });
  }
};

export const loadAllUsers = () => async (dispatch) => {
  dispatch({
    type: USERS_REQUEST_PENDING,
  });

  try {
    const { data } = await axios.get("/database/load/all-users");

    dispatch({
      type: LOAD_USERS,
      payload: data,
    });

    dispatch({
      type: USERS_REQUEST_FULFILLED,
    });
  } catch (e) {
    console.error(e);
    dispatch({
      type: USERS_REQUEST_FULFILLED,
    });
  }
};

export const updateAdvertiser = (data) => (dispatch) => {
  return axios
    .put("/database/update/advertiser", data)
    .then((response) => {
      const { user } = response.data;
      NotificationManager.success("Advertiser updated");
      /*        dispatch({
                    type: UPDATE_USER,
                    data: {user}
                });*/
    })
    .catch(() => {
      throw NotificationManager.error(`Server error`);
    });
};

export const updatePublisher = (data) => (dispatch) => {
  return axios
    .put("/database/update/publisher", data)
    .then((response) => {
      const { user } = response.data;
      NotificationManager.success("Publisher updated");
      dispatch({
        type: UPDATE_PUBLISHER,
        data: { user },
      });
    })
    .catch(() => {
      throw NotificationManager.error(`Server error`);
    });
};

export const updateManager = (data) => (dispatch) => {
  return axios.put("/database/update/admin", data).then((response) => {
    const { user } = response.data;
    NotificationManager.success(`User ${user.name} was updated`);
  });
};

export const deleteAdvertiser = (data) => async (dispatch) => {
  try {
    await axios
      .delete(`/database/delete/advertiser`, { data })
      .then((result) => {
        dispatch(reset("CreatePublisherForm"));
        if (!result.data.errors) {
          NotificationManager.success("Advertiser deleted!");
        } else {
          NotificationManager.error(`Error ${result.data.errors[0].message}`);
        }
      });

    dispatch({
      type: DELETE_ADVERTISER,
      data: {
        ids: data.ids,
      },
    });
  } catch (e) {
    console.error(e);
  }
};

export const deletePublisher = (data) => async (dispatch) => {
  try {
    await axios
      .delete(`/database/delete/publisher`, { data })
      .then((result) => {
        dispatch(reset("CreatePublisherForm"));
        if (!result.data.errors) {
          NotificationManager.success("Publisher deleted!");
        } else {
          NotificationManager.error(`Error ${result.data.errors[0].message}`);
        }
      });

    dispatch({
      type: DELETE_PUBLISHER,
      data: {
        ids: data.ids,
      },
    });
  } catch (e) {
    console.error(e);
  }
};

export const deleteAdmin = (data) => async (dispatch) => {
  try {
    await axios.delete("/database/delete/admin", { data }).then((result) => {
      dispatch(reset("CreatePublisherForm"));
      if (!result.data.errors) {
        NotificationManager.success("User deleted!");
      } else {
        NotificationManager.error(`Error ${result.data.errors[0].message}`);
      }
    });
  } catch (e) {
    console.error(e);
  }
};

export const updateAdminStatus = (data) => async (dispatch) => {
  try {
    await axios.put("/database/update/update-admin-status", data);
    NotificationManager.success("User status update!");
  } catch (e) {
    console.error(e);
  }
};

export const updatePublisherStatus = (data) => async (dispatch) => {
  try {
    await axios.put("/database/update/update-publisher-status", data);

    dispatch({
      type: UPDATE_PUBLISHER_STATUS,
      data,
    });
    return NotificationManager.success("Publisher status changed");
  } catch (e) {
    console.error(e);
  }
};

export const updateAdvertiserStatus = (data) => async (dispatch) => {
  try {
    await axios.put("/database/update/update-advertiser-status", data);

    dispatch({
      type: UPDATE_ADVERTISER_STATUS,
      data,
    });
    NotificationManager.success("Status has been changed");
  } catch (e) {
    console.error(e);
  }
};

export const createAdvertiser = (data) => () => {
  return axios
    .post("/database/create/advertiser", data)
    .then(async (response) => {
      NotificationManager.success("Advertiser created");
      await axios.put(`/advertiser/generate-api-key/${response.data.user.id}`);
    })
    .catch((err) => {
      const errorMsg = err.response ? err.response.data.error : `Server error`;
      throw NotificationManager.error(errorMsg);
    });
};

export const createPublisher = (data, history) => () => {
  return axios
    .post("/database/create/publisher", data)
    .then(() => {
      history.push(`/publishers`);
      NotificationManager.success("Publisher created");
    })
    .catch((err) => {
      if (err.response.status === 409) {
        NotificationManager.error(`Email is already used by another publisher`);
      } else if (err.response.status === 500) {
        NotificationManager.error(`value too long for type character varying`);
      } else {
        NotificationManager.success("Publisher created");
      }
    });
};

export const createAdmin = (data) => (dispatch) => {
  return axios
    .post("/database/create/admin", data)
    .then((response) => {
      const { user } = response.data;
      switch (user.role) {
        case ACCOUNT_MANAGER:
          NotificationManager.success("Account manager created");
          break;
        case ADMIN:
          NotificationManager.success("Administrator created");
          break;
        case OWNER:
          NotificationManager.success("Owner created");
          break;
        default:
          NotificationManager.warning("Something wrong happened");
      }
    })
    .catch((err) => {
      const errorMsg = err.response ? err.response.data.error : `Server error`;
      throw NotificationManager.error(errorMsg);
    });
};

export const createBillingDetailsByAdmin = (data) => (dispatch) => {
  return axios
    .post("/database/create/billing-details-by-admin", data)
    .then(({ data }) => {
      /* dispatch({
            type: CREATE_BILLING_DETAILS,
            data: {
                billingDetails: data
            }
        });*/
    });
};

export const getUserById = (id) => ({
  type: GET_USER_BY_ID,
  payload: Number(id),
});

export const resetCurrentUser = () => ({
  type: RESET_CURRENT_USER,
});

export const resetCurrentPublisher = () => ({
  type: RESET_CURRENT_PUBLISHER,
});

export const filterByName = (value) => ({
  type: FILTER_BY_NAME,
  payload: value,
});

const setManagers = () => ({
  type: SET_MANAGERS,
});

export const setPublisher = (id) => ({
  type: SET_CURRENT_PUBLISHER,
  payload: id,
});

export const resetCurrentAdvertiser = () => ({
  type: RESET_CURRENT_ADVERTISER,
});
