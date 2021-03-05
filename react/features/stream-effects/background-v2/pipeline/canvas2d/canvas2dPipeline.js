//Source code from https://github.com/Volcomix/virtual-background
//modified to Typescript to Javscript

export default class buildCanvas2dPipeline{
    render: Function;
    cleanUp: Function;

    constructor(sourcePlayback, background, canvas, tflite, useLite){
        this.sourcePlayback = sourcePlayback;
        this.background = background;
        this.canvas = canvas;
        this.tflite = tflite;

        this.ctx = canvas.getContext('2d');
        this.segmentationWidth = useLite? 160 : 256;
        this.segmentationHeight = useLite? 96 : 144;
        this.segmentationPixelCount = this.segmentationWidth * this.segmentationHeight;
        this.segmentationMask = new ImageData(this.segmentationWidth, this.segmentationHeight);
        this.segmentationMaskCanvas = document.createElement('canvas');
        this.segmentationMaskCanvas.width = this.segmentationWidth;
        this.segmentationMaskCanvas.height = this.segmentationHeight;
        this.segmentationMaskCtx = this.segmentationMaskCanvas.getContext('2d');
        this.inputMemoryOffset = this.tflite._getInputMemoryOffset() / 4;
        this.outputMemoryOffset = this.tflite._getOutputMemoryOffset() / 4;
    
        this.blendingCanvas = document.createElement('canvas');
        this.blendingCanvas.width = this.background.width;
        this.blendingCanvas.height = this.background.height;
        this.blendingCanvasCtx = this.blendingCanvas.getContext('2d');
    }

    async render() {

        this.resizeSource();
        this.runTFLiteInference()
        this.runPostProcessing();
    }
    cleanUp() {
        // Nothing to clean up in this rendering pipeline
    }
    resizeSource() {
        this.segmentationMaskCtx.drawImage(this.sourcePlayback, 0, 0, this.sourcePlayback.width, this.sourcePlayback.height, 0, 0, this.segmentationWidth, this.segmentationHeight);
        const imageData = this.segmentationMaskCtx.getImageData(0, 0, this.segmentationWidth, this.segmentationHeight);
        for (let i = 0; i < this.segmentationPixelCount; i++) {
            this.tflite.HEAPF32[this.inputMemoryOffset + i * 3] = imageData.data[i * 4] / 255;
            this.tflite.HEAPF32[this.inputMemoryOffset + i * 3 + 1] =
                imageData.data[i * 4 + 1] / 255;
                this.tflite.HEAPF32[this.inputMemoryOffset + i * 3 + 2] =
                imageData.data[i * 4 + 2] / 255;
        }
    }
    runTFLiteInference() {
        this.tflite._runInference();
        for (let i = 0; i < this.segmentationPixelCount; i++) {
            const background = this.tflite.HEAPF32[this.outputMemoryOffset + i * 2];
            const person = this.tflite.HEAPF32[this.outputMemoryOffset + i * 2 + 1];
            const shift = Math.max(background, person);
            const backgroundExp = Math.exp(background - shift);
            const personExp = Math.exp(person - shift);
            // Sets only the alpha component of each pixel
            this.segmentationMask.data[i * 4 + 3] =
                (255 * personExp) / (backgroundExp + personExp); // softmax
        }
        //this.segmentationMaskCtx.drawImage(this.background, 0, 0, this.segmentationWidth, this.segmentationWidth);
        this.segmentationMaskCtx.putImageData(this.segmentationMask, 0, 0);
    }
    runPostProcessing() {
        this.ctx.globalCompositeOperation = 'copy';
        this.ctx.filter = 'none';
    
        this.ctx.drawImage(this.background, 0, 0, this.sourcePlayback.width, this.sourcePlayback.height);
        this.ctx.globalCompositeOperation = 'source-atop';
        this.ctx.filter = 'none';
        this.drawSegmentationMask();
    }
    drawSegmentationMask() {
        this.blendingCanvasCtx.drawImage(this.segmentationMaskCanvas, 0, 0, this.segmentationWidth, this.segmentationHeight, 0, 0, this.sourcePlayback.width, this.sourcePlayback.height);
        this.blendingCanvasCtx.globalCompositeOperation = 'source-in';
        this.blendingCanvasCtx.filter = 'none';
        this.blendingCanvasCtx.drawImage(this.sourcePlayback, 0, 0);
        this.ctx.drawImage(this.blendingCanvas, 0, 0, this.sourcePlayback.width, this.sourcePlayback.height);
    }
}
