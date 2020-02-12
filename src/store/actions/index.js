import * as ACTION_TYPES from "./actionTypes";

export const login_success = (user) => {
  return {
    type: ACTION_TYPES.LOGIN_SUCCESS,
    payload: user
  };
};

export const login_failure = () => {
  return {
    type: ACTION_TYPES.LOGIN_FAILURE
  };
};

export const signup_success = profile => {
  return {
    type: ACTION_TYPES.SIGNUP_SUCCESS,
    payload: profile
  };
};

export const request_error = (error) => {
  return {
    type: ACTION_TYPES.REQUEST_ERROR,
    payload: error
  };
};
