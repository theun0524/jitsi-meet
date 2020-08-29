import axios from "axios";
import { API_URL, AUTH_API, BASE_TOKEN_URL } from "../config";
import { toState } from "../features/base/redux";
import { jitsiLocalStorage } from "@jitsi/js-utils";
import { getServerURL } from "../features/base/settings";

export function getAuthServerURL(stateful) {
  const state = toState(stateful);
  const serverUrl = getServerURL(state);
  return serverUrl;
}

export function getLocationURL(stateful) {
  const state = toState(stateful);
  const locationURL = state["features/base/connection"].locationURL;
  return `https://${locationURL._host}`;
}

function getAuthAPIURL(stateful) {
  const state = toState(stateful);
  const serverUrl = getAuthServerURL(state);
  return `${serverUrl}/${AUTH_API}`;
}

class TokenLocalStorage {
  constructor() {}

  getItem(stateful) {
    const url = getAuthServerURL(stateful);
    return jitsiLocalStorage.getItem(`token/${url}`);
  }

  getItemByURL(url) {
    if (url[url.length - 1] === "/") {
      url = url.substring(0, url.length - 1);
    }
    return jitsiLocalStorage.getItem(`token/${url}`);
  }

  setItem(token, stateful) {
    const url = getAuthServerURL(stateful);
    jitsiLocalStorage.setItem(`token/${url}`, token);
  }

  setItemByURL(url, token) {
    if (url[url.length - 1] === "/") {
      url = url.substring(0, url.length - 1);
    }
    return jitsiLocalStorage.setItem(`token/${url}`, token);
  }

  removeItem(stateful) {
    const url = getAuthServerURL(stateful);
    jitsiLocalStorage.removeItem(`token/${url}`);
  }

  removeItemByURL(url) {
    if (url[url.length - 1] === "/") {
      url = url.substring(0, url.length - 1);
    }
    return jitsiLocalStorage.removeItem(`token/${url}`);
  }
}

export const tokenLocalStorage = new TokenLocalStorage();

export function loginWithLocationURL(form, stateful) {
  const url = getLocationURL(stateful);
  return axios.post(`${url}/${AUTH_API}/login`, form, "login");
}

export function login(form, stateful) {
  return axios.post(`${getAuthAPIURL(stateful)}/login`, form);
}

export function logout(stateful) {
  return axios.get(`${getAuthAPIURL(stateful)}/logout`);
}

export function signup(form, stateful) {
  return axios.post(`${getAuthAPIURL(stateful)}/signup`, form);
}

export function passwordReset(form, stateful) {
  return axios.post(`${getAuthAPIURL(stateful)}/password-reset`, form);
}

export function updateAccount(form, stateful) {
  return axios.patch(`${getAuthAPIURL(stateful)}/account`, form);
}

export function passwordResetConfirm(form, stateful) {
  return axios.post(`${getAuthAPIURL(stateful)}/password-reset-confirm`, form);
}

export function updatePassword(form, stateful) {
  return axios.patch(`${getAuthAPIURL(stateful)}/password-reset-confirm`, form);
}
