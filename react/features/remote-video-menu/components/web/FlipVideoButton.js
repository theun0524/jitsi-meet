/* @flow */

import React from 'react';

import { translate } from '../../../base/i18n';
import { IconCodeBlock } from '../../../base/icons';
import { connect } from '../../../base/redux';
import AbstractFlipVideoButton, {
    _mapStateToProps,
    type Props
} from '../AbstractFlipVideoButton';

import RemoteVideoMenuButton from './RemoteVideoMenuButton';

/**
 * Implements a React {@link Component} which displays a button for flip
 * local video.
 *
 * NOTE: At the time of writing this is a button that doesn't use the
 * {@code AbstractButton} base component, but is inherited from the same
 * super class ({@code AbstractFlipVideoButton} that extends {@code AbstractButton})
 * for the sake of code sharing between web and mobile. Once web uses the
 * {@code AbstractButton} base component, this can be fully removed.
 */
class FlipVideoButton extends AbstractFlipVideoButton {
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
        const { t } = this.props;

        return (
            <RemoteVideoMenuButton
                buttonText = { t('videothumbnail.flip') }
                icon = { IconCodeBlock }
                id = 'flipvideo'
                // eslint-disable-next-line react/jsx-handler-names
                onClick = { this._handleClick } />
        );
    }

    _handleClick: () => void
}

export default translate(connect(_mapStateToProps)(FlipVideoButton));
