import { create } from "zustand";

interface AuthState {
    token: string | null;
    setToken: (token: string) => void;
    clearToken: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
    token: typeof window !== "undefined" ? localStorage.getItem("auth_token") : null,
    setToken: (token) => {
        localStorage.setItem("auth_token", token);
        document.cookie = `auth_token=${token}; path=/; max-age=86400`; // 24 saat
        set({ token });
    },
    clearToken: () => {
        localStorage.removeItem("auth_token");
        document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        set({ token: null });
    },
}));

interface LoginResponse {
    success: boolean;
    token?: string;
    error?: string;
}

export const getAuthHeader = () => {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const isAuthenticated = () => {
    return !!localStorage.getItem('auth_token');
};

export const handleAuthError = (error: any) => {
    if (error.status === 401) {
        localStorage.removeItem('auth_token');
        window.location.href = '/auth/login';
    }
    throw error;
};

export const useAuthService = () => {
    const { setToken, clearToken } = useAuthStore();

    const login = async (email: string, password: string): Promise<LoginResponse> => {
        try {
            const response = await fetch(`${process.env.BASE_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok && data.token) {
                setToken(data.token);
                return { success: true, token: data.token };
            }

            return {
                success: false,
                error: data.message || "Invalid credentials",
            };
        } catch (error) {
            console.error("Login error:", error);
            return {
                success: false,
                error: "An error occurred during login",
            };
        }
    };

    const logout = () => {
        clearToken();
    };

    const isAuthenticated = () => {
        const token = localStorage.getItem("auth_token");
        return !!token;
    };

    return {
        login,
        logout,
        isAuthenticated,
    };
};