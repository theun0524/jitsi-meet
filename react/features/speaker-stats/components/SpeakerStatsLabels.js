/* @flow */

import React, { Component } from 'react';

import { translate } from '../../base/i18n';

import Tooltip from '@atlaskit/tooltip';
import RefreshIcon from '@atlaskit/icon/glyph/refresh';

/**
 * The type of the React {@code Component} props of {@link SpeakerStatsLabels}.
 */
type Props = {

    /**
     * The function to translate human-readable text.
     */
    t: Function,

    /**
     * Handler for refresh.
     */
    onRefresh?: Function
};

/**
 * React component for labeling speaker stats column items.
 *
 * @extends Component
 */
class SpeakerStatsLabels extends Component<Props> {
    _onRefresh: () => Function;

    /**
     * Returns a function that is used on the onDelete callback.
     *
     * @param {Object} item - The item to be deleted.
     * @private
     * @returns {Function}
     */
    _onRefresh() {
        const { onRefresh } = this.props;

        return evt => {
            evt.stopPropagation();

            onRefresh && onRefresh();
        };
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { t } = this.props;

        return (
            <div className = 'speaker-stats-item__labels'>
                <div className = 'speaker-stats-item__refresh'>
                    <Tooltip content = {t('speakerStats.refresh')}>
                        <div
                            className = 'refresh-stats'
                            onClick = { this._onRefresh() }>
                                <RefreshIcon size="small" />
                        </div>
                    </Tooltip>
                </div>
                <div className = 'speaker-stats-item__name'>
                    { t('speakerStats.name') }
                </div>
                <div className = 'speaker-stats-item__time'>
                    { t('speakerStats.speakerTime') }
                </div>
                <div className = 'speaker-stats-item__s_time'>
                    { t('speakerStats.joinTime') }
                </div>
                <div className = 'speaker-stats-item__l_time'>
                    { t('speakerStats.leaveTime') }
                </div>
            </div>
        );
    }
}

export default translate(SpeakerStatsLabels);
