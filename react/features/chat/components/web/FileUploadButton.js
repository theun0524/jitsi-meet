/* @flow */

import React, {Component} from 'react';

import { Icon, IconShareDoc } from '../../../base/icons';

declare var interfaceConfig: Object;

/**
 * Implements a React {@link Component} which displays a button for uploading a file in a chatroom
 *
 */
export class FileUploadButton extends Component {
    /**
     * Instantiates a new {@code Component}.
     *
     * @inheritdoc
     */
    constructor(props: Props) {
        super(props);
        this._handleClick = this._handleClick.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { visible } = this.props;

        if (!visible) {
            return null;
        }

        return (
            <div className = 'file-upload'>
                <div id='fileuploadarea'>
                    <Icon src = { IconShareDoc } onClick = { () => this.refs.fileInput.click() }/>
                    <input
                        type="file" 
                        ref= "fileInput"
                        onChange = {this._handleClick} 
                        style={{ display:'none' }} 
                    />
                </div>
            </div>
        );
    }

    _handleClick: (event) => void

    _handleClick(event) {
        console.log("Selected file is: ", event.target.files[0]);
        console.log("Should dispatch the event to vmapi");
    }
}
