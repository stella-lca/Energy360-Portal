import { useContext } from "react";
import { ContextState } from "../context";
import axios from "axios";

const authUtils = () => {
  const { handleUserLogin, handleUserSignup, handleError } = useContext(
    ContextState
  );

  const userLogin = user => {
    axios({
      method: "get",
      url: "/api/user",
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
      url: "/api/user",
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
