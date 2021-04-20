// @flow

import React from 'react';
import { useTranslation } from 'react-i18next';

import s from './BreakoutRoom.module.scss';

function BreakoutRoom(props) {
    const { t } = useTranslation();

    return (
        <div className = { s.container }>
            <div className = { s.title }>
                <span>{ props.subject }</span>
                <span>{ props.members?.length || 0 }</span>
            </div>
            <div className = { s.content } />
            { props.footer && props.footer }
        </div>
    );
}

export default BreakoutRoom;
