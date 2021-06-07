// @flow

import React, { Component } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import type { Dispatch } from 'redux';

import { isMobileBrowser } from '../../../base/environment/utils';
import { translate } from '../../../base/i18n';
import { getLocalParticipant, getParticipants, getParticipantCount } from '../../../base/participants';
import { connect } from '../../../base/redux';

import { setPrivateMessageRecipient } from '../../actions';

import DropdownMenu, { DropdownItem, DropdownItemGroup } from '@atlaskit/dropdown-menu';

import SmileysPanel from './SmileysPanel';

/**
 * The type of the React {@code Component} props of {@link ChatInput}.
 */
type Props = {

    /**
     * Invoked to send chat messages.
     */
    dispatch: Dispatch<any>,

    /**
     * Optional callback to invoke when the chat textarea has auto-resized to
     * fit overflowing text.
     */
    onResize: ?Function,

    /**
     * Callback to invoke on message send.
     */
    onSend: Function,

    /**
     * Invoked to obtain translated strings.
     */
    t: Function
};

/**
 * The type of the React {@code Component} state of {@link ChatInput}.
 */
type State = {

    /**
     * User provided nickname when the input text is provided in the view.
     */
    message: string,

    /**
     * Whether or not the smiley selector is visible.
     */
    showSmileysPanel: boolean,

    /**
     * Whether or not the dropdown showing the list of participants is visible or not
     */
    showParticipantsList: Boolean,
};

/**
 * Implements a React Component for drafting and submitting a chat message.
 *
 * @extends Component
 */
class ChatInput extends Component<Props, State> {
    _textArea: ?HTMLTextAreaElement;

    state = {
        message: '',
        showSmileysPanel: false,
        showParticipantsList: false,
    };

    /**
     * Initializes a new {@code ChatInput} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: Props) {
        super(props);

        this._textArea = null;

        // Bind event handlers so they are only bound once for every instance.
        this._onDetectSubmit = this._onDetectSubmit.bind(this);
        this._onMessageChange = this._onMessageChange.bind(this);
        this._onSmileySelect = this._onSmileySelect.bind(this);
        this._onSubmitMessage = this._onSubmitMessage.bind(this);
        this._onToggleSmileysPanel = this._onToggleSmileysPanel.bind(this);
        this._setTextAreaRef = this._setTextAreaRef.bind(this);
        this._renderChatRoomParticipantsList = this._renderChatRoomParticipantsList.bind(this);
    }

    /**
     * Implements React's {@link Component#componentDidMount()}.
     *
     * @inheritdoc
     */
    componentDidMount() {
        if (isMobileBrowser()) {
            // Ensure textarea is not focused when opening chat on mobile browser.
            this._textArea && this._textArea.blur();
        }
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const smileysPanelClassName = `${this.state.showSmileysPanel
            ? 'show-smileys' : 'hide-smileys'} smileys-panel`;
        
        const { _localParticipant } = this.props;
        // let localParticipant = getLocalParticipant(APP.store.getState());
        let prole = _localParticipant.role;
        const chatInputStyleName = `${(prole === "visitor") ? 'no-display' : '' } chat-input`;
        return (
            <div className = { `chat-input-container${this.state.message.trim().length ? ' populated' : ''}` }>
                <div id = 'chat-input' >
                    <div className = 'smiley-input'>
                        <div id = 'smileysarea'>
                            <div id = 'smileys'>
                                <div
                                    className = 'smiley-button'
                                    onClick = { this._onToggleSmileysPanel }>
                                    <Icon src = { IconSmile } />
                                </div>
                            </div>
                        </div>
                        <div className = { smileysPanelClassName }>
                            <SmileysPanel
                                onSmileySelect = { this._onSmileySelect } />
                        </div>
                    </div>
                    <div className = 'usrmsg-form'>
                        <TextareaAutosize
                            id = 'usermsg'
                            inputRef = { this._setTextAreaRef }
                            maxRows = { 5 }
                            onChange = { this._onMessageChange }
                            onHeightChange = { this.props.onResize }
                            onKeyDown = { this._onDetectSubmit }
                            placeholder = { this.props.t('chat.messagebox') }
                            value = { this.state.message } />
                    </div>
                    <div className = 'send-button-container'>
                        <div
                            className = 'send-button'
                            onClick = { this._onSubmitMessage }>
                            <Icon src = { IconPlane } />
                        </div>
                    </div>
                </div>

                {/* this code will render a list containing chatroom participants */}
                { this._renderChatRoomParticipantsList() }

                <div className = 'usrmsg-form'>
                    <TextareaAutosize
                        id = 'usermsg'
                        inputRef = { this._setTextAreaRef }
                        maxRows = { 5 }
                        onChange = { this._onMessageChange }
                        onHeightChange = { this.props.onResize }
                        onKeyDown = { this._onDetectSubmit }
                        placeholder = { this.props.t('chat.messagebox') }
                        value = { this.state.message } />
                </div>
            </div>
        );
    }

    /**
     * Place cursor focus on this component's text area.
     *
     * @private
     * @returns {void}
     */
    _focus() {
        this._textArea && this._textArea.focus();
    }


    _onSubmitMessage: () => void;

    /**
     * Submits the message to the chat window.
     *
     * @returns {void}
     */
    _onSubmitMessage() {
        const trimmed = this.state.message.trim();

        if (trimmed) {
            this.props.onSend(trimmed);

            this.setState({ message: '' });

            // Keep the textarea in focus when sending messages via submit button.
            this._focus();
        }

    }
    _onDetectSubmit: (Object) => void;

    /**
     * Detects if enter has been pressed. If so, submit the message in the chat
     * window.
     *
     * @param {string} event - Keyboard event.
     * @private
     * @returns {void}
     */
    _onDetectSubmit(event) {
        if (event.keyCode === 13
            && event.shiftKey === false) {
            event.preventDefault();

            this._onSubmitMessage();
        }
    }

    _onMessageChange: (Object) => void;

    /**
     * Updates the known message the user is drafting.
     *
     * @param {string} event - Keyboard event.
     * @private
     * @returns {void}
     */
    _onMessageChange(event) {
        event.preventDefault();
        event.persist();
        this.setState({ message: event.target.value });
        
        // perform a check to see that input message starts with or contains @, if so display a list containing participants in chatroom
        // we also check to ensure that there is only one @ character when we want to show the participant list
        if((event.target.value.includes('@')) && (event.target.value.split('@').length == 2)) {
            this.setState({ showParticipantsList: true });
        } else {
            this.setState({ showParticipantsList: false });
        }
    }

    // function to render the list of participants in a chatroom in a dropdown menu
    _renderChatRoomParticipantsList = () => {
        
        // from the input message, once @ is encountered, we select all the character after @, and use it to filter the list of participants
        let filterText = '';

        if(this.state.message.includes('@')) {
            filterText = this.state.message.split('@')[1];
        }

        // use last character from message input to ensure private messaging is selected only on pressing space character
        const lastChar = this.state.message.slice(-1);

        // get participant count, localParticipant and allParticipants from props
        const { _participantCount, _allParticipants, _localParticipant } = this.props;

        // remove local participant from all participants list and store it in a variable called otherParticipants
        const otherParticipants = _allParticipants.filter(participant => participant.id !== _localParticipant.id);

        // filter participants dynamically with typed filter text (input message) from otherParticipants
        const filteredParticipants = otherParticipants.filter(participant => participant.name.startsWith(filterText.trimEnd())); // we use trimEnd here, so that it still shows the list even when pressing space char

        // in case filtered text matches that of a participant's name, it will replace the current message to private message type
        if(filterText !== '') {                
            filteredParticipants.forEach((participant) => {
                // once input text (filterText) matches with name of participant and the space character is pressed, invoke private messaging function
                if((filterText.trimEnd() === participant.name) && (lastChar === ' ')) {
                    // send private message to the corresponding participant
                    this._sendPrivateMessage(participant);

                    // reset message state and hide participant popup list since we defined private message recipient
                    this.setState({ message : '', showParticipantsList: false });                    
                }
            });
        }
        
        // we want to display that list only when there are at least 3 participants
        if((this.state.showParticipantsList) && (_participantCount > 2)) { 
            return(
                <div className="chat-participant-list">
                    <DropdownMenu
                        boundariesElement = 'scrollParent'
                        defaultOpen >
                            <DropdownItemGroup>
                                { filteredParticipants.map((participant) => {
                                    return (
                                        <DropdownItem 
                                            key = { participant.id } 
                                            onClick = { 
                                                () =>  { 
                                                    this._sendPrivateMessage(participant);
                                                    this.setState({ message: '', showParticipantsList: false });
                                                }
                                            }>
                                            { participant.name }
                                        </DropdownItem>
                                    )
                                }) }
                            </DropdownItemGroup>
                    </DropdownMenu>
                </div>
            );
        } else {
            return;
        }
    }

    // function to call private messaging function
    _sendPrivateMessage = (participant) => {
        this.props.dispatch(setPrivateMessageRecipient(participant));
    }
    
    _onSmileySelect: (string) => void;

    /**
     * Appends a selected smileys to the chat message draft.
     *
     * @param {string} smileyText - The value of the smiley to append to the
     * chat message.
     * @private
     * @returns {void}
     */
    _onSmileySelect(smileyText) {
        this.setState({
            message: `${this.state.message} ${smileyText}`,
            showSmileysPanel: false
        });

        this._focus();
    }

    _onToggleSmileysPanel: () => void;

    _renderChatRoomParticipantsList: () => void;

    /**
     * Callback invoked to hide or show the smileys selector.
     *
     * @private
     * @returns {void}
     */
    _onToggleSmileysPanel() {
        this.setState({ showSmileysPanel: !this.state.showSmileysPanel });

        this._focus();
    }

    _setTextAreaRef: (?HTMLTextAreaElement) => void;

    /**
     * Sets the reference to the HTML TextArea.
     *
     * @param {HTMLAudioElement} textAreaElement - The HTML text area element.
     * @private
     * @returns {void}
     */
    _setTextAreaRef(textAreaElement: ?HTMLTextAreaElement) {
        this._textArea = textAreaElement;
    }
}

/**
 * Maps part of the redux state to the props of this component.
 *
 * @param {Object} state - The Redux state.
 * @returns {Props}
 */
export function _mapStateToProps(state) {

    const _participantCount = getParticipantCount(state);
    const _allParticipants = getParticipants(state);
    const _localParticipant = getLocalParticipant(state);

    return {
        _participantCount,
        _allParticipants,
        _localParticipant
    };
}

export default translate(connect(_mapStateToProps)(ChatInput));
