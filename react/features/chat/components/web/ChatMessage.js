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
import { getLocalParticipant, getParticipantById } from '../../../base/participants';
import { openDialog } from '../../../base/dialog';
import { 
    KickRemoteParticipantDialog,
    DisableChatForRemoteParticipantDialog,
    EnableChatForRemoteParticipantDialog
} from '../../../remote-video-menu/components';
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
            chatMessageDialogOpen: false,
            isChatEnabledForParticipant: true,
            // // initial message is 'Disable Chat for User, because we assume Chat is enabled for everybody and participant as well
            enableDisableChatMenuMessage: 'Enable/Disable Chat for User' 
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

    handleEnableDisableChat = async() => {
        // get the participantID for whom the action is to be dispatched
        let participantID = this.props.message.id;

        // roles are defined as 'participant', 'moderator', 'visitor' and 'none'
        // 'participant' and 'moderator' have voice and thus can chat
        // 'visitor doesn't have voice and thus can't chat
        let predefinedRole = getParticipantById(APP.store.getState(), participantID).role;
        console.log("Predefined role is: ", predefinedRole);

        // based on what role the current participant is occupying, we can identify whether chat is enabled or disabled
        // when the role of participant is a visitor, he has 'no voice', so when the the popup menu item is clicked
        // it should open the enable chat dialog
        if(predefinedRole === 'visitor') {
            // dispatch necessary actions via a dialog box for the participant
            APP.store.dispatch(openDialog(EnableChatForRemoteParticipantDialog , { participantID }));
        }
        // otherwise, it should open the disable chat dialog
        else {   
            // dispatch necessary actions via a dialog box for the participant
            APP.store.dispatch(openDialog(DisableChatForRemoteParticipantDialog, { participantID }));
        }

        // STEP:1 toggleChatMessageDialog
        this.toggleChatMessageDialog()

        
    }

    handleKickOutUser = () => {
        
        // STEP:1 toggleChatMessageDialog box
        this.toggleChatMessageDialog()

        // STEP:2 dispatch events for necessary action
        let participantID = this.props.message.id;
        APP.store.dispatch(openDialog(KickRemoteParticipantDialog, { participantID }));
        
    }

    /**
     * Render control button on the sender's name on the chat history section
     * 
     * @returns {Icon} 
     */
    _renderUserControlIcon = () => {
        const popupcontent = (
            <ul className = 'chat-control-popup-menu'>
                <li className = 'chat-control-popup-menu-item' onClick={ this.handleEnableDisableChat }> { this.state.enableDisableChatMenuMessage } </li>
                <li className = 'chat-control-popup-menu-item' onClick={ this.handleKickOutUser }> Kick-out User </li>
            </ul>
        );

        const localParticipant = getLocalParticipant(APP.store.getState());  
        let isLocalParticipantAModerator = (localParticipant.role === "moderator") ;
        
        //we want to only allow moderators to get the chat control button alongside chat message
        if(isLocalParticipantAModerator) {
            return(
                <div className='user-chat-control-button'>
                    <InlineDialog 
                        onClose={() => { 
                            this.setState({chatMessageDialogOpen: false}); 
                        }}
                        content = { popupcontent }
                        position = 'right'
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
