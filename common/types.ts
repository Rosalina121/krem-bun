import { ElysiaWS } from "elysia/ws";
import { TypeCheck } from 'elysia/type-system';
import Bun from 'bun'
import { InputSchema, MergeSchema, TSchema, UnwrapRoute } from "elysia";

// Message
export enum MessageEvent { DECK, OVERLAY }

export interface Message {
    event: MessageEvent;
}

// Deck
export enum DeckMessageType { NONE, OBS, VNYAN, OVERLAY }

export interface DeckAction {
    color: string;
    desc: string;
}

export interface DeckMessage extends Message {
    type: DeckMessageType;
    data: DeckAction;
}

// Overlay
export enum OverlayMessageType { CHAT, FOLLOW, MUSIC, ACTION }

export interface OverlayMessage extends Message {
    type: OverlayMessageType;
}

export interface OverlayActionMessage extends OverlayMessage {
    data: {
        action: string;
    }
}

// for now the chat vs follow logic is a bit wonky, maybe to be refactored
export interface OverlayTwitchMessage extends OverlayMessage {
    data: {
        author: string;
        message: string;
        color: string;
        pictureURL?: string;
    }
}

export interface Track {
    artist: string;
    title: string;
    album: string;
}
export interface OverlayMusicMessage extends OverlayMessage {
    data: Track
}


// randoms
export interface MarioKartCounter {
    blueshells: number;
    coconutmalled: number;
    piorunki: number;
    errors: number;
}

export interface Emotion {
    color: string,
    emotion: string,
}

// Sims 4 Emotions
export const emotions: Emotion[] = [
    { emotion: "Rozgniewana", color: "#AB1B2C" },
    { emotion: "Szczęśliwa", color: "#29A24E" },
    { emotion: "Zainspirowana", color: "#2FA4A9" },
    { emotion: "Przestraszona", color: "#701458" },
    { emotion: "Zawstydzona", color: "#C5A940" },
    { emotion: "Rozbwiona", color: "#A04099" },
    { emotion: "Smutna", color: "#2F449B" },
    { emotion: "Pobudzona", color: "#8BB144" },
    { emotion: "Spięta", color: "#C57720" },
    { emotion: "Nieswoja", color: "#C65942" },
    { emotion: "Flirciarska", color: "#D15694" },
    { emotion: "Skupiona", color: "#6435CF" },
    { emotion: "Śpi", color: "#424262" },
    { emotion: "Znudzona", color: "#707574" },
    { emotion: "Pewna siebie", color: "#3C79AD" },
    { emotion: "Oszołomiona", color: "#705FB0" },
    { emotion: "Pogodna", color: "#CACACB" },
    { emotion: "ØPĘŦÅŇÅ", color: "#424262" },
];


// ElysiaJS types for the peace of mind

export type ClientWebSocket = (ElysiaWS<Bun.ServerWebSocket<{ validator?: TypeCheck<TSchema>; }>, MergeSchema<UnwrapRoute<InputSchema<never>, Record<string, unknown>>, Record<string, unknown>> & { params: Record<never, string>; }, { decorator: Record<string, unknown>; store: Record<string, unknown>; derive: Record<string, unknown>; resolve: Record<string, unknown>; } & { derive: Record<string, unknown>; resolve: Record<string, unknown>; }>)
