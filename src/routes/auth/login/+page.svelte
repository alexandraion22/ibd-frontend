<script>
    import { isAuthenticated } from '../../../stores/auth';

    let username = '';
    let password = '';
    let error = '';

    function handleLogin() {
        if (username === 'admin' && password === 'admin') {
            sessionStorage.setItem('isAuthenticated', 'true');
            isAuthenticated.set(true);
            sessionStorage.setItem('username', username);
            window.location.href = "/";
        } else {
            error = 'Invalid credentials. Please try again.';
        }
    }
</script>

<div class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <h1 class="text-3xl font-bold mb-4">Login</h1>
    <input
        type="text"
        placeholder="Username"
        bind:value={username}
        class="border p-2 mb-2 w-64"
    />
    <input
        type="password"
        placeholder="Password"
        bind:value={password}
        class="border p-2 mb-2 w-64"
    />
    <button on:click={handleLogin} class="btn-primary w-64">Login</button>
    {#if error}
        <p class="text-red-500 mt-2">{error}</p>
    {/if}

    <div class="mt-4">
        <a href="/auth/signup" class="text-blue-500">Need to Sign Up?</a>
    </div>
</div>
