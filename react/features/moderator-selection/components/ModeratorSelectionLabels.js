/* @flow */

import React, { Component } from 'react';

import { translate } from '../../base/i18n';

import s from './ModeratorSelectionItem.module.scss';

/**
 * The type of the React {@code Component} props of {@link ModeratorSelectionLabels}.
 */
type Props = {

    /**
     * The function to translate human-readable text.
     */
    t: Function,
};

/**
 * React component for labeling speaker stats column items.
 *
 * @extends Component
 */
class ModeratorSelectionLabels extends Component<Props> {
    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { t } = this.props;

        return (
            <div className = 'moderator-selection-item__labels'>
                <div className = { `moderator-selection-item__name ${s.nameContainer}` }>
                    { t('moderatorSelection.name') }
                </div>
                <div className = { `moderator-selection-item__email ${s.emailContainer}` }>
                    { t('moderatorSelection.email') }
                </div>
            </div>
        );
    }
}

export default translate(ModeratorSelectionLabels);
