// @flow

import { ReducerRegistry } from '../base/redux';

const DEFAULT_STATE = {
};

ReducerRegistry.register('features/breakout-room', (state = DEFAULT_STATE, action) => {
    switch (action.type) {
    }

    return state;
});
