import { io } from 'socket.io-client';

// Hardcoded for stability
const socket = io('http://localhost:5006', {
  autoConnect: false,
  withCredentials: true,
});

export default socket;
