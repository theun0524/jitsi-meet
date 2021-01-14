// @flow

import React from 'react';
import type { Dispatch } from 'redux';

import {
    createRecentClickedEvent,
    createRecentSelectedEvent,
    sendAnalytics
} from '../../analytics';
import { appNavigate } from '../../app/actions';
import {
    AbstractPageWithState,
    Container,
    Text
} from '../../base/react';

import styles from './styles';
import s from './AbstractRecentList.module.scss';

/**
 * The type of the React {@code Component} props of {@link AbstractRecentList}
 */
type Props = {

    /**
     * The redux store's {@code dispatch} function.
     */
    dispatch: Dispatch<any>,

    /**
     * The translate function.
     */
    t: Function
};

/**
 * An abstract component for the recent list.
 *
 */
export default class AbstractRecentList<P: Props, S: State> extends AbstractPageWithState<P, S> {
    /**
     * Initializes a new {@code RecentList} instance.
     *
     * @inheritdoc
     */
    constructor(props: P) {
        super(props);

        this._onPress = this._onPress.bind(this);
    }

    /**
     * Implements React's {@link Component#componentDidMount()}. Invoked
     * immediately after this component is mounted.
     *
     * @inheritdoc
     * @returns {void}
     */
    componentDidMount() {
        sendAnalytics(createRecentSelectedEvent());
    }

    _getRenderListEmptyComponent: () => React$Node;

    /**
     * Returns a list empty component if a custom one has to be rendered instead
     * of the default one in the {@link NavigateSectionList}.
     *
     * @private
     * @returns {React$Component}
     */
    _getRenderListEmptyComponent() {
        const { t } = this.props;

        return (
            <Container
                className = {s.meetingsListEmpty}
                style = { styles.emptyListContainer }>
                <Text
                    className = {s.description}
                    style = { styles.emptyListText }>
                    { t('welcomepage.recentListEmpty') }
                </Text>
            </Container>
        );
    }

    _getRenderListLoadingComponent: () => React$Node;

    _getRenderListLoadingComponent() {
        const { t } = this.props;

        return (
            <Container
                className = {s.meetingsListEmpty}
                style = { styles.emptyListContainer }>
                <Text
                    className = {s.description}
                    style = { styles.emptyListText }>
                    { t('welcomepage.dbListLoading') }
                </Text>
            </Container>
        );
    }

    _onPress: string => void;

    /**
     * Handles the list's navigate action.
     *
     * @private
     * @param {string} url - The url string to navigate to.
     * @returns {void}
     */
    _onPress(url) {
        const { dispatch } = this.props;

        sendAnalytics(createRecentClickedEvent('recent.meeting.tile'));

        dispatch(appNavigate(url));
    }
}
