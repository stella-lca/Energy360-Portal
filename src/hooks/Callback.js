import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import authUtils from "../utils/auth";

const Callback = () => {
  const location = useLocation();
  const history = useHistory();
  const { sendTracker } = authUtils();

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const success = params.get("success"); 
  const code =
    params.get("code") ||
    params.get("authCode") ||
    params.get("authorization_code") ||
    params.get("authorizationCode");

  const [status, setStatus] = useState({ loading: false, done: false, error: "" });

  useEffect(() => {
    // If utility says failure, do not call tracker
    if (success !== "true") return;

    // If success but no code, show a meaningful error
    if (!code) {
      setStatus({ loading: false, done: false, error: "Missing authorization code in callback." });
      return;
    }

    let mounted = true;

    (async () => {
      try {
        if (mounted) setStatus({ loading: true, done: false, error: "" });

        // Send auth payload to server to exchange/store whatever you need
        await sendTracker({ code });

        if (mounted) setStatus({ loading: false, done: true, error: "" });

        // Optional: redirect to dashboard after success
        // history.replace("/dashboard");
      } catch (e) {
        if (mounted)
          setStatus({
            loading: false,
            done: false,
            error: "Tracker request failed. Please try again."
          });
      }
    })();

    return () => {
      mounted = false;
    };
  }, [success, code, sendTracker, history]);

  const isSuccess = success === "true";
  const title = isSuccess ? "Thank You!" : "I am sorry!";
  const message = isSuccess
    ? status.loading
      ? "Finalizing authorization..."
      : status.done
        ? "Successfully Authenticated!"
        : status.error
          ? status.error
          : "Successfully Authenticated!"
    : "Authentication failed!";

  return (
    <div className="callback-container">
      <div className="parent">
        <h1>{title}</h1>
        <p>{message}</p>

        {!isSuccess && (
          <p style={{ opacity: 0.8 }}>
            If this keeps happening, go back and re-submit your scope selection.
          </p>
        )}
      </div>
    </div>
  );
};

export default Callback;

