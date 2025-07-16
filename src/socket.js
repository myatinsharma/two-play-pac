"use client";

import { io } from "socket.io-client";

// Optimized Socket.IO configuration for better performance
const getOptimizedSocketOptions = () => ({
  transports: ["websocket", "polling"], // Prioritize websocket but keep polling as fallback
  upgrade: true,
  rememberUpgrade: true,
  timeout: 20000,
  forceNew: false,
  reconnection: true,
  reconnectionAttempts: 3,
  reconnectionDelay: 1000,
  compression: true,
  perMessageDeflate: true,
  // Additional performance optimizations
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 10000,
});

// Create optimized socket connection
export const createOptimizedSocket = (url) => {
  return io(url, getOptimizedSocketOptions());
};

// Default socket for backward compatibility
export const socket = io();
