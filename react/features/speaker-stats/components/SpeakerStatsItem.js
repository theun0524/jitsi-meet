/* @flow */

import React, { Component } from 'react';

import TimeElapsed from './TimeElapsed';

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
        const joinTime = this.props.participantLog && this.props.participantLog.joinTime? this.hhmmss(new Date(1000 * this.props.participantLog.joinTime)) : '';
        const leaveTime = this.props.participantLog && this.props.participantLog.leaveTime? this.hhmmss(new Date(1000 * this.props.participantLog.leaveTime)) : '';

        return (
            <div className = { rowDisplayClass }>
                <div className = 'speaker-stats-item__status'>
                    <span className = { speakerStatusClass } />
                </div>
                <div className = 'speaker-stats-item__name'>
                    { this.props.displayName }
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
