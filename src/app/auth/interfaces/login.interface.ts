export interface LoginResponse {
    statusCode: number;
    message:    string;
    data:       Data;
}

export interface Data {
    user:  User;
    token: string;
    tenantToken?: string;
}

export interface User {
    id:          string;
    email:       string;
    password:    string;
    fullname:    string;
    lastname:    string;
    phone:       string;
    codeCountry: null;
    country:     null;
    city:        null;
    gender:      string;
    photoUrl:    null;
    state:       boolean;
    created_at:  Date;
    updated_at:  Date;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

