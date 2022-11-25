import * as capsConstants from '../constants/caps'

const initialState = {
  isRequestPending: false,
  capsList: [],
}

export default (state = initialState, action) => {
  switch (action.type) {
    case capsConstants.CAPS_REQUEST_PENDING:
      return {
        ...state,
        isRequestPending: true,
      }
    case capsConstants.CAPS_REQUEST_FULFILLED:
      return {
        ...state,
        isRequestPending: false,
      }
    case capsConstants.LOAD_CAPS:
      return {
        ...state,
        capsList: action.data.capsList,
      }
    default:
      return state
  }
}
