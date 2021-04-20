import {
    SET_BREAKOUT_ROOMS,
    SET_BREAKOUT_ROOM_TIME,
    CLOSE_ALL_BREAKOUT_ROOMS,
    OPEN_ALL_BREAKOUT_ROOMS,
} from './actionTypes';

export function setBreakoutRooms(rooms) {
    return {
        type: SET_BREAKOUT_ROOMS,
        rooms,
    };
}

export function setBreakoutRoomTime(time) {
    return {
        type: SET_BREAKOUT_ROOM_TIME,
        time,
    };
}

export function closeAllBreakoutRooms() {
    return {
        type: CLOSE_ALL_BREAKOUT_ROOMS
    };
}

export function openAllBreakoutRooms(time) {
    return {
        type: OPEN_ALL_BREAKOUT_ROOMS,
        time,
    };
}
