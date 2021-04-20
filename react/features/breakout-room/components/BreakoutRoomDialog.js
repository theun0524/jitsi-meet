// @flow

import Button, { ButtonGroup } from '@atlaskit/button';
import Modal from '@atlaskit/modal-dialog';
import Select from '@atlaskit/select';
import Toggle from '@atlaskit/toggle';
import { each, filter, flatten, keyBy, map, range, sum } from 'lodash';
import React, { Component } from 'react';

import { StatelessDialog, hideDialog } from '../../base/dialog';
import { connect } from '../../base/redux';
import { translate } from '../../base/i18n/functions';
import { closeAllBreakoutRooms, openAllBreakoutRooms, setBreakoutRooms, setBreakoutRoomTime } from '../actions';
import AddRoomsButton from './AddRoomsButton';
import AutoAssignButton from './AutoAssignButton';
import BreakoutRoom from './BreakoutRoom';

import s from './BreakoutRoomDialog.module.scss';

type Props = {
    dispatch: Function
};

const timeOptions = [
    { label: '10', value: 10 * 60 },
    { label: '20', value: 20 * 60 },
    { label: '30', value: 30 * 60 },
    { label: '40', value: 40 * 60 }
];
const DEFAULT_ROOM_TIME = 1;

/**
 * A React {@code Component} for displaying a dialog for breakout room.
 *
 * @extends Component
 */
class BreakoutRoomDialog extends Component<Props> {
    /**
     * Initializes a new {@code BreakoutRoomDialog} instance.
     *
     * @param {Props} props - The React {@code Component} props to initialize
     * the new instance with.
     */
    constructor(props: Props) {
        super(props);

        this.state = {
            editMode: false,
        };

        // Bind event handlers so they are only bound once for every instance.
        this._closeDialog = this._closeDialog.bind(this);
        this._onAddRooms = this._onAddRooms.bind(this);
        this._onAutoAssign = this._onAutoAssign.bind(this);
        this._onChangeRoomTime = this._onChangeRoomTime.bind(this);
        this._onCloseAllRooms = this._onCloseAllRooms.bind(this);
        this._onOpenAllRooms = this._onOpenAllRooms.bind(this);
        this._onResetRooms = this._onResetRooms.bind(this);
        this._onToggleEditMode = this._onToggleEditMode.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { _breakoutRoom, _unassigned, t } = this.props;
        const { editMode } = this.state;

        return (
            <Modal
                autoFocus = { true }
                // components = {{
                //     Footer: this._renderFooter()
                // }}
                // heading = { t('breakoutRoom.title') }
                i18n = { this.props.i18n }
                onClose = { this._closeDialog }
                onDialogDismissed = { this._closeDialog }
                shouldCloseOnEscapePress = { true }
                height = '100%'
                width = { 'x-large' }>
                <div className = { s.container } >
                    { this._renderHeader() }
                    <div className = { s.content } >
                        <BreakoutRoom
                            edit = { editMode }
                            footer = { _unassigned.length ? (
                                <div className = { s.colFooter }>
                                    <span />
                                    <AutoAssignButton onClick = { this._onAutoAssign } />
                                </div>
                            ) : null }
                            key = 'unassigned'
                            members = { _unassigned }
                            subject = { t('breakoutRoom.unassigned') } />
                        { map(_breakoutRoom.rooms, (room, index) => (
                            <BreakoutRoom
                                {...room}
                                edit = { editMode }
                                key = { `breakout-room-${index}`} />
                        )) }
                        <AddRoomsButton onClick = { this._onAddRooms } />
                    </div>
                    { this._renderFooter() }
                </div>
            </Modal>
        );
    }

    _closeDialog: () => void;

    /**
     * Callback invoked to close the dialog without saving changes.
     *
     * @private
     * @returns {void}
     */
    _closeDialog() {
        this.props.dispatch(hideDialog());
    }

    _onAddRooms: () => void;

    /**
     * Callback invoked to add breakout rooms.
     *
     * @private
     * @returns {void}
     */
    _onAddRooms(count) {
        const { _breakoutRoom, t } = this.props;
        const { rooms = [] } = _breakoutRoom;

        this.props.dispatch(setBreakoutRooms([
            ...rooms,
            ...map(range(count), index => ({
                subject: `${t('breakoutRoom.title')} ${rooms.length + index}`,
                members: [],
            }))
        ]));
    }

    _onAutoAssign: () => void;

    /**
     * Callback invoked to assign automatically unassigned to rooms.
     *
     * @private
     * @returns {void}
     */
    _onAutoAssign() {
        const { dispatch, _breakoutRoom, _unassigned } = this.props;
        const { rooms } = _breakoutRoom;
        if (!rooms?.length) {
            return;
        }

        const total = _unassigned.length + sum(map(rooms, r => r.members.length));
        const assignCount = Math.ceil(total / rooms.length);
        const unassignCount = (room, index) =>
            assignCount -
            room.members.length -
            (index < (total % rooms.length) ? 0 : 1);
        let unassigned = _unassigned;

        each(rooms, (room, index) => {
            if (room.members?.length >= assignCount) return;

            const assigned = unassigned.splice(0, assignCount(room, index));
            room.members.splice(room.members.length, ...assigned);
        });

        dispatch(setBreakoutRooms(rooms));
    }

    _onChangeRoomTime: () => void;

    /**
     * Callback invoked to set the breakout room time.
     *
     * @private
     * @returns {void}
     */
    _onChangeRoomTime(selected) {
        if (selected) {
            this.props.dispatch(setBreakoutRoomTime(selected.value));
        }
    }

    _onCloseAllRooms: () => void;

    /**
     * Callback invoked to close the all breakout rooms.
     *
     * @private
     * @returns {void}
     */
    _onCloseAllRooms() {
        this.props.dispatch(closeAllBreakoutRooms());
    }

    _onOpenAllRooms: () => void;

    /**
     * Callback invoked to open the all breakout rooms.
     *
     * @private
     * @returns {void}
     */
    _onOpenAllRooms() {
        const { time } = this.props._breakoutRoom;
        this.props.dispatch(openAllBreakoutRooms(time || timeOptions[DEFAULT_ROOM_TIME].value));
    }

    _onResetRooms: () => void;

    /**
     * Callback invoked to reset to default.
     *
     * @private
     * @returns {void}
     */
    _onResetRooms() {
        const { rooms } = this.props._breakoutRoom;
        this.props.dispatch(setBreakoutRooms(
            map(rooms, r => ({ ...r, members: [] }))
        ));
    }

    _onToggleEditMode: () => void;

    /**
     * Callback invoked to toggle the edit mode.
     *
     * @private
     * @returns {void}
     */
    _onToggleEditMode() {
        this.setState({ editMode: !this.state.editMode });
    }

    _renderHeader() {
        const { t } = this.props;

        return (
            <div className = { s.header }>
                <div className = { s.roomTimeContainer }>
                    <span>{ t('breakoutRoom.breakoutRoomTimeout') } :</span>
                    <Select
                        className = { s.selectTime }
                        defaultValue = { timeOptions[DEFAULT_ROOM_TIME] }
                        options = { timeOptions }
                        onChange = { this._onChangeRoomTime } />
                    <span>{ t('breakoutRoom.minutes') }</span>
                </div>
                <div className = { s.toggleEditMode }>
                    <span>{ t('breakoutRoom.editMode') }</span>
                    <Toggle
                        isChecked = { this.state.editMode }
                        onChange = { this._onToggleEditMode } />
                </div>
            </div>
        )
    }

    _renderFooter() {
        const buttons = [];
        const { _breakoutRoom, t } = this.props;

        if (_breakoutRoom.isOpened) {
            buttons.push(
                <Button
                    appearance = 'danger'
                    id = 'id-close-all-rooms'
                    key = 'close-rooms'
                    onClick = { this._onCloseAllRooms }
                    type = 'button'>
                    { t('breakoutRoom.closeAllRooms') }
                </Button>
            );
        } else {
            buttons.push(
                <Button
                    appearance = 'subtle'
                    id = 'id-reset'
                    key = 'reset'
                    onClick = { this._onResetRooms }
                    type = 'button'>
                    { t('breakoutRoom.reset') }
                </Button>
            );
            buttons.push(
                <Button
                    appearance = 'primary'
                    id = 'id-open-all-rooms'
                    key = 'open-rooms'
                    onClick = { this._onOpenAllRooms }
                    type = 'button'>
                    { t('breakoutRoom.openAllRooms') }
                </Button>
            );
        }

        return (
            <div className = { s.footer }>
                <span />
                <ButtonGroup>
                    { buttons }
                </ButtonGroup>
            </div>
        );
    }
}

/**
 * Maps (parts of) the Redux state to the associated props for the
 * {@code BreakoutRoomDialog} component.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function _mapStateToProps(state) {
    const participants = state['features/base/participants'];
    const breakoutRoom = state['features/breakout-room'];
    const assigned = keyBy(flatten(map(breakoutRoom.rooms, 'members')), 'id');

    return {
        _breakoutRoom: breakoutRoom,
        _unassigned: filter(participants, p => !p.local && !assigned[p.id]),
    };
}

export default translate(connect(_mapStateToProps)(BreakoutRoomDialog));
