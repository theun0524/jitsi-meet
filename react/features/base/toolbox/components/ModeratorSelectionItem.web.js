// @flow

import React, { Component } from 'react';

import { translate } from '../../i18n';
import { connect } from '../../redux';

import { Icon } from '../../icons';
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

type State = {

    clicked: boolean
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
        disabled: false,
        initialSelected: false
    };

    constructor(props: Props) {
        super(props);
        this._onClick = this._onClick.bind(this);

        this.state = {
            clicked: this.props.initialSelected
        };
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
                <Avatar
                    participantId = { this.props.id }
                    size = { 24 } />
                { this._renderText() }
                {
                    elementAfter || null
                }
            </li>
        );
    }

    /**
     * Renders the text label to display in the {@code OverflowMenuItem}.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderText() {
        const textElement = (
            <span className = 'moderator-selection-menu-item-text'>
                { this.props.text }
            </span>
        );

        if (this.props.tooltip) {
            return (
                <Tooltip
                    content = { this.props.tooltip }
                    position = { this.props.tooltipPosition }>
                    { textElement }
                </Tooltip>
            );
        }

        return textElement;
    }

    _onClick() {
        //console.log(this.props);
        //const currentState = this.state.clicked;
        const { onClick, id } = this.props;

        onClick(id);

        //this.setState({clicked: !currentState});
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