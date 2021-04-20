// @flow

import React, { useRef } from 'react';
import { Trans } from 'react-i18next';
import { Icon, IconAdd } from '../../base/icons';

import s from './AddRoomsButton.module.scss';

function AddRoomsButton(props) {
    const inputRef = useRef();

    const onAddRooms = e => {
        if (inputRef.current && e.target !== inputRef.current) {
            const value = parseInt(inputRef.current.value, 10) || 1;
            props.onClick && props.onClick(value);
            inputRef.current.value = '';
        }
    }

    return (
        <div className = { s.container } key = 'add-rooms' >
            <div className = { s.button } onClick = { onAddRooms }>
                <Trans i18nKey = 'breakoutRoom.addRooms'>
                    Add
                    <input 
                        name = 'rooms' 
                        placeholder = '1' 
                        maxLength = '2'
                        ref = { inputRef } />
                    Rooms
                </Trans>
            </div>
            <Icon src = { IconAdd } />
        </div>
    )
}

export default AddRoomsButton;
