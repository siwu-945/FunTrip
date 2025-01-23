// src/utils/cookies.ts
import Cookies from "js-cookie";

/**
 * Set a cookie
 * @param name - Name of the cookie
 * @param value - Value of the cookie
 * @param options - Optional settings like expiration
 */
export const setCookie = (name: string, value: string, options?: Cookies.CookieAttributes): void => {
    Cookies.set(name, value, options);
};

/**
 * Get a cookie
 * @param name - Name of the cookie
 * @returns The cookie value or undefined if not found
 */
export const getCookie = (name: string): string | undefined => {
    return Cookies.get(name);
};

/**
 * Remove a cookie
 * @param name - Name of the cookie
 */
export const removeCookie = (name: string): void => {
    Cookies.remove(name);
};
