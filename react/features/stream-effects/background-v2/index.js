// @flow

import useTFLite from './core/hooks/useTFLite'
import VmeetingStreamBackgroundEffectV2 from './VmeetingStreamBackgroundEffectV2';

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
    let useLite = false;

    var tflite = await useTFLite(useLite);
    console.log("tflite: ", tflite);

    return new VmeetingStreamBackgroundEffectV2(tflite, backgroundImageUrl, useLite);
}
