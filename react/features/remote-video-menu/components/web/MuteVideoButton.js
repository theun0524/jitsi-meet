/* @flow */

import React from 'react';

import { translate } from '../../../base/i18n';
import { IconCamera, IconCameraDisabled } from '../../../base/icons';
import { connect } from '../../../base/redux';
import AbstractMuteVideoButton, {
    _mapStateToProps,
    type Props
} from '../AbstractMuteVideoButton';

import RemoteVideoMenuButton from './RemoteVideoMenuButton';

/**
 * Implements a React {@link Component} which displays a button for video muting
 * a participant in the conference.
 *
 * NOTE: At the time of writing this is a button that doesn't use the
 * {@code AbstractButton} base component, but is inherited from the same
 * super class ({@code AbstractMuteVideoButton} that extends {@code AbstractButton})
 * for the sake of code sharing between web and mobile. Once web uses the
 * {@code AbstractButton} base component, this can be fully removed.
 */
class MuteVideoButton extends AbstractMuteVideoButton {
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
        const { _videoTrackMuted, _disableRemoteUnmuteVideo, mute, participantID, t } = this.props;
        const buttonText = `videothumbnail.do${mute ? '' : 'un'}muteVideo`;
        const muteClassName = _videoTrackMuted && _disableRemoteUnmuteVideo
            ? 'mutelink disabled' : 'mutelink';
        const icon = mute ? IconCameraDisabled : IconCamera;

        return (
            <RemoteVideoMenuButton
                buttonText = { t(buttonText) }
                displayClass = { muteClassName }
                icon = { icon }
                id = { `mutelink_${participantID}` }
                // eslint-disable-next-line react/jsx-handler-names
                onClick = { this._handleClick } />
        );
    }

    _handleClick: () => void
}

export default translate(connect(_mapStateToProps)(MuteVideoButton));
