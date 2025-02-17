import Cookies from "js-cookie";
import { create } from "zustand";

interface TokenState {
  apiToken: string;
  setToken: (token: string) => void;
  displayName: string;
  setDisplayName: (name: string) => void;
}

export const useTokenStore = create<TokenState>((set) => ({
  apiToken: Cookies.get("api_key") || "",
  setToken: (token: string) => {
    Cookies.set("api_key", token, {
      expires: 1,
      secure:
        typeof window !== "undefined" && window.location.protocol === "https:",
      sameSite: "strict",
    });
    set({ apiToken: token });
  },
  displayName: "User",
  setDisplayName: (name: string) => {
    set({ displayName: name });
  },
}));
