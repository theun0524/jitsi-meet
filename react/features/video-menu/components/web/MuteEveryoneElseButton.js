// @flow

import React from 'react';

import { createToolbarEvent, sendAnalytics } from '../../../analytics';
import { translate } from '../../../base/i18n';
import { IconMicDisabled, IconMicrophone, IconMuteEveryoneElse } from '../../../base/icons';
import { connect } from '../../../base/redux';
import { showConfirmDialog } from '../../../notifications';
import { muteAllParticipants } from '../../actions';
import AbstractMuteButton, {
    _mapStateToProps,
    type Props
} from '../AbstractMuteButton';

import RemoteVideoMenuButton from './RemoteVideoMenuButton';

/**
 * Implements a React {@link Component} which displays a button for audio muting
 * every participant in the conference except the one with the given
 * participantID
 */
class MuteEveryoneElseButton extends AbstractMuteButton {
    /**
     * Instantiates a new {@code MuteEveryoneElseButton}.
     *
     * @inheritdoc
     */
    constructor(props: Props) {
        super(props);

        this._handleClick = this._handleClick.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { mute, participantID, t } = this.props;

        return (
            <RemoteVideoMenuButton
                buttonText = { t(`videothumbnail.do${mute ? '' : 'un'}muteOthers`) }
                displayClass = { 'mutelink' }
                icon = { mute ? IconMicDisabled : IconMicrophone }
                id = { `mutelink_${participantID}` }
                // eslint-disable-next-line react/jsx-handler-names
                onClick = { this._handleClick } />
        );
    }

    _handleClick: () => void;

    /**
     * Handles clicking / pressing the button, and opens a confirmation dialog.
     *
     * @private
     * @returns {void}
     */
    _handleClick() {
        const { dispatch, participantID, mute, t } = this.props;
        const conference = APP.conference;
        const exclude = [ participantID ];
        const whom = exclude
            // eslint-disable-next-line no-confusing-arrow
            .map(id => conference.isLocalId(id)
                ? t('me')
                : conference.getParticipantDisplayName(id))
            .join(', ');

        sendAnalytics(createToolbarEvent('mute.everyoneelse.pressed'));
        showConfirmDialog({
            cancelButtonText: t('dialog.Cancel'),
            confirmButtonText: t(`videothumbnail.do${mute ? '' : 'un'}mute`),
            showCancelButton: true,
            text: t(`dialog.${mute ? '' : 'un'}muteEveryoneElseTitle`, { whom })
        }).then(result => {
            if (result.isConfirmed) {
                dispatch(muteAllParticipants(exclude, mute));
            }
        });
        // dispatch(openDialog(MuteEveryoneDialog, { exclude: [ participantID ], mute }));
    }
}

export default translate(connect(_mapStateToProps)(MuteEveryoneElseButton));
