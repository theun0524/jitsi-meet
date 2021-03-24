// @flow

import React, { Component } from 'react';

import { Icon, IconMenuThumb } from '../../../base/icons';
import { Popover } from '../../../base/popover';

import {
    RemoteVideoMenu,
} from '.';
import FlipVideoButton from './FlipVideoButton';

import s from './LocalVideoMenuTriggerButton.module.scss';

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
                className = { s.popoverContainer }
                content = { content }
                onPopoverOpen = { this._onShowRemoteMenu }
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
        const buttons = [];

        buttons.push(
            <FlipVideoButton
                onFlipXChanged = { this.props.onFlipXChanged } />
        );

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

export default LocalVideoMenuTriggerButton;
