// @flow

import React from 'react';
import { toArray } from 'react-emoji-render';
import { Icon, IconMenuThumb } from '../../../base/icons';
import { translate } from '../../../base/i18n';
import { Linkify } from '../../../base/react';
import { MESSAGE_TYPE_LOCAL } from '../../constants';
import AbstractChatMessage, {
    type Props
} from '../AbstractChatMessage';
import PrivateMessageButton from '../PrivateMessageButton';
import InlineDialog from '@atlaskit/inline-dialog/dist/cjs/InlineDialog';
import { getLocalParticipant, getParticipants } from '../../../base/participants';

import ChatMessageBanButton from './ChatMessageBanButton';
import ChatMessageDisableButton from './ChatMessageDisableButton';
declare var APP: Object;

/**
 * Renders a single chat message.
 */
class ChatMessage extends AbstractChatMessage<Props> {
    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */

    constructor(props) {
        super(props);
        this.state = {
            chatMessageDialogOpen: false
        };
    }

    render() {
        const { message } = this.props;
        const processedMessage = [];

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
            <div className = 'chatmessage-wrapper'>
                <div className = { `chatmessage ${message.privateMessage ? 'privatemessage' : ''}` }>
                    <div className = 'replywrapper'>
                        <div className = 'messagecontent'>
                            { this.props.showDisplayName && this._renderDisplayName() }
                            <div className = 'usermessage'>
                                { processedMessage }
                            </div>
                            { message.privateMessage && this._renderPrivateNotice() }
                        </div>
                        { message.privateMessage && message.messageType !== MESSAGE_TYPE_LOCAL
                            && (
                                <div className = 'messageactions'>
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
            <div className = 'display-name'>
                { this.props.message.displayName }
                { this._renderUserControlIcon() }
            </div>
        );
    }

    toggleChatMessageDialog = () => {
        this.setState({ chatMessageDialogOpen: !this.state.chatMessageDialogOpen });
    }

    /**
     * Render control button on the sender's name on the chat history section
     * 
     * @returns {Icon} 
     */
    _renderUserControlIcon = () => {
        const popupcontent = (
            <ul className = 'overflow-menu'>
                <ChatMessageDisableButton className='overflow-menu-item' key = 'chatcontroldisablebutton' visible = { true } message = { this.props.message } showLabel = { true } />
                <ChatMessageBanButton className='overflow-menu-item' message = { this.props.message } visible = { true } message = { this.props.message } showLabel = { true } />
            </ul>
        );

        // in case the participant has been kicked out, we don't want to display the control button
        const allParticipants = getParticipants(APP.store.getState());
        const allParticipantsID = allParticipants.map(participant => participant.id);

        const remoteParticipantID = this.props.message.id;

        // use a boolean flag to identify if the participant is still in the meeting
        const isParticipantStillConnected = allParticipantsID.includes(remoteParticipantID);

        const localParticipant = getLocalParticipant(APP.store.getState());  
        let isLocalParticipantAModerator = (localParticipant.role === "moderator");
        
        //we want to only allow moderators to get the chat control button alongside chat message
        if(isLocalParticipantAModerator && isParticipantStillConnected) {
            return(
                <div className='user-chat-control-button'>
                    <InlineDialog 
                        onClose={() => { 
                            this.setState({chatMessageDialogOpen: false}); 
                        }}
                        content = { popupcontent }
                        placement = { 'bottom' }
                        isOpen = { this.state.chatMessageDialogOpen } >
                            <div className='thumb-menu-icon' onClick = { this.toggleChatMessageDialog }>
                                <Icon size = '1em' src = { IconMenuThumb } title = 'Remote-user chat controls' />
                            </div>
                    </InlineDialog>
                </div>  
            );
        } else {
            return null;
        }

    }

    /**
     * Renders the message privacy notice.
     *
     * @returns {React$Element<*>}
     */
    _renderPrivateNotice() {
        return (
            <div className = 'privatemessagenotice'>
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
        return (
            <div className = 'timestamp'>
                { this._getFormattedTimestamp() }
            </div>
        );
    }
}

export default translate(ChatMessage);
