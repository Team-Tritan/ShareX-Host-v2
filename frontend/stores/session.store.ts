import { create } from "zustand"

interface TokenState {
    apiToken: string
    setToken: (token: string) => void
    displayName: string
    setDisplayName: (name: string) => void
}

function setCookie(name: string, value: string, days: number) {
    if (typeof document !== "undefined") {
        const expires = new Date(Date.now() + days * 864e5).toUTCString()
        document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/'
    }
}

function getCookie(name: string) {
    if (typeof document !== "undefined") {
        return document.cookie.split('; ').reduce((r, v) => {
            const parts = v.split('=')
            return parts[0] === name ? decodeURIComponent(parts[1]) : r
        }, '')
    }
    return ""
}

export const useTokenStore = create<TokenState>((set) => ({
    apiToken: getCookie("api_key") || "",
    setToken: (token: string) => {
        setCookie("api_key", token, 7)
        set({ apiToken: token })
    },
    displayName: "User",
    setDisplayName: (name: string) => {
        set({ displayName: name })
    }
}))
