// @flow

import React from 'react';
import Button from '@atlaskit/button';
import { useTranslation } from 'react-i18next';

function AutoAssignButton(props) {
    const { t } = useTranslation();
    const onClick = e => {
        props.onClick && props.onClick(value);
    }

    return (
        <Button
            appearance = 'subtle'
            id = 'id-auto-assign'
            key = 'auto-assign'
            onClick = { onClick }
            type = 'button'>
            { t('breakoutRoom.automaticAssign') }
        </Button>
    );
}

export default AutoAssignButton;
