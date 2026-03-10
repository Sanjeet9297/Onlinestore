import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_BACKEND_URL, {
  autoConnect: false, // Connect manually when user is logged in
});

export default socket;