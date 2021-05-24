// @flow
/* eslint-disable react/jsx-no-bind, no-return-assign */
import Spinner from '@atlaskit/spinner';
import axios from 'axios';
import { each } from 'lodash';
import React, { useState, useEffect } from 'react';
import { getAuthUrl } from '../../../api/url';

import { Dialog } from '../../base/dialog';
import { translate } from '../../base/i18n';
import { Icon, IconBlurBackground, IconCancelSelection } from '../../base/icons';
import { connect } from '../../base/redux';
import { Tooltip } from '../../base/tooltip';
import { toggleBackgroundEffect, setVirtualBackground, backgroundEnabled } from '../actions';
import logger from '../logger';

type Props = {
    _trackExist: Boolean,

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
function VirtualBackground({ _apiBase, _trackExist, _virtualSource, dispatch, t }: Props) {
    const [ data, setData ] = useState({ docs: [] });
    const [ loading, isloading ] = useState(false);
    const [ images, setImages ] = useState([]);

    /**
     * Loads images from server.
     */
    useEffect(() => {
        async function loadImage() {
            isloading(true);
            try {
                const resp = await axios.get(`${_apiBase}/backgrounds?pagination=false`);
                setData(resp.data);
                setImages([...resp.data.docs, ...images]);
                isloading(false);
            } catch {
                isloading(false);
            }
        }
        loadImage();
    }, []);

    const [ selected, setSelected ] = useState(_virtualSource || 'none');
    const enableBlur = async () => {
        setSelected('blur');
        await dispatch(setVirtualBackground('blur', false));
        if(_trackExist)
            await dispatch(toggleBackgroundEffect(true));
    };

    const removeBackground = async image => {
        if (image._id === selected) {
            const found = images.findIndex(item => item === image);
            const next = found > 0 ? images[found-1] : images[0];
    
            setImageBackground(next);
        }
        setImages(images.filter(item => image !== item));
        axios.delete(`${_apiBase}/backgrounds/${image._id}`);
    };

    const setImageBackground = async image => {
        setSelected(image._id);
        if (image._id === 'none') {
            dispatch(backgroundEnabled(false));
            await dispatch(setVirtualBackground('', false));
            if(_trackExist)
                await dispatch(toggleBackgroundEffect(false));
        } else {
            dispatch(backgroundEnabled(true));
            await dispatch(setVirtualBackground(image._id, true));
            if(_trackExist)
                await dispatch(toggleBackgroundEffect(true));
        }
    };

    const uploadImage = async imageFile => {
        const form = new FormData();

        isloading(true);
        each(imageFile, file => {
            form.append(file.name, file);
        });

        try {
            const resp = await axios.post(`${_apiBase}/backgrounds`, form);
            setImages(resp.data);
            await setImageBackground(resp.data[resp.data.length - 1]);
            isloading(false);
        } catch {
            isloading(false);
            logger.error('Failed to upload virtual image!');
        }
    };

    return (
        <Dialog
            hideCancelButton = { true }
            submitDisabled = { false }
            titleKey = { 'virtualBackground.title' }
            width = 'small'>
            <div>
                <div className = 'virtual-background-dialog'>
                    <Tooltip
                        content = { t('virtualBackground.removeBackground') }
                        position = { 'top' }>
                        <div
                            className = { selected === 'none' ? 'none-selected' : 'virtual-background-none' }
                            onClick = { () => setImageBackground({ _id: 'none' }) }>
                            <div>
                                {t('virtualBackground.none')}
                            </div>
                        </div>
                    </Tooltip>
                    <Tooltip
                        content = { t('virtualBackground.enableBlur') }
                        position = { 'top' }>
                        <Icon
                            className = { selected === 'blur' ? 'blur-selected' : '' }
                            onClick = { () => enableBlur() }
                            size = { 50 }
                            src = { IconBlurBackground } />
                    </Tooltip>
                    {images.map((image, index) => (
                        <div
                            key = { index }
                            className = { 'thumbnail-container' }>
                            <img
                                className = { selected === image._id ? 'thumbnail-selected' : 'thumbnail' }
                                onClick = { () => setImageBackground(image) }
                                onError = { event => event.target.style.display = 'none' }
                                src = { `${_apiBase}/backgrounds/${image._id}/ld` } />
                            { !image.isPublic && (
                                <Icon
                                    className = { 'delete-image-icon' }
                                    onClick = { () => removeBackground(image) }
                                    size = { 15 }
                                    src = { IconCancelSelection } />
                            )}
                        </div>
                    ))}
                    { loading ? (
                        <div className = { 'file-loading' }>
                            <Spinner
                                isCompleting = { false }
                                size = 'medium' />
                        </div>
                    ) : (
                        <Tooltip
                            content = { t('virtualBackground.uploadImage') }
                            position = { 'top' }>
                            <div className = 'file-upload-container'>
                                <label
                                    className = 'custom-file-upload'
                                    htmlFor = 'file-upload'>
                                    +
                                </label>
                                <input
                                    accept = 'image/*'
                                    className = 'file-upload-btn'
                                    id = 'file-upload'
                                    onChange = { e => uploadImage(e.target.files) }
                                    type = 'file' />
                            </div>
                        </Tooltip>
                    )}
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
        _trackExist: state['features/base/tracks'].length === 0? false : true,
        _virtualSource: state['features/virtual-background'].virtualSource
    };
}

export default translate(connect(_mapStateToProps)(VirtualBackground));
