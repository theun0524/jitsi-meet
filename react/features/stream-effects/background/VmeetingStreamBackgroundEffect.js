// @flow

import * as bodyPix from '@tensorflow-models/body-pix';

import {
    CLEAR_INTERVAL,
    INTERVAL_TIMEOUT,
    SET_INTERVAL,
    timerWorkerScript
} from './TimerWorker';

/**
 * Represents a modified MediaStream that adds blur to video background.
 * <tt>VmeetingStreamBackgroundEffect</tt> does the processing of the original
 * video stream.
 */
export default class VmeetingStreamBackgroundEffect {
    _bpModel: Object;
    _videoElement: HTMLVideoElement;
    _onVideoFrameTimer: Function;
    _videoFrameTimerWorker: Worker;
    _videoInProgress: boolean;
    _canvas: HTMLCanvasElement;
    _renderMask: Function;
    _segmentationData: Object;
    isEnabled: Function;
    startEffect: Function;
    stopEffect: Function;

    /**
     * Represents a modified video MediaStream track.
     *
     * @class
     * @param {BodyPix} bpModel - BodyPix model.
     */
    constructor(bpModel: Object, backgroundImageUrl: String) {
        this._bpModel = bpModel;

        // Bind event handler so it is only bound once for every instance.
        this._onVideoFrameTimer = this._onVideoFrameTimer.bind(this);
        this._backgroundImageUrl = backgroundImageUrl;
    }

    /**
     * EventHandler onmessage for the maskFrameTimerWorker WebWorker.
     *
     * @private
     * @param {EventHandler} response - The onmessage EventHandler parameter.
     * @returns {void}
     */
    async _onVideoFrameTimer(response: Object) {
        if (response.data.id === INTERVAL_TIMEOUT) {
            if (!this._videoInProgress) {
                await this._renderVideo();
            }
        }
    }

    /**
     * Loop function to render the video with virtual background.
     *
     * @private
     * @returns {void}
     */
    async _renderVideo() {
        this._videoInProgress = true;
        this._segmentationData = await this._bpModel.segmentPerson(this._videoElement, {
            internalResolution: 'medium', // resized to 0.5 times of the original resolution before inference
            maxDetections: 1, // max. number of person poses to detect per image
            segmentationThreshold: 0.5 // represents probability that a pixel belongs to a person
        });
        this._videoInProgress = false;
        this.drawBody();
    }

    /**
     * Checks if the local track supports this effect.
     *
     * @param {JitsiLocalTrack} jitsiLocalTrack - Track to apply effect.
     * @returns {boolean} - Returns true if this effect can run on the specified track
     * false otherwise.
     */
    isEnabled(jitsiLocalTrack: Object) {
        return jitsiLocalTrack.isVideoTrack() && jitsiLocalTrack.videoType === 'camera';
    }

    /**
     * Starts loop to capture video frame and render the segmentation mask.
     *
     * @param {MediaStream} stream - Stream to be used for processing.
     * @returns {MediaStream} - The stream with the applied effect.
     */
    startEffect(stream: MediaStream) {
        this._videoFrameTimerWorker = new Worker(timerWorkerScript, { name: 'Background effect worker' });
        this._videoFrameTimerWorker.onmessage = this._onVideoFrameTimer;

        const firstVideoTrack = stream.getVideoTracks()[0];
        const { height, frameRate, width }
            = firstVideoTrack.getSettings ? firstVideoTrack.getSettings() : firstVideoTrack.getConstraints();

        this._container = document.createElement('div');
        this._canvas = document.createElement('canvas');
        this._ctx = this._canvas.getContext('2d');
        this._videoElement = document.createElement('video');
        this._backgroundElement = document.createElement('img');

        this._container.appendChild(this._videoElement);
        this._container.appendChild(this._backgroundElement);
        if (document.body !== null) {
            document.body.appendChild(this._container);
        }

        this._backgroundElement.src = this._backgroundImageUrl;
        this._backgroundElement.style = {
            'object-fit': 'cover'
        };

        // set the style attribute of the div to make it invisible
        this._container.style.display = 'none';

        this._canvas.width = parseInt(width, 10);
        this._canvas.height = parseInt(height, 10);
        this._backgroundElement.width = parseInt(width, 10);
        this._backgroundElement.height = parseInt(height, 10);
        this._videoElement.width = parseInt(width, 10);
        this._videoElement.height = parseInt(height, 10);
        this._videoElement.autoplay = true;
        this._videoElement.srcObject = stream;
        this._videoElement.onloadeddata = () => {
            this._videoFrameTimerWorker.postMessage({
                id: SET_INTERVAL,
                timeMs: 1000 / parseInt(frameRate, 10)
            });
        };

        return this._canvas.captureStream(parseInt(frameRate, 10));
    }

    /**
     * Stops the capture and render loop.
     *
     * @returns {void}
     */
    stopEffect() {
        this._videoFrameTimerWorker.postMessage({
            id: CLEAR_INTERVAL
        });

        this._videoFrameTimerWorker.terminate();
        document.body.removeChild(this._container);
    }

    /**
     * Draw the person body
     */
    drawBody() {
        if (!this._segmentationData) return;

        const { width, height } = this._videoElement;

        this._ctx.drawImage(this._videoElement, 0, 0, width, height);
        const mixData = this._ctx.getImageData(0, 0, width, height);
        const pixel = mixData.data;

        this._ctx.drawImage(this._backgroundElement, 0, 0, width, height);
        const back = this._ctx.getImageData(0, 0, width, height).data;
        for (let p = 0; p < pixel.length; p += 4) {
            if (this._segmentationData.data[p/4] == 0) {
                pixel[p] = back[p];
                pixel[p+1] = back[p+1];
                pixel[p+2] = back[p+2];
                pixel[p+3] = back[p+3];
            }
        }
        this._ctx.imageSmoothingEnabled = true;
        this._ctx.putImageData(mixData, 0, 0);
    }
}
