import { find, max, min } from 'lodash';
import moment from 'moment';

export function getDuration(item) {
    if (!item.leaveTime || !item.joinTime) return 0;

    const t2 = item.leaveTime;
    const t1 = item.lastJoinTime || item.joinTime;

    return moment.duration(moment(t2).diff(t1)).as('milliseconds');
}

export function getOverlap(log1, log2) {
    const t2 = min([log1.leaveTime, log2.leaveTime]);
    const t1 = max([log1.joinTime, log2.joinTime]);

    // not overlapped
    if (t2 <= t1) return 0;

    return moment.duration(moment(t2).diff(t1)).as('milliseconds');
}

export function mergeStats(state) {
    const data = [];

    state.forEach(s => {
        const item = { ...s };

        item.key = item.nick;
        item.duration = getDuration(item);

        // 참석자 없으면 drop
        if (!item.stats_id) {
            return;
        }

        // 참석자 stats_id가 일치하지 않으면 걍 추가
        const found = find(data, { stats_id: item.stats_id });
        if (!found) {
            data.push(item);
            return;
        }

        // --- ----
        // --=-----
        // --====--
        if (found.leaveTime && item.leaveTime) {
            // merge with before
            found.duration += item.duration;
            found.duration -= getOverlap(found, item);
            found.leaveTime = max([found.leaveTime, item.leaveTime]);
            found.nick = item.nick;
        }
        // --- ---->
        // --=----->
        else if (found.leaveTime && !item.leaveTime) {
            // merge with before
            found.lastJoinTime = item.joinTime;
            found.leaveTime = '';
            found.nick = item.nick;
        }
        // ---======>
        else if (!found.leaveTime && !item.leaveTime) {
            // add log
            data.push(item);
            return;
        }
        // ---====-->
        else {
            // drop log
        }

        if (!found.children) {
            found.children = [ { ...found, name: '', email: '' } ];
        }

        item.name = '';
        item.email = '';
        found.children.push(item);
    });

    return data;
}
