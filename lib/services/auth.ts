import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthState {
    token: string | null;
    setToken: (token: string) => void;
    clearToken: () => void;
}

const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            setToken: (token) => {
                if (typeof window !== "undefined") {
                    document.cookie = `auth_token=${token}; path=/; max-age=86400`; // 24 hours
                    localStorage.setItem("auth_token", token);
                }
                set({ token });
            },
            clearToken: () => {
                if (typeof window !== "undefined") {
                    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
                }
                set({ token: null });
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : null)),
            skipHydration: true,
        }
    )
);

interface LoginResponse {
    success: boolean;
    token?: string;
    error?: string;
}

export const getAuthHeader = () => {
    if (typeof window === "undefined") return {};
    const store = useAuthStore.getState();
    return store.token ? { Authorization: `Bearer ${store.token}` } : {};
};

export const isAuthenticated = () => {
    if (typeof window === "undefined") return false;
    const store = useAuthStore.getState();
    return !!store.token;
};

export const handleAuthError = (error: any) => {
    if (error.status === 401 && typeof window !== "undefined") {
        useAuthStore.getState().clearToken();
        window.location.href = '/auth/login';
    }
    throw error;
};

export const useAuthService = () => {
    const { token, setToken, clearToken } = useAuthStore();

    const getAuthToken = () => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("auth_token") || token;
        }
        return token;
    };

    const login = async (email: string, password: string): Promise<LoginResponse> => {
        try {
            const response = await fetch(`${process.env.BASE_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeader(),
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

    return {
        login,
        logout,
        getAuthToken,
        isAuthenticated,
    };
};