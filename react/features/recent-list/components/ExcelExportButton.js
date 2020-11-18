// @flow

import ExcelSpreadsheet24Icon from '@atlaskit/icon-file-type/glyph/excel-spreadsheet/24';
import Spinner from '@atlaskit/spinner';
import Tooltip from '@atlaskit/tooltip';
import axios from 'axios';
import Moment from 'moment'
import * as FileSaver from 'file-saver';
import { map } from 'lodash';
import React, { Component } from 'react';
import * as XLSX from 'xlsx';

import { translate } from '../../base/i18n';
import { connect } from '../../base/redux';

/**
 * The type of the React {@code Component} props of {@link AddMeetingUrlButton}.
 */
type Props = {

    /**
     * The room name to export participant stats.
     */
    room: string,

    /**
     * Invoked to obtain translated strings.
     */
    t: Function
};

/**
 * A React Component for adding a meeting URL to an existing calendar event.
 *
 * @extends Component
 */
class ExcelExportButton extends Component<Props> {
    /**
     * Initializes a new {@code AddMeetingUrlButton} instance.
     *
     * @inheritdoc
     */
    constructor(props: Props) {
        super(props);

        // Bind event handler so it is only bound once for every instance.
        this._onClick = this._onClick.bind(this);
        this.state = {
            exporting: false,
        };
    }

    /**
     * Implements React's {@link Component#render}.
     *
     * @inheritdoc
     */
    render() {
        return (
            <Tooltip content = { this.props.t('welcomepage.downloadToExcel') }>
                <div
                    className = 'button add-button'
                    onClick = { this._onClick }>
                    { this.state.exporting ? <Spinner /> : <ExcelSpreadsheet24Icon /> }
                </div>
            </Tooltip>
        );
    }

    _onClick: () => void;

    /**
     * Dispatches an action to adding a meeting URL to a calendar event.
     *
     * @returns {void}
     */
    _onClick(evt) {
        const { room } = this.props;

        evt.preventDefault();
        evt.stopPropagation();

        console.log('download to excel:', room);
        this.setState({ exporting: true });
        makeExportData(room).then(data => {
            exportExcel(data);
            this.setState({ exporting: false });
        });
    }
}

const exportExcel = ({ room, csvData }) => {
    if (csvData.length === 0) {
        return;
    }

    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileName = `${room}_stats_export_${Moment().format()}.xlsx`;

    console.log('Prepare exporting...');

    const ws = XLSX.utils.json_to_sheet(csvData);
    const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data_ex = new Blob([excelBuffer], {type: fileType});

    FileSaver.saveAs(data_ex, fileName);
};

async function makeExportData(room) {
    const resp = await axios.get(`/auth/api/participants/?room__exact=${room}&limit=1`);

    Moment.locale('ko');
    const csvData = map(resp.data.docs[0].stats, doc => ({
        name: doc.name,
        email: doc.email, 
        joinTime: Moment.unix(doc.joinTime).format('lll'),
        leaveTime: Moment.unix(doc.leaveTime).format('lll'),
    }));

    return { room, csvData };
}

export default translate(connect()(ExcelExportButton));
