import {
  USERS_REQUEST_PENDING,
  USERS_REQUEST_FULFILLED,
  LOAD_ADVERTISERS,
  LOAD_PUBLISHERS,
  LOAD_USERS,
  UPDATE_USER,
  DELETE_ADVERTISER,
  DELETE_PUBLISHER,
  CREATE_USER,
  UPDATE_PUBLISHER_STATUS,
  GET_USER_BY_ID,
  FILTER_BY_NAME,
  ACCOUNT_MANAGER,
  ADMIN,
  SET_MANAGERS,
  SET_ADMINS,
  RESET_CURRENT_USER,
  SET_CURRENT_PUBLISHER,
  SET_KEY_BY_ADMIN,
  UPDATE_ADVERTISER_STATUS,
  RESET_CURRENT_ADVERTISER,
  UPDATE_PUBLISHER,
  LOAD_ADVERTISER_DETAILS,
  RESET_CURRENT_PUBLISHER,
  LOAD_PUBLISHER_LIST_DROPDOWN,
  SET_API_KEY_TO_ADVERTISER_BY_ADMIN,
} from "../constants/user";
import { RESET_REDUX_STATE } from "../constants/auth";
import { LOAD_CURRENT_BILLING } from "../constants/billingDetails";

const initialState = {
  isRequestPending: false,
  usersList: [],
  managers: [],
  admins: [],
  advertisers: [],
  publishers: [],
  currentPublisher: {},
  currentAdvertiser: {},
  publisherListDropdown: [],
  count: 0,
  active: 0,
  advertisersCount: 0,
  pending: 0,
  rejected: 0,
  paused: 0,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case USERS_REQUEST_PENDING:
      return {
        ...state,
        isRequestPending: true,
      };
    case LOAD_PUBLISHER_LIST_DROPDOWN:
      return {
        ...state,
        publisherListDropdown: [
          ...state.publisherListDropdown,
          ...action.payload,
        ],
      };
    case USERS_REQUEST_FULFILLED:
      return {
        ...state,
        isRequestPending: false,
      };
    case LOAD_ADVERTISER_DETAILS:
      return {
        ...state,
        currentAdvertiser: action.payload,
      };
    case LOAD_ADVERTISERS:
      const list = [
        { label: "-", value: null },
        ...action.data.usersList.map((advertiser) => ({
          value: advertiser.id,
          label: advertiser.companyName || advertiser.name,
        })),
      ];
      return {
        ...state,
        advertisers: action.data.usersList,
        selectListAdvertisers: list,
        advertisersCount: action.data.count,
        advertiserActive: action.data.usersList.filter(
          (item) => item.status === "ACTIVE"
        ).length,
        advertiserPending: action.data.usersList.filter(
          (item) => item.status === "PENDING"
        ).length,
        advertiserPaused: action.data.usersList.filter(
          (item) => item.status === "PAUSED"
        ).length,
      };
    case LOAD_USERS:
      return {
        ...state,
        usersList: action.payload.usersList,
      };
    case LOAD_PUBLISHERS:
      return {
        ...state,
        publishers: action.data.usersList,
        count: action.data.count,
        active: action.data.usersList.filter((item) => item.status === "ACTIVE")
          .length,
        pending: action.data.usersList.filter(
          (item) => item.status === "PENDING"
        ).length,
        rejected: action.data.rejected,
        paused: action.data.usersList.filter((item) => item.status === "PAUSED")
          .length,
      };
    case DELETE_PUBLISHER:
      return {
        ...state,
        publishers: state.publishers.map((user) =>
          action.data.ids.find((id) => id === user.id)
            ? {
                ...user,
                status: "REMOVED",
              }
            : user
        ),
      };
    case DELETE_ADVERTISER:
      return {
        ...state,
        advertisers: state.advertisers.map((user) =>
          action.data.ids.find((id) => id === user.id)
            ? {
                ...user,
                status: "REMOVED",
              }
            : user
        ),
      };
    case UPDATE_USER:
      return {
        ...state,
        usersList: state.usersList.map((user) =>
          user.id === action.data.user.id ? action.data.user : user
        ),
      };
    case UPDATE_PUBLISHER:
      return {
        ...state,
        publishers: state.publishers.map((publisher) =>
          publisher.id === action.data.user.id ? action.data.user : publisher
        ),
      };
    case CREATE_USER:
      return {
        ...state,
        usersList: [...state.usersList, action.data.user],
      };
    case UPDATE_PUBLISHER_STATUS:
      return {
        ...state,
        publishers: state.publishers.map((user) =>
          action.data.ids.find((id) => id === user.id)
            ? {
                ...user,
                status: action.data.status,
              }
            : user
        ),
      };
    case UPDATE_ADVERTISER_STATUS:
      return {
        ...state,
        advertisers: state.advertisers.map((user) =>
          action.data.ids.find((id) => id === user.id)
            ? {
                ...user,
                status: action.data.status,
              }
            : user
        ),
      };
    case GET_USER_BY_ID: {
      if (!state.admins.length || !action.payload) {
        return state;
      }
      const clone = _.cloneDeep(
        state.admins.filter((user) => user.id === action.payload)[0]
      );
      const { permissions } = clone;
      const obj = {
        id: clone.id,
        role: clone.role,
        name: clone.name,
        skype: clone.skype,
        email: clone.email,
      };
      permissions &&
        permissions.forEach((item) => {
          obj[item] = true;
        });
      return {
        ...state,
        currentUser: obj,
      };
    }
    case FILTER_BY_NAME: {
      let list = null;
      if (action.payload) {
        list = state.admins.filter(
          (item) =>
            (item.name.includes(action.payload) ||
              item.email.includes(action.payload)) &&
            (item.role === ADMIN || item.role === ACCOUNT_MANAGER)
        );
      }
      return {
        ...state,
        filterValue: action.payload,
        filterList: list,
      };
    }
    case SET_ADMINS: {
      return {
        ...state,
        admins: [...action.payload],
      };
    }
    case SET_MANAGERS: {
      const list = [];
      // list = state.admins.filter(user => user.role === ACCOUNT_MANAGER);
      state.admins
        .filter((user) => user.role === ACCOUNT_MANAGER)
        .forEach((user) => {
          list.push({
            label: user.name,
            value: user.id,
            id: user.id,
            name: user.name,
          });
        });
      list.push({ label: "-", value: null });
      return {
        ...state,
        managers: list,
      };
    }
    case RESET_CURRENT_USER: {
      return {
        ...state,
        currentUser: null,
      };
    }
    case RESET_CURRENT_ADVERTISER: {
      return {
        ...state,
        currentAdvertiser: {},
      };
    }
    case SET_CURRENT_PUBLISHER: {
      return {
        ...state,
        currentPublisher: action.payload,
      };
    }
    case RESET_CURRENT_PUBLISHER: {
      return {
        ...state,
        currentPublisher: {},
      };
    }
    case SET_KEY_BY_ADMIN: {
      return {
        ...state,
        currentPublisher: Object.assign({}, state.currentPublisher, {
          apiKey: action.data.apiKey,
        }),
      };
    }
    case SET_API_KEY_TO_ADVERTISER_BY_ADMIN: {
      return {
        ...state,
        currentAdvertiser: Object.assign({}, state.currentAdvertiser, {
          apiKey: action.data.apiKey,
        }),
      };
    }
    case LOAD_CURRENT_BILLING: {
      return {
        ...state,
        currentAdvertiser: Object.assign({}, state.currentAdvertiser, {
          billing: action.payload,
        }),
      };
    }
    case RESET_REDUX_STATE:
      return initialState;
    default:
      return state;
  }
};
