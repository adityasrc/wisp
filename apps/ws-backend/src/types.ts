

import { CLIENT_EVENTS, type ServerEventType } from "./event.js";
import type {
    SendMessageSchema,
    EditWsMessageSchema,
    SendRequestSchema,
    RespondRequestSchema,
} from "@repo/common";

export type SendMessagePayload = SendMessageSchema;
export type EditMessagePayload = EditWsMessageSchema;
export type SendRequestPayload = SendRequestSchema;
export type RespondRequestPayload = RespondRequestSchema;



export type ClientMessage =
    | { type: typeof CLIENT_EVENTS.MESSAGE_SEND; payload: SendMessagePayload }
    | { type: typeof CLIENT_EVENTS.MESSAGE_EDIT; payload: EditMessagePayload }
    | { type: typeof CLIENT_EVENTS.REQUEST_SEND; payload: SendRequestPayload }
    | { type: typeof CLIENT_EVENTS.REQUEST_RESPOND; payload: RespondRequestPayload };

export interface ServerMessage<T = any> {
    type: ServerEventType;
    payload: T;
}


