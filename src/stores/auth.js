import { writable } from 'svelte/store';

export const isAuthenticated = writable(false);

if (typeof window !== 'undefined' && sessionStorage.getItem('isAuthenticated') === 'true') {
  isAuthenticated.set(true);
}
