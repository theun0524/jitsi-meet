/* @flow */

import { toState } from '../redux';
import { parseURLParams } from '../util';

/**
 * Retrieves the JSON Web Token (JWT), if any, defined by a specific
 * {@link URL}.
 *
 * @param {URL} url - The {@code URL} to parse and retrieve the JSON Web Token
 * (JWT), if any, from.
 * @returns {string} The JSON Web Token (JWT), if any, defined by the specified
 * {@code url}; otherwise, {@code undefined}.
 */
export function parseJWTFromURLParams(url: URL = window.location) {
    return parseURLParams(url, true, 'search').jwt;
}

/*
 * 회의 게스트인지 판단하여 결과값을 리턴한다.
 * jwt가 있어도 방장이 아니면 게스트로 판단한다.
 */
export function isHost(stateful) {
    const state = toState(stateful);
    const { roomInfo } = state['features/base/conference'];

    return Boolean(state['features/base/jwt'].jwt) &&
        ( roomInfo && roomInfo.isHost );
}
