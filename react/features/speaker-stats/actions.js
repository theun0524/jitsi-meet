// @flow

import axios from 'axios';
import { each, max, min } from 'lodash';
import moment from 'moment';
import type { Dispatch } from 'redux';

import { getAuthUrl } from '../../api/url';
import { MEDIA_TYPE, VIDEO_TYPE } from '../base/media';
import { getTrackByMediaTypeAndParticipant } from '../base/tracks';

import { 
    SPEAKER_STATS_LOADED,
    SPEAKER_STATS_UPDATED,
} from './actionTypes';

declare var APP: Object;

export function getDuration(stats) {
    if (!stats.leaveTime) return 0;

    const t2 = stats.leaveTime;
    const t1 = stats.lastJoinTime || stats.joinTime;

    return moment.duration(moment(t2).diff(t1)).as('milliseconds');
}

export function getOverlap(log1, log2) {
    const t2 = min([log1.leaveTime, log2.leaveTime]);
    const t1 = max([log1.joinTime, log2.joinTime]);

    // not overlapped
    if (t2 <= t1) return 0;

    return moment.duration(moment(t2).diff(t1)).as('milliseconds');
}

export function mergeSpeakerStats(stats, callback) {
    const data = [];

    each(stats, item => {
        callback && callback(item);
    
        // 참석자 stats_id가 없으면 걍 추가
        if (!item.stats_id) {
            data.push(item);
            return;
        }

        // 참석자 stats_id가 일치하지 않으면 걍 추가
        const found = data.find(r => r.stats_id === item.stats_id);
        if (!found) {
            data.push(item);
            return;
        }

        // --- ----
        // --=-----
        // --====--
        if (found.leaveTime && item.leaveTime) {
            // merge with before
            found.duration += getDuration(item);
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
        }
        // ---====-->
        else {
            // drop log
        }
    });

    return data;
}

export function loadSpeakerStats(meetingId) {
    return async (dispatch: Dispatch<any>, getState: Function) => {
        const apiBase = getAuthUrl(getState());
        const apiUrl = `${apiBase}/plog?meeting_id=${meetingId}`;
        const tracks = getState()['features/base/tracks'];

        try {
            const logs = await axios.get(apiUrl);
            console.log('loadSpeakerStats:', logs.data);
            const data = mergeSpeakerStats(logs.data, item => {
                const audioTrack = getTrackByMediaTypeAndParticipant(tracks, MEDIA_TYPE.AUDIO, item.nick);
                const videoTrack = getTrackByMediaTypeAndParticipant(tracks, MEDIA_TYPE.VIDEO, item.nick);
                
                item.duration = getDuration(item);
                item.local = audioTrack?.local || videoTrack?.local;
                item.audioMuted = audioTrack?.muted;
                item.videoMuted = videoTrack?.muted;
                item.isPresenter = videoTrack?.videoType === VIDEO_TYPE.DESKTOP;
            });

            dispatch(speakerStatsLoaded(data));
        } catch(err) {    
            console.log('loadSpeakerStats is failed:', err);
        }    
    };
}

export function speakerStatsLoaded(stats: Array) {
    return {
        type: SPEAKER_STATS_LOADED,
        stats
    };
}

export function speakerStatsUpdated(item: Object) {
    return {
        type: SPEAKER_STATS_UPDATED,
        item
    };
}
