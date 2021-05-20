// @flow

import React, { Component } from 'react';

import { Icon, IconCaretDown, IconCaretLeft, IconCaretRight, IconCaretUp } from '../../base/icons';
import { getCurrentLayout, LAYOUTS } from '../../video-layout';

/**
 * A container to hold video status labels, including recording status and
 * current large video quality.
 *
 * @extends Component
 */
export default class AbstractPageButton extends Component {
    /**
     * Renders the {@code E2EELabel}.
     *
     * @protected
     * @returns {React$Element}
     */
    render() {
        const { _current, _layout, _totalPages } = this.props;
        let className = 'page-button';
        let icon;

        if (_totalPages === 1) {
            return null;
        }

        className += ` ${this.className || ''}`;
        if (this.state.disabled) {
            className += ' disabled';
        }
        if (_layout === LAYOUTS.TILE_VIEW) {
            icon = this.className === 'prev' ? IconCaretLeft : IconCaretRight;
            className += ' column';
        } else {
            icon = this.className === 'prev' ? IconCaretUp : IconCaretDown;
            className += ' row';
        }

        return (
            <div
                className={className}
                onClick={this.onChangePage}>
                <Icon size={20} src={icon} />
                {_current}/{_totalPages}
            </div>
        );
    }
}

/**
 * Maps (parts of) the redux state to the associated props of the {@link AbstractPageButton}
 * {@code Component}.
 *
 * @param {Object} state - The redux state.
 * @private
 * @returns {{
 *     _current: number,
 *     _totalPages: number
 * }}
 */
export function _abstractMapStateToProps(state: Object) {
    return {
        _layout: getCurrentLayout(state),
        _totalPages: state['features/video-layout'].pageInfo?.totalPages || 1,
        _current: state['features/video-layout'].pageInfo?.current || 1,
    };
}
