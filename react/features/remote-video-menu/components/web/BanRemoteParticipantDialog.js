// @flow

import React from 'react';

import { Dialog } from '../../../base/dialog';
import { translate } from '../../../base/i18n';
import { connect } from '../../../base/redux';
import AbstractBanRemoteParticipantDialog
    from '../AbstractBanRemoteParticipantDialog';

/**
 * Dialog to confirm a remote participant kick action.
 */
class BanRemoteParticipantDialog extends AbstractBanRemoteParticipantDialog {
    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <Dialog
                okKey = 'dialog.banButton'
                onSubmit = { this._onSubmit }
                titleKey = 'dialog.banParticipantTitle'
                width = 'small'>
                <div>
                    { this.props.t('dialog.banParticipantDialog') }
                </div>
            </Dialog>
        );
    }

    _onSubmit: () => boolean;
}

export default translate(connect()(BanRemoteParticipantDialog));
