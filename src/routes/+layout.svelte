<script>
	import '../app.css';
	let { children } = $props();

	import { onMount } from 'svelte';

    onMount(() => {
        //if (typeof window !== 'undefined') {
            const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
            if (!isAuthenticated && window.location.pathname !== '/auth') {
                window.location.href = '/auth';
            }
        //}
    });
</script>

{@render children()}
