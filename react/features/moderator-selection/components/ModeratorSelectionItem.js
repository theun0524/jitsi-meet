/* @flow */

import React, { Component } from 'react';

import { appNavigate } from '../../app/actions';
import { grantModerator } from '../../base/participants';
import { disconnect } from '../../base/connection';

import { translate } from '../../base/i18n';

import s from './ModeratorSelectionItem.module.scss';



declare var interfaceConfig: Object;

/**
 * The type of the React {@code Component} props of {@link ModeratorSelectionItem}.
 */
type Props = {

    /**
     * The name of the participant.
     */
    displayName: string,

    /**
     * Invoked to active other features of the app.
     */
     dispatch: Function
};

/**
 * React component for display an individual user's.
 *
 * @extends Component
 */
class ModeratorSelectionItem extends Component<Props> {
    constructor(props: Props) {
        super(props);

        this._onClick = this._onClick.bind(this);
    }

    _onClick: () => void;

    _onClick(event) {
        const {
            id,
            dispatch
        } = this.props;

       dispatch(grantModerator(id));
    
        // FIXME: these should be unified.
        if (navigator.product === 'ReactNative') {
            dispatch(appNavigate(undefined));
        } else {
            dispatch(disconnect(true));
        }
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const {
            name,
            email,
            local,
            t
        } = this.props;

        let displayName;
        if (local) {
            return null;
        } else {
            displayName = name || interfaceConfig.DEFAULT_REMOTE_DISPLAY_NAME;
        }

        return (
            <div 
                className = { `moderator-selection-item ${s.itemContainer}` }
                role = 'button'
                onClick = {this._onClick}
                >
                <div className = { `moderator-selection-item__name ${s.nameContainer}` }> 
                    <span className = { s.name }>{ displayName }</span>
                </div>
                <div className = { `moderator-selection-item__email ${s.emailContainer}` }> 
                    <span className = { s.email }>{ email }</span>
                </div>
            </div>
        );
    }
}

export default translate(ModeratorSelectionItem);
