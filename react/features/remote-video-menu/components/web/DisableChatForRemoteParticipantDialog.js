// @flow

import React from 'react';

import { Dialog } from '../../../base/dialog';
import { translate } from '../../../base/i18n';
import { connect } from '../../../base/redux';
import AbstractDisableChatForRemoteParticipantDialog
    from '../AbstractDisableChatForRemoteParticipantDialog';

/**
 * Dialog to confirm a remote participant kick action.
 */
class DisableChatForRemoteParticipantDialog extends AbstractDisableChatForRemoteParticipantDialog {
    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        console.log("I am inside DisableChatForRemoteParticipantDialog");
        return (
            <Dialog
                okKey = 'dialog.disableChatButton'
                onSubmit = { this._onSubmit }
                titleKey = 'dialog.disableChatForParticipantTitle'
                width = 'small'>
                <div>
                    { this.props.t('dialog.disableChatForParticipantDialog') }
                </div>
            </Dialog>
        );
    }

    _onSubmit: () => boolean;
}

export default translate(connect()(DisableChatForRemoteParticipantDialog));
