// @flow

import React, { Component } from 'react';
import { getLocalizedDateFormatter } from '../../../base/i18n';
import ChatMessage from './ChatMessage';

type Props = {

    /**
     * Additional CSS classes to apply to the root element.
     */
    className: string,

    /**
     * The messages to display as a group.
     */
    messages: Array<Object>,
};

/**
 * Displays a list of chat messages. Will show only the display name for the
 * first chat message and the timestamp for the last chat message.
 *
 * @extends React.Component
 */
class ChatMessageGroup extends Component<Props> {
    static defaultProps = {
        className: ''
    };

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        const formattedTS = [];
        const { className, messages } = this.props;

        const messagesLength = messages.length;

        // loop through each message object and get the formatted timestamp for each message
        messages.forEach((m, i) => {
            formattedTS[i] = getLocalizedDateFormatter(new Date(m.timestamp)).format("H:mm");
        });

        // create an array to decide whether or not to show timestamp for each message; initially all values set to true
        const showTSArray = Array(messagesLength).fill(true);

        // loop through formattedTS array and check for same timestamp values 
        // if same, the previous index value for showTS array is set to false
        for(let i = 0, j = 1; i < j && j < messagesLength ; i++, j++) {
            if(formattedTS[i] === formattedTS[j]) {
                showTSArray[i] = false;
            }
        }

        if (!messagesLength) {
            return null;
        }

        return (
            <div className = { `chat-message-group ${className}` }>
                {
                    messages.map((message, i) => (
                        <ChatMessage
                            key = { i }
                            message = { message }
                            showDisplayName = { i === 0 }
                            timestamp = { formattedTS[i] }
                            // showTimestamp = { i === messages.length - 1 } />
                            showTimestamp = { showTSArray[i] } />
                    ))
                }
            </div>
        );
    }
}

export default ChatMessageGroup;
