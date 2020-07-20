import axios from "axios";
import { API_URL } from "../config";

export function fetchCurrentUser() {
  return axios.get(`${API_URL}/current-user`, { withCredentials: true });
}

export function login(form) {
  return axios.post(`${API_URL}/login`, form);
}

export function logout() {
  return axios.get(`${API_URL}/logout`);
}

export function signup(form) {
  return axios.post(`${API_URL}/signup`, form);
}

export function passwordReset(form) {
  return axios.post(`${API_URL}/password-reset`, form);
}

export function updateAccount(form) {
  return axios.patch(`${API_URL}/account`, form);
}

export function passwordResetConfirm(form) {
  return axios.post(`${API_URL}/password-reset-confirm`, form);
}

export function updatePassword(form) {
  return axios.patch(`${API_URL}/password-reset-confirm`, form);
}
