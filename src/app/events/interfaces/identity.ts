export interface GetIdentityVerificationResponse {
    statusCode: number;
    data:       Data;
    message:    string;
    metadata:   Metadata;
}

export interface Data {
    isAllowed:    boolean;
    currentCount: number;
    maxAllowed:   number;
}

export interface Metadata {
    timestamp: string;
    version:   string;
}

export interface PostVerificationResponse {
    statusCode: number;
    data:       Data;
    message:    string;
    metadata:   Metadata;
}

export interface Data {
    verification: Verification;
    faceMatch:    boolean;
}

export interface Verification {
    tenantId:     string;
    document_url: string;
    selfie_url:   string;
    user:         Event;
    event:        Event;
    verified_at:  Date;
    id:           string;
    status:       boolean;
    created_at:   Date;
}

export interface Event {
    id: string;
}

export interface Metadata {
    timestamp: string;
    version:   string;
}
