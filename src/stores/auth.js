// src/stores/auth.js
import { writable } from 'svelte/store';

// Create an authentication store
export const isAuthenticated = writable(false);

// Check localStorage or sessionStorage for the initial auth status
if (typeof window !== 'undefined' && sessionStorage.getItem('isAuthenticated') === 'true') {
  isAuthenticated.set(true);
}
