export interface DecodedToken {
    userId: string;
    username: string;
    email: string;
    roles: string[];
    permissions: string[];
    isAdmin: boolean;
    exp: number;
}

export const decodeJWT = (token: string): DecodedToken | null => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
};

export const getCurrentUserId = (): string | null => {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;

    const decoded = decodeJWT(token);
    return decoded?.userId || null;
};