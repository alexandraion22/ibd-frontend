<script>
    import { writable } from 'svelte/store';

    let collectionName = '';
    let error = '';
    let successMessage = '';

    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/collections/create_collection`;

    async function handleAddCollection() {
        error = '';
        successMessage = '';

        if (!collectionName.trim()) {
            error = 'Collection name cannot be empty.';
            return;
        }

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
                },
                body: JSON.stringify({ collection_name: collectionName })
            });

            if (!response.ok) {
                const data = await response.json();
                error = data.message || 'Failed to create collection.';
                return;
            }

            const data = await response.json();
            successMessage = `Collection "${collectionName}" created successfully!`;
            collectionName = '';
        } catch (err) {
            error = 'An error occurred. Please try again later.';
            console.error(err);
        }
    }
</script>

<div class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <h1 class="text-3xl font-bold mb-4">Add New Collection</h1>

    <input
        type="text"
        placeholder="Collection Name"
        bind:value={collectionName}
        class="border p-2 mb-2 w-64"
    />

    <button on:click={handleAddCollection} class="btn-primary w-64">Add Collection</button>

    {#if error}
        <p class="text-red-500 mt-2">{error}</p>
    {/if}

    {#if successMessage}
        <p class="text-green-500 mt-2">{successMessage}</p>
    {/if}

    <div class="mt-4">
        <a href="/" class="text-blue-500">Back to Home</a>
    </div>
</div>
