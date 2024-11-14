// Message
export enum MessageEvent { DECK, OVERLAY }

export interface Message {
    event: MessageEvent;
}

// Deck
export enum DeckMessageType { NONE, OBS, VNYAN, GODOT }

export interface DeckAction {
    color: string;
    desc: string;
}

export interface DeckMessage extends Message {
    type: DeckMessageType;
    data: DeckAction;
}

// Godot
export enum OverlayMessageType { CHAT, FOLLOW, MUSIC }

export interface OverlayMessage extends Message {
    type: OverlayMessageType;
}

// for now the chat vs follow logic is a bit wonky, maybe to be refactored
export interface OverlayTwitchMessage extends OverlayMessage {
    data: {
        author: string;
        message: string;
        color: string;
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
