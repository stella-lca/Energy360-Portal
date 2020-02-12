import { useContext } from "react";
import { ContextState } from "../context";
import axios from "axios";

const { API_URL } = process.env;

const authUtils = () => {
  const { handleUserLogin, handleUserSignup, handleError } = useContext(
    ContextState
  );

  const userLogin = user => {
    axios({
      method: "get",
      url: "user",
      baseURL: API_URL,
      params: user
    })
      .then(response => {
        const { status, data } = response;
        if (status === 200) {
          handleUserLogin(data);
        } else {
          handleError(data.message);
        }
      })
      .catch(error => {
        handleError("Request Error, Please try it later!");
      });
  };

  const userSignup = user => {
    axios({
      method: "post",
      url: "user",
      baseURL: API_URL,
      data: user
    })
      .then(response => {
        const { status, data } = response;

        if (status === 200) {
          handleUserSignup(data);
        } else {
          handleError(data.message);
        }
      })
      .catch(error => {
        handleError("Request Error, Please try it later!");
      });
  };

  return {
    userLogin,
    userSignup
  };
};

export default authUtils;
