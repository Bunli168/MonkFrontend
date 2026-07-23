import { io } from "socket.io-client";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
let socketOrigin = apiBaseUrl;

try {
    const url = new URL(apiBaseUrl);
    socketOrigin = url.origin;
} catch (e) { }

import Cookies from "js-cookie";

export const socket = io(socketOrigin, {
    withCredentials: true,
    autoConnect: true,
    transports: ["websocket", "polling"],
    auth: (cb) => {
        cb({
            token: Cookies.get("accessToken")
        });
    }
});
