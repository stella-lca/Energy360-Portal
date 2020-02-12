import * as ACTION_TYPES from '../actions/actionTypes'

export const initialState = {
  is_authenticated: false,
  profile: null,
  error: null
}

export const AuthReducer = (state = initialState, action) => {
    switch(action.type) {
      case ACTION_TYPES.LOGIN_SUCCESS:
        return {
          ...state,
          is_authenticated: true,
          profile: action.payload,
          error: null
        }
      case ACTION_TYPES.LOGIN_FAILURE:
        return {
          ...state,
          is_authenticated: false,
          profile: null,
          error: null
        }
      case ACTION_TYPES.SIGNUP_SUCCESS:
        return {
          ...state,
          is_authenticated: true,
          profile: action.payload,
          error: null
        }
      case ACTION_TYPES.REQUEST_ERROR:
        return {
          ...state,
          is_authenticated: false,
          profile: null,
          error: action.payload
        }
      default:
        return state
    }
}
