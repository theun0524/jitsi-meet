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
import ChatDisableButtonForAll from './ChatDisableButtonForAll';
declare var APP: Object;

/**
 * React Component for holding the chat feature in a side panel that slides in
 * and out of view.
 */

/**
 * The type of the React {@code Component} state of {@link Chat}.
 */
 type State = {
    chatHeaderMenuDialogOpen: boolean,
    showChatInput: Boolean,
    searchQuery: String,
 }


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

    state = {
        chatHeaderMenuDialogOpen: false,
        showChatInput: true,
        searchQuery: '',
    };
    
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

        // Bind event handlers so they are only bound once for every instance.
        this._renderPanelContent = this._renderPanelContent.bind(this);

        // Bind event handlers so they are only bound once for every instance.
        this._onChatInputResize = this._onChatInputResize.bind(this);

        // Bind event handlers so they are only bound once for every instance.
        this._updateChatStatus = this._updateChatStatus.bind(this);
    }

    /**
     * Implements {@code Component#componentDidMount}.
     *
     * @inheritdoc
     */
    componentDidMount() {
        this._scrollMessageContainerToBottom(true);
        this._updateInterval = setInterval(this._updateChatStatus, 1000);
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

    _updateChatStatus: () => void;

    _updateChatStatus() {
        let localParticipant = getLocalParticipant(APP.store.getState());
        let prole = localParticipant.role;
        if(prole === "visitor") {
            this.setState({ showChatInput: false});
        } else {
            this.setState({ showChatInput: true });
        }
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
                { this.state.showChatInput
                    ? <ChatInput onResize = { this._onChatInputResize } onSend = { this.props._onSendMessage } />
                    : <> </>
                }
            </>
        );
    }

    toggleChatHeaderMenuDialog = () => {
        this.setState({ chatHeaderMenuDialogOpen: !this.state.chatHeaderMenuDialogOpen });
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
                        placeholder =  { 'Search for chat messages' }
                        shouldFitContainer = { true }
                        // eslint-disable-next-line react/jsx-no-bind
                        onChange = { this._updateChatSearchInput }
                        type = 'text' />
                    <div className = 'chat-header-search-icon' onClick= { this._handleChatSearchInput } >
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
            <ul className='overflow-menu'>
                    <ChatDisableButtonForAll key = 'allchatcontroldisablebutton' visible = { true } showLabel = { true } /> 
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
                        placement = { 'auto' }
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

    _updateChatSearchInput = async(event) => {
        await this.setState({ searchQuery: event.target.value });
        
        // invoke the function that scrolls to chatMessage and highlights it
        this._clearHighlightText();

        // invoke a chat search function when 'enter' key is pressed as well
        document.addEventListener('keypress', (ev) => {
            if(ev.key === "Enter") {
                this._handleChatSearchInput();
            }
        })

        
    }

    _handleChatSearchInput = () => {

        // clear highlights for pre-existing search term
        this._clearHighlightText();

        // call the function for highlighting search text
        this.highlightTextinUserMessages(this.state.searchQuery, "highlight-search-text");
        
    }

    _clearHighlightText = () => {
        // logic to clear highlighted text
        var highlightedTexts = document.querySelectorAll("[class^='highlight-search-text']")
        highlightedTexts.forEach((el) => { 
            el.replaceWith(document.createTextNode(el.textContent)) 
        })
        
        // reconstruct original chat messages
        // when we used cleared highlight texts above, the conent was replaced with broken strings
        // so we unified again with original text
        var usrmsgs = document.getElementsByClassName('usermessage');
        if(usrmsgs.length > 0) {
            for(let usrmsg of usrmsgs) {
                usrmsg.textContent = usrmsg.innerText;
            }
        }

    }

    highlightTextinUserMessages = (term, hlClass, usrmsgs = document.getElementById('chatconversation')) => {
        if(!term) {
            console.log("Search term is empty");
        }
        hlClass = hlClass || "highlight-search-text";
        term = term instanceof Array ? term.join("|") : term;
        const highlighter = a => `<span class="${hlClass}">${a}</span>`;
        const toHtml = node => node.innerHTML = node.innerHTML.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
        const children = usrmsgs.childNodes;
        for (let i=0; i < children.length; i += 1) {
            
            // we only want to search for usermessage
            if(children[i].className === "display-name") {
                continue;
            }

            if(children[i].childNodes.length) {
                this.highlightTextinUserMessages.call(null, term, hlClass, children[i]);
            }

            let node = children[i];
            let re = RegExp(`(${term})`, "gi");

            if(node.nodeType === Node.TEXT_NODE && re.test(node.data)) {
                node.data = node.data.replace(re, highlighter);
                toHtml(node.parentElement);
            }
        }
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
