<script>
    import { writable } from 'svelte/store';
    import { initializeApp } from 'firebase/app';
    import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
    import { isAuthenticated } from '../../../stores/auth';

    let email = '';
    let password = '';
    let error = '';
    let userEmail = '';

    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      databaseURL: import.meta.env.VITE_FIREBASE_DB_URL
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);


    async function handleLogin() {
        error = '';

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            userEmail = user.email;
            let userId = user.uid
            sessionStorage.setItem('user_id', userId);
            const token = await user.getIdToken();
            sessionStorage.setItem('auth_token', token);
            sessionStorage.setItem('isAuthenticated', 'true');
            isAuthenticated.set(true);
            sessionStorage.setItem('username', userEmail);
            console.log(token)
            window.location.href = "/";
        } catch (err) {
            error = 'Login failed. Please check your credentials or try again later.';
            console.error(err);
        }
    }
</script>

<div class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <h1 class="text-3xl font-bold mb-4">Login</h1>
    <input type="email" placeholder="Email" bind:value={email} class="border p-2 mb-2 w-64" />
    <input type="password" placeholder="Password" bind:value={password} class="border p-2 mb-2 w-64" />
    <button on:click={handleLogin} class="btn-primary w-64">Login</button>
    {#if error}
        <p class="text-red-500 mt-2">{error}</p>
    {/if}
    {#if userEmail}
        <p class="mt-4 text-green-500">Hello, {userEmail}!</p>
    {/if}
    <div class="mt-4">
        <a href="/auth/signup" class="text-blue-500">Need to Sign Up?</a>
    </div>
</div>
