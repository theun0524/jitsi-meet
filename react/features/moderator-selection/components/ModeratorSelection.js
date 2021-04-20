// @flow

import FieldText from '@atlaskit/field-text';
import {
    HeaderComponentProps,
    ModalHeader
} from '@atlaskit/modal-dialog';
import { filter, keyBy, map } from 'lodash';
import React, { Component } from 'react';

import { Dialog } from '../../base/dialog';
import { translate } from '../../base/i18n';
import { connect } from '../../base/redux';
import { Tooltip } from '../../base/tooltip';

import ModeratorSelectionItem from './ModeratorSelectionItem';
import ModeratorSelectionLabels from './ModeratorSelectionLabels';

import s from './ModeratorSelection.module.scss';
import { PARTICIPANT_ROLE } from '../../base/participants';
import { Icon, IconSearch } from '../../base/icons';
import CrossCircleIcon from '@atlaskit/icon/glyph/cross-circle';

/**
 * The type of the React {@code Component} props of {@link ModeratorSelection}.
 */
type Props = {

    /**
     * The JitsiConference from which stats will be pulled.
     */
    conference: Object,

    participants: Array,

    /**
     * The function to translate human-readable text.
     */
    t: Function
};

/**
 * The type of the React {@code Component} state of {@link SpeakerStats}.
 */
type State = {

    loading: Boolean,

    /**
     * The search query inserted by the user
     */
    searchQuery: String,

    /**
     * An array of items object containing search results to be returned
     */
    searchResult: Array,

    showSearch: Boolean
};

/**
 * React component for displaying a list of speaker stats.
 *
 * @extends Component
 */
class ModeratorSelection extends Component<Props, State> {
    /**
     * Initializes a new SpeakerStats instance.
     *
     * @param {Object} props - The read-only React Component props with which
     * the new instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            searchQuery: '',
            searchResult: [], //initialize the initialy state variable as an empty array
            showSearch: false,
        };

        this._onToggleSearch = this._onToggleSearch.bind(this);
        this._customHeader = this._customHeader.bind(this);
        this.filterParticipants = this.filterParticipants.bind(this);
        this.handleSearchInput = this.handleSearchInput.bind(this);
    }

    /**
     * 
     *
     * @inheritdoc
     */
    componentDidMount() {
    }

    /**
     * 
     *
     * @inheritdoc
     * @returns {void}
     */
    componentWillUnmount() {
    }

    _onToggleSearch: () => void;

    /**
     * Toggle a search input.
     *
     * @inheritdoc
     * @returns {void}
     */
    _onToggleSearch() {
        const showSearch = !this.state.showSearch;

        if (showSearch) {
            this.setState({ showSearch });
        } else {
            this.setState({ showSearch, searchQuery: '' });
        }
    }


    _customHeader = (props: HeaderComponentProps) => {
        const { t } = this.props;
        const { loading, showSearch } = this.state;

        return (
            <ModalHeader {...props}>
                <h4 className={ s.titleContainer }>
                    <span>
                        { t('moderatorSelection.moderatorSelection') }
                    </span>
                    <div className={ s.titleDescriptionContainer }>
                        <span>
                            { t('moderatorSelection.moderatorSelectionDesc') }
                        </span>
                    </div>
                    { !loading && (
                        <div
                            className = { `${s.button} ${showSearch ? s.pressed : ''}` }
                            onClick = { this._onToggleSearch }>
                            <Tooltip content = { t('moderatorSelection.search') } position = 'top'>
                                <Icon size = { 24 } src = { IconSearch } />
                            </Tooltip>
                        </div>
                    )}
                </h4>
            </ModalHeader>
        );
    };

    /**
     * Function to handle search inputs
     * @param {Object} event from search input box
     */
    handleSearchInput = event => {
        this.setState(
            { searchQuery: event.target.value },
            () => this.filterParticipants(this.state.searchQuery)
        );
    }

    /**
     * Core function that filters participants based on the search input
     * @param {String} filterText the string from search input, based upon which to filter result
     */
    filterParticipants = filterText => {
        const { participants } = this.props;
        filterText = filterText.toLowerCase();
        this.setState({
            searchResult: filter(participants, ({ name }) =>
                name && name.toLowerCase().includes(filterText)
            )
        });
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { participants, dispatch, t } = this.props;
        const { searchQuery, searchResult } = this.state;
        let items = [];

        if (searchQuery) {
            items = map(searchResult, item => (
                <ModeratorSelectionItem
                    key = { item.id }
                    dispatch = { dispatch }
                    { ...item } />
            ));
        } else {
            items = map(participants, item => (
                <ModeratorSelectionItem
                    key = { item.id }
                    dispatch = { dispatch }
                    { ...item } />
            ));
        }

        return (
            <Dialog
                cancelKey = { 'dialog.close' }
                customHeader = { this._customHeader }
                submitDisabled = { true }
                width = { 'large' }
                titleKey = 'moderatorSelection.moderatorSelection'>

                { this.state.showSearch && (
                    <div className = {`moderator-selection-searchbox ${s.searchContainer}`}>
                        <FieldText
                            autoFocus = { true }
                            compact = { true }
                            id = 'searchBox'
                            isLabelHidden = { true }
                            placeholder =  { this.props.t('moderatorSelection.searchPlaceholder') }
                            shouldFitContainer = { true }
                            // eslint-disable-next-line react/jsx-no-bind
                            onChange = { this.handleSearchInput }
                            type = 'text'
                            value = { this.state.searchQuery } />
                        <div
                            className = { s.closeIcon }
                            onClick = { this._onToggleSearch }>
                            <CrossCircleIcon size = 'small' />
                        </div>
                    </div>
                )}

                <hr className = { s.divider } />

                <div className = { `moderator-selection ${s.container}` }>
                    <ModeratorSelectionLabels />
                    { this.state.loading
                        ? <Spinner appearance = 'invert' />
                        : items }
                </div>
            </Dialog>
        );
    }
}

/**
 * Maps (parts of) the redux state to the associated SpeakerStats's props.
 *
 * @param {Object} state - The redux state.
 * @private
 * @returns Object
 */
function _mapStateToProps(state) {
    const _participants = keyBy(state['features/base/participants'], 'id');
    return {
        participants: _participants
    };
}

export default translate(connect(_mapStateToProps)(ModeratorSelection));
