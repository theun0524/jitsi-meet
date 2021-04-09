import { ENABLE_BREAKOUT_ROOM } from "./actionTypes";

export function enableBreakoutRoom(enabled: boolean = false) {
    return {
        type: ENABLE_BREAKOUT_ROOM,
        enabled,
    };
}
