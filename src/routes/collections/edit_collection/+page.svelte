<script>
    import { onMount } from 'svelte';

    let collectionName = '';
    let collectionId = null;
    let error = '';
    let successMessage = '';
    let apiUrl = '';

    onMount(() => {
        const urlParams = new URLSearchParams(window.location.search);
        collectionId = urlParams.get('id');
        collectionName = urlParams.get('name');

        if (collectionId) {
            apiUrl = `${import.meta.env.VITE_API_BASE_URL}/collections/rename_collection/${collectionId}`;
        } else {
            error = 'Collection ID is missing.';
        }
    });

    async function handleEditCollection() {
        error = '';
        successMessage = '';

        if (!collectionName.trim()) {
            error = 'Collection name cannot be empty.';
            return;
        }

        if (!collectionId) {
            error = 'No collection selected for editing.';
            return;
        }

        try {
            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
                },
                body: JSON.stringify({
                    new_collection_name: collectionName
                })
            });

            if (!response.ok) {
                const data = await response.json();
                error = data.message || 'Failed to update collection.';
                return;
            }

            const data = await response.json();
            successMessage = `Collection "${collectionName}" updated successfully!`;
        } catch (err) {
            error = 'An error occurred. Please try again later.';
            console.error(err);
        }
    }
</script>

<div class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <h1 class="text-3xl font-bold mb-4">Edit Collection</h1>

    <input
        type="text"
        placeholder="Collection Name"
        bind:value={collectionName}
        class="border p-2 mb-2 w-64"
    />

    <button on:click={handleEditCollection} class="btn-primary w-64">Edit Collection</button>

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
