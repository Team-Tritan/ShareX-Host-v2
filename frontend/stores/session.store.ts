import Cookies from "js-cookie";
import { create } from "zustand";

interface TokenState {
  apiToken: string;
  setToken: (token: string) => void;
  displayName: string;
  setDisplayName: (name: string) => void;
}

function encodeBase64(str: string): string {
  return btoa(str);
}

function decodeBase64(str: string): string {
  try {
    return atob(str);
  } catch (e) {
    console.error("Failed to decode Base64 string:", e);
    return "";
  }
}

export const useTokenStore = create<TokenState>((set) => ({
  apiToken: decodeBase64(Cookies.get(encodeBase64("api_key")) || ""),
  setToken: (token: string) => {
    Cookies.set(encodeBase64("api_key"), encodeBase64(token), {
      expires: 1,
      secure:
        typeof window !== "undefined" && window.location.protocol === "https:",
      sameSite: "strict",
    });
    set({ apiToken: token });
  },
  displayName: decodeBase64(Cookies.get(encodeBase64("display_name")) || ""),
  setDisplayName: (name: string) => {
    Cookies.set(encodeBase64("display_name"), encodeBase64(name), {
      expires: 1,
      secure:
        typeof window !== "undefined" && window.location.protocol === "https:",
      sameSite: "strict",
    });
    set({ displayName: name });
  },
}));
