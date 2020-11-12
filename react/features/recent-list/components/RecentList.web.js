// @flow

import React from 'react';
import type { Dispatch } from 'redux';

import { translate } from '../../base/i18n';
import { MeetingsList } from '../../base/react';
import { connect } from '../../base/redux';
import { deleteRecentListEntry } from '../actions';
import { isRecentListEnabled, toDisplayableList } from '../functions';

import AbstractRecentList from './AbstractRecentList';

import Modal, { ModalTransition } from '@atlaskit/modal-dialog';

/**
 * The type of the React {@code Component} props of {@link RecentList}
 */
type Props = {

    /**
     * Renders the list disabled.
     */
    disabled: boolean,

    /**
     * The redux store's {@code dispatch} function.
     */
    dispatch: Dispatch<any>,

    /**
     * The translate function.
     */
    t: Function,

    /**
     * The recent list from the Redux store.
     */
    _recentList: Array<Object>
};

type State = {
    isModalOpen: boolean,
    targetEntry: Object
};

/**
 * The cross platform container rendering the list of the recently joined rooms.
 *
 */
class RecentList extends AbstractRecentList<Props, State> {
    _getRenderListEmptyComponent: () => React$Node;
    _onPress: string => {};

    _proceedDelete = () => { this.props.dispatch(deleteRecentListEntry(this.state.targetEntry)); this.setState({ isModalOpen: false });}
    _closeModal = () => this.setState({ isModalOpen: false });
    _openModal = () => this.setState({ isModalOpen: true });

    /**
     * Initializes a new {@code RecentList} instance.
     *
     * @inheritdoc
     */
    constructor(props: Props) {
        super(props);

        this.state = {
            isModalOpen: false,
            targetEntry: null
        }

        this._getRenderListEmptyComponent
            = this._getRenderListEmptyComponent.bind(this);
        this._onPress = this._onPress.bind(this);
        this._onItemDelete = this._onItemDelete.bind(this);
    }

    _onItemDelete: Object => void;

    /**
     * Deletes a recent entry.
     *
     * @param {Object} entry - The entry to be deleted.
     * @inheritdoc
     */
    _onItemDelete(entry) {
        this.setState({ targetEntry: entry });
        this._openModal();
    }

    /**
     * Implements the React Components's render method.
     *
     * @inheritdoc
     */
    render() {
        if (!isRecentListEnabled()) {
            return null;
        }
        const { t } = this.props;
        const {
            disabled,
            _recentList
        } = this.props;
        const recentList = toDisplayableList(_recentList);
        let modalOpen = this.state.isModalOpen;

        return (
            <>
            <MeetingsList
                disabled = { disabled }
                hideURL = { true }
                listEmptyComponent = { this._getRenderListEmptyComponent() }
                meetings = { recentList }
                onItemDelete = { this._onItemDelete }
                onPress = { this._onPress } />
            <ModalTransition>
                {modalOpen && (
                <Modal
                        actions={[{ text: t('welcomepage.deleteElement'), onClick: this._proceedDelete }, { text: t('welcomepage.cancelDelete'), onClick: this._closeModal }]}
                        onClose={ this._closeModal }
                        heading={t('welcomepage.deleteModalHeading')}
                        appearance="warning"
                        width="small"
                    >
                        {t('welcomepage.deleteRecentListElementMessage')}
                    </Modal>
                    )}
                </ModalTransition>    
            </>
        );
    }
}

/**
 * Maps redux state to component props.
 *
 * @param {Object} state - The redux state.
 * @returns {{
 *     _defaultServerURL: string,
 *     _recentList: Array
 * }}
 */
export function _mapStateToProps(state: Object) {
    return {
        _recentList: state['features/recent-list']
    };
}

export default translate(connect(_mapStateToProps)(RecentList));
