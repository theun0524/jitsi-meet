// @flow

import React, { Component } from 'react';

import {
    getLocalizedDateFormatter,
    getLocalizedDurationFormatter
} from '../../../i18n';

import Container from './Container';
import Text from './Text';
import s from './MeetingList.module.scss';

import TrashIcon from '@atlaskit/icon/glyph/trash';
import EditorCloseIcon from '@atlaskit/icon/glyph/editor/close';

type Props = {

    /**
     * Indicates if the list is disabled or not.
     */
    disabled: boolean,

    /**
     * Indicates if the URL should be hidden or not.
     */
    hideURL: boolean,

    /**
     * Function to be invoked when an item is pressed. The item's URL is passed.
     */
    onPress: Function,

    /**
     * Rendered when the list is empty. Should be a rendered element.
     */
    listEmptyComponent: Object,

    /**
     * An array of meetings.
     */
    meetings: Array<Object>,

    /**
     * Handler for deleting an item.
     */
    onDeleteFromDB?: Function,

    /**
     * Handler for deleting an item.
     */
    onDeleteFromRecent?: Function
};

/**
 * Generates a date string for a given date.
 *
 * @param {Object} date - The date.
 * @private
 * @returns {string}
 */
function _toDateString(date) {
    // return getLocalizedDateFormatter(date).format('MMM Do, YYYY');
    return getLocalizedDateFormatter(date).format('ll');
}


/**
 * Generates a time (interval) string for a given times.
 *
 * @param {Array<Date>} times - Array of times.
 * @private
 * @returns {string}
 */
function _toTimeString(times) {
    if (times && times.length > 0) {
        return (
            times
                .map(time => getLocalizedDateFormatter(time).format('LT'))
                .join(' - '));
    }

    return undefined;
}

/**
 * Implements a React/Web {@link Component} for displaying a list with
 * meetings.
 *
 * @extends Component
 */
export default class MeetingsList extends Component<Props> {
    /**
     * Constructor of the MeetingsList component.
     *
     * @inheritdoc
     */
    constructor(props: Props) {
        super(props);

        this._onPress = this._onPress.bind(this);
        this._renderItem = this._renderItem.bind(this);
    }

    /**
     * Renders the content of this component.
     *
     * @returns {React.ReactNode}
     */
    render() {
        const { listEmptyComponent, meetings } = this.props;

        /**
         * If there are no recent meetings we don't want to display anything
         */
        if (meetings) {
            return (
                <Container
                    className = {s.meetingsList}>
                    {
                        meetings.length === 0
                            ? listEmptyComponent
                            : meetings.map(this._renderItem)
                    }
                </Container>
            );
        }

        return null;
    }

    _onPress: string => Function;

    /**
     * Returns a function that is used in the onPress callback of the items.
     *
     * @param {string} url - The URL of the item to navigate to.
     * @private
     * @returns {Function}
     */
    _onPress(url) {
        const { disabled, onPress } = this.props;

        if (!disabled && url && typeof onPress === 'function') {
            return () => onPress(url);
        }

        return null;
    }

    _onDeleteFromDB: Object => Function;

    /**
     * Returns a function that is used on the onDelete callback.
     *
     * @param {Object} item - The item to be deleted.
     * @private
     * @returns {Function}
     */
    _onDeleteFromDB(item) {
        const { onDeleteFromDB } = this.props;

        return evt => {
            evt.stopPropagation();

            onDeleteFromDB && onDeleteFromDB(item);
        };
    }

    _onDeleteFromRecent: Object => Function;

    /**
     * Returns a function that is used on the onDelete callback.
     *
     * @param {Object} item - The item to be deleted.
     * @private
     * @returns {Function}
     */
    _onDeleteFromRecent(item) {
        const { onDeleteFromRecent } = this.props;

        return evt => {
            evt.stopPropagation();

            onDeleteFromRecent && onDeleteFromRecent(item);
        };
    }

    _renderItem: (Object, number) => React$Node;

    /**
     * Renders an item for the list.
     *
     * @param {Object} meeting - Information about the meeting.
     * @param {number} index - The index of the item.
     * @returns {Node}
     */
    _renderItem(meeting, index) {
        const {
            date,
            duration,
            elementAfter,
            time,
            title,
            url,
            canDelete
        } = meeting;
        const { hideURL = false, onDeleteFromDB, onDeleteFromRecent } = this.props;
        const onPress = this._onPress(url);
        const rootClassName
            = `${s.item} ${onPress ? s.withClickHandler : s.withoutClickHandler}`;

        return (
            <Container
                className = { rootClassName }
                key = { index }
                onClick = { onPress }>
                <Container className = {s.leftColumn}>
                    <Text className = {s.date}>
                        { _toDateString(date) }
                    </Text>
                    <Text>
                        { _toTimeString(time) }
                    </Text>
                </Container>
                <Container className = {s.rightColumn}>
                    <Text className = {s.title}>
                        { title }
                    </Text>
                    {
                        hideURL || !url ? null : (
                            <Text>
                                { url }
                            </Text>)
                    }
                    {
                        typeof duration === 'number' ? (
                            <Text>
                                { getLocalizedDurationFormatter(duration) }
                            </Text>) : null
                    }
                </Container>
                <Container className = {s.actions}>
                    { canDelete && onDeleteFromDB && <TrashIcon
                        className = 'delete-meeting'
                        size="large"
                        label="Delete from My Conference"
                        onClick = { this._onDeleteFromDB(meeting) } />}
                </Container>
                <Container className = {s.actionsUpper}>
                    { elementAfter || null }

                    { !canDelete && onDeleteFromRecent && <EditorCloseIcon
                        className = 'delete-from-recent'
                        size="medium" 
                        label="Delete from Recent List"
                        onClick = { this._onDeleteFromRecent(meeting) } />}
                </Container>
            </Container>
        );
    }
}
