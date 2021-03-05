// @flow

import Button from '@atlaskit/button';
import Flag from '@atlaskit/flag';
import EditorInfoIcon from '@atlaskit/icon/glyph/editor/info';
import ErrorIcon from '@atlaskit/icon/glyph/error';
import WarningIcon from '@atlaskit/icon/glyph/warning';
import { colors } from '@atlaskit/theme';
import React from 'react';

import { translate } from '../../../base/i18n';
import { Icon, IconClose } from '../../../base/icons';
import { NOTIFICATION_TYPE } from '../../constants';
import AbstractNotification, {
    type Props
} from '../AbstractNotification';

import s from './Notification.module.scss';

declare var interfaceConfig: Object;

/**
 * Secondary colors for notification icons.
 *
 * @type {{error, info, normal, success, warning}}
 */
const ICON_COLOR = {
    error: colors.R400,
    info: colors.N500,
    normal: colors.N0,
    success: colors.G400,
    warning: colors.Y200
};

/**
 * Implements a React {@link Component} to display a notification.
 *
 * @extends Component
 */
class Notification extends AbstractNotification<Props> {
    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const {
            appearance,
            hideErrorSupportLink,
            isDismissAllowed,
            isNewStyle,
            onDismissed,
            t,
            title,
            titleArguments,
            titleKey,
            uid,
        } = this.props;

        return isNewStyle ? (
            <div className = { s.flagContainer }>
                <div className = { s.titleContainer }>
                    <div className = { s.iconContainer }>
                        { this._mapAppearanceToIcon('large') }
                    </div>
                    <h2>{ title || t(titleKey, titleArguments) }</h2>
                    <div
                        className = { s.close }
                        onClick = { this._onDismissed }>
                        <Icon size = { 20 } src = { IconClose } />
                    </div>
                </div>
                <div className = { s.contentContainer }>
                    <div className = { s.description }>
                        { this._renderDescription() }
                    </div>
                    <div className = { s.buttonContainer }>
                        { this._mapAppearanceToButtons(hideErrorSupportLink).map(b => (
                            <div className = { s.button } key = { b.content }>
                                <Button
                                    appearance = "subtle"
                                    onClick = { b.onClick }>
                                    { b.content }
                                </Button>
                            </div>
                        )) }
                    </div>
                </div>
            </div>
        ) : (
            <Flag
                actions = { this._mapAppearanceToButtons(hideErrorSupportLink) }
                appearance = { appearance }
                description = { this._renderDescription() }
                icon = { this._mapAppearanceToIcon() }
                id = { uid }
                isDismissAllowed = { isDismissAllowed }
                onDismissed = { onDismissed }
                testId = { titleKey }
                title = { title || t(titleKey, titleArguments) } />
        );
    }

    _getDescription: () => Array<string>

    _getDescriptionKey: () => string

    _onDismissed: () => void;

    /**
     * Creates a {@code ReactElement} for displaying the contents of the
     * notification.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderDescription() {
        const description = this._getDescription();

        // the id is used for testing the UI
        return (
            <div data-testid = { this._getDescriptionKey() } >
                { description }
            </div>
        );
    }

    /**
     * Opens the support page.
     *
     * @returns {void}
     * @private
     */
    _onOpenSupportLink() {
        window.open(interfaceConfig.SUPPORT_URL, '_blank', 'noopener');
    }

    /**
     * Creates action button configurations for the notification based on
     * notification appearance.
     *
     * @param {boolean} hideErrorSupportLink - Indicates if the support link
     * should be hidden in the error messages.
     * @private
     * @returns {Object[]}
     */
    _mapAppearanceToButtons(hideErrorSupportLink) {
        switch (this.props.appearance) {
        case NOTIFICATION_TYPE.ERROR: {
            const buttons = [
                {
                    content: this.props.t('dialog.dismiss'),
                    onClick: this._onDismissed
                }
            ];

            if (!hideErrorSupportLink) {
                buttons.push({
                    content: this.props.t('dialog.contactSupport'),
                    onClick: this._onOpenSupportLink
                });
            }

            return buttons;
        }
        case NOTIFICATION_TYPE.WARNING:
            return [
                {
                    content: this.props.t('dialog.Ok'),
                    onClick: this._onDismissed
                }
            ];

        default:
            if (this.props.customActionNameKey && this.props.customActionHandler) {
                return [
                    {
                        content: this.props.t(this.props.customActionNameKey),
                        onClick: () => {
                            if (this.props.customActionHandler()) {
                                this._onDismissed();
                            }
                        }
                    }
                ];
            }

            return [];
        }
    }

    /**
     * Creates an icon component depending on the configured notification
     * appearance.
     *
     * @private
     * @returns {ReactElement}
     */
    _mapAppearanceToIcon(iconSize = 'medium') {
        const appearance = this.props.appearance;
        const secIconColor = ICON_COLOR[this.props.appearance];

        switch (appearance) {
        case NOTIFICATION_TYPE.ERROR:
            return (
                <ErrorIcon
                    label = { appearance }
                    secondaryColor = { secIconColor }
                    size = { iconSize } />
            );

        case NOTIFICATION_TYPE.WARNING:
            return (
                <WarningIcon
                    label = { appearance }
                    secondaryColor = { secIconColor }
                    size = { iconSize } />
            );

        default:
            return (
                <EditorInfoIcon
                    label = { appearance }
                    secondaryColor = { secIconColor }
                    size = { iconSize } />
            );
        }
    }
}

export default translate(Notification);
