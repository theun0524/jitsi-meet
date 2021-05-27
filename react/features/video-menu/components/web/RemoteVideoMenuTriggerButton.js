// @flow

import React, { Component } from 'react';

import { Icon, IconMenuThumb } from '../../../base/icons';
import { getLocalParticipant, getParticipantById, getParticipantCount, PARTICIPANT_ROLE } from '../../../base/participants';
import { Popover } from '../../../base/popover';
import { connect } from '../../../base/redux';
import { getCurrentLayout, LAYOUTS, shouldDisplayTileView } from '../../../video-layout';

import {
    GrantModeratorButton,
    MuteButton,
    MuteEveryoneElseButton,
    KickButton,
    PrivateMessageMenuButton,
    RemoteControlButton,
    VideoMenu,
    VolumeSlider
} from '.';
import ChatDisableButton from './ChatDisableButton';
import AllChatDisableButton from './AllChatDisableButton';
import MoveToFirstButton from './MoveToFirstButton';
import MoveToLastButton from './MoveToLastButton';
import MuteVideoButton from './MuteVideoButton';
import MuteVideoEveryoneElseButton from './MuteVideoEveryoneElseButton';

/**
 * The type of the React {@code Component} props of
 * {@link RemoteVideoMenuTriggerButton}.
 */
type Props = {

    /**
     * Whether or not to display the kick button.
     */
    _disableKick: boolean,

    /**
     * Whether or not to display the remote mute buttons.
     */
    _disableRemoteMute: Boolean,

    /**
     * Whether or not to display the grant moderator button.
     */
    _disableGrantModerator: Boolean,

     /**
     * Whether or not the participant is a conference moderator.
     */
    _isModerator: boolean,

    /**
     * The position relative to the trigger the remote menu should display
     * from. Valid values are those supported by AtlasKit
     * {@code InlineDialog}.
     */
    _menuPosition: string,

     /**
      * Whether to display the Popover as a drawer.
      */
    _overflowDrawer: boolean,


    /**
     * A value between 0 and 1 indicating the volume of the participant's
     * audio element.
     */
    initialVolumeValue: number,

    /**
     * Whether or not the participant is currently muted.
     */
    isAudioMuted: boolean,

    /**
     * Whether or not the participant video is currently muted.
     */
    isVideoMuted: boolean,

    /**
     * Callback to invoke choosing to start a remote control session with
     * the participant.
     */
    onRemoteControlToggle: Function,

    /**
     * Callback to invoke when changing the level of the participant's
     * audio element.
     */
    onVolumeChange: Function,

    /**
     * The ID for the participant on which the remote video menu will act.
     */
    participantID: string,
};

/**
 * React {@code Component} for displaying an icon associated with opening the
 * the {@code RemoteVideoMenu}.
 *
 * @extends {Component}
 */
class RemoteVideoMenuTriggerButton extends Component<Props> {
    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const content = this._renderRemoteVideoMenu();

        if (!content) {
            return null;
        }

        return (
            <Popover
                content = { content }
                position = { this.props._menuPosition }>
                <span
                    className = 'popover-trigger remote-video-menu-trigger'>
                    <Icon
                        size = '1em'
                        src = { IconMenuThumb }
                        title = 'Remote user controls' />
                </span>
            </Popover>
        );
    }

    /**
     * Creates a new {@code RemoteVideoMenu} with buttons for interacting with
     * the remote participant.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderRemoteVideoMenu() {
        const {
            _disableGrantModerator,
            _disableKick,
            _disablePrivateMessage,
            _disableRemoteMute,
            _disableRemoteUnmute,
            _disableRemoteMuteVideo,
            _disableRemoteUnmuteVideo,
            _isModerator,
            _shouldDisplayTileView,
            _participantCount,
            initialVolumeValue,
            isAudioMuted,
            isFirst,
            isLast,
            isVideoMuted,
            onRemoteControlToggle,
            onVolumeChange,
            participantID
        } = this.props;

        const buttons = [];

        if (_isModerator) {
            if (!_disableRemoteMute) {
                buttons.push(
                    <MuteButton
                        key = 'mute'
                        participantID = { participantID }
                        mute = { _disableRemoteUnmute ? true : !isAudioMuted } />
                );
            }
            if (_participantCount > 2) {
                if (!_disableRemoteMute) {
                    buttons.push(
                        <MuteEveryoneElseButton
                            key = 'mute-others'
                            participantID = { participantID }
                            mute = { true } />
                    );
                }
                if (!_disableRemoteUnmute) {
                    buttons.push(
                        <MuteEveryoneElseButton
                            key = 'unmute-others'
                            participantID = { participantID }
                            mute = { false } />
                    );
                }
            }
            if (!_disableRemoteMuteVideo) {
                buttons.push(
                    <MuteVideoButton
                        key = 'mutevideo'
                        participantID = { participantID }
                        mute = { _disableRemoteUnmuteVideo ? true : !isVideoMuted } />
                );
            }
            if (_participantCount > 2) {
                if (!_disableRemoteMuteVideo) {
                    buttons.push(
                        <MuteVideoEveryoneElseButton
                            key = 'mutevideo-others'
                            participantID = { participantID }
                            mute = { true } />
                    );
                }
                if (!_disableRemoteUnmuteVideo) {
                    buttons.push(
                        <MuteVideoEveryoneElseButton
                            key = 'unmutevideo-others'
                            participantID = { participantID }
                            mute = { false } />
                    );
                }
            }

            if (!_disableGrantModerator) {
                buttons.push(
                    <GrantModeratorButton
                        key = 'grant-moderator'
                        participantID = { participantID } />
                );
            }

            // push a new button to show disable/enable chat option for selected remote participant
            buttons.push(
                <ChatDisableButton
                    key='disable-chat'
                    participantID = { participantID } />
            );

            // push a new button to show enable/disable chat option for all remote participants; doesn't affect moderators
            buttons.push(
                <AllChatDisableButton
                    key='disable-chat-all'
                    participantID = { participantID } />
            );

            if (!_disableKick) {
                buttons.push(
                    <KickButton
                        key = 'kick'
                        participantID = { participantID } />
                );
            }
        }

        // if (_remoteControlState) {
        //     buttons.push(
        //         <RemoteControlButton
        //             key = 'remote-control'
        //             onClick = { onRemoteControlToggle }
        //             participantID = { participantID }
        //             remoteControlState = { _remoteControlState } />
        //     );
        // }

        if (!_disablePrivateMessage) {
            buttons.push(
                <PrivateMessageMenuButton
                    key = 'privateMessage'
                    participantID = { participantID } />
            );
        }

        if (_shouldDisplayTileView) {
            if (!isFirst) {
                buttons.push(
                    <MoveToFirstButton
                        key = 'moveToFirst'
                        participantID = { participantID } />
                );
            }
            if (!isLast) {
                buttons.push(
                    <MoveToLastButton
                        key = 'moveToLast'
                        participantID = { participantID } />
                );
            }
        }

        if (onVolumeChange && initialVolumeValue && !isNaN(initialVolumeValue)) {
            buttons.push(
                <VolumeSlider
                    initialValue = { initialVolumeValue }
                    key = 'volume-slider'
                    onChange = { onVolumeChange } />
            );
        }

        if (buttons.length > 0) {
            return (
                <VideoMenu id = { participantID }>
                    { buttons }
                </VideoMenu>
            );
        }

        return null;
    }
}

/**
 * Maps (parts of) the Redux state to the associated {@code RemoteVideoMenuTriggerButton}'s props.
 *
 * @param {Object} state - The Redux state.
 * @param {Object} ownProps - The own props of the component.
 * @private
 * @returns {Object}
 */
function _mapStateToProps(state, ownProps) {
    const { participantID } = ownProps;
    const localParticipant = getLocalParticipant(state);
    const { remoteVideoMenu = {}, disableRemoteMute } = state['features/base/config'];
    const {
        disableKick,
        disableGrantModerator,
        disablePrivateMessage,
        disableRemoteUnmute,
        disableRemoteMuteVideo,
        disableRemoteUnmuteVideo,
    } = remoteVideoMenu;
    const { overflowDrawer } = state['features/toolbox'];
    const { ordered } = state['features/video-layout'];
    const found = ordered?.indexOf(participantID);

    const currentLayout = getCurrentLayout(state);
    let _menuPosition;

    switch (currentLayout) {
    case LAYOUTS.TILE_VIEW:
        _menuPosition = 'left-start';
        break;
    case LAYOUTS.VERTICAL_FILMSTRIP_VIEW:
        _menuPosition = 'left-end';
        break;
    default:
        _menuPosition = 'auto';
    }
    
    return {
        _isModerator: Boolean(localParticipant?.role === PARTICIPANT_ROLE.MODERATOR),
        _disableGrantModerator: Boolean(disableGrantModerator),
        _disableKick: Boolean(disableKick),
        _disablePrivateMessage: Boolean(disablePrivateMessage),
        _disableRemoteMute: Boolean(disableRemoteMute),
        _disableRemoteUnmute: Boolean(disableRemoteUnmute),
        _disableRemoteMuteVideo: Boolean(disableRemoteMuteVideo),
        _disableRemoteUnmuteVideo: Boolean(disableRemoteUnmuteVideo),
        _menuPosition,
        _overflowDrawer: overflowDrawer,
        _participantCount: getParticipantCount(state),
        _shouldDisplayTileView: shouldDisplayTileView(state),
        isFirst: ordered && found === 0,
        isLast: ordered && found === ordered.length - 1,
    };
}

export default connect(_mapStateToProps)(RemoteVideoMenuTriggerButton);
