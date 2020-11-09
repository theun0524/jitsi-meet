// @flow
/* global APP, config */

import { trim } from 'lodash';
import { getLocalParticipant } from '../../base/participants';
import {
    CLEAR_INTERVAL,
    INTERVAL_TIMEOUT,
    SET_INTERVAL,
    timerWorkerScript
} from './TimeWorker';

// Background image size
const BACKGROUND_WIDTH = 1280;
const BACKGROUND_HEIGHT = 720;

// Canvas size
const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

// scale position from background to canvas
const scaleX = x => parseInt(CANVAS_WIDTH * x / BACKGROUND_WIDTH, 10);
const scaleY = y => parseInt(CANVAS_HEIGHT * y / BACKGROUND_HEIGHT, 10);

const layout = {
    video: {
        rect: {
            x: scaleX(40),
            y: scaleY(142),
            w: scaleX(910),
            h: scaleY(512)
        }
    },
    presenter: {
        rect: {
            x: scaleX(978),
            y: scaleY(142),
            w: scaleX(262),
            h: scaleY(196),
        },
        outline: {
            lineWidth: 2,
            lineColor: '#A9A9A9',
        },
        name: {
            font: "18px '맑은 고딕'",
            color: 'white',
            x: scaleX(978),
            y: scaleY(370)
        },
        title: {
            font: "14px '맑은 고딕'",
            color: 'white',
            x: scaleX(978),
            y: scaleY(395),
        },
    },
};

/**
 * Represents a modified MediaStream that adds video as pip on a desktop stream.
 * <tt>JitsiStreamPresenterEffect</tt> does the processing of the original
 * desktop stream.
 */
export default class JitsiStreamPresenterEffect {
    _backgroundElement: HTMLImageElement;
    _canvas: HTMLCanvasElement;
    _ctx: CanvasRenderingContext2D;
    _desktopElement: HTMLVideoElement;
    _desktopStream: MediaStream;
    _frameRate: number;
    _onVideoFrameTimer: Function;
    _onVideoFrameTimerWorker: Function;
    _renderVideo: Function;
    _videoFrameTimerWorker: Worker;
    _videoElement: HTMLVideoElement;
    isEnabled: Function;
    startEffect: Function;
    stopEffect: Function;

    /**
     * Represents a modified MediaStream that adds a camera track at the
     * bottom right corner of the desktop track using a HTML canvas.
     * <tt>JitsiStreamPresenterEffect</tt> does the processing of the original
     * video stream.
     *
     * @param {MediaStream} videoStream - The video stream which is user for
     * creating the canvas.
     */
    constructor(videoStream: MediaStream) {
        const videoDiv = document.createElement('div');
        const firstVideoTrack = videoStream.getVideoTracks()[0];
        const { height, width, frameRate } = firstVideoTrack.getSettings() ?? firstVideoTrack.getConstraints();
        const localParticipant = getLocalParticipant(APP.store.getState());
        const [name, title] = localParticipant.name.split('/').map(trim);

        this._name = name;
        this._title = title;
        this._canvas = document.createElement('canvas');
        this._ctx = this._canvas.getContext('2d');

        this._desktopElement = document.createElement('video');
        this._videoElement = document.createElement('video');
        this._backgroundElement = document.createElement('img');
        videoDiv.appendChild(this._videoElement);
        videoDiv.appendChild(this._desktopElement);
        videoDiv.appendChild(this._backgroundElement);
        if (document.body !== null) {
            document.body.appendChild(videoDiv);
        }

        const { maxWidth = 240, pipMode, backgroundImageUrl } = config.presenter || {};
        const maxHeight = maxWidth * 3 / 4;

        // Set the video element properties
        this._frameRate = parseInt(frameRate, 10);
        this._videoElement.width = Math.min(parseInt(width, 10), maxWidth);
        this._videoElement.height = Math.min(parseInt(height, 10), maxHeight);
        this._videoElement.autoplay = true;
        this._videoElement.srcObject = videoStream;

        // Set the background element properties
        if (!pipMode && backgroundImageUrl) {
            this._backgroundElement.src = backgroundImageUrl;
            this._backgroundElement.style = {
                'width': '100%',
                'object-fit': 'contain'
            };
        }

        // set the style attribute of the div to make it invisible
        videoDiv.style.display = 'none';

        // Bind event handler so it is only bound once for every instance.
        this._onVideoFrameTimer = this._onVideoFrameTimer.bind(this);
    }

    /**
     * EventHandler onmessage for the videoFrameTimerWorker WebWorker.
     *
     * @private
     * @param {EventHandler} response - The onmessage EventHandler parameter.
     * @returns {void}
     */
    _onVideoFrameTimer(response) {
        if (response.data.id === INTERVAL_TIMEOUT) {
            this._renderVideo();
        }
    }

    /**
     * Loop function to render the video frame input and draw presenter effect.
     *
     * @private
     * @returns {void}
     */
    _renderVideo() {
        // adjust the canvas width/height on every frame incase the window has been resized.
        const [ track ] = this._desktopStream.getVideoTracks();
        const { height, width } = track.getSettings() ?? track.getConstraints();
        const { pipMode = true } = config.presenter || {};
        const pipOffset = pipMode ? 0 : this._videoElement.width;

        this._desktopElement.width = parseInt(width, 10);
        this._desktopElement.height = parseInt(height, 10);
        this._canvas.width = CANVAS_WIDTH;
        this._canvas.height = CANVAS_HEIGHT;

        if (!pipMode && layout) {
            let rc = layout.video.rect;
            let { w, h } = rc;

            if (width >= height) {
                // width is 100%
                w = rc.w;
                h = parseInt(height * rc.w / width, 10);
            } else {
                // height is 100%
                h = rc.h;
                w = parseInt(width * rc.h / height, 10);
            }

            // adjust max width and height
            if (w > rc.w) {
                h = parseInt(h * rc.w / w, 10);
                w = rc.w;
            } else if (h > rc.h) {
                w = parseInt(w * rc.h / h, 10);
                h = rc.h;
            }
            console.log('track:', width, height, w, h);

            this._ctx.drawImage(this._backgroundElement, 0, 0, this._canvas.width, this._canvas.height);
            this._ctx.drawImage(
                this._desktopElement,
                0, 0, width, height,
                parseInt(rc.x + (rc.w - w) / 2, 10), parseInt(rc.y + (rc.h - h) / 2, 10), w, h);

            rc = layout.presenter.rect;
            this._ctx.drawImage(this._videoElement, rc.x, rc.y, rc.w, rc.h);

            // draw a border around the video element.
            const outline = layout.presenter.outline;
            this._ctx.beginPath();
            this._ctx.lineWidth = outline.lineWidth;
            this._ctx.strokeStyle = outline.lineColor; // dark grey
            this._ctx.rect(rc.x, rc.y, rc.w, rc.h);
            this._ctx.stroke();

            // draw presenter name
            let text = layout.presenter.name;
            this._ctx.font = text.font;
            this._ctx.fillStyle = text.color;
            this._ctx.fillText(this._name, text.x, text.y);

            if (this._title) {
                text = layout.presenter.title;
                this._ctx.font = text.font;
                this._ctx.fillStyle = text.color;
                this._ctx.fillText(this._title, text.x, text.y);
            }
        } else {
            this._ctx.drawImage(this._desktopElement, 0, 0, this._canvas.width, this._canvas.height);
            this._ctx.drawImage(
                this._videoElement,
                this._canvas.width - this._videoElement.width,
                this._canvas.height - this._videoElement.height,
                this._videoElement.width,
                this._videoElement.height);

            // draw a border around the video element.
            this._ctx.beginPath();
            this._ctx.lineWidth = 2;
            this._ctx.strokeStyle = '#A9A9A9'; // dark grey
            this._ctx.rect(this._canvas.width - this._videoElement.width, this._canvas.height - this._videoElement.height,
                this._videoElement.width, this._videoElement.height);
            this._ctx.stroke();
        }
    }

    /**
     * Checks if the local track supports this effect.
     *
     * @param {JitsiLocalTrack} jitsiLocalTrack - Track to apply effect.
     * @returns {boolean} - Returns true if this effect can run on the
     * specified track, false otherwise.
     */
    isEnabled(jitsiLocalTrack: Object) {
        return jitsiLocalTrack.isVideoTrack() && jitsiLocalTrack.videoType === 'desktop';
    }

    /**
     * Starts loop to capture video frame and render presenter effect.
     *
     * @param {MediaStream} desktopStream - Stream to be used for processing.
     * @returns {MediaStream} - The stream with the applied effect.
     */
    startEffect(desktopStream: MediaStream) {
        const firstVideoTrack = desktopStream.getVideoTracks()[0];
        const { height, width } = firstVideoTrack.getSettings() ?? firstVideoTrack.getConstraints();

        // set the desktop element properties.
        this._desktopStream = desktopStream;
        this._desktopElement.width = parseInt(width, 10);
        this._desktopElement.height = parseInt(height, 10);
        this._desktopElement.autoplay = true;
        this._desktopElement.srcObject = desktopStream;
        this._canvas.width = parseInt(width, 10);
        this._canvas.height = parseInt(height, 10);
        this._videoFrameTimerWorker = new Worker(timerWorkerScript, { name: 'Presenter effect worker' });
        this._videoFrameTimerWorker.onmessage = this._onVideoFrameTimer;
        this._videoFrameTimerWorker.postMessage({
            id: SET_INTERVAL,
            timeMs: 1000 / this._frameRate
        });

        const capturedStream = this._canvas.captureStream(this._frameRate);

        // Put emphasis on the text details for the presenter's stream;
        // See https://www.w3.org/TR/mst-content-hint/
        // $FlowExpectedError
        capturedStream.getVideoTracks()[0].contentHint = 'text';

        return capturedStream;
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
    }

}
