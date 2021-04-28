// @flow

import Filmstrip from '../../../modules/UI/videolayout/Filmstrip';
import VideoLayout from '../../../modules/UI/videolayout/VideoLayout.js';
import { CONFERENCE_JOINED, CONFERENCE_WILL_LEAVE } from '../base/conference';
import {
    DOMINANT_SPEAKER_CHANGED,
    PARTICIPANT_JOINED,
    PARTICIPANT_LEFT,
    PARTICIPANT_UPDATED,
    PIN_PARTICIPANT,
    getParticipantById
} from '../base/participants';
import { MiddlewareRegistry } from '../base/redux';
import { TRACK_ADDED, TRACK_REMOVED } from '../base/tracks';
import { SET_FILMSTRIP_VISIBLE } from '../filmstrip';
import { ORDERED_TILE_VIEW, SET_TILE_VIEW_ORDER } from './actionTypes';
import { shouldDisplayTileView } from './functions';

import './middleware.any';

declare var APP: Object;

/**
 * Middleware which intercepts actions and updates the legacy component
 * {@code VideoLayout} as needed. The purpose of this middleware is to redux-ify
 * {@code VideoLayout} without having to simultaneously react-ifying it.
 *
 * @param {Store} store - The redux store.
 * @returns {Function}
 */
// eslint-disable-next-line no-unused-vars
MiddlewareRegistry.register(store => next => action => {
    // Purposefully perform additional actions after state update to mimic
    // being connected to the store for updates.
    const result = next(action);

    switch (action.type) {
    case CONFERENCE_JOINED:
        VideoLayout.mucJoined();
        break;

    case CONFERENCE_WILL_LEAVE:
        VideoLayout.reset();
        break;

    case PARTICIPANT_JOINED:
        if (!action.participant.local) {
            VideoLayout.addRemoteParticipantContainer(
                getParticipantById(store.getState(), action.participant.id));
            VideoLayout.reorderVideos();
        }
        break;

    case PARTICIPANT_LEFT:
        VideoLayout.removeParticipantContainer(action.participant.id);
        VideoLayout.reorderVideos();
        break;

    case PARTICIPANT_UPDATED: {
        // Look for actions that triggered a change to connectionStatus. This is
        // done instead of changing the connection status change action to be
        // explicit in order to minimize changes to other code.
        if (typeof action.participant.connectionStatus !== 'undefined') {
            VideoLayout.onParticipantConnectionStatusChanged(
                action.participant.id,
                action.participant.connectionStatus);
        }

        // move muted videos to the end of DOM, default id=0, no parameter passed
        if (typeof action.participant.name !== 'undefined') {
            VideoLayout.reorderVideos();
        }
        break;
    }

    case DOMINANT_SPEAKER_CHANGED:
        VideoLayout.onDominantSpeakerChanged(action.participant.id);
        break;

    case ORDERED_TILE_VIEW: {
        const state = store.getState();
        if (shouldDisplayTileView(state)) {
            const { width, height } = state['features/filmstrip'].tileViewDimensions.thumbnailSize;

            // Once the thumbnails are reactified this should be moved there too.
            Filmstrip.resizeThumbnailsForTileView(width, height, true);
        }
        break;
    }

    case PIN_PARTICIPANT:
        VideoLayout.onPinChange(action.participant?.id);
        break;

    case SET_FILMSTRIP_VISIBLE:
        VideoLayout.resizeVideoArea();
        break;

    case SET_TILE_VIEW_ORDER:
        VideoLayout.reorderVideos();
        break;

    case TRACK_ADDED:
        if (!action.track.local) {
            VideoLayout.onRemoteStreamAdded(action.track.jitsiTrack);
            VideoLayout.reorderVideos();
        }
        break;

    case TRACK_REMOVED:
        if (!action.track.local) {
            VideoLayout.onRemoteStreamRemoved(action.track.jitsiTrack);
            VideoLayout.reorderVideos();
        }
        break;
    }

    return result;
});
