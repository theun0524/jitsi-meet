/* @flow */

import React, { Component } from 'react';

import TimeElapsed from './TimeElapsed';
import { BaseIndicator } from '../../base/react';
import { IconMicrophone, IconMicDisabled, IconCamera, IconCameraDisabled } from '../../base/icons'
/**
 * The type of the React {@code Component} props of {@link SpeakerStatsItem}.
 */
type Props = {

    /**
     * The name of the participant.
     */
    displayName: string,

    /**
     * The total milliseconds the participant has been dominant speaker.
     */
    dominantSpeakerTime: number,

    /**
     * True if the participant is no longer in the meeting.
     */
    hasLeft: boolean,

    /**
     * True if the participant is currently the dominant speaker.
     */
    isDominantSpeaker: boolean,

    /**
     * The participants' join/leave time.
     */
    participantLog: Object,

    /**
     * True if the participant's video is muted.
     */
    videoMuted: boolean,

    /**
     * True if the participant's audio is muted.
     */
    audioMuted: boolean
};

/**
 * React component for display an individual user's speaker stats.
 *
 * @extends Component
 */
class SpeakerStatsItem extends Component<Props> {
    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const hasLeftClass = this.props.hasLeft ? 'status-user-left' : '';
        const rowDisplayClass = `speaker-stats-item ${hasLeftClass}`;

        const dotClass = this.props.isDominantSpeaker
            ? 'status-active' : 'status-inactive';
        const speakerStatusClass = `speaker-stats-item__status-dot ${dotClass}`;

        //prosody(lua) gives time in seconds (not in milliseconds)
        const joinTime = this.props.participantLog && this.props.participantLog.joinTime? this.hhmmss(new Date(this.props.participantLog.joinTime)) : '';
        const leaveTime = this.props.participantLog && this.props.participantLog.leaveTime? this.hhmmss(new Date(this.props.participantLog.leaveTime)) : '';

        const videoMuted = this.props.videoMuted;
        const audioMuted = this.props.audioMuted;
        return (
            <div className = { rowDisplayClass }>
                <div className = 'speaker-stats-item__status'>
                    <span className = { speakerStatusClass } />
                </div>
                <div className = 'speaker-stats-item__name'> 
                    { this.props.displayName } &nbsp; { this.displayAudioStatus(audioMuted) } &nbsp; { this.displayVideoStatus(videoMuted) }
                </div>
                <div className = 'speaker-stats-item__time'>
                    <TimeElapsed
                        time = { this.props.dominantSpeakerTime } />
                </div>
                <div className = 'speaker-stats-item__s_time'>
                    { joinTime }
                </div>
                <div className = 'speaker-stats-item__l_time'>
                    { leaveTime } 
                </div>
            </div>
        );
    }

    displayAudioStatus(audioMuted) {
        let iconClass;
        let toolTipMessage;
        if(audioMuted) {
            iconClass = IconMicDisabled;
            toolTipMessage = 'videothumbnail.mute'
        }
        else {
            iconClass = IconMicrophone;
            toolTipMessage = 'videothumbnail.audioconnected'
        }
        return(
            <BaseIndicator
                className = 'audioMuted toolbar-icon'
                icon = { iconClass }
                iconId = 'mic-disabled'
                iconSize = { 13 }
                tooltipKey = { toolTipMessage }
                tooltipPosition = { 'top' } />
        );
    }

    displayVideoStatus(videoMuted) {
        let iconClass;
        let toolTipMessage;
        if(videoMuted) {
            iconClass = IconCameraDisabled;
            toolTipMessage = 'videothumbnail.videomute'
        }
        else {
            iconClass = IconCamera;
            toolTipMessage = 'videothumbnail.videoconnected'
        }
        return(
            <BaseIndicator
                className = 'videoMuted toolbar-icon'
                icon = { iconClass }
                iconId = 'camera-disabled'
                iconSize = { 16 }
                tooltipKey = { toolTipMessage }
                tooltipPosition = { 'top' } />
        );
    }
    
    hhmmss(hms) {
        var hh = hms.getHours();
        var mm = hms.getMinutes();
        var ss = hms.getSeconds();

        return [(hh>9 ? '' : '0') + hh, ':',
                (mm>9 ? '' : '0') + mm, ':',
                (ss>9 ? '' : '0') + ss,
                ].join('');
    }
}

export default SpeakerStatsItem;
