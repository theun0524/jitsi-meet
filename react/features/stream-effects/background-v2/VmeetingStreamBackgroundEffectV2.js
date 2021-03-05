// @flow

import { flip } from 'lodash';
import useRenderingPipeline from './core/hooks/useRenderingPipeline';
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
    _tflite;
    _videoElement: HTMLVideoElement;
    _backgroundElement: HTMLImageElement;
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
     * @param {TFLite} tflite - TFLite model.
     */
    constructor(tflite, backgroundImageUrl, useLite) {
        this._tflite = tflite;
        this._useLite = useLite;

        // Bind event handler so it is only bound once for every instance.
        this._onVideoFrameTimer = this._onVideoFrameTimer.bind(this);
        this._backgroundImageUrl = backgroundImageUrl;

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

        const {
            pipeline,
            backgroundImageRef,
            canvasRef,
          } = useRenderingPipeline(
            this._videoElement,
            this._tflite,
            this._backgroundElement,
            this._canvas,
            this._useLite
          );
        //console.log(this._tflite._getModelBufferMemoryOffset());
        if (pipeline) {
            pipeline.updatePostProcessingConfig({
                smoothSegmentationMask: true,
                jointBilateralFilter: { sigmaSpace: 1, sigmaColor: 0.1 },
                coverage: [0.5, 0.75],
                lightWrapping: 0.3,
                blendMode: 'screen',
              })
        }
        this._videoInProgress = false;
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

        this._backgroundElement.src = this._backgroundImageUrl;
        this._backgroundElement.style.objectFit = 'cover';


        // set the style attribute of the div to make it invisible
        this._container.style.display = 'none';

        this._canvas.width = parseInt(width, 10);
        this._canvas.height = parseInt(height, 10);
        //this._canvas.ref = this._canvasRef;
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
}
