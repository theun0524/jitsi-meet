// @flow

import React, { Component } from 'react';

import { renderConferenceTimer } from '../';
import { getConferenceTimestamp, getConferenceTimeRemained } from '../../base/conference/functions';
import { getLocalizedDurationFormatter, translate } from '../../base/i18n';
import { connect } from '../../base/redux';

import s from './ConferenceTimer.module.scss';

/**
 * The type of the React {@code Component} props of {@link ConferenceTimer}.
 */
type Props = {

    /**
     * The UTC timestamp representing the time when first participant joined.
     */
    _startTimestamp: ?number,

    /**
     * Style to be applied to the rendered text.
     */
    textStyle: ?Object,

    /**
     * The redux {@code dispatch} function.
     */
    dispatch: Function
};

/**
 * The type of the React {@code Component} state of {@link ConferenceTimer}.
 */
type State = {

    /**
     * Value of current conference time.
     */
    timerValue: string
};

/**
 * ConferenceTimer react component.
 *
 * @class ConferenceTimer
 * @extends Component
 */
class ConferenceTimer extends Component<Props, State> {

    /**
     * Handle for setInterval timer.
     */
    _interval;

    _timeRemained;

    /**
     * Initializes a new {@code ConferenceTimer} instance.
     *
     * @param {Props} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: Props) {
        super(props);

        this.state = {
            timerValue: getLocalizedDurationFormatter(0)
        };
    }

    /**
     * Starts the conference timer when component will be
     * mounted.
     *
     * @inheritdoc
     */
    componentDidMount() {
        this._startTimer();
    }

    /**
     * Stops the conference timer when component will be
     * unmounted.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        this._stopTimer();
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps._timeRemained !== this.props._timeRemained) {
            this._stopTimer();
            this._startTimer();
        }
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { timerValue } = this.state;
        const { _startTimestamp, _timeRemained, t, textStyle } = this.props;

        if (!_startTimestamp && !_timeRemained) {
            return null;
        }

        if (_timeRemained) {
            return (
                <div className = { s.timeRemainedContainer }>
                    { t('dialog.conferenceTimeRemaining', {
                        seconds: getLocalizedDurationFormatter(timerValue * 1000)
                    }) }
                </div>
            )
        }

        return renderConferenceTimer(timerValue, textStyle);
    }

    /**
     * Sets the current state values that will be used to render the timer.
     *
     * @param {number} refValueUTC - The initial UTC timestamp value.
     * @param {number} currentValueUTC - The current UTC timestamp value.
     *
     * @returns {void}
     */
    _setStateFromUTC(refValueUTC, currentValueUTC) {
        if (!refValueUTC || !currentValueUTC) {
            return;
        }

        if (currentValueUTC < refValueUTC) {
            return;
        }

        const timerMsValue = currentValueUTC - refValueUTC;

        const localizedTime = getLocalizedDurationFormatter(timerMsValue);

        this.setState({
            timerValue: localizedTime
        });
    }

    _setStateTimeRemained(value) {
        if (!value) {
            return;
        }

        this.setState({ timerValue: value });
    }

    /**
     * Start conference timer.
     *
     * @returns {void}
     */
    _startTimer() {
        if (!this._interval) {
            if (!this.props._timeRemained) {
                this._setStateFromUTC(this.props._startTimestamp, (new Date()).getTime());

                this._interval = setInterval(() => {
                    this._setStateFromUTC(this.props._startTimestamp, (new Date()).getTime());
                }, 1000);
            } else {
                this._setStateTimeRemained(this.props._timeRemained);
                this._interval = setInterval(() => {
                    this._setStateTimeRemained(this.state.timerValue - 1);
                }, 1000);
            }
        }
    }

    /**
     * Stop conference timer.
     *
     * @returns {void}
     */
    _stopTimer() {
        if (this._interval) {
            clearInterval(this._interval);
            this._interval = null;
        }

        this.setState({
            timerValue: getLocalizedDurationFormatter(0)
        });
    }
}

/**
 * Maps (parts of) the Redux state to the associated
 * {@code ConferenceTimer}'s props.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {{
 *      _startTimestamp: number
 * }}
 */
export function _mapStateToProps(state: Object) {

    return {
        _startTimestamp: getConferenceTimestamp(state),
        _timeRemained: getConferenceTimeRemained(state)
    };
}

export default translate(connect(_mapStateToProps)(ConferenceTimer));
