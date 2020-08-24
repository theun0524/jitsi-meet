import axios from "axios";
import { API_URL, AUTH_API } from "../config";
import { toState } from "../features/base/redux";

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

export function login(form, stateful) {
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
