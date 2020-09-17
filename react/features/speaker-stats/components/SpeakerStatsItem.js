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
     * True if the participant is currently the dominant speaker.
     */
    participantLog: Object

    /**
     * Date object that saves join time of the user
     */
    //startTime: Object,

    /**
     * Date object that saves leave time of the user (null if not leave)
     */
    //leaveTime: Object
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
                    { this.props.participantLog && this.props.participantLog["joinTime"]? this.hhmmss(this.props.participantLog["joinTime"]) : '' }
                </div>
                <div className = 'speaker-stats-item__l_time'>
                    { this.props.participantLog && this.props.participantLog["leaveTime"]? this.hhmmss(this.props.participantLog["leaveTime"]) : '' } 
                </div>
            </div>
        );
    }

    hhmmss(hms) {
        var hh = hms["hour"];
        var mm = hms["min"];
        var ss = hms["sec"];

        return [(hh>9 ? '' : '0') + hh, ':',
                (mm>9 ? '' : '0') + mm, ':',
                (ss>9 ? '' : '0') + ss,
                ].join('');
    }
}

export default SpeakerStatsItem;
