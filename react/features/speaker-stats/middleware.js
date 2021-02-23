/* eslint-disable no-unused-vars */
/* global config */

import { max, sortBy } from 'lodash';

import { MiddlewareRegistry } from '../base/redux';
import {
    PARTICIPANT_JOINED,
    PARTICIPANT_LEFT
} from '../base/participants/actionTypes';
import {
    getDuration,
    mergeSpeakerStats,
    speakerStatsLoaded,
} from './actions';

MiddlewareRegistry.register(store => next => action => {
    const { dispatch, getState } = store;
    const result = next(action);

    switch (action.type) {
    case PARTICIPANT_JOINED: {
        dispatch(speakerStatsLoaded(_participantJoined(getState(), action)));
        break;
    }

    case PARTICIPANT_LEFT: {
        dispatch(speakerStatsLoaded(_participantLeft(getState(), action)));
        break;
    }
    }

    return result;
});

function _participantJoined(state, action) {
    const {
        avatarID,
        avatarURL,
        botType,
        connectionStatus,
        dominantSpeaker,
        email,
        id,
        isFakeParticipant,
        isJigasi,
        loadableAvatarUrl,
        local,
        name,
        pinned,
        presence,
        role
    } = action.participant;
    const { conference } = state['features/base/conference'];
    const stats = state['features/speaker-stats'];

    if (!conference) return stats;

    const participant = conference.participants[id] || {};
    const tracks = participant.tracks;
    const { muted: audioMuted } = tracks?.find(t => t.type === 'audio') || {};
    const { muted: videoMuted } = tracks?.find(t => t.type === 'video') || {};

    return mergeSpeakerStats({
        ...stats,
        [id]: {
            nick: id,
            local: local || false,
            name,
            email,
            joinTime: (new Date()).toJSON(),
            // leaveTime,
            // duration,
            // isPresenter,
            videoMuted,
            audioMuted,
            stats_id: local ? conference.myUserId() : participant._statsID,
        }
    });
}

function _participantLeft(state, { participant }) {
    const stats = state['features/speaker-stats'];

    const item = stats[participant.id];
    if (!item) return stats;

    item.leaveTime = (new Date()).toJSON();
    item.duration = (item.duration || 0) + getDuration(item);
    // console.error('participantLeft:', item);

    return mergeSpeakerStats(stats);
}
