/* @flow */

import TextField from '@atlaskit/textfield';
import React from 'react';

import { Dialog } from '../../../base/dialog';
import { translate } from '../../../base/i18n';
import { connect } from '../../../base/redux';
import AbstractDisplayNamePrompt, {
    type Props
} from '../AbstractDisplayNamePrompt';
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
                width = 'small'>
                <div className = { s.inputContainer }>
                    <TextField
                        autoFocus = { true }
                        isCompact = { true }
                        label = { t('dialog.enterDisplayName') }
                        name = 'displayName'
                        onChange = { this._onDisplayNameChange }
                        placeholder = { t('dialog.placeholderName') }
                        type = 'text'
                        value = { this.state.displayName } />
                    {/* <span className = { s.seperator }>/</span>
                    <TextField
                        isCompact = { true }
                        label = { t('dialog.enterOrganizationName') }
                        name = 'organizationName'
                        onChange = { this._onOrganizationNameChange }
                        placeholder = { t('dialog.placeholderOrganization') }
                        type = 'text'
                        value = { this.state.organizationName } /> */}
                </div>
            </Dialog>);
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