// @flow

import type { Dispatch } from 'redux';

import { createToolbarEvent, sendAnalytics } from '../../analytics';
import { translate } from '../../base/i18n';
import { IconShareDoc } from '../../base/icons';
import { isLocalParticipantModerator } from '../../base/participants';
import { connect } from '../../base/redux';
import { AbstractButton, type AbstractButtonProps } from '../../base/toolbox';
import { toggleDocument } from '../actions';


type Props = AbstractButtonProps & {

    /**
     * Whether the shared document is being edited or not.
     */
    _editing: boolean,

    /**
     * Redux dispatch function.
     */
    dispatch: Dispatch<any>,
};

/**
 * Implements an {@link AbstractButton} to open the chat screen on mobile.
 */
class SharedDocumentButton extends AbstractButton<Props, *> {
    accessibilityLabel = 'toolbar.accessibilityLabel.toggleWhiteboard';
    icon = IconShareDoc;
    label = 'toolbar.whiteboardOpen';
    toggledLabel = 'toolbar.whiteboardClose';

    /**
     * Handles clicking / pressing the button, and opens / closes the appropriate dialog.
     *
     * @private
     * @returns {void}
     */
    _handleClick() {
        sendAnalytics(createToolbarEvent(
            'toggle.etherpad',
            {
                enable: !this.props._editing
            }));
        this.props.dispatch(toggleDocument());
    }

    /**
     * Indicates whether this button is in toggled state or not.
     *
     * @override
     * @protected
     * @returns {boolean}
     */
    _isToggled() {
        return this.props._editing;
    }
}

/**
 * Maps part of the redux state to the component's props.
 *
 * @param {Object} state - The redux store/state.
 * @param {Object} ownProps - The properties explicitly passed to the component
 * instance.
 * @returns {Object}
 */
function _mapStateToProps(state: Object, ownProps: Object) {
    const { documentUrl, editing } = state['features/etherpad'];
    let { visible } = ownProps;
    const isModerator = isLocalParticipantModerator(state);

    if (typeof visible === 'undefined') {
        visible = isModerator && Boolean(documentUrl);
    }

    return {
        _editing: editing,
        visible
    };
}

export default translate(connect(_mapStateToProps)(SharedDocumentButton));
