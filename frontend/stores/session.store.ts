import { create } from "zustand"

interface TokenState {
    apiToken: string
    setToken: (token: string) => void
}

export const useTokenStore = create<TokenState>((set) => ({
    apiToken: localStorage.getItem("api_key") || "",
    setToken: (token: string) => {
        localStorage.setItem("api_key", token)
        set({ apiToken: token })
    },
}))
