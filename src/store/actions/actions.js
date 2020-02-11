import * as ACTION_TYPES from "./action_types";

export const login_success = () => {
  return {
    type: ACTION_TYPES.LOGIN_SUCCESS
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

export const signup_failure = () => {
  return {
    type: ACTION_TYPES.SIGNUP_FAILURE
  };
};
