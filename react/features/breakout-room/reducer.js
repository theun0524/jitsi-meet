// @flow

import { ReducerRegistry } from '../base/redux';
import { ENABLE_BREAKOUT_ROOM } from './actionTypes';

const DEFAULT_STATE = {
    enabled: false,
};

ReducerRegistry.register('features/breakout-room', (state = DEFAULT_STATE, action) => {
    switch (action.type) {
        case ENABLE_BREAKOUT_ROOM: {
            return {
                ...state,
                enabled: action.enabled
            };
        }
    }

    return state;
});
