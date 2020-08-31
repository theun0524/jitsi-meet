/* eslint-disable no-param-reassign */
/* eslint-disable require-jsdoc */
import { jitsiLocalStorage } from '@jitsi/js-utils';

import { getAuthServerURL } from './url';

class TokenLocalStorage {
    getItem(stateful) {
        const url = getAuthServerURL(stateful);

        return jitsiLocalStorage.getItem(`token/${url}`);
    }

    getItemByURL(url) {
        if (url[url.length - 1] === '/') {
            url = url.substring(0, url.length - 1);
        }

        return jitsiLocalStorage.getItem(`token/${url}`);
    }

    setItem(token, stateful) {
        const url = getAuthServerURL(stateful);

        jitsiLocalStorage.setItem(`token/${url}`, token);
    }

    setItemByURL(url, token) {
        if (url[url.length - 1] === '/') {
            url = url.substring(0, url.length - 1);
        }

        return jitsiLocalStorage.setItem(`token/${url}`, token);
    }

    removeItem(stateful) {
        const url = getAuthServerURL(stateful);

        jitsiLocalStorage.removeItem(`token/${url}`);
    }

    removeItemByURL(url) {
        if (url[url.length - 1] === '/') {
            url = url.substring(0, url.length - 1);
        }

        return jitsiLocalStorage.removeItem(`token/${url}`);
    }
}

const tokenLocalStorage = new TokenLocalStorage();

export default tokenLocalStorage;
