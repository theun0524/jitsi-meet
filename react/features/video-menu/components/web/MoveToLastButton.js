/* @flow */

import React from 'react';

import { translate } from '../../../base/i18n';
import { IconAngleDoubleRight } from '../../../base/icons';
import { connect } from '../../../base/redux';
import { AbstractButton } from '../../../base/toolbox/components';
import { moveToLast } from '../../../video-layout';

import RemoteVideoMenuButton from './RemoteVideoMenuButton';

/**
 * Implements a React {@link Component} which displays a button for move
 * a participant to last in the tileview
 */
class MoveToLastButton extends AbstractButton {
    /**
     * Instantiates a new {@code Component}.
     *
     * @inheritdoc
     */
    constructor(props: Props) {
        super(props);

        this._handleClick = this._handleClick.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { participantID, t } = this.props;

        return (
            <RemoteVideoMenuButton
                buttonText = { t('videothumbnail.moveToLast') }
                icon = { IconAngleDoubleRight }
                id = { `movetolast_${participantID}` }
                // eslint-disable-next-line react/jsx-handler-names
                onClick = { this._handleClick } />
        );
    }

    _handleClick: () => void

    _handleClick() {
        const { dispatch, participantID, onClick } = this.props;
        onClick && onClick();
        dispatch(moveToLast(participantID));
    }
}

export default translate(connect()(MoveToLastButton));
