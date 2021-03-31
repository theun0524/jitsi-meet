// @flow

import Swal from 'sweetalert2';
import { toState } from '../base/redux';
import { NOTIFICATION_TYPE } from './constants';
import { i18next } from '../base/i18n';

declare var interfaceConfig: Object;

/**
 * Tells whether or not the notifications are enabled and if there are any
 * notifications to be displayed based on the current Redux state.
 *
 * @param {Object|Function} stateful - The redux store state.
 * @returns {boolean}
 */
export function areThereNotifications(stateful: Object | Function) {
    const state = toState(stateful);
    const { enabled, notifications } = state['features/notifications'];

    return enabled && notifications.length > 0;
}

/**
 * Tells wether join/leave notifications are enabled in interface_config.
 *
 * @returns {boolean}
 */
export function joinLeaveNotificationsDisabled() {
    return Boolean(typeof interfaceConfig !== 'undefined' && interfaceConfig?.DISABLE_JOIN_LEAVE_NOTIFICATIONS);
}

export function showSweetAlert(props) {
    const {
        appearance,
        descriptionKey : text,
        titleKey : title,
        customClass,
    } = props;
    let confirmButtonText;

    switch (appearance) {
    case NOTIFICATION_TYPE.ERROR: {
        confirmButtonText = 'dialog.dismiss';
        break;
    }
    case NOTIFICATION_TYPE.WARNING: {
        confirmButtonText = 'dialog.OK';
        break;
    }
    default: {
        confirmButtonText = 'dialog.confirm';
        break;
    }
    }

    Swal.fire({
        title: i18next.t(title),
        text: i18next.t(text),
        icon: appearance,
        confirmButtonText: i18next.t(confirmButtonText),
        customClass
    });
}

export function showConfirmDialog(props) {
    return Swal.fire(props);
}