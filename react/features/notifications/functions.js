// @flow

import Swal from 'sweetalert2';
import { toState } from '../base/redux';
import { NOTIFICATION_TYPE } from './constants';

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

export function showSweetAlert(props, t) {
    const {
        appearance,
        descriptionKey : text,
        titleKey : title,
        customClass,
    } = props;
    let confirmButtonText;

    switch (appearance) {
    case NOTIFICATION_TYPE.ERROR: {
        confirmButtonText = t('dialog.dismiss');
        break;
    }
    case NOTIFICATION_TYPE.WARNING: {
        confirmButtonText = t('dialog.OK');
        break;
    }
    default: {
        confirmButtonText = t('dialog.confirm');
        break;
    }
    }

    Swal.fire({
        title: t(title),
        text: t(text),
        icon: appearance,
        confirmButtonText,
        customClass
    });
}