// @flow

import * as bodyPix from '@tensorflow-models/body-pix';

import VmeetingStreamBackgroundEffect from './VmeetingStreamBackgroundEffect';

/**
 * Creates a new instance of VmeetingStreamBackgroundEffect. This loads the bodyPix model that is used to
 * extract person segmentation.
 *
 * @returns {Promise<VmeetingStreamBackgroundEffect>}
 */
export async function createBackgroundEffect(backgroundImageUrl) {
    if (!MediaStreamTrack.prototype.getSettings && !MediaStreamTrack.prototype.getConstraints) {
        throw new Error('VmeetingStreamBackgroundEffect not supported!');
    }

    // An output stride of 16 and a multiplier of 0.5 are used for improved
    // performance on a larger range of CPUs.
    const bpModel = await bodyPix.load({
        architecture: 'MobileNetV1',
        outputStride: 16,
        multiplier: 1,
        quantBytes: 2
    });

    return new VmeetingStreamBackgroundEffect(bpModel, backgroundImageUrl);
}
