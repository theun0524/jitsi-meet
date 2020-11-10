/* global interfaceConfig */

import { parseURIString, safeDecodeURIComponent } from '../base/util';



/**
 * Transforms the history list to a displayable list.
 *
 * @private
 * @param {Array<Object>} dbList - The recent list form the redux store.
 * @returns {Array<Object>}
 */
export function toDisplayableList(dbList) {
    return (
        dbList.map(item => {
                return {
                    schedule: item.schedule,
                    lock: item.lock,
                    date: item.date,
                    duration: item.duration,
                    time: [ item.date ],
                    title: safeDecodeURIComponent(parseURIString(item.conference).room),
                    url: item.conference
                };
            }));
}
