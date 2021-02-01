// @flow

import React from 'react';

import { Dialog } from '../../../base/dialog';
import { translate } from '../../../base/i18n';
import { connect } from '../../../base/redux';
import AbstractEnableChatForRemoteParticipantDialog
    from '../AbstractEnableChatForRemoteParticipantDialog';

/**
 * Dialog to confirm a remote participant kick action.
 */
class EnableChatForRemoteParticipantDialog extends AbstractEnableChatForRemoteParticipantDialog {
    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <Dialog
                okKey = 'dialog.enableChatButton'
                onSubmit = { this._onSubmit }
                titleKey = 'dialog.enableChatForParticipantTitle'
                width = 'small'>
                <div>
                    { this.props.t('dialog.enableChatForParticipantDialog') }
                </div>
            </Dialog>
        );
    }

    _onSubmit: () => boolean;
}

export default translate(connect()(EnableChatForRemoteParticipantDialog));
