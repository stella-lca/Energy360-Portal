import * as ACTION_TYPES from '../actions/action_types'

export const initialState = {
  is_authenticated: false,
  profile: null
}

export const AuthReducer = (state = initialState, action) => {
    switch(action.type) {
      case ACTION_TYPES.LOGIN_SUCCESS:
        return {
          ...state,
          is_authenticated: true,
          profile: action.payload
        }
      case ACTION_TYPES.LOGIN_FAILURE:
        return {
          ...state,
          is_authenticated: false,
          profile: null
        }
      case ACTION_TYPES.SIGNUP_SUCCESS:
        return {
          ...state,
          is_authenticated: true,
          profile: action.payload
        }
      case ACTION_TYPES.SIGNUP_FAILURE:
        return {
          ...state,
          is_authenticated: false,
          profile: null
        }
      default:
        return state
    }
}
