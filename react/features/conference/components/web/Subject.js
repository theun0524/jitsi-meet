/* @flow */

import Tooltip from '@atlaskit/tooltip';
import React, { Component } from 'react';
import Swal from 'sweetalert2';

import { getConferenceName, getConferenceTimeRemained } from '../../../base/conference/functions';
import { Icon, IconEdit } from '../../../base/icons';
import { isHost } from '../../../base/jwt';
import { getParticipantCount } from '../../../base/participants/functions';
import { connect } from '../../../base/redux';
import { translate } from '../../../base/i18n';
import { isToolboxVisible } from '../../../toolbox/functions.web';
import ConferenceTimer from '../ConferenceTimer';

import ParticipantsCount from './ParticipantsCount';

import s from './Subject.module.scss';
import { setSubject } from '../../../base/conference';

/**
 * The type of the React {@code Component} props of {@link Subject}.
 */
type Props = {

    /**
     * Whether the conference timer should be shown or not.
     */
    _hideConferenceTimer: Boolean,

    /**
     * Whether the participant count should be shown or not.
     */
    _showParticipantCount: boolean,

    /**
     * Whether the conference subject should be shown or not.
     */
    _showSubject: boolean,

    /**
     * The subject or the of the conference.
     * Falls back to conference name.
     */
    _subject: string,

    /**
     * Indicates whether the component should be visible or not.
     */
    _visible: boolean
};

/**
 * Subject react component.
 *
 * @class Subject
 */
class Subject extends Component<Props> {

    constructor(props) {
        super(props);

        this._onEditSubject = this._onEditSubject.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const {
            _hideConferenceTimer,
            _isHost,
            _showParticipantCount,
            _showSubject,
            _subject,
            _visible,
            t
        } = this.props;

        return (
            <div className = { `subject ${_visible ? 'visible' : ''} ${s.container}` }>
                { _showSubject && (
                    <div className = {s.textContainer}>
                        <span className = 'subject-text'>{ _subject }</span>
                        { _isHost && (
                            <div
                                className = { s.button }
                                onClick = { this._onEditSubject }>
                                <Tooltip content = { t('dialog.edit') } position = 'bottom'>
                                    <Icon size = { 16 } src = { IconEdit } />
                                </Tooltip>
                            </div>
                        )}
                    </div>
                )}
                { _showParticipantCount && <ParticipantsCount /> }
                { !_hideConferenceTimer && <ConferenceTimer /> }
            </div>
        );
    }

    _onEditSubject() {
        const { dispatch, t } = this.props;

        Swal.fire({
            text: t('dialog.changeSubject'),
            input: 'text',
            showCancelButton: true,
            confirmButtonText: t('dialog.Change'),
            cancelButtonText: t('dialog.Cancel')
        }).then(result => {
            if (result.isConfirmed) {
                dispatch(setSubject(result.value));
            }
        });
    }
}

/**
 * Maps (parts of) the Redux state to the associated
 * {@code Subject}'s props.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {{
 *     _hideConferenceTimer: boolean,
 *     _showParticipantCount: boolean,
 *     _showSubject: boolean,
 *     _subject: string,
 *     _visible: boolean
 * }}
 */
function _mapStateToProps(state) {
    const participantCount = getParticipantCount(state);
    const timeRemained = getConferenceTimeRemained(state);
    const { hideConferenceTimer, hideConferenceSubject, hideParticipantsStats } = state['features/base/config'];

    return {
        _hideConferenceTimer: Boolean(hideConferenceTimer),
        _isHost: isHost(state),
        _showParticipantCount: participantCount > 2 && !hideParticipantsStats,
        _showSubject: !hideConferenceSubject,
        _subject: getConferenceName(state),
        _visible: Boolean(timeRemained) || isToolboxVisible(state)
    };
}

export default translate(connect(_mapStateToProps)(Subject));
