import * as subIdWhiteBlackListsConstants from '../constants/subIdWhiteBlackLists';
import * as authConstants from '../constants/auth';

const initialState = {
  isSubIdWhiteListRequestPending: false,
  isSubIdBlackListRequestPending: false,
  subIdWhiteList: [],
  subIdBlackList: [],
  subIds: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case subIdWhiteBlackListsConstants.SUBID_WHITE_LIST_REQUEST_PENDING:
      return {
        ...state,
        isSubIdWhiteListRequestPending: true,
      };
    case subIdWhiteBlackListsConstants.SUBID_BLACK_LIST_REQUEST_PENDING:
      return {
        ...state,
        isSubIdBlackListRequestPending: false,
      };
    case subIdWhiteBlackListsConstants.SUBID_WHITE_LIST_REQUEST_FULFILLED:
      return {
        ...state,
        isSubIdWhiteListRequestPending: true,
      };
    case subIdWhiteBlackListsConstants.SUBID_BLACK_LIST_REQUEST_FULFILLED:
      return {
        ...state,
        isSubIdBlackListRequestPending: true,
      };
    case subIdWhiteBlackListsConstants.CREATE_SUBID_WHITE_LIST_ITEM:
      return {
        ...state,
        isSubIdWhiteListRequestPending: false,
        subIds: [...action.data.subIdListItem],
      };
    case subIdWhiteBlackListsConstants.DELETE_SUBID_WHITE_LIST_ITEM:
      return {
        ...state,
        subIds: state.subIds.filter((subIdListItem) => subIdListItem.id !== action.data.id),
      };
    case subIdWhiteBlackListsConstants.DELETE_SUBID_BLACK_LIST_ITEM:
      return {
        ...state,
        subIds: state.subIds.filter((subIdListItem) => subIdListItem.id !== action.data.id),
      };
    case subIdWhiteBlackListsConstants.LOAD_SUBID_WHITE_LIST:
      return {
        ...state,
        isSubIdWhiteListRequestPending: false,
        subIds: action.data.subIdList,
      };
    case subIdWhiteBlackListsConstants.LOAD_SUBID_BLACK_LIST:
      return {
        ...state,
        subIds: action.data.subIdListItem,
      };
    case subIdWhiteBlackListsConstants.LOAD_LIMIT_COUNT_SUBID_BLACK_LIST:
      return {
        ...state,
        subIdLimitCountBlackList: action.data.subIdBlackListStatistic,
      };
    case authConstants.RESET_REDUX_STATE:
      return initialState;
    default:
      return state;
  }
};
