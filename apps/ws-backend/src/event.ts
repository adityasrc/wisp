
export const CLIENT_EVENTS = {
    MESSAGE_SEND: "message:send",
    MESSAGE_EDIT: "message:edit",
    REQUEST_SEND: "request:send",
    REQUEST_RESPOND: "request:respond"

} as const;

export const SERVER_EVENTS = {
    MESSAGE_NEW: "message:new",
    MESSAGE_EDITED: "message:edited",
    MESSAGE_EXPIRED: "message:expired",
    REQUEST_RECEIVED: "request:received",
    REQUEST_ACCEPTED: "request:accepted",
    REQUEST_REJECTED: "request:rejected",
    CONVERSATION_REACTIVATED: "conversation:reactivated",
    ERROR: "error"
} as const;


export type ClientEventType = typeof CLIENT_EVENTS[keyof typeof CLIENT_EVENTS]; // creates a union of all event keys values
export type ServerEventType = typeof SERVER_EVENTS[keyof typeof SERVER_EVENTS];
