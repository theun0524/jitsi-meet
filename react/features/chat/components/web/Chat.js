// @flow

import React from 'react';

import { FieldTextStateless } from '@atlaskit/field-text';
import CrossCircleIcon from '@atlaskit/icon/glyph/cross-circle';
import DropdownMenu, { DropdownItem, DropdownItemGroup } from '@atlaskit/dropdown-menu';
import Tooltip from '@atlaskit/tooltip';

import { translate } from '../../../base/i18n';
import { Icon, IconClose, IconMenu, IconMenuThumb, IconSearch } from '../../../base/icons';
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
import InlineDialog from '@atlaskit/inline-dialog/dist/cjs/InlineDialog';
import { getLocalParticipant } from '../../../base/participants';
import ChatDisableButtonForAll from './ChatDisableButtonForAll';

import s from './Chat.module.scss';
import { openDialog } from '../../../base/dialog';
import EnableChatForAllParticipantsDialog from '../../../remote-video-menu/components/web/EnableChatForAllParticipantsDialog';
import DisableChatForAllParticipantsDialog from '../../../remote-video-menu/components/web/DisableChatForAllParticipantsDialog';

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
    showSearch: Boolean,
    showChatMenu: Boolean,
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
        showSearch: false,
        showChatMenu: false,
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

        this._onToggleSearch = this._onToggleSearch.bind(this);
        this._onDisableChatForAll = this._onDisableChatForAll.bind(this);
        this._onEnableChatForAll = this._onEnableChatForAll.bind(this);
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

    _onDisableChatForAll: () => void;

    _onDisableChatForAll() {
        APP.store.dispatch(openDialog(DisableChatForAllParticipantsDialog));
    }

    _onEnableChatForAll: () => void;

    _onEnableChatForAll() {
        APP.store.dispatch(openDialog(EnableChatForAllParticipantsDialog));
    }

    _onToggleSearch: () => void;

    /**
     * Callback invoked when search button clicked.
     *
     * @private
     * @returns {void}
     */
     _onToggleSearch() {
        const showSearch = !this.state.showSearch;

        if (showSearch) {
            this.setState({ showSearch });
            document.addEventListener('keyup', this._handleKeyPress);
        } else {
            this.setState({ showSearch, searchQuery: '' });
            document.removeEventListener('keyup', this._handleKeyPress);
            this._clearHighlightText();
        }
    }

    _updateChatStatus: () => void;

    _updateChatStatus() {
        let localParticipant = getLocalParticipant(APP.store.getState());
        if (!localParticipant) return;

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

    _renderSearch() {
        const { t } = this.props;

        return (
            <div className = { s.searchContainer }>
                <FieldTextStateless
                    compact = { true }
                    id = 'chatHeaderSearchBox'
                    autoFocus = { true }
                    placeholder =  { t('chat.search') }
                    shouldFitContainer = { true }
                    isLabelHidden = { true }
                     // eslint-disable-next-line react/jsx-no-bind
                    onChange = { this._updateChatSearchInput }
                    type = 'text' />
                <div
                    className = { s.closeIcon }
                    onClick = { this._onToggleSearch }>
                    <CrossCircleIcon size = 'small' />
                </div>
            </div>                        
        );
    }

    /**
     * Instantiates a React Element to display at the top of {@code Chat} to
     * close {@code Chat}.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderChatHeader() {
        const { _enableChatControl, t } = this.props;
        const { showSearch } = this.state;
        const localParticipant = getLocalParticipant(APP.store.getState());
        const showMenu =
            _enableChatControl &&
            localParticipant.role === 'moderator';

        return (
            <div className = {`chat-header ${s.chatHeader}`}>
                { !showSearch ? t('chat.title') : this._renderSearch() }
                {/* Portion for rendering the chat close icon */}
                <div className = { s.toolContainer }>
                    { !showSearch && (
                        <div
                            className = { s.button }
                            onClick = { this._onToggleSearch }>
                            <Tooltip
                                content = { t('chat.search') }
                                position = 'bottom'>
                                <Icon src = { IconSearch } />
                            </Tooltip>
                        </div>
                    )}
                    { showMenu ? (
                        <DropdownMenu
                            position = 'bottom right'
                            triggerButtonProps = {{ iconBefore: <Icon src = { IconMenu } /> }}
                            triggerType = 'button'>
                            <DropdownItemGroup>
                                <DropdownItem onClick = { this._onDisableChatForAll }>
                                    { t('dialog.disableChatForAll') }
                                </DropdownItem>
                                <DropdownItem onClick = { this._onEnableChatForAll }>
                                    { t('dialog.enableChatForAll') }
                                </DropdownItem>
                                <DropdownItem onClick = { this.props._onToggleChat }>
                                    { t('dialog.close') }
                                </DropdownItem>
                            </DropdownItemGroup>
                        </DropdownMenu>
                    ) : (
                        <div
                            className = { s.button }
                            onClick = { this.props._onToggleChat }>
                            <Tooltip
                                content = { t('dialog.close') }
                                position = 'bottom'>
                                <Icon src = { IconClose } />
                            </Tooltip>
                        </div>
                    )}
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
    }

    _handleKeyPress = ev => {
        if (ev.key === "Enter") {
            this._handleChatSearchInput();
        } else if (ev.key === 'Escape') {
            this._onToggleSearch();
        }
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
