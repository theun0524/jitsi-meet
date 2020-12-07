// @flow

import React, { Component } from 'react';

import { Dialog } from '../../base/dialog';
import { translate } from '../../base/i18n';
import { getLocalParticipant } from '../../base/participants';
import { connect } from '../../base/redux';

import SpeakerStatsItem from './SpeakerStatsItem';
import SpeakerStatsLabels from './SpeakerStatsLabels';

import axios from 'axios';

declare var interfaceConfig: Object;

/**
 * The type of the React {@code Component} props of {@link SpeakerStats}.
 */
type Props = {

    /**
     * The display name for the local participant obtained from the redux store.
     */
    _localDisplayName: string,

    /**
     * The JitsiConference from which stats will be pulled.
     */
    conference: Object,

    baseURL: Object,

    participants: Object,

    /**
     * The function to translate human-readable text.
     */
    t: Function
};

/**
 * The type of the React {@code Component} state of {@link SpeakerStats}.
 */
type State = {

    /**
     * The stats summary provided by the JitsiConference.
     */
    stats: Object,

    /**
     * The participant logs provided by the JitsiConference.
     */
    logs: Object,

    loaded: Boolean,

    participants: Object
};

/**
 * React component for displaying a list of speaker stats.
 *
 * @extends Component
 */
class SpeakerStats extends Component<Props, State> {
    _updateInterval: IntervalID;

    /**
     * Initializes a new SpeakerStats instance.
     *
     * @param {Object} props - The read-only React Component props with which
     * the new instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            stats: this.props.conference.getSpeakerStats(),
            logs: {},
            loaded: false
        };

        // Bind event handlers so they are only bound once per instance.
        this._updateStats = this._updateStats.bind(this);
        this._onRefresh = this._onRefresh.bind(this);
    }

    /**
     * Begin polling for speaker stats updates.
     *
     * @inheritdoc
     */
    componentDidMount() {
        this._loadStatsFromDB();

        this._updateInterval = setInterval(this._updateStats, 1000);
    }

    /**
     * Stop polling for speaker stats updates.
     *
     * @inheritdoc
     * @returns {void}
     */
    componentWillUnmount() {
        clearInterval(this._updateInterval);
    }

    _onRefresh: () => void;

    /**
     * Deletes a recent entry.
     *
     * @param {Object} entry - The entry to be deleted.
     * @inheritdoc
     */
    _onRefresh() {
        this.setState({ ...this.state, loaded: false });
        this._loadStatsFromDB();
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const userIds = Object.keys(this.state.stats);
        const items = userIds.map(userId => this._createStatsItem(userId));

        return (
            <Dialog
                cancelKey = { 'dialog.close' }
                width = { 'large' }
                submitDisabled = { true }
                titleKey = 'speakerStats.speakerStats'>
                <div className = 'speaker-stats'>
                    <SpeakerStatsLabels onRefresh = { this._onRefresh }/>
                    { this.state.loaded? items : null }
                </div>
            </Dialog>
        );
    }

    /**
     * Create a SpeakerStatsItem instance for the passed in user id.
     *
     * @param {string} userId -  User id used to look up the associated
     * speaker stats from the jitsi library.
     * @returns {SpeakerStatsItem|null}
     * @private
     */
    _createStatsItem(userId) {
        const statsModel = this.state.stats[userId];
        const logModel = this.state.logs[userId];

        if (!statsModel || !logModel) {
            return null;
        }

        // variables for indicating whether or not audio and video is accessible
        // the variables videoMuted and audioMuted will be passed as props to SpeakerStatsItem
        const participantId = statsModel._userId;
        let videoMuted = false;
        let audioMuted = false;
        const tracks = Object.values(APP.store.getState()['features/base/tracks'])
        tracks.forEach((track) => {
            if(track.participantId == participantId && track.mediaType == "video") {
                videoMuted = track.muted;
            }
            if(track.participantId == participantId && track.mediaType == "audio") {
                audioMuted = track.muted;
            }
        });

        const isDominantSpeaker = statsModel.isDominantSpeaker();
        const dominantSpeakerTime = statsModel.getTotalDominantSpeakerTime();
        const hasLeft = statsModel.hasLeft();

        const participantLog = logModel;

        let displayName;

        if (statsModel.isLocalStats()) {
            const { t } = this.props;
            const meString = t('me');

            displayName = this.props._localDisplayName;
            displayName
                = displayName ? `${displayName} (${meString})` : meString;
        } else {
            displayName
                = this.state.stats[userId].getDisplayName()
                    || interfaceConfig.DEFAULT_REMOTE_DISPLAY_NAME;
        }

        return (
            <SpeakerStatsItem
                displayName = { displayName }
                dominantSpeakerTime = { dominantSpeakerTime }
                hasLeft = { hasLeft }
                isDominantSpeaker = { isDominantSpeaker }
                participantLog = { participantLog }
                videoMuted = { videoMuted }
                audioMuted = { audioMuted }
                key = { userId } />
        );
    }

    _updateStats: () => void;

    /**
     * Update the internal state with the latest speaker stats.
     *
     * @returns {void}
     * @private
     */
    _updateStats() {
        const stats = this.props.conference.getSpeakerStats();

        this.setState({ ...this.state, stats: stats });
    }

    _loadStatsFromDB: () => void;

    _loadStatsFromDB(){
        const {
            conference,
            baseURL
        } = this.props;

        const AUTH_API_BASE = process.env.VMEETING_API_BASE;
        const apiBaseUrl = `${baseURL.origin}${AUTH_API_BASE}`;
        const room_name = conference.options.name;
        const meetingId = conference.room.meetingId;

        const apiUrl = `${apiBaseUrl}/plog/participants?name=${room_name}&meetingId=${meetingId}`;

        try{
            axios.get(apiUrl).then(logs => {
                this.setState({ ...this.state, logs: logs.data[0], loaded: true });
            });
        }
        catch(err){    
            console.log(err);
        }
    }
}

/**
 * Maps (parts of) the redux state to the associated SpeakerStats's props.
 *
 * @param {Object} state - The redux state.
 * @private
 * @returns {{
 *     _localDisplayName: ?string
 * }}
 */
function _mapStateToProps(state) {
    const localParticipant = getLocalParticipant(state);

    return {
        /**
         * The local display name.
         *
         * @private
         * @type {string|undefined}
         */
        _localDisplayName: localParticipant && localParticipant.name,
        baseURL: state['features/base/connection'].locationURL,
        participants: state['features/base/participants']
    };
}

export default translate(connect(_mapStateToProps)(SpeakerStats));
