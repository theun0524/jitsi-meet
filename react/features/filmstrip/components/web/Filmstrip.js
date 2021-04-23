/* @flow */

import { debounce, map } from 'lodash';
import React, { Component } from 'react';
import type { Dispatch } from 'redux';

import {
    createShortcutEvent,
    createToolbarEvent,
    sendAnalytics
} from '../../../analytics';
import { translate } from '../../../base/i18n';
import { Icon, IconMenuDown, IconMenuUp } from '../../../base/icons';
import { connect } from '../../../base/redux';
import { dockToolbox } from '../../../toolbox/actions.web';
import { getCurrentLayout, LAYOUTS, setTileViewOrder } from '../../../video-layout';
import { setFilmstripHovered, setFilmstripVisible } from '../../actions';
import { shouldRemoteVideosBeVisible } from '../../functions';

import Toolbar from './Toolbar';
import s from './Filmstrip.module.scss';
import { getVideoId } from '../../../../../modules/UI/videolayout/VideoLayout';

declare var APP: Object;
declare var interfaceConfig: Object;
declare var $: Object;

/**
 * The type of the React {@code Component} props of {@link Filmstrip}.
 */
type Props = {

    /**
     * Additional CSS class names top add to the root.
     */
    _className: string,

    /**
     * The current layout of the filmstrip.
     */
    _currentLayout: string,

    /**
     * The number of columns in tile view.
     */
    _columns: number,

    /**
     * Whether the UI/UX is filmstrip-only.
     */
    _filmstripOnly: boolean,

    /**
     * The width of the filmstrip.
     */
    _filmstripWidth: number,

    /**
     * Whether the filmstrip scrollbar should be hidden or not.
     */
    _hideScrollbar: boolean,

    /**
     * Whether the filmstrip toolbar should be hidden or not.
     */
    _hideToolbar: boolean,

    /**
     * Whether or not remote videos are currently being hovered over. Hover
     * handling is currently being handled detected outside of react.
     */
    _hovered: boolean,

    /**
     * The number of rows in tile view.
     */
    _rows: number,

    /**
     * Additional CSS class names to add to the container of all the thumbnails.
     */
    _videosClassName: string,

    /**
     * Whether or not the filmstrip videos should currently be displayed.
     */
    _visible: boolean,

    /**
     * The redux {@code dispatch} function.
     */
    dispatch: Dispatch<any>,

    /**
     * Invoked to obtain translated strings.
     */
    t: Function
};

/**
 * Implements a React {@link Component} which represents the filmstrip on
 * Web/React.
 *
 * @extends Component
 */
class Filmstrip extends Component<Props> {
    _isHovered: boolean;

    _notifyOfHoveredStateUpdate: Function;

    _onMouseOut: Function;

    _onMouseOver: Function;

    /**
     * Initializes a new {@code Filmstrip} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: Props) {
        super(props);

        // Debounce the method for dispatching the new filmstrip handled state
        // so that it does not get called with each mouse movement event. This
        // also works around an issue where mouseout and then a mouseover event
        // is fired when hovering over remote thumbnails, which are not yet in
        // react.
        this._notifyOfHoveredStateUpdate = debounce(this._notifyOfHoveredStateUpdate, 100);

        // Cache the current hovered state for _updateHoveredState to always
        // send the last known hovered state.
        this._isHovered = false;

        // Bind event handlers so they are only bound once for every instance.
        this._onMouseOut = this._onMouseOut.bind(this);
        this._onMouseOver = this._onMouseOver.bind(this);
        this._onShortcutToggleFilmstrip = this._onShortcutToggleFilmstrip.bind(this);
        this._onToolbarToggleFilmstrip = this._onToolbarToggleFilmstrip.bind(this);
        this._videosContainer = React.createRef();
    }

    /**
     * Implements React's {@link Component#componentDidMount}.
     *
     * @inheritdoc
     */
    componentDidMount() {
        this.$videosContainer = $(this._videosContainer.current);
        if (!this.props._filmstripOnly) {
            APP.keyboardshortcut.registerShortcut(
                'F',
                'filmstripPopover',
                this._onShortcutToggleFilmstrip,
                'keyboardShortcuts.toggleFilmstrip'
            );
        }
    }

    /**
     * Implements React's {@link Component#componentDidUpdate}.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        APP.keyboardshortcut.unregisterShortcut('F');
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps._currentLayout !== this.props._currentLayout) {
            console.log('current layout is changed:', this.props._currentLayout);
            this._changeSortable();
        }
    }

    _changeSortable() {
        if (this.props._currentLayout === LAYOUTS.TILE_VIEW) {
            this.$videosContainer.sortable({
                disabled: false,
                stop: () => {
                    this.props.dispatch(setTileViewOrder(
                        map(this.$videosContainer.children(), getVideoId)
                    ));
                }
            });
        } else {
            this.$videosContainer.sortable({
                disabled: true
            });
        }
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        // Note: Appending of {@code RemoteVideo} views is handled through
        // VideoLayout. The views do not get blown away on render() because
        // ReactDOMComponent is only aware of the given JSX and not new appended
        // DOM. As such, when updateDOMProperties gets called, only attributes
        // will get updated without replacing the DOM. If the known DOM gets
        // modified, then the views will get blown away.

        const filmstripStyle = {};
        const filmstripRemoteVideosContainerStyle = {};
        let remoteVideoContainerClassName = 'remote-videos-container';

        switch (this.props._currentLayout) {
            case LAYOUTS.VERTICAL_FILMSTRIP_VIEW:
                // Adding 18px for the 2px margins, 2px borders on the left and right and 5px padding on the left and right.
                // Also adding 7px for the scrollbar.
                filmstripStyle.maxWidth = (interfaceConfig.FILM_STRIP_MAX_HEIGHT || 120) + 25;
                break;
            case LAYOUTS.TILE_VIEW: {
                // The size of the side margins for each tile as set in CSS.
                const { _columns, _rows, _filmstripWidth } = this.props;

                if (_rows > _columns) {
                    remoteVideoContainerClassName += ' has-overflow';
                }

                filmstripRemoteVideosContainerStyle.width = _filmstripWidth;
                break;
            }
        }

        let remoteVideosWrapperClassName = `filmstrip__videos ${s.filmstripVideos}`;

        if (this.props._hideScrollbar) {
            remoteVideosWrapperClassName += ` ${hideScrollbar}`;
        }

        let toolbar = null;

        if (!this.props._hideToolbar) {
            toolbar = this.props._filmstripOnly ? <Toolbar /> : this._renderToggleButton();
        }

        return (
            <div
                className={`filmstrip ${this.props._className}`}
                style={filmstripStyle}>
                { toolbar}
                <div
                    className={this.props._videosClassName}
                    id='remoteVideos'>
                    <div
                        className={`filmstrip__videos ${this.props._localVideoClass}`}
                        id='filmstripLocalVideo'
                        onMouseOut={this._onMouseOut}
                        onMouseOver={this._onMouseOver}>
                        <div id='filmstripLocalVideoThumbnail' />
                    </div>
                    <div
                        className={remoteVideosWrapperClassName}
                        id='filmstripRemoteVideos'>
                        {/*
                          * XXX This extra video container is needed for
                          * scrolling thumbnails in Firefox; otherwise, the flex
                          * thumbnails resize instead of causing overflow.
                          */}
                        <div
                            className={remoteVideoContainerClassName}
                            id='filmstripRemoteVideosContainer'
                            onMouseOut={this._onMouseOut}
                            onMouseOver={this._onMouseOver}
                            ref={this._videosContainer}
                            style={filmstripRemoteVideosContainerStyle}>
                            <div id='localVideoTileViewContainer' />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /**
     * Dispatches an action to change the visibility of the filmstrip.
     *
     * @private
     * @returns {void}
     */
    _doToggleFilmstrip() {
        this.props.dispatch(setFilmstripVisible(!this.props._visible));
    }

    /**
     * If the current hover state does not match the known hover state in redux,
     * dispatch an action to update the known hover state in redux.
     *
     * @private
     * @returns {void}
     */
    _notifyOfHoveredStateUpdate() {
        if (this.props._hovered !== this._isHovered) {
            this.props.dispatch(dockToolbox(this._isHovered));
            this.props.dispatch(setFilmstripHovered(this._isHovered));
        }
    }

    /**
     * Updates the currently known mouseover state and attempt to dispatch an
     * update of the known hover state in redux.
     *
     * @private
     * @returns {void}
     */
    _onMouseOut() {
        this._isHovered = false;
        this._notifyOfHoveredStateUpdate();
    }

    /**
     * Updates the currently known mouseover state and attempt to dispatch an
     * update of the known hover state in redux.
     *
     * @private
     * @returns {void}
     */
    _onMouseOver() {
        this._isHovered = true;
        this._notifyOfHoveredStateUpdate();
    }

    _onShortcutToggleFilmstrip: () => void;

    /**
     * Creates an analytics keyboard shortcut event and dispatches an action for
     * toggling filmstrip visibility.
     *
     * @private
     * @returns {void}
     */
    _onShortcutToggleFilmstrip() {
        sendAnalytics(createShortcutEvent(
            'toggle.filmstrip',
            {
                enable: this.props._visible
            }));

        this._doToggleFilmstrip();
    }

    _onToolbarToggleFilmstrip: () => void;

    /**
     * Creates an analytics toolbar event and dispatches an action for opening
     * the speaker stats modal.
     *
     * @private
     * @returns {void}
     */
    _onToolbarToggleFilmstrip() {
        sendAnalytics(createToolbarEvent(
            'toggle.filmstrip.button',
            {
                enable: this.props._visible
            }));

        this._doToggleFilmstrip();
    }

    /**
     * Creates a React Element for changing the visibility of the filmstrip when
     * clicked.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderToggleButton() {
        const icon = this.props._visible ? IconMenuDown : IconMenuUp;
        const { _hideFilmstrip, t } = this.props;

        return !_hideFilmstrip && (
            <div className='filmstrip__toolbar'>
                <button
                    aria-label={t('toolbar.accessibilityLabel.toggleFilmstrip')}
                    id='toggleFilmstripButton'
                    onClick={this._onToolbarToggleFilmstrip}>
                    <Icon src={icon} />
                </button>
            </div>
        );
    }
}

/**
 * Maps (parts of) the Redux state to the associated {@code Filmstrip}'s props.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Props}
 */
function _mapStateToProps(state) {
    const { iAmSipGateway, hideLocalVideo, hideRemoteVideos } = state['features/base/config'];
    const { hovered, visible } = state['features/filmstrip'];
    const isFilmstripOnly = Boolean(interfaceConfig.filmStripOnly);
    const reduceHeight
        = !isFilmstripOnly && state['features/toolbox'].visible && interfaceConfig.TOOLBAR_BUTTONS.length;
    const remoteVideosVisible = shouldRemoteVideosBeVisible(state);
    const { isOpen: shiftRight } = state['features/chat'];
    const className = `${remoteVideosVisible ? '' : 'hide-videos'} ${reduceHeight ? 'reduce-height' : ''
        } ${shiftRight ? 'shift-right' : ''}`.trim();
    const videosClassName = `filmstrip__videos${isFilmstripOnly ? ' filmstrip__videos-filmstripOnly' : ''}${visible ? '' : ' hidden'}`;
    const { gridDimensions = {}, filmstripWidth } = state['features/filmstrip'].tileViewDimensions;

    return {
        _className: className,
        _columns: gridDimensions.columns,
        _currentLayout: getCurrentLayout(state),
        _filmstripOnly: isFilmstripOnly,
        _filmstripWidth: filmstripWidth,
        _hideFilmstrip: Boolean(hideRemoteVideos && hideLocalVideo),
        _hideScrollbar: Boolean(iAmSipGateway),
        _hideToolbar: Boolean(iAmSipGateway),
        _hovered: hovered,
        _localVideoClass: Boolean(hideLocalVideo) ? 'hide' : '',
        _rows: gridDimensions.rows,
        _videosClassName: videosClassName,
        _visible: visible
    };
}

export default translate(connect(_mapStateToProps)(Filmstrip));
