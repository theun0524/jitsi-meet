// @flow

import { toState } from '../base/redux';

/**
 * Returns true if follow me is active and false otherwise.
 *
 * @param {Object|Function} stateful - Object or function that can be resolved
 * to the Redux state.
 * @returns {boolean} - True if follow me is active and false otherwise.
 */
export function isFollowMeActive(stateful: Object | Function) {
    const state = toState(stateful);

    return Boolean(state['features/follow-me'].moderator);
}

/**
 * Returns true if follow me is enabled and false otherwise.
 *
 * @param {Object|Function} stateful - Object or function that can be resolved
 * to the Redux state.
 * @returns {boolean} - True if follow me is enabled and false otherwise.
 */
export function isFollowMeEnabled(stateful: Object | Function) {
    const state = toState(stateful);

    return Boolean(state['features/base/conference'].followMeEnabled) ||
        Boolean(state['features/base/config'].followMeEnabled);
}
