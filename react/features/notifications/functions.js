// @flow
/* global APP */

import Swal from 'sweetalert2';
import { toState } from '../base/redux';
import { NOTIFICATION_TYPE } from './constants';
import { i18next } from '../base/i18n';
import { showToolbox } from '../toolbox/actions.web';

declare var interfaceConfig: Object;

const Toast = Swal.mixin({
    toast: true,
    position: 'bottom-start',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: false,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
});

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
 * Tells whether join/leave notifications are enabled in interface_config.
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
        descriptionArguments : args,
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

    APP.store.dispatch(showToolbox());
    Swal.fire({
        confirmButtonText: i18next.t(confirmButtonText),
        customClass,
        icon: appearance,
        text: i18next.t(text, args),
        title: i18next.t(title),
    });
}

export function showToast(props) {
    const {
        animation = true,
        icon = 'success',
        position = 'bottom-start',
        timeout = 3000,
        title,
    } = props;

    APP.store.dispatch(showToolbox());
    return Toast.fire({ icon, title, position, timer: timeout, animation });
}

export function showConfirmDialog(props) {
    APP.store.dispatch(showToolbox());
    return Swal.fire(props);
}