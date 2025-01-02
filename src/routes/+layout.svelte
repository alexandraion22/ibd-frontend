<script>
	import '../app.css';
	let { children } = $props();

	import { onMount } from 'svelte';

    onMount(() => {
        const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
        if (!isAuthenticated && window.location.pathname !== '/auth/login') {
            window.location.href = '/auth/login';
        }
    });
</script>

{@render children()}
