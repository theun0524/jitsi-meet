//Source code from https://github.com/Volcomix/virtual-background
//modified to Typescript to Javscript

import React, { useEffect, useState } from 'react';
import createTFLiteModule from '../../tflite/tflite';
import createTFLiteSIMDModule from '../../tflite/tflite-simd';

export default async function useTFLite(useLite) {

  try {
    const MyModule = await createTFLiteModule();

    if (!MyModule) {
      console.log('Module not exists!');
      return;
    }

    const newSelectedTFLite = await MyModule;

    if (!newSelectedTFLite) {
        throw new Error(`TFLite backend unavailable`);
    }
    const modelFileName = useLite? 'bg_segmentation_lite' : 'bg_segmentation';
    //console.log('Loading meet model:', modelFileName);
    const modelResponse = await fetch(`/libs/${modelFileName}.tflite`);
    const model = await modelResponse.arrayBuffer();
    //console.log('Model buffer size:', model.byteLength);
    const modelBufferOffset = newSelectedTFLite._getModelBufferMemoryOffset();
    //console.log('Model buffer memory offset:', modelBufferOffset);
    //console.log('Loading model buffer...');
    newSelectedTFLite.HEAPU8.set(new Uint8Array(model), modelBufferOffset);
    console.log('_loadModel result:', newSelectedTFLite._loadModel(model.byteLength));
    /*console.log('Input memory offset:', newSelectedTFLite._getInputMemoryOffset());
    console.log('Input height:', newSelectedTFLite._getInputHeight());
    console.log('Input width:', newSelectedTFLite._getInputWidth());
    console.log('Input channels:', newSelectedTFLite._getInputChannelCount());
    console.log('Output memory offset:', newSelectedTFLite._getOutputMemoryOffset());
    console.log('Output height:', newSelectedTFLite._getOutputHeight());
    console.log('Output width:', newSelectedTFLite._getOutputWidth());
    console.log('Output channels:', newSelectedTFLite._getOutputChannelCount());*/

    const currentTFLite = await newSelectedTFLite;

    return currentTFLite;
  }
  catch (error) {
    console.warn('Failed to create TFLite WebAssembly module.', error);
  }
}
