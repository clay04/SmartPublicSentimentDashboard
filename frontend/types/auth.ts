export interface User {
    id: number | string;
    username: string;
    name: string;
}

export interface LoginPayload {
    username: string;
    password: string;
}

export interface RegisterPayload {
    username: string;
    password: string;
    name: string;
}

export interface AuthResponse {
    message?: string;
    Message?: string;
    token?: string;
    user?: User;
}