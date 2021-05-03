// @flow

import React, { Component } from 'react';

import { Icon } from '../../icons';
import { Tooltip } from '../../tooltip';

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
     * A React Element to display at the end of {@code OverflowMenuItem}.
     */
    elementAfter?: React$Node,

    warning: boolean,

    /**
     * The callback to invoke when {@code OverflowMenuItem} is clicked.
     */
    onClick: Function,

    /**
     * The text to display in the {@code OverflowMenuItem}.
     */
    text: string,

    /**
     * The text to display in the tooltip.
     */
    tooltip?: string,

    /**
     * From which direction the tooltip should appear, relative to the button.
     */
    tooltipPosition: string
};

/**
 * A React {@code Component} for displaying a link to interact with other
 * features of the application.
 *
 * @extends Component
 */
class HangupMenuItem extends Component<Props> {
    /**
     * Default values for {@code OverflowMenuItem} component's properties.
     *
     * @static
     */
    static defaultProps = {
        tooltipPosition: 'left',
        warning: false,
        disabled: false
    };

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { accessibilityLabel, disabled, elementAfter, onClick } = this.props;

        let className = this.props.warning? 'hangup-menu-item-warning' : 'hangup-menu-item';
        className += this.props.disabled ? ' disabled' : '';
        

        return (
            <li
                aria-label = { accessibilityLabel }
                className = { className }
                onClick = { disabled ? null : onClick }>
                <div className = 'text'>
                    { this.props.text }
                </div>
                {
                    elementAfter || null
                }
            </li>
        );
    }
}

export default HangupMenuItem;
