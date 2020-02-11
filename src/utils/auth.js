import React, { useContext } from "react";
import { ContextState } from "../context";
import axios from "axios"

const { API_URL } = process.env;

const authUtils = () => {
  // const [handleUserLogin, handleUserLogout, handleSignup] = useContext(
  //   ContextState
  // );

 function userLogin(user) {
    console.log("request user login ===>", user);
    axios({
      method: "get",
      url: `${API_URL}/user`,
      param: user
    })
      .then(response => {
        console.log(response);
      })
      .catch(error => {
        console.log(error);
      });
  };

  // const userSignup = () => {
  //   if (state.isPlaying) {
  //     state.audioPlayer.pause();
  //   } else {
  //     state.audioPlayer.play();
  //   }
  //   setState(state => ({ ...state, isPlaying: !state.isPlaying }));
  // };

  // const register = () => {
  //   const newIndex =
  //     (((state.currentTrackIndex + -1) % state.tracks.length) +
  //       state.tracks.length) %
  //     state.tracks.length;
  //   playTrack(newIndex);
  // };

  return {
    userLogin
  }
};

export default authUtils;
