// @flow

import type { Dispatch } from 'redux';

import { toggleDialog } from '../base/dialog';
import { SecurityDialog } from './components/security-dialog';

import axios from 'axios';

import {
    SET_PUBLIC_SCOPE_ENABLED
} from './actionTypes';

/**
 * Action that triggers toggle of the security options dialog.
 *
 * @returns {Function}
 */
export function toggleSecurityDialog() {
    return function(dispatch: (Object) => Object) {
        dispatch(toggleDialog(SecurityDialog));
    };
}

export function toggleScope() {
    return function(dispatch: Dispatch<any>, getState: Function) {
        const value = getState()['features/base/conference'].roomInfo.scope;

        const baseURL = getState()['features/base/connection'].locationURL;
        const email = getState()['features/base/jwt'].user.email;
        const room_name = getState()['features/base/conference'].room;

        const AUTH_API_BASE = process.env.VMEETING_API_BASE;
        const apiBaseUrl = `${baseURL.origin}${AUTH_API_BASE}`;

        try{
            axios.post(`${apiBaseUrl}/conference/update-conference-scope`, {
                name: room_name,
                mail_owner: email,
                scope: !value
            }).then(conf => {
                dispatch(setPublicScopeEnabled(!value));
            });
        }
        catch(err){    
            console.log(err);
        }
    };
}

/**
 * Dispatches an action to set scope.
 *
 * @param {boolean} enabled - The new value to set scope.
 * @returns {{
 *      type: SET_PUBLIC_SCOPE_ENABLED,
 *      enabled: boolean
 * }}
 */
export function setPublicScopeEnabled(enabled: boolean) {
    return {
        type: SET_PUBLIC_SCOPE_ENABLED,
        enabled
    };
}