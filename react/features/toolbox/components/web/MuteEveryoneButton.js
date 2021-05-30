// @flow

import { createToolbarEvent, sendAnalytics } from '../../../analytics';
import { translate } from '../../../base/i18n';
import { IconMuteEveryone } from '../../../base/icons';
import { getLocalParticipant, PARTICIPANT_ROLE } from '../../../base/participants';
import { connect } from '../../../base/redux';
import { AbstractButton, type AbstractButtonProps } from '../../../base/toolbox/components';
import { showConfirmDialog } from '../../../notifications';
import { muteAllParticipants } from '../../../video-menu/actions';

type Props = AbstractButtonProps & {

    /**
     * The Redux dispatch function.
     */
    dispatch: Function,

    /*
     ** Whether the local participant is a moderator or not.
     */
    isModerator: Boolean,

    /*
     ** Whether mute or unmute
     */
    mute: Boolean,

    /**
     * The ID of the local participant.
     */
    localParticipantId: string
};

/**
 * Implements a React {@link Component} which displays a button for audio muting
 * every participant (except the local one)
 */
class MuteEveryoneButton extends AbstractButton<Props, *> {
    constructor(props) {
        super(props);

        this.accessibilityLabel = 'toolbar.accessibilityLabel.muteEveryone';
        this.label = 'toolbar.muteEveryone';
        this.tooltip = 'toolbar.muteEveryone';
        this.icon = IconMuteEveryone;
    }

    /**
     * Handles clicking / pressing the button, and opens a confirmation dialog.
     *
     * @private
     * @returns {void}
     */
    _handleClick() {
        const { dispatch, localParticipantId, mute, t } = this.props;
        const conference = APP.conference;
        const exclude = [ localParticipantId ];
        const whom = exclude
            // eslint-disable-next-line no-confusing-arrow
            .map(id => conference.isLocalId(id)
                ? t('me')
                : conference.getParticipantDisplayName(id))
            .join(', ');

        sendAnalytics(createToolbarEvent('mute.everyone.pressed'));
        showConfirmDialog({
            cancelButtonText: t('dialog.Cancel'),
            confirmButtonText: t(`videothumbnail.domute`),
            showCancelButton: true,
            text: t(`dialog.muteEveryoneElseTitle`, { whom })
        }).then(result => {
            if (result.isConfirmed) {
                dispatch(muteAllParticipants(exclude, mute));
            }
        });
        // dispatch(openDialog(MuteEveryoneDialog, {
        //     exclude: [ localParticipantId ],
        //     mute
        // }));
    }
}

/**
 * Maps part of the redux state to the component's props.
 *
 * @param {Object} state - The redux store/state.
 * @param {Props} ownProps - The component's own props.
 * @returns {Object}
 */
function _mapStateToProps(state: Object, ownProps: Props) {
    const localParticipant = getLocalParticipant(state);
    const isModerator = localParticipant.role === PARTICIPANT_ROLE.MODERATOR;
    const { visible } = ownProps;
    const { disableRemoteMute } = state['features/base/config'];

    return {
        isModerator,
        localParticipantId: localParticipant.id,
        visible: visible && isModerator && !disableRemoteMute
    };
}

export default translate(connect(_mapStateToProps)(MuteEveryoneButton));
