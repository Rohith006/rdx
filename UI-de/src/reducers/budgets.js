import {BUDGETS_REQUEST_PENDING, BUDGETS_REQUEST_FULFILLED, CREATE_BUDGET, DELETE_BUDGET, LOAD_BUDGETS, UPDATE_BUDGET} from '../constants/budgets';
import {RESET_REDUX_STATE} from '../constants/auth';

const initialState = {
  isRequestPending: false,
  budgetsList: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case BUDGETS_REQUEST_PENDING:
      return {
        ...state,
        isRequestPending: true,
      };
    case BUDGETS_REQUEST_FULFILLED:
      return {
        ...state,
        isRequestPending: false,
      };
    case CREATE_BUDGET:
      return {
        ...state,
        budgetsList: [...state.budgetsList, action.data.budget],
      };
    case DELETE_BUDGET:
      return {
        ...state,
        budgetsList: state.budgetsList.filter((budget) => !action.data.ids.find((id) => id === budget.campaignId)),
      };
    case LOAD_BUDGETS:
      return {
        ...state,
        budgetsList: action.data.budgets,
      };
    case UPDATE_BUDGET:
      return {
        ...state,
        budgetsList: state.budgetsList.map((budget) => budget.id === action.data.budget.id ? action.data.budget : budget),
      };
    case RESET_REDUX_STATE:
      return initialState;
    default:
      return state;
  }
};
