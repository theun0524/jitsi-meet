// @flow

import { keyBy } from 'lodash';
import { ReducerRegistry, set, assign } from '../base/redux';

import {
    SPEAKER_STATS_LOADED,
    SPEAKER_STATS_UPDATED,
    SPEAKER_STATS_REMOVED,
} from './actionTypes';

/**
 * Listen for actions that contain the conference object, so that it can be
 * stored for use by other action creators.
 */
ReducerRegistry.register(
    'features/speaker-stats',
    (state = {}, action) => {
        switch (action.type) {
        case SPEAKER_STATS_LOADED:
            return _speakerStatsLoaded(state, action);

        case SPEAKER_STATS_REMOVED:
            return _speakerStatsRemoved(state, action);

        case SPEAKER_STATS_UPDATED:
            return _speakerStatsUpdated(state, action);
        }

        return state;
    });

function _speakerStatsLoaded(state, { stats }) {
    return keyBy(stats, 'nick');
}

function _speakerStatsRemoved(state, { item }) {
    if (!item) return state;

    return set(state, item.nick);
}

function _speakerStatsUpdated(state, { item }) {
    if (!item || !item.nick) return state;

    const found = state[item.nick];
    if (!found) {
        return item.joinTime ? set(state, item.nick, item) : state;
    }
    return set(state, item.nick, assign(found, item));
}
