// @flow

import FieldText from '@atlaskit/field-text';
import RefreshIcon from '@atlaskit/icon/glyph/refresh';
import {
    HeaderComponentProps,
    ModalHeader
} from '@atlaskit/modal-dialog';
import Spinner from '@atlaskit/spinner';
import Tooltip from '@atlaskit/tooltip';
import { filter, keyBy, map } from 'lodash';
import React, { Component } from 'react';

import { Dialog } from '../../base/dialog';
import { translate } from '../../base/i18n';
import { connect } from '../../base/redux';
import { loadSpeakerStats } from '../actions';

import SpeakerStatsItem from './SpeakerStatsItem';
import SpeakerStatsLabels from './SpeakerStatsLabels';

import s from './SpeakerStats.module.scss';
import { MEDIA_TYPE, VIDEO_TYPE } from '../../base/media';
import { getLocalVideoTrack, getTrackByMediaTypeAndParticipant, isLocalTrackMuted, isRemoteTrackMuted } from '../../base/tracks';

/**
 * The type of the React {@code Component} props of {@link SpeakerStats}.
 */
type Props = {

    /**
     * The JitsiConference from which stats will be pulled.
     */
    conference: Object,

    /**
     * The function to translate human-readable text.
     */
    t: Function
};

/**
 * The type of the React {@code Component} state of {@link SpeakerStats}.
 */
type State = {

    loading: Boolean,

    /**
     * The search query inserted by the user
     */
    searchQuery: String,

    /**
     * An array of items object containing search results to be returned
     */
    searchResult: Array
};

/**
 * React component for displaying a list of speaker stats.
 *
 * @extends Component
 */
class SpeakerStats extends Component<Props, State> {
    /**
     * Initializes a new SpeakerStats instance.
     *
     * @param {Object} props - The read-only React Component props with which
     * the new instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            searchQuery: '',
            searchResult: [] //initialize the initialy state variable as an empty array
        };

        this._onRefresh = this._onRefresh.bind(this);
        this._customHeader = this._customHeader.bind(this);
        this.filterParticipants = this.filterParticipants.bind(this);
        this.handleSearchInput = this.handleSearchInput.bind(this);
    }

    /**
     * Begin polling for speaker stats updates.
     *
     * @inheritdoc
     */
    componentDidMount() {
        this._onRefresh();
    }

    /**
     * Stop polling for speaker stats updates.
     *
     * @inheritdoc
     * @returns {void}
     */
    componentWillUnmount() {
    }

    _onRefresh: () => void;

    /**
     * Deletes a recent entry.
     *
     * @param {Object} entry - The entry to be deleted.
     * @inheritdoc
     */
    _onRefresh() {
        const { conference, dispatch } = this.props;
        
        this.setState({ loading: true });
        dispatch(loadSpeakerStats(conference.room.meetingId)).then(() => {
            this.setState({ loading: false });
        });
    }

    _customHeader = (props: HeaderComponentProps) => {
        const { t } = this.props;
        const { loading } = this.state;

        return (
            <ModalHeader {...props}>
                <h4 className={ s.titleContainer }>
                    <span>
                        { t('speakerStats.speakerStats') }
                    </span>
                    { !loading && (
                        <div className = { s.button } onClick = { this._onRefresh }>
                            <Tooltip content = { t('speakerStats.refresh') } position = 'top'>
                                <RefreshIcon size = 'small' />
                            </Tooltip>
                        </div>
                    )}
                </h4>
            </ModalHeader>
        );
    };
      
    /**
     * Function to handle search inputs
     * @param {Object} event from search input box
     */
    handleSearchInput = event => {
        this.setState(
            { searchQuery: event.target.value },
            () => this.filterParticipants(this.state.searchQuery)
        );
    }

    /**
     * Core function that filters participants based on the search input
     * @param {String} filterText the string from search input, based upon which to filter result
     */
    filterParticipants = filterText => {
        const { stats } = this.props;
        filterText = filterText.toLowerCase();
        this.setState({
            searchResult: filter(stats, ({ name }) =>
                name && name.toLowerCase().includes(filterText)
            )
        });
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { searchQuery, searchResult } = this.state;
        const { stats } = this.props;
        let items = [];

        if (searchQuery) {
            items = map(searchResult, item => (
                <SpeakerStatsItem
                    hasLeft = { Boolean(item.leaveTime) }
                    key = { item.nick }
                    { ...item } />
            ));
        } else {
            //first created items, when there has been no search text or search result
            items = map(stats, item => (
                <SpeakerStatsItem
                    hasLeft = { Boolean(item.leaveTime) }
                    key = { item.nick }
                    { ...item } />
            ));
        }

        return (
            <Dialog
                cancelKey = { 'dialog.close' }
                customHeader = { this._customHeader }
                submitDisabled = { true }
                width = { 'large' }
                titleKey = 'speakerStats.speakerStats'>
                
                <div className = 'speaker-stats-searchbox'>
                    <FieldText
                        compact = { true }
                        id = 'searchBox'
                        isLabelHidden = { true }
                        placeholder =  { this.props.t('speakerStats.searchPlaceholder') }
                        shouldFitContainer = { true }
                        // eslint-disable-next-line react/jsx-no-bind
                        onChange = { this.handleSearchInput }
                        type = 'text'
                        value = { this.state.searchQuery } />
                </div>

                <hr className = { s.divider } />

                <div className = 'speaker-stats'>
                    <SpeakerStatsLabels />
                    { this.state.loading
                        ? <Spinner appearance = 'invert' />
                        : items }
                </div>
            </Dialog>
        );
    }
}

/**
 * Maps (parts of) the redux state to the associated SpeakerStats's props.
 *
 * @param {Object} state - The redux state.
 * @private
 * @returns Object
 */
function _mapStateToProps(state) {
    const { conference } = state['features/base/conference'];
    const participants = state['features/base/participants'];
    const tracks = state['features/base/tracks'];
    const onMap = keyBy(participants, ({ id, local }) => local
        ? conference?._statsCurrentId
        : conference?.participants[id]?._statsID);
    const stats = state['features/speaker-stats'];

    return {
        stats: map(stats.items, item => {
            const { id, local } = onMap[item.stats_id] || {};

            if (id) {
                const videoTrack = local
                    ? getLocalVideoTrack(tracks)
                    : getTrackByMediaTypeAndParticipant(tracks, MEDIA_TYPE.VIDEO, id);

                return {
                    ...item,
                    audioMuted: local
                        ? isLocalTrackMuted(tracks, MEDIA_TYPE.AUDIO)
                        : isRemoteTrackMuted(tracks, MEDIA_TYPE.AUDIO, id),
                    videoMuted: !videoTrack || videoTrack.muted,
                    isPresenter: videoTrack?.videoType === VIDEO_TYPE.DESKTOP
                }
            }
            return item;
        })
    };
}

export default translate(connect(_mapStateToProps)(SpeakerStats));
