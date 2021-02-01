/* eslint-disable no-param-reassign */
/* eslint-disable require-jsdoc */
import axios from 'axios';

import { toState } from '../features/base/redux';
import { getAuthServerURL, getLocationURL } from './url';

const AUTH_API = '/auth/api';

function getAuthAPIURL(stateful) {
    const state = toState(stateful);
    const serverUrl = getAuthServerURL(state);

    return AUTH_API.startsWith('http') ? AUTH_API : `${serverUrl}/${AUTH_API}`;
}

export function loginWithLocationURL(form, stateful) {
    if (AUTH_API.startsWith('http')) {
        return axios.post(`${AUTH_API}/login`, form, 'login');
    }

    const url = getLocationURL(stateful);

    return axios.post(`${url}/${AUTH_API}/login`, form, 'login');
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
