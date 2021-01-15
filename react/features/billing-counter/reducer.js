import { ReducerRegistry } from '../base/redux';

import { SET_ENDPOINT_COUNTED, SET_LICENSE_ERROR } from './actionTypes';

const DEFAULT_STATE = {
    endpointCounted: false
};

/**
 * Listen for actions that mutate the billing-counter state
 */
ReducerRegistry.register(
    'features/billing-counter', (state = DEFAULT_STATE, action) => {
        switch (action.type) {

        case SET_ENDPOINT_COUNTED: {
            return {
                ...state,
                endpointCounted: true
            };
        }

        case SET_LICENSE_ERROR: {
            return {
                ...state,
                error: action.error
            };
        }

        default:
            return state;
        }
    },
);
