// @flow

import React, { PureComponent } from 'react';
import type { Dispatch } from 'redux';

import tokenLocalStorage from '../../../../api/tokenLocalStorage';
import { getAuthUrl } from '../../../../api/url';
import { getCurrentUser } from '../../../base/auth';
import { disconnect } from '../../../base/connection';
import { Dialog } from '../../../base/dialog';
import { getLicenseError } from '../../../billing-counter/functions';
import { LICENSE_ERROR_INVALID_LICENSE, LICENSE_ERROR_MAXED_LICENSE } from '../../../billing-counter/constants';
import { translate, translateToHTML } from '../../../base/i18n';
import { setJWT } from '../../../base/jwt';
import { connect } from '../../../base/redux';
import { cancelWaitForOwner } from '../../actions.web';

/**
 * The type of the React {@code Component} props of {@link WaitForOwnerDialog}.
 */
type Props = {

    /**
     * The name of the conference room (without the domain part).
     */
    _room: string,

    /**
     * Redux store dispatch method.
     */
    dispatch: Dispatch<any>,

    /**
     * Function to be invoked after click.
     */
    onAuthNow: ?Function,

    /**
     * Invoked to obtain translated strings.
     */
    t: Function
}

/**
 * Authentication message dialog for host confirmation.
 *
 * @returns {React$Element<any>}
 */
class WaitForOwnerDialog extends PureComponent<Props> {
    /**
     * Instantiates a new component.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: Props) {
        super(props);

        this._onCancelWaitForOwner = this._onCancelWaitForOwner.bind(this);
        this._onSubmit = this._onSubmit.bind(this);
    }

    _onCancelWaitForOwner: () => void;

    /**
     * Called when the cancel button is clicked.
     *
     * @private
     * @returns {void}
     */
    _onCancelWaitForOwner() {
        const { dispatch } = this.props;
        dispatch(cancelWaitForOwner);
        dispatch(disconnect());
    }

    _onSubmit: () => void;

    /**
     * Called when the OK button is clicked.
     *
     * @private
     * @returns {void}
     */
    _onSubmit() {
        const { dispatch, onAuthNow } = this.props;

        const apiBase = getAuthUrl();
        axios.get(`${apiBase}/logout`).then(() => {
            tokenLocalStorage.removeItem(APP.store.getState());
            dispatch(setJWT());
            onAuthNow && onAuthNow();
        });
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        const {
            _room: room,
            description,
            t,
            ...dialogProps
        } = this.props;

        return (
            <Dialog
                onCancel = { this._onCancelWaitForOwner }
                onSubmit = { this._onSubmit }
                width = { 'small' }
                {...dialogProps}>
                <span>
                    { translateToHTML(
                        t,
                        description,
                        { room: decodeURI(room) }) }
                </span>
            </Dialog>
        );
    }
}

/**
 * Maps (parts of) the Redux state to the associated props for the
 * {@code WaitForOwnerDialog} component.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Props}
 */
function mapStateToProps(state) {
    const { authRequired } = state['features/base/conference'];
    const { waitOnlyGuestEnabled } = state['features/base/config'];
    const isAuthenticated = Boolean(getCurrentUser(state));

    const messages = {
        [LICENSE_ERROR_INVALID_LICENSE]: 'dialog.InvalidLicense',
        [LICENSE_ERROR_MAXED_LICENSE]: 'dialog.MaxedLicense',
        none: isAuthenticated ? 'dialog.WaitForHostMsg' : 'dialog.WaitingRoomMsg'
    };
    
    const error = getLicenseError();
    const titleKey = error ? 'dialog.LicenseError' : 'dialog.WaitingForHost';
    const okKey = 'dialog.login';
    const cancelKey = 'dialog.goHome';
    let description = messages[error || 'none'];
    let cancelDisabled, submitDisabled;

    if (isAuthenticated || error) {
        submitDisabled = true;
    }

    if (waitOnlyGuestEnabled) {
        description = 'dialog.WaitingRoomMsg';
        cancelDisabled = true;
        submitDisabled = true;
    }

    return {
        cancelDisabled,
        cancelKey,
        description,
        okKey,
        submitDisabled,
        titleKey,
        _room: authRequired && authRequired.getName()
    };
}

export default translate(connect(mapStateToProps)(WaitForOwnerDialog));
