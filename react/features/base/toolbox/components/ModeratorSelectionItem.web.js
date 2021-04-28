// @flow

import React, { Component } from 'react';

import { translate } from '../../i18n';
import { connect } from '../../redux';

import { Icon, IconCheck } from '../../icons';
import { Tooltip } from '../../tooltip';
import { Avatar } from '../../avatar';

/**
 * The type of the React {@code Component} props of {@link OverflowMenuItem}.
 */
type Props = {

    /**
     * A succinct description of what the item does. Used by accessibility tools
     * and torture tests.
     */
    accessibilityLabel: string,

    /**
     * Whether menu item is disabled or not.
     */
    disabled: boolean,

    /**
     * A React Element to display at the end of {@code ModeratorSelectionItem}.
     */
    elementAfter?: React$Node,

    warning: boolean,

    initialSelected: boolean,

    /**
     * The callback to invoke when {@code ModeratorSelectionItem} is clicked.
     */
    onClick: Function,

    /**
     * The text to display in the {@code ModeratorSelectionItem}.
     */
    text: string,

    /**
     * The text to display in the tooltip.
     */
    tooltip?: string,

    /**
     * From which direction the tooltip should appear, relative to the button.
     */
    tooltipPosition: string,

    _selectedModerator: string
};

/**
 * A React {@code Component} for displaying a link to interact with other
 * features of the application.
 *
 * @extends Component
 */
class ModeratorSelectionItem extends Component<Props, State> {
    /**
     * Default values for {@code ModeratorSelectionItem} component's properties.
     *
     * @static
     */
    static defaultProps = {
        tooltipPosition: 'left',
        warning: false,
        disabled: false
    };

    constructor(props: Props) {
        super(props);
        this._onClick = this._onClick.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { accessibilityLabel, disabled, elementAfter } = this.props;

        let clicked = this.props.id === this.props._selectedModerator ? true : false;

        let className = clicked? 'moderator-selection-menu-item-selected' : 'moderator-selection-menu-item';
        className += this.props.disabled ? ' disabled' : '';

        return (
            <li
                aria-label = { accessibilityLabel }
                className = { className }
                onClick = { disabled ? null : this._onClick }>
                <div className = 'avatar'>
                    <Avatar
                        participantId = { this.props.id }
                        size = { 24 } />
                </div>
                <div className = 'text'>
                    { this.props.text }
                </div>
                <div className = 'icon'>
                {
                    clicked? <Icon src = { IconCheck } /> : null
                }
                </div>
                {
                    elementAfter || null
                }
            </li>
        );
    }

    _onClick() {
        const { onClick, id } = this.props;

        onClick(id);
    }
}

//export default ModeratorSelectionItem;

function _mapStateToProps(state) {
    const {
        selectedModerator,
    } = state['features/toolbox'];

    return {
        _selectedModerator: selectedModerator
    };
}

export default translate(connect(_mapStateToProps)(ModeratorSelectionItem));