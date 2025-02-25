import Cookies from "js-cookie";

export const formatFileSize = (size: number): string => {
  if (size >= 1e9) {
    return (size / 1e9).toFixed(2) + " GB";
  } else if (size >= 1e6) {
    return (size / 1e6).toFixed(2) + " MB";
  } else {
    return (size / 1e3).toFixed(2) + " KB";
  }
};

export const encodeBase64 = (str: string): string => btoa(str);

export const decodeBase64 = (str: string): string => {
  try {
    return atob(str);
  } catch (e) {
    console.error("Failed to decode Base64 string:", e);
    return "";
  }
};

export const getCookie = (key: string): string =>
  decodeBase64(Cookies.get(encodeBase64(key)) || "");

export const setCookie = (key: string, value: string): void => {
  Cookies.set(encodeBase64(key), encodeBase64(value), {
    expires: 1,
    secure:
      typeof window !== "undefined" && window.location.protocol === "https:",
    sameSite: "strict",
  });
};
