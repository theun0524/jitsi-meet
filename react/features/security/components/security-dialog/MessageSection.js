// @flow

import React, { PureComponent } from 'react';

import { translate } from '../../../base/i18n';
import { connect } from '../../../base/redux';

type Props = {

    /**
     * The Redux Dispatch function.
     */
    dispatch: Function,

    /**
     * Function to be used to translate i18n labels.
     */
    t: Function
};

/**
 * Implements a security feature section to control lobby mode.
 */
class MessageSection extends PureComponent<Props, State> {
    /**
     * Instantiates a new component.
     *
     * @inheritdoc
     */
    constructor(props: Props) {
        super(props);
    }
    /**
     * Implements {@code PureComponent#render}.
     *
     * @inheritdoc
     */
    render() {
        const { t } = this.props;

        return (
            <>
                <div id = 'lobby-section'>
                    <p className = 'description'>
                        { t('security.dialogDescription') }
                    </p>
                </div>
                <div className = 'separator-line' />
            </>
        );
    }
}

export default translate(connect()(MessageSection));
