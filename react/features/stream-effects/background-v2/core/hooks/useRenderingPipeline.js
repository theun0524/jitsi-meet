//Source code from https://github.com/Volcomix/virtual-background
//modified to Typescript to Javscript

import { useEffect, useRef, useState } from 'react';
import buildCanvas2dPipeline from '../../pipeline/canvas2d/canvas2dPipeline';
//import { buildWebGL2Pipeline } from '../../pipeline/webgl2/webgl2Pipeline';

export default async function useRenderingPipeline(sourcePlayback, tflite, _backgroundImageRef, _canvasRef) {
    let pipeline = null;
    let backgroundImageRef = _backgroundImageRef;
    let canvasRef = _canvasRef;

    let shouldRender = true;
    let renderRequestId;
    //const newPipeline = buildWebGL2Pipeline(sourcePlayback, backgroundImageRef, canvasRef, tflite);
    const newPipeline = new buildCanvas2dPipeline(sourcePlayback, backgroundImageRef, canvasRef, tflite);

    async function render() {
        if (!shouldRender) {
          return;
        }

        await newPipeline.render();
        renderRequestId = requestAnimationFrame(render);
      }

    render();
    pipeline = newPipeline;

    shouldRender = false;
    cancelAnimationFrame(renderRequestId);
    newPipeline.cleanUp();
    //console.log('Animation stopped:', sourcePlayback);
    pipeline = null;

    return {
        pipeline,
        backgroundImageRef,
        canvasRef,
    };
}