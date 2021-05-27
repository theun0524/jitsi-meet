// @flow

import DropdownMenu, { DropdownItem, DropdownItemGroup } from '@atlaskit/dropdown-menu';
import React from 'react';
import { toArray } from 'react-emoji-render';
import { Icon, IconMenuThumb } from '../../../base/icons';
import { translate } from '../../../base/i18n';
import { Linkify } from '../../../base/react';
import { connect } from '../../../base/redux';
import { MESSAGE_TYPE_LOCAL } from '../../constants';
import BanRemoteParticipantDialog from '../../../video-menu/components/web/BanRemoteParticipantDialog';

import AbstractChatMessage, {
    type Props
} from '../AbstractChatMessage';
import PrivateMessageButton from '../PrivateMessageButton';
import { getLocalParticipant, getParticipantById, getParticipants } from '../../../base/participants';

import s from './ChatMessage.module.scss';
import { openDialog } from '../../../base/dialog';
import EnableChatForRemoteParticipantDialog from '../../../video-menu/components/web/EnableChatForRemoteParticipantDialog';
import DisableChatForRemoteParticipantDialog from '../../../video-menu/components/web/DisableChatForRemoteParticipantDialog';
import { setPrivateMessageRecipient } from '../../actions'

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

        this._onToggleChatState = this._onToggleChatState.bind(this);
        this._onBanUser = this._onBanUser.bind(this);
        this._onPrivateMessage = this._onPrivateMessage.bind(this);
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

    _onBanUser: () => void;

    _onBanUser() {
        const { dispatch, message } = this.props;
        dispatch(openDialog(BanRemoteParticipantDialog, { participantID: message.id }));
    }

    _onPrivateMessage: () => void;

    _onPrivateMessage() {
        const { dispatch, _participant } = this.props;
        dispatch(setPrivateMessageRecipient(_participant));
    }

    _onToggleChatState: () => void;

    _onToggleChatState() {
        const { _isChatMessageDisabled, dispatch, message } = this.props;
        
        // get the participantID for whom the action is to be dispatched
        const participantID = message.id;

        //let predefinedRole = getParticipantById(APP.store.getState(), participantID).role;

        // based on what role the current participant is occupying, we can identify whether chat is enabled or disabled
        // when the role of participant is a visitor, he has 'no voice', so when the the popup menu item is clicked
        // it should open the enable chat dialog
        if(_isChatMessageDisabled) {
            // dispatch necessary actions via a dialog box for the participant
            dispatch(openDialog(EnableChatForRemoteParticipantDialog, { participantID }));
        }
        // otherwise, it should open the disable chat dialog
        else {   
            // dispatch necessary actions via a dialog box for the participant
            dispatch(openDialog(DisableChatForRemoteParticipantDialog, { participantID }));
        }
    }

    /**
     * Renders the display name of the sender.
     *
     * @returns {React$Element<*>}
     */
    _renderDisplayName() {
        return (
            <div className = { `display-name ${s.chatHeader}` }>
                { this.props.message.displayName }
                { this._renderUserControlIcon() }
            </div>
        );
    }

    /**
     * Render control button on the sender's name on the chat history section
     * 
     * @returns {Icon} 
     */
    _renderUserControlIcon = () => {
        const { _isChatMessageDisabled, _participant, t } = this.props;

        const localParticipant = getLocalParticipant(APP.store.getState());  
        let isLocalParticipantAModerator = (localParticipant.role === "moderator");
        
        //we want to only allow moderators to get the chat control button alongside chat message
        if (isLocalParticipantAModerator && _participant) {
            return(
                <div className = { s.messageMenuContainer }>
                    <DropdownMenu
                        boundariesElement = 'scrollParent'
                        triggerButtonProps = {{ iconBefore: <Icon size = { 16 } src = { IconMenuThumb } /> }}
                        triggerType = 'button'>
                        <DropdownItemGroup>
                            <DropdownItem onClick = { this._onPrivateMessage }>
                                { t('dialog.privateMessage') }
                            </DropdownItem>
                            <DropdownItem onClick = { this._onToggleChatState }>
                                { _isChatMessageDisabled ? t('dialog.enableChat') : t('dialog.disableChat') }
                            </DropdownItem>
                            <DropdownItem onClick = { this._onBanUser }>
                                { t('dialog.banUser') }
                            </DropdownItem>
                        </DropdownItemGroup>
                    </DropdownMenu>
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

function _mapStateToProps(state, ownProps) {
    const participantID = ownProps.message.id;
    const participant = getParticipantById(state, participantID);
    const userRole = participant?.role;

    return {
        _isChatMessageDisabled: Boolean(userRole === "visitor"),
        _participant: participant,
    };
}

export default translate(connect(_mapStateToProps)(ChatMessage));
