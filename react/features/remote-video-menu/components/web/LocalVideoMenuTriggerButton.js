// @flow

import React, { Component } from 'react';

import { Icon, IconMenuThumb } from '../../../base/icons';
import { Popover } from '../../../base/popover';
import { connect } from '../../../base/redux';
import { shouldDisplayTileView } from '../../../video-layout';

import {
    RemoteVideoMenu,
} from '.';
import FlipVideoButton from './FlipVideoButton';

import MoveToFirstButton from './MoveToFirstButton';
import MoveToLastButton from './MoveToLastButton';
import { getLocalParticipant, getParticipantCount, PARTICIPANT_ROLE } from '../../../base/participants';
import MuteEveryoneElseButton from './MuteEveryoneElseButton';
import MuteVideoEveryoneElseButton from './MuteVideoEveryoneElseButton';

/**
 * The type of the React {@code Component} props of
 * {@link LocalVideoMenuTriggerButton}.
 */
type Props = {

    /**
     * Callback to invoke when the flip has been changed.
     */
    onFlipXChanged: Function,

    /**
     * Callback to invoke when the popover has been displayed.
     */
    onMenuDisplay: Function,

    /**
     * from. Valid values are those supported by AtlasKit
     * The position relative to the trigger the remote menu should display
     * {@code InlineDialog}.
     */
    menuPosition: string,

};

/**
 * React {@code Component} for displaying an icon associated with opening the
 * the {@code RemoteVideoMenu}.
 *
 * @extends {Component}
 */
class LocalVideoMenuTriggerButton extends Component<Props> {
    /**
     * The internal reference to topmost DOM/HTML element backing the React
     * {@code Component}. Accessed directly for associating an element as
     * the trigger for a popover.
     *
     * @private
     * @type {HTMLDivElement}
     */
    _rootElement = null;

    /**
     * Initializes a new {#@code LocalVideoMenuTriggerButton} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: Object) {
        super(props);

        // Bind event handler so it is only bound once for every instance.
        this._onShowLocalMenu = this._onShowLocalMenu.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const content = this._renderLocalVideoMenu();

        if (!content) {
            return null;
        }

        return (
            <Popover
                content = { content }
                onPopoverOpen = { this._onShowLocalMenu }
                position = { this.props.menuPosition }>
                <span
                    className = 'popover-trigger remote-video-menu-trigger'>
                    <Icon
                        size = '1em'
                        src = { IconMenuThumb }
                        title = 'Local user controls' />
                </span>
            </Popover>
        );
    }

    _onShowLocalMenu: () => void;

    /**
     * Opens the {@code LocalVideoMenu}.
     *
     * @private
     * @returns {void}
     */
    _onShowLocalMenu() {
        this.props.onMenuDisplay();
    }

    /**
     * Creates a new {@code LocalVideoMenu} with buttons for interacting with
     * the local participant.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderLocalVideoMenu() {
        const {
            _disableRemoteMute,
            _participantCount,
            _shouldDisplayTileView,
            isFirst,
            isLast,
            participant
        } = this.props;
        const buttons = [];
        const participantID = participant?.id;

        buttons.push(
            <FlipVideoButton
                key = 'flipvideo'
                onFlipXChanged = { this.props.onFlipXChanged } />
        );

        if (!_disableRemoteMute && participant.role === PARTICIPANT_ROLE.MODERATOR) {
            if (_participantCount > 2) {
                buttons.push(
                    <MuteEveryoneElseButton
                        key = 'mute-others'
                        participantID = { participantID }
                        mute = { true } />
                );
                buttons.push(
                    <MuteEveryoneElseButton
                        key = 'unmute-others'
                        participantID = { participantID }
                        mute = { false } />
                );
                buttons.push(
                    <MuteVideoEveryoneElseButton
                        key = 'mutevideo-others'
                        participantID = { participantID }
                        mute = { true } />
                );
                buttons.push(
                    <MuteVideoEveryoneElseButton
                        key = 'unmutevideo-others'
                        participantID = { participantID }
                        mute = { false } />
                );
            }
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

        if (buttons.length > 0) {
            return (
                <RemoteVideoMenu id = 'localvideomenu'>
                    { buttons }
                </RemoteVideoMenu>
            );
        }

        return null;
    }
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
    const { ordered } = state['features/video-layout'];
    const found = ordered?.indexOf(participant?.id);
    const { disableRemoteMute } = state['features/base/config'];

    return {
        _disableRemoteMute: Boolean(disableRemoteMute),
        _participantCount: getParticipantCount(state),
        isFirst: ordered && found === 0,
        isLast: ordered && found === ordered.length - 1,
        participant,
        _shouldDisplayTileView: shouldDisplayTileView(state)
    };
}

export default connect(_mapStateToProps)(LocalVideoMenuTriggerButton);
