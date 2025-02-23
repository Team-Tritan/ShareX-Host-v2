import Cookies from "js-cookie";
import { create } from "zustand";

interface TokenState {
  apiToken: string;
  setToken: (token: string) => void;
  displayName: string;
  setDisplayName: (name: string) => void;
}

const encodeBase64 = (str: string): string => btoa(str);

const decodeBase64 = (str: string): string => {
  try {
    return atob(str);
  } catch (e) {
    console.error("Failed to decode Base64 string:", e);
    return "";
  }
};

const getCookie = (key: string): string =>
  decodeBase64(Cookies.get(encodeBase64(key)) || "");

const setCookie = (key: string, value: string): void => {
  Cookies.set(encodeBase64(key), encodeBase64(value), {
    expires: 1,
    secure: typeof window !== "undefined" && window.location.protocol === "https:",
    sameSite: "strict",
  });
};

export const useTokenStore = create<TokenState>((set) => ({
  apiToken: getCookie("api_key"),
  setToken: (token: string) => {
    setCookie("api_key", token);
    set({ apiToken: token });
  },
  displayName: getCookie("display_name"),
  setDisplayName: (name: string) => {
    setCookie("display_name", name);
    set({ displayName: name });
  },
}));
