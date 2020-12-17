// @flow

import RefreshIcon from '@atlaskit/icon/glyph/refresh';
import {
    HeaderComponentProps,
    ModalHeader
} from '@atlaskit/modal-dialog';
import Spinner from '@atlaskit/spinner';
import Tooltip from '@atlaskit/tooltip';
import axios from 'axios';
import { keyBy } from 'lodash';
import React, { Component } from 'react';

import { Dialog } from '../../base/dialog';
import { translate } from '../../base/i18n';
import { getLocalParticipant } from '../../base/participants';
import { connect } from '../../base/redux';

import SpeakerStatsItem from './SpeakerStatsItem';
import SpeakerStatsLabels from './SpeakerStatsLabels';

import s from './SpeakerStats.module.scss';

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

    loading: Boolean,

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
            loading: false
        };

        // Bind event handlers so they are only bound once per instance.
        this._updateStats = this._updateStats.bind(this);
        this._onRefresh = this._onRefresh.bind(this);
        this._customHeader = this._customHeader.bind(this);
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
        this.setState({ loading: true });
        this._loadStatsFromDB();
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
                customHeader = { this._customHeader }
                submitDisabled = { true }>
                <div className = 'speaker-stats'>
                    <SpeakerStatsLabels />
                    { this.state.loading ? <Spinner appearance = 'invert' /> : items }
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
        const { conference, baseURL } = this.props;
        const AUTH_API_BASE = process.env.VMEETING_API_BASE;
        const apiBaseUrl = `${baseURL.origin}${AUTH_API_BASE}`;

        const apiUrl = `${apiBaseUrl}/plog?meetingId=${conference.room.meetingId}`;

        try{
            axios.get(apiUrl).then(logs => {
                console.log(this.state.stats, logs);
                this.setState({ logs: keyBy(logs.data, 'nick'), loading: false });
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
