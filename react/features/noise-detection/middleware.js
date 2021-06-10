// @flow

import { APP_WILL_MOUNT, APP_WILL_UNMOUNT } from '../base/app';
import { CONFERENCE_JOINED } from '../base/conference';
import { i18next } from '../base/i18n';
import { JitsiConferenceEvents } from '../base/lib-jitsi-meet';
import { MiddlewareRegistry } from '../base/redux';
import { playSound, registerSound, unregisterSound } from '../base/sounds';
import { hideNotification, NOTIFICATION_TIMEOUT, showNotification, showToast } from '../notifications';

import { setNoisyAudioInputNotificationUid } from './actions';
import { NOISY_AUDIO_INPUT_SOUND_ID } from './constants';
import { NOISY_AUDIO_INPUT_SOUND_FILE } from './sounds';

MiddlewareRegistry.register(store => next => action => {
    const result = next(action);

    switch (action.type) {
    case APP_WILL_MOUNT:
        store.dispatch(registerSound(NOISY_AUDIO_INPUT_SOUND_ID, NOISY_AUDIO_INPUT_SOUND_FILE));
        break;
    case APP_WILL_UNMOUNT:
        store.dispatch(unregisterSound(NOISY_AUDIO_INPUT_SOUND_ID));
        break;
    case CONFERENCE_JOINED: {
        const { dispatch, getState } = store;
        const { conference } = action;

        conference.on(
            JitsiConferenceEvents.TRACK_MUTE_CHANGED,
            track => {
                const { noisyAudioInputNotificationUid } = getState()['features/noise-detection'];

                // Hide the notification in case the user mutes the microphone
                if (noisyAudioInputNotificationUid && track.isAudioTrack() && track.isLocal() && track.isMuted()) {
                    dispatch(hideNotification(noisyAudioInputNotificationUid));
                    dispatch(setNoisyAudioInputNotificationUid());
                }
            });
        conference.on(
            JitsiConferenceEvents.NOISY_MIC, () => {
                showToast({
                    title: i18next.t('toolbar.noisyAudioInputDesc'),
                    timeout: NOTIFICATION_TIMEOUT * 2,
                    icon: 'warning' });

                dispatch(playSound(NOISY_AUDIO_INPUT_SOUND_ID));
            });
        break;
    }
    }

    return result;
});
