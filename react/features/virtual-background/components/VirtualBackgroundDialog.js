// @flow
/* eslint-disable react/jsx-no-bind, no-return-assign */
import Spinner from '@atlaskit/spinner';
import axios from 'axios';
import { each } from 'lodash';
import React, { useState, useEffect } from 'react';
import { getAuthUrl } from '../../../api/url';

import { Dialog, hideDialog } from '../../base/dialog';
import { translate } from '../../base/i18n';
import { Icon, IconCancelSelection, IconPlusCircle, IconShareDesktop } from '../../base/icons';
import { createLocalTrack } from '../../base/lib-jitsi-meet/functions';
import { VIDEO_TYPE } from '../../base/media';
import { connect } from '../../base/redux';
import { getLocalVideoTrack } from '../../base/tracks';
import { showErrorNotification } from '../../notifications';
import { toggleBackgroundEffect } from '../actions';
import { VIRTUAL_BACKGROUND_TYPE } from '../constants';
import { getRemoteImageUrl, toDataURL } from '../functions';
import logger from '../logger';

import VirtualBackgroundPreview from './VirtualBackgroundPreview';

const images = [
    {
        id: '1',
        src: 'images/virtual-background/background-1.jpg'
    },
    {
        id: '2',
        src: 'images/virtual-background/background-2.jpg'
    },
    {
        id: '3',
        src: 'images/virtual-background/background-3.jpg'
    },
    {
        id: '4',
        src: 'images/virtual-background/background-4.jpg'
    },
    {
        id: '5',
        src: 'images/virtual-background/background-5.jpg'
    },
    {
        id: '6',
        src: 'images/virtual-background/background-6.jpg'
    },
    {
        id: '7',
        src: 'images/virtual-background/background-7.jpg'
    }
];
type Props = {

    /**
     * Returns the jitsi track that will have backgraund effect applied.
     */
    _jitsiTrack: Object,

    /**
     * Returns the selected thumbnail identifier.
     */
    _selectedThumbnail: string,

    /**
     * Returns the selected virtual source object.
     */
    _virtualSource: Object,

    /**
     * The redux {@code dispatch} function.
     */
    dispatch: Function,

    /**
     * Invoked to obtain translated strings.
     */
    t: Function
};

/**
 * Renders virtual background dialog.
 *
 * @returns {ReactElement}
 */
function VirtualBackground({ _apiBase, _jitsiTrack, _selectedThumbnail, _virtualSource, dispatch, t }: Props) {
    const [ options, setOptions ] = useState({});
    const [ remoteImages, setRemoteImages ] = useState([]);
    const [ loading, isloading ] = useState(false);
    const [ activeDesktopVideo ] = useState(_virtualSource?.videoType === VIDEO_TYPE.DESKTOP ? _virtualSource : null);

    /**
     * Loads images from server.
     */
    useEffect(() => {
        async function loadRemoteImages() {
            isloading(true);
            try {
                const resp = await axios.get(`${_apiBase}/backgrounds?pagination=false`);
                setRemoteImages([...resp.data.docs, ...remoteImages]);
                isloading(false);
            } catch {
                isloading(false);
            }
        }

        loadRemoteImages();
    }, []);

    const enableBlur = async (blurValue, selection) => {
        setOptions({
            backgroundType: VIRTUAL_BACKGROUND_TYPE.BLUR,
            enabled: true,
            blurValue,
            selectedThumbnail: selection
        });
    };

    const removeBackground = async image => {
        if (!image || image._id === _selectedThumbnail) {
            setOptions({
                enabled: false,
                selectedThumbnail: 'none'
            });
        }
        if (image) {
            setRemoteImages(remoteImages.filter(item => image !== item));
            axios.delete(`${_apiBase}/backgrounds/${image._id}`);
        }
    };

    const shareDesktop = async selection => {
        const url = await createLocalTrack('desktop', '');

        if (!url) {
            dispatch(showErrorNotification({
                titleKey: 'virtualBackground.desktopShareError'
            }));
            logger.error('Could not create desktop share as a virtual background!');

            return;
        }
        setOptions({
            backgroundType: VIRTUAL_BACKGROUND_TYPE.DESKTOP_SHARE,
            enabled: true,
            selectedThumbnail: selection,
            url
        });
    };

    const setUploadedImageBackground = image => {
        setOptions({
            backgroundType: VIRTUAL_BACKGROUND_TYPE.IMAGE,
            enabled: true,
            url: getRemoteImageUrl(image),
            selectedThumbnail: image._id
        });
    };

    const setImageBackground = async image => {
        const url = await toDataURL(image.src);

        setOptions({
            backgroundType: VIRTUAL_BACKGROUND_TYPE.IMAGE,
            enabled: true,
            url,
            selectedThumbnail: image._id
        });
    };

    const uploadImage = async imageFile => {
        const form = new FormData();

        isloading(true);
        form.append(imageFile[0].name, imageFile[0]);

        try {
            const resp = await axios.post(`${_apiBase}/backgrounds`, form);
            const image = resp.data[resp.data.length - 1];
            setRemoteImages([
                ...remoteImages,
                image
            ]);
            setOptions({
                backgroundType: VIRTUAL_BACKGROUND_TYPE.IMAGE,
                enabled: true,
                url: getRemoteImageUrl(image, 'hd'),
                selectedThumbnail: image._id
            });
            isloading(false);
        } catch {
            isloading(false);
            logger.error('Failed to upload virtual image!');
        }
    };

    const applyVirtualBackground = async () => {
        if (activeDesktopVideo) {
            await activeDesktopVideo.dispose();
        }
        isloading(true);
        await dispatch(toggleBackgroundEffect(options, _jitsiTrack));
        await isloading(false);
        dispatch(hideDialog());
    };

    return (
        <Dialog
            hideCancelButton = { false }
            okKey = { 'virtualBackground.apply' }
            onSubmit = { applyVirtualBackground }
            submitDisabled = { !options || loading }
            titleKey = { 'virtualBackground.title' } >
            <VirtualBackgroundPreview options = { options } />
            <div>
                {loading ? (
                    <div className = 'virtual-background-loading'>
                        <Spinner
                            isCompleting = { false }
                            size = 'small' />
                    </div>
                ) : (
                    <label
                        className = 'file-upload-label'
                        htmlFor = 'file-upload'>
                        <Icon
                            className = { 'add-background' }
                            size = { 20 }
                            src = { IconPlusCircle } />
                        {t('virtualBackground.addBackground')}
                    </label>
                )}
                <input
                    accept = 'image/*'
                    className = 'file-upload-btn'
                    id = 'file-upload'
                    onChange = { e => uploadImage(e.target.files) }
                    type = 'file' />
                <div className = 'virtual-background-dialog'>
                    <div
                        className = { _selectedThumbnail === 'none' ? 'none-selected' : 'virtual-background-none' }
                        onClick = { () => removeBackground() }>
                        {t('virtualBackground.none')}
                    </div>
                    <div
                        className = { _selectedThumbnail === 'slight-blur'
                            ? 'slight-blur-selected' : 'slight-blur' }
                        onClick = { () => enableBlur(8, 'slight-blur') }>
                        {t('virtualBackground.slightBlur')}
                    </div>
                    <div
                        className = { _selectedThumbnail === 'blur' ? 'blur-selected' : 'blur' }
                        onClick = { () => enableBlur(25, 'blur') }>
                        {t('virtualBackground.blur')}
                    </div>
                    <div
                        className = { _selectedThumbnail === 'desktop-share'
                            ? 'desktop-share-selected'
                            : 'desktop-share' }
                        onClick = { () => shareDesktop('desktop-share') }>
                        <Icon
                            className = 'share-desktop-icon'
                            size = { 30 }
                            src = { IconShareDesktop } />
                    </div>
                    {images.map((image, index) => (
                        <img
                            className = {
                                options.selectedThumbnail === image.id || _selectedThumbnail === image.id
                                    ? 'thumbnail-selected'
                                    : 'thumbnail'
                            }
                            key = { index }
                            onClick = { () => setImageBackground(image) }
                            onError = { event => event.target.style.display = 'none' }
                            src = { image.src } />
                    ))}
                    {remoteImages.map((image, index) => (
                        <div
                            className = { 'thumbnail-container' }
                            key = { index }>
                            <img
                                className = { _selectedThumbnail === image._id ? 'thumbnail-selected' : 'thumbnail' }
                                onClick = { () => setUploadedImageBackground(image) }
                                onError = { event => event.target.style.display = 'none' }
                                src = { getRemoteImageUrl(image, 'ld') } />
                            { !image.isPublic && (
                                <Icon
                                    className = { 'delete-image-icon' }
                                    onClick = { () => removeBackground(image) }
                                    size = { 15 }
                                    src = { IconCancelSelection } />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </Dialog>
    );
}

/**
 * Maps (parts of) the Redux state to the associated props for the
 * {@code VirtualBackgroundDialog} component.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function _mapStateToProps(state) {
    return {
        _apiBase: getAuthUrl(state),
        _jitsiTrack: getLocalVideoTrack(state['features/base/tracks'])?.jitsiTrack,
        _selectedThumbnail: state['features/virtual-background'].selectedThumbnail || 'none',
        _virtualSource: state['features/virtual-background'].virtualSource
    };
}

export default translate(connect(_mapStateToProps)(VirtualBackground));
