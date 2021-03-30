// @flow

import * as wasmCheck from 'wasm-check';

import VmeetingStreamBackgroundEffectV2 from './VmeetingStreamBackgroundEffectV2';
import createTFLiteModule from './tflite/tflite';
import createTFLiteSIMDModule from './tflite/tflite-simd';

const models = {
    'model96': 'libs/bg_segmentation_lite.tflite',
    'model144': 'libs/bg_segmentation.tflite'
};

const segmentationDimensions = {
    'model96': {
        'height': 96,
        'width': 160
    },
    'model144': {
        'height': 144,
        'width': 256
    }
};

/**
 * Creates a new instance of VmeetingStreamBackgroundEffect. This loads the bodyPix model that is used to
 * extract person segmentation.
 *
 * @returns {Promise<VmeetingStreamBackgroundEffect>}
 */
export async function createBackgroundEffectV2(backgroundImageUrl) {
    if (!MediaStreamTrack.prototype.getSettings && !MediaStreamTrack.prototype.getConstraints) {
        throw new Error('VmeetingStreamBackgroundEffectV2 not supported!');
    }

    let tflite;

    if (wasmCheck.feature.simd) {
        tflite = await createTFLiteSIMDModule();
        console.log('Background Effect uses SIMD');
    } else {
        tflite = await createTFLiteModule();
    }

    const modelBufferOffset = tflite._getModelBufferMemoryOffset();
    const modelResponse = await fetch(
        wasmCheck.feature.simd ? models.model144 : models.model96
    );

    if (!modelResponse.ok) {
        throw new Error('Failed to download tflite model!');
    }

    const model = await modelResponse.arrayBuffer();

    tflite.HEAPU8.set(new Uint8Array(model), modelBufferOffset);

    tflite._loadModel(model.byteLength);

    const options = wasmCheck.feature.simd ? segmentationDimensions.model144 : segmentationDimensions.model96;

    return new VmeetingStreamBackgroundEffectV2(tflite, backgroundImageUrl, options);
}
