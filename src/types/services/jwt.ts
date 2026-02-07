export interface AccessPayload {
    userId: string;
    type: "access";
}

export interface RefreshPayload {
    userId: string;
    tokenVersion: number;
    type: "refresh";
}
