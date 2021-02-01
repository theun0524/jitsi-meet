// @flow

import React from 'react';

import { translate } from '../../../base/i18n';
import { Icon, IconClose, IconMenuThumb, IconSearch } from '../../../base/icons';
import { connect } from '../../../base/redux';
import AbstractChat, {
    _mapDispatchToProps,
    _mapStateToProps,
    type Props
} from '../AbstractChat';

import ChatInput from './ChatInput';
import DisplayNameForm from './DisplayNameForm';
import MessageContainer from './MessageContainer';
import MessageRecipient from './MessageRecipient';
import { FieldTextStateless } from '@atlaskit/field-text';
import InlineDialog from '@atlaskit/inline-dialog/dist/cjs/InlineDialog';
import { getLocalParticipant } from '../../../base/participants';
declare var APP: Object;

/**
 * React Component for holding the chat feature in a side panel that slides in
 * and out of view.
 */
class Chat extends AbstractChat<Props> {

    /**
     * Whether or not the {@code Chat} component is off-screen, having finished
     * its hiding animation.
     */
    _isExited: boolean;

    /**
     * Reference to the React Component for displaying chat messages. Used for
     * scrolling to the end of the chat messages.
     */
    _messageContainerRef: Object;

    /**
     * Initializes a new {@code Chat} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: Props) {
        super(props);

        this._isExited = true;
        this._messageContainerRef = React.createRef();

        this.state = {
            chatHeaderMenuDialogOpen: false,

            //initial assumption => chat enabled for everyone
            isChatEnabledForEverybody: true,

            // initial message is 'Disable Chat' , because we assume Chat is enabled for everybody
            enableDisableChatHeaderMenuMessage: 'Enable/Disable Chat' 
        };

        // Bind event handlers so they are only bound once for every instance.
        this._renderPanelContent = this._renderPanelContent.bind(this);

        // Bind event handlers so they are only bound once for every instance.
        this._onChatInputResize = this._onChatInputResize.bind(this);
    }

    /**
     * Implements {@code Component#componentDidMount}.
     *
     * @inheritdoc
     */
    componentDidMount() {
        this._scrollMessageContainerToBottom(true);
    }

    /**
     * Implements {@code Component#componentDidUpdate}.
     *
     * @inheritdoc
     */
    componentDidUpdate(prevProps) {
        if (this.props._messages !== prevProps._messages) {
            this._scrollMessageContainerToBottom(true);
        } else if (this.props._isOpen && !prevProps._isOpen) {
            this._scrollMessageContainerToBottom(false);
        }
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <>
                { this._renderPanelContent() }
            </>
        );
    }

    _onChatInputResize: () => void;

    /**
     * Callback invoked when {@code ChatInput} changes height. Preserves
     * displaying the latest message if it is scrolled to.
     *
     * @private
     * @returns {void}
     */
    _onChatInputResize() {
        this._messageContainerRef.current.maybeUpdateBottomScroll();
    }

    /**
     * Returns a React Element for showing chat messages and a form to send new
     * chat messages.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderChat() {
        return (
            <>
                <MessageContainer
                    messages = { this.props._messages }
                    ref = { this._messageContainerRef } />
                <MessageRecipient />
                <ChatInput
                    onResize = { this._onChatInputResize }
                    onSend = { this.props._onSendMessage } />
            </>
        );
    }

    toggleChatHeaderMenuDialog = () => {
        console.log("I am inside toggleChatHeaderMenuDialog");
        this.setState({ chatHeaderMenuDialogOpen: !this.state.chatHeaderMenuDialogOpen });
    }

    handleEnableDisableChat = async () => {
        //STEP:1 Toggle Chat Dialog
        this.toggleChatHeaderMenuDialog();
        await this.setState({ isChatEnabledForEverybody: !this.state.isChatEnabledForEverybody});

        //STEP:2 Update the message for PopUp Dialog
        if(this.state.isChatEnabledForEverybody) {
            await this.setState({ enableDisableChatHeaderMenuMessage: 'Disable Chat' });
        }
        else {
            await this.setState({ enableDisableChatHeaderMenuMessage: 'Enable Chat' });
        }

        //STEP:3 Propagate events to XMPP
    }

    /**
     * Instantiates a React Element to display at the top of {@code Chat} to
     * close {@code Chat}.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderChatHeader() {
        return (
            <div className = 'chat-header'>
                {/* Portion for rendering the search box */}
                <div className = 'chat-header-searchbox'>
                    <FieldTextStateless
                        compact = { true }
                        id = 'chatHeaderSearchBox'
                        autoFocus = { true }
                        placeholder =  { 'e.g. John Doe' }
                        shouldFitContainer = { true }
                        // eslint-disable-next-line react/jsx-no-bind
                        onChange = { this._handleChatSearchInput }
                        type = 'text'
                        value = { 'e.g. John Doe' } />
                    <div className = 'chat-header-search-icon'>
                        <Icon src = { IconSearch } />
                    </div>
                </div>

                {/* Portion for rendering chat control button */}
                { this._renderChatControlIcon() }

                {/* Portion for rendering the chat close icon */}
                <div
                    className = 'chat-close'
                    onClick = { this.props._onToggleChat }>
                    <Icon src = { IconClose } />
                </div>
            </div>
        );
    }

    _renderChatControlIcon = () => {
        const popupcontent = (
            <ul className='chat-control-popup-menu'>
                <li className='chat-control-popup-menu-item' onClick={ this.handleEnableDisableChat }>
                    { this.state.enableDisableChatHeaderMenuMessage } 
                </li>
            </ul>
        );

        const localParticipant = getLocalParticipant(APP.store.getState());  
        let isLocalParticipantAModerator = (localParticipant.role === "moderator");

        //we want to only allow moderators to get the chat control button alongside chat message
        if(isLocalParticipantAModerator) {
            return(
                <div className='chat-header-control-button'>
                    <InlineDialog 
                        onClose={() => { 
                            this.setState({chatHeaderMenuDialogOpen: false}); 
                        }}
                        content = { popupcontent }
                        placement = 'bottom'
                        isOpen = { this.state.chatHeaderMenuDialogOpen } >
                            <div className='thumb-menu-icon' onClick = { this.toggleChatHeaderMenuDialog }>
                                <Icon src = { IconMenuThumb } title = 'All Remote-Users Chat Control' />
                            </div>
                    </InlineDialog>
                </div>  
            );
        } else {
            return null;
        }

    }

    _handleChatSearchInput() {
        console.log("Inside chat header search");
    }

    _renderPanelContent: () => React$Node | null;

    /**
     * Renders the contents of the chat panel.
     *
     * @private
     * @returns {ReactElement | null}
     */
    _renderPanelContent() {
        const { _isOpen, _showNamePrompt } = this.props;
        const ComponentToRender = _isOpen
            ? (
                <>
                    { this._renderChatHeader() }
                    { _showNamePrompt
                        ? <DisplayNameForm /> : this._renderChat() }
                </>
            )
            : null;
        let className = '';

        if (_isOpen) {
            className = 'slideInExt';
        } else if (this._isExited) {
            className = 'invisible';
        }

        return (
            <div
                className = { `sideToolbarContainer ${className}` }
                id = 'sideToolbarContainer'>
                { ComponentToRender }
            </div>
        );
    }

    /**
     * Scrolls the chat messages so the latest message is visible.
     *
     * @param {boolean} withAnimation - Whether or not to show a scrolling
     * animation.
     * @private
     * @returns {void}
     */
    _scrollMessageContainerToBottom(withAnimation) {
        if (this._messageContainerRef.current) {
            this._messageContainerRef.current.scrollToBottom(withAnimation);
        }
    }
}

export default translate(connect(_mapStateToProps, _mapDispatchToProps)(Chat));
