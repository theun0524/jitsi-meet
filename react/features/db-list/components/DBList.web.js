// @flow

import React from 'react';
import type { Dispatch } from 'redux';

import { translate } from '../../base/i18n';
import { MeetingsListFromDB } from '../../base/react';
import { connect } from '../../base/redux';
import { toDisplayableList } from '../functions';

import AbstractDBList from './AbstractDBList';

import axios from 'axios';

/**
 * The type of the React {@code Component} props of {@link RecentList}
 */
type Props = {

    email: string,

    baseURL: Object,

    /**
     * The redux store's {@code dispatch} function.
     */
    dispatch: Dispatch<any>,

    /**
     * The translate function.
     */
    t: Function
};

type State = {
    setting: false,
    _dbList: Object
};

/**
 * The cross platform container rendering the list of the recently joined rooms.
 *
 */
class DBList extends AbstractDBList<Props, State> {
    _getRenderListEmptyComponent: () => React$Node;
    _onPress: string => {};

    /**
     * Initializes a new {@code RecentList} instance.
     *
     * @inheritdoc
     */
    constructor(props: Props) {
        super(props);

        this.state = {
            setting: false,
            _dbList: []
        }

        this._getRenderListEmptyComponent
            = this._getRenderListEmptyComponent.bind(this);
        this._onPress = this._onPress.bind(this);
    }
    
    /**
     * Implements the React Components's render method.
     *
     * @inheritdoc
     */
    render() {
        const {
            email,
            baseURL
        } = this.props;

        const AUTH_API_BASE = process.env.VMEETING_API_BASE;
        const apiBaseUrl = `${baseURL.origin}${AUTH_API_BASE}`;
                
        let dbList;
        let set = this.state.setting;

        if(!set){
            try{
                axios.post(`${apiBaseUrl}/conference/get-conference-by-email`, {
                    mail_owner: email
                }).then(_dbList => {
                    const _dbListData = _dbList.data;
                    const nextSetting = true;
                    this.state._dbList = _dbListData;
                    this.state.setting = nextSetting;
                });
            }
            catch(err){    
                console.log(err);
            }
        } else{
            dbList = toDisplayableList(this.state._dbList);
        }

        return set? (
            <MeetingsListFromDB
                hideURL = { true }
                listEmptyComponent = { this._getRenderListEmptyComponent() }
                meetings = { dbList }
                onPress = { this._onPress } />
        ): <MeetingsListFromDB
            hideURL = { true }
            listEmptyComponent = { this._getRenderListEmptyComponent() }
            meetings = { [] }
            onPress = { this._onPress } />;
    }
}

function mapStateToProps(state) {
    return {
        email: state['features/base/jwt'].user.email,
        baseURL: state['features/base/connection'].locationURL
    };
}


export default translate(connect(mapStateToProps)(DBList));
