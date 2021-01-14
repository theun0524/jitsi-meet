// @flow
/* global APP */

import Button from '@atlaskit/button';
import { keyBy } from 'lodash';
import React from 'react';
import { toArray } from 'react-emoji-render';

import { KickRemoteParticipantDialog } from '../../../../features/remote-video-menu';
import { openDialog } from '../../../base/dialog';
import { translate } from '../../../base/i18n';
import { isLocalParticipantModerator } from '../../../base/participants';
import { Linkify } from '../../../base/react';
import { connect, equals } from '../../../base/redux';
import { MESSAGE_TYPE_LOCAL } from '../../constants';
import AbstractChatMessage, {
    type Props
} from '../AbstractChatMessage';
import PrivateMessageButton from '../PrivateMessageButton';
import s from './ChatMessage.module.scss';

/**
 * Renders a single chat message.
 */
class ChatMessage extends AbstractChatMessage<Props> {
    /**
     * Initializes a new {@code MessageContainer} instance.
     *
     * @param {Props} props - The React {@code Component} props to initialize
     * the new {@code MessageContainer} instance with.
     */
    constructor(props: Props) {
        super(props);

        this._handleKickOut = this._handleKickOut.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { message, _participants } = this.props;
        const processedMessage = [];
        const typeClass = _participants[message.id]?.role === 'moderator' ? s.local : '';

        // content is an array of text and emoji components
        const content = toArray(this._getMessageText(), { className: 'smiley' });

        content.forEach(i => {
            if (typeof i === 'string') {
                processedMessage.push(<Linkify key = { i }>{ i }</Linkify>);
            } else {
                processedMessage.push(i);
            }
        });

        return (
            <div className = { `${s.chatmessageWrapper} ${typeClass}` }>
                <div className = { `${s.chatmessage} ${message.privateMessage ? s.privatemessage : ''}` }>
                    <div className = { s.replywrapper }>
                        <div className = { s.messagecontent }>
                            { this.props.showDisplayName && this._renderDisplayName() }
                            <div className = { s.usermessage }>
                                { processedMessage }
                            </div>
                            { message.privateMessage && this._renderPrivateNotice() }
                        </div>
                        { message.privateMessage && message.messageType !== MESSAGE_TYPE_LOCAL
                            && (
                                <div className = { s.messageactions }>
                                    <PrivateMessageButton
                                        participantID = { message.id }
                                        reply = { true }
                                        showLabel = { false } />
                                </div>
                            ) }
                    </div>
                </div>
                { this.props.showTimestamp && this._renderTimestamp() }
            </div>
        );
    }

    _getFormattedTimestamp: () => string;

    _getMessageText: () => string;

    _getPrivateNoticeMessage: () => string;

    /**
     * Renders the display name of the sender.
     *
     * @returns {React$Element<*>}
     */
    _renderDisplayName() {
        return (
            <div className = { s.displayName }>
                { this.props.message.displayName }
            </div>
        );
    }

    /**
     * Renders the message privacy notice.
     *
     * @returns {React$Element<*>}
     */
    _renderPrivateNotice() {
        return (
            <div className = { s.privatemessagenotice }>
                { this._getPrivateNoticeMessage() }
            </div>
        );
    }

    /**
     * Renders the time at which the message was sent.
     *
     * @returns {React$Element<*>}
     */
    _renderTimestamp() {
        const isModerator = isLocalParticipantModerator(APP.store.getState());
        const { messageType } = this.props.message;
        const { t } = this.props;

        return (
            <div className = { s.timestamp }>
                { this._getFormattedTimestamp() }
                { (isModerator && messageType !== MESSAGE_TYPE_LOCAL) && (
                    <span className = { s.divider}>
                        ·
                        <Button
                            appearance = 'subtle'
                            className = { s.button }
                            onClick = { this._handleKickOut }>
                            { t('videothumbnail.kick') }
                        </Button>
                    </span>
                ) }
            </div>
        );
    }

    _handleKickOut() {
        const { id: participantID } = this.props.message || {};

        APP.store.dispatch(openDialog(KickRemoteParticipantDialog, { participantID }));
    }
}

function _mapStateToProps(state) {
    return {
        _isGuest: Boolean(!state['features/base/jwt'].jwt),
        _participants: keyBy(state['features/base/participants'], 'id'),
    };
}

export default translate(connect(_mapStateToProps)(ChatMessage));
