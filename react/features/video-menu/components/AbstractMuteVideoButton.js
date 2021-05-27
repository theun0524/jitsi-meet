// @flow

import {
    createRemoteVideoMenuButtonEvent,
    sendAnalytics
} from '../../analytics';
import { IconMicDisabled } from '../../base/icons';
import { MEDIA_TYPE } from '../../base/media';
import { AbstractButton, type AbstractButtonProps } from '../../base/toolbox/components';
import { isRemoteTrackMuted } from '../../base/tracks';

import { muteRemoteVideo } from '../actions';
import { showConfirmDialog } from '../../notifications';
import { muteRemote } from '../actions.any';

export type Props = AbstractButtonProps & {

    /**
     * Boolean to indicate if the video track of the participant is muted or
     * not.
     */
    _videoTrackMuted: boolean,

    /**
     * The redux {@code dispatch} function.
     */
    dispatch: Function,

    /**
     * The ID of the participant object that this button is supposed to
     * mute/unmute.
     */
    participantID: string,

    /**
     * The function to be used to translate i18n labels.
     */
    t: Function
};

/**
 * An abstract remote video menu button which mutes the remote participant.
 */
export default class AbstractMuteVideoButton extends AbstractButton<Props, *> {
    accessibilityLabel = 'toolbar.accessibilityLabel.remoteMuteVideo';
    icon = IconMicDisabled;
    label = 'videothumbnail.domute';
    toggledLabel = 'videothumbnail.muted';

    /**
     * Handles clicking / pressing the button, and mutes the participant.
     *
     * @private
     * @returns {void}
     */
    _handleClick() {
        const { mute, dispatch, participantID, t } = this.props;

        sendAnalytics(createRemoteVideoMenuButtonEvent(
            'mutevideo.button',
            {
                'participant_id': participantID
            }));

        showConfirmDialog({
            cancelButtonText: t('dialog.Cancel'),
            confirmButtonText: t(`videothumbnail.do${mute ? '' : 'un'}muteVideo`),
            showCancelButton: true,
            text: t(`dialog.${mute ? '' : 'un'}muteVideoParticipantTitle`)
        }).then(result => {
            if (result.isConfirmed) {
                dispatch(muteRemote(participantID, MEDIA_TYPE.VIDEO));
            }
        });
        // dispatch(openDialog(MuteRemoteParticipantDialog, { participantID }));
    }

    /**
     * Renders the item disabled if the participant is muted.
     *
     * @inheritdoc
     */
    _isDisabled() {
        const { _disableRemoteUnmuteVideo, _videoTrackMuted } = this.props;
        return _disableRemoteUnmuteVideo ? _videoTrackMuted : false;
    }

    /**
     * Renders the item toggled if the participant is muted.
     *
     * @inheritdoc
     */
    _isToggled() {
        const { _disableRemoteUnmuteVideo, _videoTrackMuted } = this.props;
        return _disableRemoteUnmuteVideo ? _videoTrackMuted : false;
    }
}

/**
 * Function that maps parts of Redux state tree into component props.
 *
 * @param {Object} state - Redux state.
 * @param {Object} ownProps - Properties of component.
 * @private
 * @returns {{
 *      _videoTrackMuted: boolean
 *  }}
 */
export function _mapStateToProps(state: Object, ownProps: Props) {
    const tracks = state['features/base/tracks'];
    const { disableRemoteUnmuteVideo } = state['features/base/config'];

    return {
        _videoTrackMuted: isRemoteTrackMuted(
            tracks, MEDIA_TYPE.VIDEO, ownProps.participantID),
        _disableRemoteUnmuteVideo: disableRemoteUnmuteVideo
    };
}
