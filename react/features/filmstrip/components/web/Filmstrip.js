/* @flow */

import { keyBy, map } from 'lodash';
import React, { Component } from 'react';
import type { Dispatch } from 'redux';

// import { getVideoId } from '../../../../../modules/UI/videolayout/VideoLayout';
import {
    createShortcutEvent,
    createToolbarEvent,
    sendAnalytics
} from '../../../analytics';
import { getToolbarButtons } from '../../../base/config';
import { translate } from '../../../base/i18n';
import { Icon, IconMenuDown, IconMenuUp } from '../../../base/icons';
import { getLocalParticipant } from '../../../base/participants';
import { connect } from '../../../base/redux';
import { isButtonEnabled } from '../../../toolbox/functions.web';
import { getCurrentLayout, getPageData, LAYOUTS, setPageInfo, setPageOrder } from '../../../video-layout';
import { setFilmstripVisible } from '../../actions';
import { shouldRemoteVideosBeVisible } from '../../functions';

import PagePrevButton from '../../../conference/components/web/PagePrevButton';
import PageNextButton from '../../../conference/components/web/PageNextButton';

import Thumbnail from './Thumbnail';

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
     * Whether the filmstrip button is enabled.
     */
    _isFilmstripButtonEnabled: boolean,

    /**
     * The participants in the call.
     */
    _participants: Array<Object>,

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
class Filmstrip extends Component <Props> {

    /**
     * Initializes a new {@code Filmstrip} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: Props) {
        super(props);

        // Bind event handlers so they are only bound once for every instance.
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
        APP.keyboardshortcut.registerShortcut(
            'F',
            'filmstripPopover',
            this._onShortcutToggleFilmstrip,
            'keyboardShortcuts.toggleFilmstrip'
        );
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
        if (!this.props._disableSortable &&
            prevProps._currentLayout !== this.props._currentLayout) {
            this._changeSortable();
        }
    }

    _changeSortable() {
        if (this.props._currentLayout === LAYOUTS.TILE_VIEW) {
            this.$videosContainer.sortable({
                disabled: false,
                stop: () => {
                    const { data, current, pageSize } = this.props._pageInfo;
                    const mapData = keyBy(data, 'id');
                    const page = map(this.$videosContainer.children(), el =>
                        mapData[el.id]);
                    console.log(data, page);
                    data.splice((current - 1) * pageSize, pageSize, ...page);
                    this.props.dispatch(setPageInfo({ data }));
                    this.props.dispatch(setPageOrder({ by: 'userDefined' }));
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
        const filmstripStyle = { };
        const filmstripRemoteVideosContainerStyle = {};
        let remoteVideoContainerClassName = 'remote-videos-container';
        const { _currentLayout, _participants, _localParticipant, tileViewActive } = this.props;

        switch (_currentLayout) {
        case LAYOUTS.VERTICAL_FILMSTRIP_VIEW:
            // Adding 18px for the 2px margins, 2px borders on the left and right and 5px padding on the left and right.
            // Also adding 7px for the scrollbar.
            filmstripStyle.maxWidth = (interfaceConfig.FILM_STRIP_MAX_HEIGHT || 120) + 25;
            break;
        case LAYOUTS.TILE_VIEW: {
            // The size of the side margins for each tile as set in CSS.
            const { _columns, _rows, _filmstripWidth } = this.props;

            // if (_rows > _columns) {
            //     remoteVideoContainerClassName += ' has-overflow';
            // }

            filmstripRemoteVideosContainerStyle.width = _filmstripWidth;
            break;
        }
        }

        let remoteVideosWrapperClassName = 'filmstrip__videos';

        if (this.props._hideScrollbar) {
            remoteVideosWrapperClassName += ' hide-scrollbar';
        }

        let toolbar = null;

        if (!this.props._hideToolbar && this.props._isFilmstripButtonEnabled) {
            toolbar = this._renderToggleButton();
        }

        return (
            <div
                className = { `filmstrip ${this.props._className}` }
                style = { filmstripStyle }>
                <div
                    className = { this.props._videosClassName }
                    id = 'remoteVideos'>
                    <div
                        className = 'filmstrip__videos'
                        id = 'filmstripLocalVideo'>
                        <div id = 'filmstripLocalVideoThumbnail'>
                            {
                                !tileViewActive && <Thumbnail
                                    key = 'local'
                                    participantID = { _localParticipant.id } />
                            }
                        </div>
                    </div>
                    <PagePrevButton />
                    <div
                        className = { remoteVideosWrapperClassName }
                        id = 'filmstripRemoteVideos'>
                        {/*
                          * XXX This extra video container is needed for
                          * scrolling thumbnails in Firefox; otherwise, the flex
                          * thumbnails resize instead of causing overflow.
                          */}
                        <div
                            className = { remoteVideoContainerClassName }
                            id = 'filmstripRemoteVideosContainer'
                            ref={this._videosContainer}
                            style = { filmstripRemoteVideosContainerStyle }>
                            {
                                _participants.map(
                                    p => (
                                        <Thumbnail
                                            key = { p.id }
                                            participantID = { p.id } />
                                    ))
                            }
                        </div>
                    </div>
                    <PageNextButton />
                </div>
                { toolbar }
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
            <div className = 'filmstrip__toolbar'>
                <button
                    aria-label = { t('toolbar.accessibilityLabel.toggleFilmstrip') }
                    id = 'toggleFilmstripButton'
                    onClick = { this._onToolbarToggleFilmstrip }>
                    <Icon src = { icon } />
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
    const { iAmSipGateway, disableSortable, hideLocalVideo, hideRemoteVideos } = state['features/base/config'];
    const toolbarButtons = getToolbarButtons(state);
    const { visible } = state['features/filmstrip'];
    const reduceHeight
        = state['features/toolbox'].visible && toolbarButtons.length;
    const remoteVideosVisible = shouldRemoteVideosBeVisible(state);
    const { isOpen: shiftRight } = state['features/chat'];
    const className = `${remoteVideosVisible ? '' : 'hide-videos'} ${
        reduceHeight ? 'reduce-height' : ''
    } ${shiftRight ? 'shift-right' : ''}`.trim();
    const videosClassName = `filmstrip__videos${visible ? '' : ' hidden'}`;
    const { gridDimensions = {}, filmstripWidth } = state['features/filmstrip'].tileViewDimensions;
    const _currentLayout = getCurrentLayout(state);
    const localParticipant = getLocalParticipant(state);
    const tileViewActive = _currentLayout === LAYOUTS.TILE_VIEW;

    return {
        _className: className,
        _columns: gridDimensions.columns,
        _currentLayout,
        _disableSortable: disableSortable,
        _filmstripWidth: filmstripWidth,
        _hideFilmstrip: Boolean(hideRemoteVideos && hideLocalVideo),
        _hideScrollbar: Boolean(iAmSipGateway),
        _hideToolbar: Boolean(iAmSipGateway),
        _isFilmstripButtonEnabled: isButtonEnabled('filmstrip', state),
        _localParticipant: localParticipant,
        _pageInfo: state['features/video-layout'].pageInfo,
        _participants: getPageData(state),
        _rows: gridDimensions.rows,
        _videosClassName: videosClassName,
        _visible: visible,
        tileViewActive,
    };
}

export default translate(connect(_mapStateToProps)(Filmstrip));
