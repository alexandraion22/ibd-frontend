<script>
    import { writable } from 'svelte/store';

    let email = '';
    let name = '';
    let password = '';
    let error = '';
    let success = '';

    const backendUrl = `${import.meta.env.VITE_API_BASE_URL}/users/create_user`;

    async function handleSignUp() {
        error = '';
        success = '';

        if (!name || !email || !password) {
            error = 'All fields are required.';
            return;
        }

        try {
            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    display_name: name
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Sign Up failed');
            }

            success = 'Account created successfully! You can now log in.';
        } catch (err) {
            error = err.message || 'An unexpected error occurred.';
        }
    }
</script>

<div class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <h1 class="text-3xl font-bold mb-4">Sign Up</h1>

    <input
        type="text"
        placeholder="Name"
        bind:value={name}
        class="border p-2 mb-2 w-64"
    />

    <input
        type="text"
        placeholder="Email"
        bind:value={email}
        class="border p-2 mb-2 w-64"
    />

    <input
        type="password"
        placeholder="Password"
        bind:value={password}
        class="border p-2 mb-2 w-64"
    />

    <button on:click={handleSignUp} class="btn-primary w-64">
        Sign Up
    </button>

    {#if error}
        <p class="text-red-500 mt-2">{error}</p>
    {/if}

    {#if success}
        <p class="text-green-500 mt-2">{success}</p>
    {/if}

    <div class="mt-4">
        <a href="/auth/login" class="text-blue-500">Back to Login</a>
    </div>
</div>
