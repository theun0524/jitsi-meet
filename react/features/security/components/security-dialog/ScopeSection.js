// @flow

import React, { PureComponent } from 'react';

import { translate } from '../../../base/i18n';
import { Switch } from '../../../base/react';
import { connect } from '../../../base/redux';
import { toggleScope } from '../../actions';

type Props = {

    /**
     * True if public conference.
     */
    _scope: boolean,

    /**
     * The Redux Dispatch function.
     */
    dispatch: Function,

    /**
     * Function to be used to translate i18n labels.
     */
    t: Function
};

type State = {

    /**
     * True if public conference.
     */
    scope: boolean
}

/**
 * Implements a security feature section to control lobby mode.
 */
class ScopeSection extends PureComponent<Props, State> {
    /**
     * Instantiates a new component.
     *
     * @inheritdoc
     */
    constructor(props: Props) {
        super(props);

        this.state = {
            scope: props._scope
        };

        this._onToggleScope = this._onToggleScope.bind(this);
    }

    /**
     * Implements React's {@link Component#getDerivedStateFromProps()}.
     *
     * @inheritdoc
     */
    static getDerivedStateFromProps(props: Props, state: Object) {
        if (props._scope !== state.scope) {

            return {
                scope: props._scope
            };
        }

        return null;
    }

    /**
     * Implements {@code PureComponent#render}.
     *
     * @inheritdoc
     */
    render() {
        const { onToggle, t } = this.props;

        return (
            <>
                <div id = 'lobby-section'>
                    <p className = 'description'>
                        { t('security.enableDialogText') }
                    </p>
                    <div className = 'control-row'>
                        <label>
                            { t('security.toggleLabel') }
                        </label>
                        <Switch
                            onValueChange = { this._onToggleScope }
                            value = { this.state.scope } />
                    </div>
                </div>
                <div className = 'separator-line' />
            </>
        );
    }

    _onToggleScope: () => void;

    /**
     * Callback to be invoked when the user toggles the lobby feature on or off.
     *
     * @returns {void}
     */
    _onToggleScope() {
        const { dispatch } = this.props;
        const newValue = !this.state.scope;

        this.setState({
            scope: newValue
        });

        dispatch(toggleScope());
    }
}

/**
 * Maps part of the Redux state to the props of this component.
 *
 * @param {Object} state - The Redux state.
 * @returns {Props}
 */
function mapStateToProps(state: Object): $Shape<Props> {
    return {
        _scope: state['features/base/conference'].roomInfo?.scope
    };
}

export default translate(connect(mapStateToProps)(ScopeSection));
