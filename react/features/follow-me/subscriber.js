// @flow

import { getCurrentConference } from '../base/conference';
import { isHost } from '../base/jwt';
import {
    getPinnedParticipant,
    isLocalParticipantModerator
} from '../base/participants';
import { StateListenerRegistry } from '../base/redux';
import { isRecording, isStreaming } from '../recording';
import { shouldDisplayTileView } from '../video-layout/functions';

import { FOLLOW_ME_COMMAND } from './constants';
import { isFollowMeEnabled } from './functions';

/**
 * Subscribes to changes to the Follow Me setting for the local participant to
 * notify remote participants of current user interface status.
 * Changing newSelectedValue param to off, when feature is turned of so we can
 * notify all listeners.
 */
StateListenerRegistry.register(
    /* selector */ state => state['features/base/conference'].followMeEnabled,
    /* listener */ (newSelectedValue, store) => _sendFollowMeCommand(newSelectedValue || 'off', store));

/**
 * Subscribes to changes to the currently pinned participant in the user
 * interface of the local participant.
 */
StateListenerRegistry.register(
    /* selector */ state => {
        const pinnedParticipant = getPinnedParticipant(state);

        return pinnedParticipant ? pinnedParticipant.id : null;
    },
    /* listener */ _sendFollowMeCommand);

/**
 * Subscribes to changes to the shared document (etherpad) visibility in the
 * user interface of the local participant.
 *
 * @param sharedDocumentVisible {Boolean} {true} if the shared document was
 * shown (as a result of the toggle) or {false} if it was hidden
 */
StateListenerRegistry.register(
    /* selector */ state => state['features/etherpad'].editing,
    /* listener */ _sendFollowMeCommand);

/**
 * Subscribes to changes to the filmstrip visibility in the user interface of
 * the local participant.
 */
StateListenerRegistry.register(
    /* selector */ state => state['features/filmstrip'].visible,
    /* listener */ _sendFollowMeCommand);

/**
 * Subscribes to changes to the tile view setting in the user interface of the
 * local participant.
 */
StateListenerRegistry.register(
    /* selector */ state => state['features/video-layout'].tileViewEnabled,
    /* listener */ _sendFollowMeCommand);

/**
 * Subscribes to changes to the tile view order setting.
 */
 StateListenerRegistry.register(
    /* selector */ state => state['features/video-layout'].order,
    /* listener */ _sendFollowMeCommand);

/**
 * selector for returning state from redux that should be respected by
 * other participants while follow me is enabled.
 *
 * @param {Object} state - The redux state.
 * @returns {Object}
 */
export function getFollowMeState(state) {
    const pinnedParticipant = getPinnedParticipant(state);
    const followMeState = {
        filmstripVisible: state['features/filmstrip'].visible,
        nextOnStage: pinnedParticipant && pinnedParticipant.id,
        sharedDocumentVisible: state['features/etherpad'].editing,
        tileViewEnabled: shouldDisplayTileView(state)
    };

    // mark sendToRecorder, if followMe is disabled and jibri is running
    if (!isFollowMeEnabled(state) &&
        (isRecording(state, true) || isStreaming(state, true))) {
        followMeState.sendToRecorder = true;
    }

    return followMeState;
}

/**
 * Sends the follow-me command, when a local property change occurs.
 *
 * @param {*} newSelectedValue - The changed selected value from the selector.
 * @param {Object} store - The redux store.
 * @private
 * @returns {void}
 */
function _sendFollowMeCommand(
        newSelectedValue, store) { // eslint-disable-line no-unused-vars
    const state = store.getState();
    const conference = getCurrentConference(state);
    const { chatOnlyGuestEnabled, followMeEnabled } = state['features/base/config'];
    const isGuest = !isHost(state);
    const forceSend = isRecording(state, true) || isStreaming(state, true);

    if (!conference) {
        return;
    }

    // Only a moderator is allowed to send commands.
    if (!isLocalParticipantModerator(state)) {
        return;
    }

    if (newSelectedValue === 'off') {
        // if the change is to off, local user turned off follow me and
        // we want to signal this

        conference.sendCommandOnce(
            FOLLOW_ME_COMMAND,
            { attributes: { off: true } }
        );

        return;
    } if (!forceSend && typeof followMeEnabled !== 'undefined') {
        if (!followMeEnabled) return;
    } else if (!forceSend && !state['features/base/conference'].followMeEnabled) {
        return;
    } else if (chatOnlyGuestEnabled && isGuest) {
        return;
    }

    conference.sendCommand(
        FOLLOW_ME_COMMAND,
        {
            attributes: getFollowMeState(state),
            value: JSON.stringify(state['features/video-layout'].order)
        }
    );
}
