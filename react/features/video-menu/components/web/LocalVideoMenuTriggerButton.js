// @flow

import React, { Component, useState } from 'react';

import { translate } from '../../../base/i18n';
import { Icon, IconMenuThumb } from '../../../base/icons';
import { getLocalParticipant, getParticipantCount, PARTICIPANT_ROLE } from '../../../base/participants';
import { Popover } from '../../../base/popover';
import { connect } from '../../../base/redux';
import { getLocalVideoTrack } from '../../../base/tracks';
import { getCurrentLayout, LAYOUTS, shouldDisplayTileView } from '../../../video-layout';

import MoveToFirstButton from './MoveToFirstButton';
import MoveToLastButton from './MoveToLastButton';
import MuteEveryoneElseButton from './MuteEveryoneElseButton';
import MuteVideoEveryoneElseButton from './MuteVideoEveryoneElseButton';

import FlipLocalVideoButton from './FlipLocalVideoButton';
import VideoMenu from './VideoMenu';

/**
 * The type of the React {@code Component} props of
 * {@link LocalVideoMenuTriggerButton}.
 */
type Props = {

    /**
     * The position relative to the trigger the local video menu should display
     * from. Valid values are those supported by AtlasKit
     * {@code InlineDialog}.
     */
    _menuPosition: string,

    /**
     * Whether to display the Popover as a drawer.
     */
    _overflowDrawer: boolean,

    /**
     * Shows/hides the local video flip button.
     */
    _showLocalVideoFlipButton: boolean,

    /**
     * Invoked to obtain translated strings.
     */
    t: Function
};

/**
 * React {@code Component} for displaying an icon associated with opening the
 * the {@code RemoteVideoMenu}.
 *
 * @extends {Component}
 */
function LocalVideoMenuTriggerButton(props: Props) {
    const [ state, setState ] = useState({});

    /**
     * Creates a new {@code LocalVideoMenu} with buttons for interacting with
     * the local participant.
     *
     * @private
     * @returns {ReactElement}
     */
     function _renderLocalVideoMenu() {
        const {
            _disableRemoteMute,
            _disableRemoteUnmute,
            _disableRemoteMuteVideo,
            _disableRemoteUnmuteVideo,
            _participantCount,
            _shouldDisplayTileView,
            _showLocalVideoFlipButton,
            isFirst,
            isLast,
            participant
        } = props;
        const buttons = [];
        const participantID = participant?.id;

        if (_showLocalVideoFlipButton) {
            buttons.push(
                <FlipLocalVideoButton key = 'flipvideo' />
            );
        }

        if (participant.role === PARTICIPANT_ROLE.MODERATOR && _participantCount > 2) {
            if (!_disableRemoteMute) {
                buttons.push(
                    <MuteEveryoneElseButton
                        key = 'mute-others'
                        participantID = { participantID }
                        mute = { true } />
                );
            }
            // if (!_disableRemoteUnmute) {
            //     buttons.push(
            //         <MuteEveryoneElseButton
            //             key = 'unmute-others'
            //             participantID = { participantID }
            //             mute = { false } />
            //     );
            // }
            if (!_disableRemoteMuteVideo) {
                buttons.push(
                    <MuteVideoEveryoneElseButton
                        key = 'mutevideo-others'
                        participantID = { participantID }
                        mute = { true } />
                );
            }
            // if (!_disableRemoteUnmuteVideo) {
            //     buttons.push(
            //         <MuteVideoEveryoneElseButton
            //             key = 'unmutevideo-others'
            //             participantID = { participantID }
            //             mute = { false } />
            //     );
            // }
        }

        if (_shouldDisplayTileView) {
            if (!isFirst) {
                buttons.push(
                    <MoveToFirstButton
                        key = 'moveToFirst'
                        onClick = { _closeMenu }
                        participantID = { participantID } />
                );
            }
            if (!isLast) {
                buttons.push(
                    <MoveToLastButton
                        key = 'moveToLast'
                        onClick = { _closeMenu }
                        participantID = { participantID } />
                );
            }
        }

        if (buttons.length > 0) {
            return (
                <VideoMenu id = 'localVideoMenu'>
                    { buttons }
                </VideoMenu>
            );
        }

        return null;
    }

    function _onMenuOpen(doMenuClose) {
        setState({ doMenuClose });
    }

    function _closeMenu() {
        state.doMenuClose && state.doMenuClose();
    }

    const content = _renderLocalVideoMenu();

    if (!content) {
        return null;
    }

    return (
        props._showLocalVideoFlipButton
            ? <Popover
                content = { content }
                overflowDrawer = { props._overflowDrawer }
                onPopoverOpen = { _onMenuOpen }
                position = { props._menuPosition }>
                <span
                    className = 'popover-trigger local-video-menu-trigger'>
                    <Icon
                        ariaLabel = { props.t('dialog.localUserControls') }
                        role = 'button'
                        size = '1em'
                        src = { IconMenuThumb }
                        tabIndex = { 0 }
                        title = { props.t('dialog.localUserControls') } />
                </span>
            </Popover>
            : null
    );
}

/**
 * Maps (parts of) the Redux state to the associated {@code LocalVideoMenuTriggerButton}'s props.
 *
 * @param {Object} state - The Redux state.
 * @param {Object} ownProps - The own props of the component.
 * @private
 * @returns {Object}
 */
function _mapStateToProps(state) {
    const participant = getLocalParticipant(state);
    const participants = state['features/base/participants'];
    const currentLayout = getCurrentLayout(state);
    const { disableLocalVideoFlip, disableRemoteMute, remoteVideoMenu = {} } = state['features/base/config'];
    const {
        disableRemoteUnmute,
        disableRemoteMuteVideo,
        disableRemoteUnmuteVideo,
    } = remoteVideoMenu;
    const videoTrack = getLocalVideoTrack(state['features/base/tracks']);
    const { overflowDrawer } = state['features/toolbox'];
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
        _disableRemoteMute: Boolean(disableRemoteMute),
        _disableRemoteUnmute: Boolean(disableRemoteUnmute),
        _disableRemoteMuteVideo: Boolean(disableRemoteMuteVideo),
        _disableRemoteUnmuteVideo: Boolean(disableRemoteUnmuteVideo),
        _participantCount: getParticipantCount(state),
        _menuPosition,
        isFirst: participants[0] === participant,
        isLast: participants[participants.length - 1] === participant,
        participant,
        _shouldDisplayTileView: shouldDisplayTileView(state),
        _showLocalVideoFlipButton: !disableLocalVideoFlip && videoTrack?.videoType !== 'desktop',
        _overflowDrawer: overflowDrawer
    };
}

export default translate(connect(_mapStateToProps)(LocalVideoMenuTriggerButton));
