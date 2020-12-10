/* @flow */

import * as bodyPix from '@tensorflow-models/body-pix';
import React, { Component } from 'react';

import Video from '../../base/media/components/Video';
import s from './VideoInputPreview.module.scss';

/**
 * The type of the React {@code Component} props of {@link VideoInputPreview}.
 */
type Props = {

    /**
     * Background image id to display
     */
    background: ?string,
    /**
     * An error message to display instead of a preview. Displaying an error
     * will take priority over displaying a video preview.
     */
    error: ?string,

    /**
     * The JitsiLocalTrack to display.
     */
    track: Object
};

/**
 * React component for displaying video. This component defers to lib-jitsi-meet
 * logic for rendering the video.
 *
 * @extends Component
 */
class VideoInputPreview extends Component<Props> {
    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { error } = this.props;
        const className = `${s.videoInputPreview} ${error ? s.hasError : ''}`;

        return (
            <div className = { className }>
                <Video
                    className = { `${s.display} flipVideoX` }
                    playsinline = { true }
                    videoTrack = {{ jitsiTrack: this.props.track }} />
                <div className = {s.error}>
                    { error || '' }
                </div>
            </div>
        );
    }
}

export default VideoInputPreview;
