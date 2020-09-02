import * as authApi from './AuthApi';
import tokenLocalStorage from './tokenLocalStorage';
import * as url from './url';

export default {
    ...authApi,
    ...tokenLocalStorage,
    ...url
};
