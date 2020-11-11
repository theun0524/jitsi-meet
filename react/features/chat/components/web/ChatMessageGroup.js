// @flow

import React, { Component } from 'react';

import ChatMessage from './ChatMessage';
import s from './ChatMessageGroup.module.scss';

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
        const { className, messages } = this.props;

        const messagesLength = messages.length;

        if (!messagesLength) {
            return null;
        }

        return (
            <div className = { s.chatMessageGroup }>
                {
                    messages.map((message, i) => (
                        <ChatMessage
                            key = { i }
                            message = { message }
                            messageType = { className }
                            showDisplayName = { true }
                            showTimestamp = { false } />
                    ))
                }
            </div>
        );
    }
}

export default ChatMessageGroup;
