export interface postCreateUserParams{
    email: string;
    fullname: string;
    lastname: string;
    phone: string;
    password: string;
    gender: string;
}
export interface UserCreateResponse {
    statusCode: number;
    message:    string;
    data:       Data;
}

export interface Data {
    user: User;
}

export interface User {
    email:       string;
    password:    string;
    fullname:    string;
    lastname:    string;
    phone:       string;
    gender:      string;
    codeCountry: null;
    country:     null;
    city:        null;
    photoUrl:    null;
    id:          string;
    state:       boolean;
    created_at:  Date;
    updated_at:  Date;
}
