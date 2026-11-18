/**
 * Tells open chats that the WebSocket reconnected after dropping, so they
 * reload the messages they missed while it was down.
 */
const listeners = new Set<() => void>();

/** Called by the Apollo client when the WebSocket comes back. */
export const notifyReconnected = () =>
  listeners.forEach((listener) => listener());

/** Runs `listener` after each reconnect; returns a function that stops it. */
export const onReconnected = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => void listeners.delete(listener);
};
