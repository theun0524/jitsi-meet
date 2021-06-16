/* @flow */

import { FieldTextStateless as TextField } from '@atlaskit/field-text';
import React from 'react';

import { Dialog } from '../../../base/dialog';
import { translate } from '../../../base/i18n';
import { connect } from '../../../base/redux';
import AbstractDisplayNamePrompt, {
    type Props
} from '../AbstractDisplayNamePrompt';
import { showToast } from '../../../notifications';
import s from './DisplayNamePrompt.module.scss';

/**
 * The type of the React {@code Component} props of {@link DisplayNamePrompt}.
 */
type State = {

    /**
     * The name to show in the display name text field.
     */
    displayName: string,

    /**
     * The name to show in the organization name text field.
     */
    organizationName: string,
};

const NOTIFICATION_TIMEOUT = 3000;

/**
 * Implements a React {@code Component} for displaying a dialog with an field
 * for setting the local participant's display name.
 *
 * @extends Component
 */
class DisplayNamePrompt extends AbstractDisplayNamePrompt<State> {
    /**
     * Initializes a new {@code DisplayNamePrompt} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: Props) {
        super(props);

        this.state = {
            displayName: '',
            organizationName: '',
        };

        // Bind event handlers so they are only bound once for every instance.
        this._onDisplayNameChange = this._onDisplayNameChange.bind(this);
        this._onOrganizationNameChange = this._onOrganizationNameChange.bind(this);
        this._onSubmit = this._onSubmit.bind(this);
        this._isSubmitBtnDisabled = this._isSubmitBtnDisabled.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { t } = this.props;

        return (
            <Dialog
                isModal = { true }
                onSubmit = { this._onSubmit }
                titleKey = 'dialog.displayNameRequired'
                // currently submitDisabled prop is not required
                // submitDisabled = { this._isSubmitBtnDisabled() }
                width = 'small'>
                <div className = { s.inputContainer }>
                    <TextField
                        autoFocus = { true }
                        compact = { true }
                        label = { t('dialog.enterDisplayName') }
                        name = 'displayName'
                        onChange = { this._onDisplayNameChange }
                        placeholder = { t('dialog.placeholderName') }
                        shouldFitContainer = { true }
                        type = 'text'
                        value = { this.state.displayName } />
                    {/* <span className = { s.seperator }>/</span>
                    <TextField
                        compact = { true }
                        label = { t('dialog.enterOrganizationName') }
                        name = 'organizationName'
                        onChange = { this._onOrganizationNameChange }
                        placeholder = { t('dialog.placeholderOrganization') }
                        shouldFitContainer = { true }
                        type = 'text'
                        value = { this.state.organizationName } /> */}
                </div>
            </Dialog>);
    }

    /**
     * callback function to submitDisabled prop, NOT USED CURRENTLY
     * used to check if display name is set or not, if display name is not set, returns true
     * which is used to hide the submit button when displayName is empty
     */
    _isSubmitBtnDisabled: () => void;

    _isSubmitBtnDisabled() {
        if ((this.state.displayName.length === 0) || (this.state.displayName.trim() === "")) {
            return true;
        } else {
            return false;
        }
    }

    _onDisplayNameChange: (Object) => void;

    /**
     * Updates the entered display name.
     *
     * @param {Object} event - The DOM event triggered from the entered display
     * name value having changed.
     * @private
     * @returns {void}
     */
    _onDisplayNameChange(event) {
        this.setState({
            displayName: event.target.value
        });
    }

    _onOrganizationNameChange: (Object) => void;

    /**
     * Updates the entered organization name.
     *
     * @param {Object} event - The DOM event triggered from the entered organization
     * name value having changed.
     * @private
     * @returns {void}
     */
    _onOrganizationNameChange(event) {
        this.setState({
            organizationName: event.target.value
        });
    }

    _onSetDisplayName: string => boolean;

    _onSubmit: () => boolean;

    /**
     * Dispatches an action to update the local participant's display name. A
     * name must be entered for the action to dispatch.
     *
     * @private
     * @returns {boolean}
     */
    _onSubmit() {
        const { t } = this.props;

        // show a toast message if display name is set to null
        if(this.state.displayName.trim() === "" || this.state.displayName === undefined || this.state.displayName === "") {
            showToast({
                title: t('notify.noNameInserted'),
                timeout: NOTIFICATION_TIMEOUT,
                icon: 'info',
                animation: false });
        }
        return this._onSetDisplayName(this.state.displayName);
        // const { displayName, organizationName } = this.state;
        // let result = displayName;

        // if (organizationName) {
        //     result = `${displayName} / ${organizationName}`;
        // }

        // return this._onSetDisplayName(result);
    }
}

export default translate(connect()(DisplayNamePrompt));