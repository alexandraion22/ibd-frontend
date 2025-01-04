<script>
    import logo from '$lib/assets/city-spotter-bg.png';
    import { isAuthenticated } from '../stores/auth';
    import { onMount } from 'svelte';

    let authenticated = false;
    isAuthenticated.subscribe(value => {
        authenticated = value;
    });

    let collections = [];
    let currentPage = 1;
    const itemsPerPage = 5;
    $: totalPages = Math.max(1, Math.ceil(collections.length / itemsPerPage));
    let error = '';

    async function fetchCollections() {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/collections/get_collections`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
                }
            });

            if (!response.ok) {
                const data = await response.json();
                error = data.message || 'Failed to load collections.';
                return;
            }

            const data = await response.json();
            if (data.collections && Array.isArray(data.collections)) {
                collections = data.collections.map(item => ({
                    id: item.collection_id,
                    name: item.name
                }));
            } else {
                error = 'Invalid data format from server.';
            }
        } catch (err) {
            error = 'An error occurred while fetching collections.';
            console.error(err);
        }
    }

    onMount(() => {
        fetchCollections();
    });

    function nextPage() {
        if (currentPage < totalPages) currentPage++;
    }

    function prevPage() {
        if (currentPage > 1) currentPage--;
    }

    function editCollection(id, name) {
        window.location.href = `/collections/edit_collection?id=${id}&name=${encodeURIComponent(`${name}`)}`;
    }

    async function deleteCollection(id) {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/collections/delete_collection/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
                }
            });

            if (!response.ok) {
                const data = await response.json();
                console.error('Failed to delete collection:', data.message || 'Unknown error');
                return;
            }

            collections = collections.filter(collection => collection.id !== id);

            if (currentPage > Math.ceil(collections.length / itemsPerPage)) {
                currentPage = Math.max(1, Math.ceil(collections.length / itemsPerPage));
            }

        } catch (err) {
            console.error('Error while deleting collection:', err);
        }
    }

    function seeCollection(id) {
        console.log(`See collection with ID: ${id}`);
    }

    function logout() {
        sessionStorage.removeItem('isAuthenticated');
        window.location.href = "/auth/login";
    }

    function gotoDashboard() {
        window.location.href = "/dashboard";
    }

    function newCollection() {
        window.location.href = "/collections/new_collection";
    }
</script>

<style>
    .logout-btn {
        position: absolute;
        top: 20px;
        right: 20px;
        background-color: #ff4d4f;
        color: white;
        padding: 8px 16px;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
        transition: background-color 0.2s ease-in-out;
    }

    .logout-btn:hover {
        background-color: #d9363e;
    }

    .container {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        min-height: 100vh;
        padding: 20px;
        box-sizing: border-box;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        margin-bottom: 20px;
    }

    .logo {
        width: 200px;
        height: auto;
    }

    .collections-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        max-width: 600px;
        margin-bottom: 10px;
    }

    .collections-header h2 {
        font-size: 1.5rem;
        font-weight: bold;
    }

    .content {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        max-width: 600px;
    }

    .collection-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 20px;
        margin-bottom: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
        background-color: #f9fafb;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        width: 100%;
    }

    .collection-buttons button {
        margin-left: 8px;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
    }

    .edit-btn {
        background-color: #ffc107;
        color: white;
    }

    .delete-btn {
        background-color: #dc3545;
        color: white;
    }

    .see-btn {
        background-color: #17a2b8;
        color: white;
    }

    .edit-btn:hover { background-color: #e0a800; }
    .delete-btn:hover { background-color: #c82333; }
    .see-btn:hover { background-color: #138496; }

    .pagination {
        width: 100%;
        max-width: 600px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: auto;
        padding: 20px 0;
        background: #fff;
    }

    .pagination button {
        background-color: #007bff;
        color: white;
        padding: 8px 16px;
        border-radius: 5px;
        cursor: pointer;
    }

    .pagination button:disabled {
        background-color: #d6d6d6;
        cursor: not-allowed;
    }
</style>

{#if authenticated}
    <button class="logout-btn" on:click={logout}>Logout</button>

    <div class="container">

        <div class="header">
            <img alt="city-spotter-logo" src={logo} class="logo">
        </div>

        <div class="content">
            <div class="collections-header">
                <h2>My Collections</h2>
                <button id="btn-dashboard" on:click={gotoDashboard} class="btn-primary">📊 View Statistics</button>
                <button id="btn-dashboard" on:click={newCollection} class="btn-primary">+ New Collection</button>
            </div>

            {#if collections.length === 0}
                <p class="text-center text-gray-500">No collections available.</p>
            {/if}

            {#if collections.length > 0 && error}
                <p class="text-red-500">{error}</p>
            {/if}

            {#each collections.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) as collection (collection.id)}
                <div class="collection-item">
                    <span>{collection.name}</span>
                    <div class="collection-buttons">
                        <button class="edit-btn" on:click={() => editCollection(collection.id, collection.name)}>Edit</button>
                        <button class="delete-btn" on:click={() => deleteCollection(collection.id)}>Delete</button>
                        <button class="see-btn" on:click={() => seeCollection(collection.id)}>View</button>
                    </div>
                </div>
            {/each}
        </div>

        <div class="pagination">
            <button on:click={prevPage} disabled={currentPage === 1}>← Previous</button>
            <span>Page {currentPage} of {totalPages}</span>
            <button on:click={nextPage} disabled={currentPage === totalPages}>Next →</button>
        </div>
    </div>
{/if}
