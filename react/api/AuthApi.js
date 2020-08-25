import axios from "axios";
import { API_URL, AUTH_API, BASE_TOKEN_URL } from "../config";
import { toState } from "../features/base/redux";
import { jitsiLocalStorage } from "@jitsi/js-utils";

function getServerURL(stateful) {
  const state = toState(stateful);

  const connection = state["features/base/connection"];
  if (connection && "locationURL" in connection) {
    const locationURL = connection.locationURL;
    if (
      locationURL &&
      locationURL._url &&
      locationURL._url.split("/").length > 2
    ) {
      const serverURL = locationURL._url.split("/");
      return serverURL[2];
    } else {
      return BASE_TOKEN_URL;
    }
  } else {
    return BASE_TOKEN_URL;
  }
}

function getServerAPIURL(stateful) {
  const state = toState(stateful);
  const { locationURL } = state["features/base/connection"];
  if (locationURL._url && locationURL._url.split("/").length > 2) {
    const serverURL = locationURL._url.split("/");
    return `https://${serverURL[2]}/${AUTH_API}`;
  } else {
    return API_URL;
  }
}

class TokenLocalStorage {
  constructor() {}

  getItem(stateful) {
    const url = getServerURL(stateful);
    return jitsiLocalStorage.getItem(`token/${getServerURL(url)}`);
  }

  setItem(token, stateful) {
    const url = getServerURL(stateful);
    jitsiLocalStorage.setItem(`token/${getServerURL(url)}`, token);
  }

  removeItem(stateful) {
    const url = getServerURL(stateful);
    jitsiLocalStorage.removeItem(`token/${getServerURL(url)}`);
  }
}

export const tokenLocalStorage = new TokenLocalStorage();

export function login(form, stateful) {
  console.log(`${getServerAPIURL(stateful)}/login`, form, "login");
  return axios.post(`${getServerAPIURL(stateful)}/login`, form);
}

export function logout(stateful) {
  return axios.get(`${getServerAPIURL(stateful)}/logout`);
}

export function signup(form, stateful) {
  return axios.post(`${getServerAPIURL(stateful)}/signup`, form);
}

export function passwordReset(form, stateful) {
  return axios.post(`${getServerAPIURL(stateful)}/password-reset`, form);
}

export function updateAccount(form, stateful) {
  return axios.patch(`${getServerAPIURL(stateful)}/account`, form);
}

export function passwordResetConfirm(form, stateful) {
  return axios.post(
    `${getServerAPIURL(stateful)}/password-reset-confirm`,
    form
  );
}

export function updatePassword(form, stateful) {
  return axios.patch(
    `${getServerAPIURL(stateful)}/password-reset-confirm`,
    form
  );
}
