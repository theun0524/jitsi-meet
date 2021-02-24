/* eslint-disable no-unused-vars */
/* global config */

import { MiddlewareRegistry } from '../base/redux';
import {
    PARTICIPANT_JOINED,
    PARTICIPANT_LEFT
} from '../base/participants/actionTypes';
import { speakerStatsAdded, speakerStatsUpdated } from './actions';

MiddlewareRegistry.register(store => next => action => {
    const result = next(action);

    switch (action.type) {
    case PARTICIPANT_JOINED: {
        _participantJoined(store, action);
        break;
    }

    case PARTICIPANT_LEFT: {
        _participantLeft(store, action);
        break;
    }
    }

    return result;
});

function _participantJoined(store, action) {
    const { dispatch, getState } = store;
    const state = getState();
    const {
        email,
        id,
        local,
        name,
    } = action.participant;
    const { conference } = state['features/base/conference'];
    const participant = conference?.participants[id];

    if (!conference || !participant) return;

    console.error('_participantJoined:', action);
    dispatch(speakerStatsAdded({
        nick: id,
        local: Boolean(local),
        name,
        email,
        joinTime: (new Date()).toJSON(),
        stats_id: local ? conference._statsCurrentId : participant?._statsID,
    }));
}

function _participantLeft(store, { participant }) {
    const { dispatch } = store;

    dispatch(speakerStatsUpdated({
        nick: participant.id,
        leaveTime: (new Date()).toJSON(),
    }));
}
