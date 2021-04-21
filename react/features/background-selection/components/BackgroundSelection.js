// @flow

import AddIcon from '@atlaskit/icon/glyph/add';
import CrossCircleIcon from '@atlaskit/icon/glyph/cross-circle';
import Spinner from '@atlaskit/spinner';
import Tooltip from '@atlaskit/tooltip';
import { jitsiLocalStorage } from '@jitsi/js-utils';
import axios from 'axios';
import { each, reject } from 'lodash';
import React from 'react';

import AbstractDialogTab, {
    type Props as AbstractDialogTabProps
} from '../../base/dialog/components/web/AbstractDialogTab';
import { translate } from '../../base/i18n/functions';
import { Icon } from '../../base/icons';
import { connect } from '../../base/redux';
import { createLocalTrack } from '../../base/lib-jitsi-meet/functions';
import { createVirtualBackgroundEffect } from '../../stream-effects/virtual-background';
import logger from '../logger';
import { getAuthUrl } from '../../../api/url';

import { toggleBackgroundEffect, setVirtualBackground } from '../../virtual-background/actions';

import VideoInputPreview from './VideoInputPreview';
import s from './BackgroundSelection.module.scss';

const apiBase = process.env.VMEETING_API_BASE;

/**
 * The type of the React {@code Component} props of {@link BackgroundSelection}.
 */
export type Props = {
    ...$Exact<AbstractDialogTabProps>,

    /**
     * The logged in user information.
     */
    _user: Object,

    /**
     * The id of the video input device to preview.
     */
    selectedVideoInputId: string,

    _apiBase: string,

    _virtualSource: string,

    /**
     * Invoked to obtain translated strings.
     */
    t: Function
};

/**
 * The type of the React {@code Component} state of {@link BackgroundSelection}.
 */
type State = {

    /**
     * The JitsiTrack to use for previewing video input.
     */
    previewVideoTrack: ?Object,

    /**
     * The error message from trying to use a video input device.
     */
    previewVideoTrackError: ?string,

    selectd: String,
};

/**
 * React {@code Component} for previewing audio and video input/output devices.
 *
 * @extends Component
 */
class BackgroundSelection extends AbstractDialogTab<Props, State> {

    /**
     * Whether current component is mounted or not.
     *
     * In component did mount we start a Promise to create tracks and
     * set the tracks in the state, if we unmount the component in the meanwhile
     * tracks will be created and will never been disposed (dispose tracks is
     * in componentWillUnmount). When tracks are created and component is
     * unmounted we dispose the tracks.
     */
    _unMounted: boolean;

    /**
     * Initializes a new BackgroundSelection instance.
     *
     * @param {Object} props - The read-only React Component props with which
     * the new instance is to be initialized.
     */
    constructor(props: Props) {
        super(props);

        this.state = {
            backgrounds: [],
            previewVideoTrack: null,
            previewVideoTrackError: null,
            selected: props._user?.background ||
                jitsiLocalStorage.getItem('background') ||
                'none',
            loading: false,
        };
        this._unMounted = true;
        this._onSelect = this._onSelect.bind(this);
        this._onDeleteBackgroundImage = this._onDeleteBackgroundImage.bind(this);
        this._onUploadBackgroundImage = this._onUploadBackgroundImage.bind(this);
        this._triggerFileUpload = this._triggerFileUpload.bind(this);
        this.imageUploader = '';
    }

    /**
     * Generate the initial previews for video input.
     *
     * @inheritdoc
     */
    componentDidMount() {
        this._unMounted = false;
        this._createVideoInputTrack(this.props.selectedVideoInputId)
        .catch(err => logger.warn('Failed to initialize preview tracks', err))
        .then(() => this.props.mountCallback && this.props.mountCallback());

        this._loadBackgrounds()
        .then(resp => {
            console.log('backgrounds:', resp.data.docs);
            this.setState({ backgrounds: resp.data?.docs || [] });
            this._setBackgroundEffect(this.state.selected);
        });
    }

    /**
     * Ensure preview tracks are destroyed to prevent continued use.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        this._unMounted = true;
        this._disposeVideoInputPreview();
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        const { _user, t } = this.props;
        const { loading } = this.state;

        return (
            <div className = { s.backgroundSelection }>
                <div className = { `${s.column} ${s.video}` }>
                    <div className = { s.videoContainer }>
                        <VideoInputPreview
                            background = { this.state.selected }
                            error = { this.state.previewVideoTrackError }
                            track = { this.state.previewVideoTrack } />
                    </div>
                </div>
                <div className = { `${s.column} ${s.selectors} `}>
                    { _user && (
                        <div className = { s.toolbar }>
                            <div
                                className = { s.button }
                                onClick = { this._triggerFileUpload }>
                                <Tooltip
                                    content = { t('backgroundSelection.add') }
                                    position = 'top'>
                                    { !loading
                                    ? <AddIcon size = 'small' />
                                    : <Spinner size = 'small' /> }
                                </Tooltip>
                            </div>
                            <input
                                accept = 'image/*'
                                // multiple = { true }
                                name = 'image-uploader'
                                onChange = { this._onUploadBackgroundImage }
                                onClick = { this._onUploadClick }
                                ref = { el => this.imageUploader = el }
                                type = 'file' />
                        </div>
                    )}
                    <div className = { s.backgroundSelectors }>
                        { this._renderSelectors() }
                    </div>
                </div>
            </div>
        );
    }

    /**
     * Creates the JitiTrack for the video input preview.
     *
     * @param {string} deviceId - The id of video device to preview.
     * @private
     * @returns {void}
     */
    _createVideoInputTrack(deviceId) {
        return this._disposeVideoInputPreview()
            .then(() => createLocalTrack('video', deviceId))
            .then(jitsiLocalTrack => {
                console.log('jitsiLocalTrack:', jitsiLocalTrack);
                if (!jitsiLocalTrack) {
                    return Promise.reject();
                }

                if (this._unMounted) {
                    jitsiLocalTrack.dispose();

                    return;
                }

                this.setState({
                    previewVideoTrack: jitsiLocalTrack,
                    previewVideoTrackError: null
                });
            })
            .catch(() => {
                this.setState({
                    previewVideoTrack: null,
                    previewVideoTrackError:
                        this.props.t('backgroundSelection.previewUnavailable')
                });
            });
    }

    /**
     * Utility function for disposing the current video input preview.
     *
     * @private
     * @returns {Promise}
     */
    _disposeVideoInputPreview(): Promise<*> {
        if (this.state.previewVideoTrack) {
            this.state.previewVideoTrack.setEffect(undefined);
            return this.state.previewVideoTrack.dispose();
        }

        return Promise.resolve();
    }

    /**
     * Load the backgrounds for me.
     *
     * @private
     * @returns {Promise}
     */
    _loadBackgrounds() {
        return axios.get(`${apiBase}/backgrounds`, { withCredentials: true });
    }

    /**
     * Creates a BackgroundSelector instance based on the passed in configuration.
     *
     * @private
     * @param {Object} backgroundSelectorProps - The props for the BackgroundSelector.
     * @returns {ReactElement}
     */
    _renderSelector(props) {
        const { _id, isPublic } = props;
        const { selected } = this.state;
        const { t } = this.props;

        return (
            <div
                key = { _id }
                id = { _id }
                className = { `${s.backgroundSelector} ${ selected === _id ? s.selected : '' }` }
                onClick = { this._onSelect }>
                { _id === 'none'
                ? <span>{this.props.t('backgroundSelection.none')}</span>
                : <img src = { `${apiBase}/backgrounds/${_id}/ld` } /> }
                { !isPublic && (
                    <div
                        className = { `${s.button} ${s.close}` }
                        onClick = { this._onDeleteBackgroundImage }>
                        <Tooltip
                            content = { t('backgroundSelection.delete') }
                            position = 'top'>
                            <Icon src = { CrossCircleIcon } />
                        </Tooltip>
                    </div>
                )}
            </div>
        );
    }

    /**
     * Creates BackgroundSelector instances for video output
     *
     * @private
     * @returns {Array<ReactElement>} BackgroundSelector instances.
     */
    _renderSelectors() {
        const { backgrounds } = this.state;
        return [{ _id: 'none', isPublic: true }, ...backgrounds].map(item => this._renderSelector(item));
    }

    _onDeleteBackgroundImage: (Object) => void;

    /**
     * Called to delete a background image.
     * 
     * @param {Object} event - Event from deleting a image.
     * @private
     * @returns {void}
     */
    _onDeleteBackgroundImage(event) {
        event.stopPropagation();

        try {
            const id = event.currentTarget.parentElement.id;

            this.setState({ loading: true });
            if (this.state.selected === id) {
                this.setState({ selected: 'none' });
                super._onChange({ selectedBackgroundId: '' });
                this._setBackgroundEffect('none');
            }

            axios.delete(`${apiBase}/backgrounds/${id}`)
            .then(resp => {
                this.setState({
                    backgrounds: reject(this.state.backgrounds, { _id: id }),
                    loading: false,
                });
            });
        } catch (err) {
            console.error(err);
            this.setState({ loading: false });
        }
    }

    _onSelect: (Object) => void;

    /**
     * Invokes the passed in callback to notify of selection changes.
     *
     * @param {Object} selection - Event from selecting image.
     * @private
     * @returns {void}
     */
    _onSelect(event) {
        const id = event.currentTarget.id;

        if (this.state.selected !== id) {
            // this.setState({ selected: id });
            super._onChange({ selectedBackgroundId: id === 'none' ? '' : id });

            this._setBackgroundEffect(id);
        }
    }

    _onUploadBackgroundImage: (Object) => void;

    /**
     * Called to add a background image.
     * 
     * @param {Object} event - Event from change input file element.
     * @private
     * @returns {void}
     */
    _onUploadBackgroundImage(event) {
        try {
            const { files } = event.target;
            const form = new FormData();
    
            this.setState({ loading: true });
            each(files, file => {
                form.append(file.name, file);
            });
            axios.post(`${apiBase}/backgrounds`, form)
            .then(resp => {
                console.log('onUploadBackgroundImage:', resp.data);
                this.setState({
                    backgrounds: resp.data,
                    loading: false,
                });
            });
        } catch (err) {
            console.error(err);
            this.setState({ loading: false });
        }
    }

    _onUploadClick: (Object) => void;

    /**
     * Called to click input file element.
     */
    _onUploadClick(event) {
        event.target.value = null;
    }

    _triggerFileUpload: () => void;

    /**
     * Called to open file selection
     */
    _triggerFileUpload() {
        this.imageUploader.click();
    }

    async _createBackgroundEffect(virtualBackground, apiBase) {
        const effect = await createVirtualBackgroundEffect({...virtualBackground, apiBase});

        return effect;
    }

    async _setBackgroundEffect(id) {
        if (id === 'none') {
            this.state.previewVideoTrack.setEffect(undefined);
            this.setState({ selected: id });
            await this.props.dispatch(setVirtualBackground('', false));
        } else {
            await this.props.dispatch(setVirtualBackground(id, true));

            const virtualBackground = this.props._virtualBackground;

            this._createBackgroundEffect(virtualBackground, this.props._apiBase)
            .then(effect => {
                console.log('effect:', effect);
                return this.state.previewVideoTrack.setEffect(effect);
            })
            .then(() => {
                this.setState({ selected: id });
            });
        }
    }
}

function _mapStateToProps(state) {
    return {
        _apiBase: getAuthUrl(state),
        _virtualBackground: state['features/virtual-background']
    };
}

export default translate(connect(_mapStateToProps)(BackgroundSelection));