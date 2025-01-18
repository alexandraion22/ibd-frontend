<script>
    import { onMount } from 'svelte';
    import { writable, get } from 'svelte/store';

    let collectionId = '';
    let collectionData = writable(null);
    let error = '';
    let owner = writable('');

    const deleteLocationUrl = `${import.meta.env.VITE_API_BASE_URL}/locations`;
    const collectionsUrl = `${import.meta.env.VITE_API_BASE_URL}/collections/get_collection`;
    const usersUrl = `${import.meta.env.VITE_API_BASE_URL}/users/get_users_id`;

    onMount(async () => {
        const urlParams = new URLSearchParams(window.location.search);
        collectionId = urlParams.get('id');
        if (collectionId) {
            await fetchCollectionData();
        } else {
            error = 'No collection ID provided.';
        }
    });

    async function fetchCollectionData() {
        error = '';
        try {
            const response = await fetch(`${collectionsUrl}/${collectionId}`, {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,
                }
            });

            if (!response.ok) {
                const data = await response.json();
                error = data.message || 'Failed to fetch collection details.';
                return;
            }

            const data = await response.json();
            collectionData.set(data || null);
            const owners = getMembersByRole(data?.members, 'owner');
            owner.set(owners.length > 0 ? owners[0] : '');
        } catch (err) {
            console.error(err);
            error = 'An error occurred while fetching collection data.';
        }
    }

    async function getUserName(id) {
        try {
            const res = await fetch(`${usersUrl}/${id}`, {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,
                }
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to fetch user details.');
            }

            const name = await res.json();
            return name;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    function getMembersByRole(members, role) {
        return Object.values(members)
            .filter(member => member.rights === role)
            .map(member => member.user_id);
    }

    function isUserOwner(colOwner) {
        const id = sessionStorage.getItem('user_id');
        return colOwner === id;
    }

    async function deleteLocation(coords) {
        try {
            const response = await fetch(`${deleteLocationUrl}/${collectionId}/${coords}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
                }
            });

            if (!response.ok) {
                const data = await response.json();
                console.error('Failed to delete location:', data.message || 'Unknown error');
                return;
            }
            await fetchCollectionData();
        } catch (err) {
            console.error('Error while deleting location:', err);
        }
    }
</script>

<style>
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px;
        min-height: 100vh;
        background-color: #f4f7fc;
    }

    .card {
        background-color: white;
        border-radius: 16px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        padding: 32px;
        margin: 16px;
        width: 100%;
        max-width: 800px;
        text-align: left;
        transition: transform 0.3s ease;
    }

    .card:hover {
        transform: translateY(-6px);
    }

    .title {
        font-size: 1.8rem;
        font-weight: bold;
        color: #333;
        text-align: center;
        margin-bottom: 20px;
    }

    .section {
        margin-bottom: 20px;
    }

    .section-title {
        font-size: 1.2rem;
        font-weight: bold;
        color: #555;
        margin-bottom: 10px;
    }

    .section-content {
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 6px;
        margin-bottom: 10px;
        background: #f9f9f9;
    }

    .error {
        color: #d9534f;
        text-align: center;
        margin-top: 20px;
    }

    .location-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
        width: 100%;
    }

    .location-box {
        display: flex;
        flex-direction: column;
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 16px;
        height: 100%;
        min-height: 200px;
        position: relative;
    }

    .location-content {
        flex-grow: 1;
        margin-bottom: 40px;
    }

    .location-info {
        margin-bottom: 8px;
    }

    .location-actions {
        position: absolute;
        bottom: 16px;
        right: 16px;
    }

    .delete-btn {
        background: #dc3545;
        color: white;
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .delete-btn:hover {
        background: #c82333;
    }

    .back-btn {
        display: inline-block;
        margin-top: 20px;
        padding: 10px 20px;
        color: #555;
        text-decoration: none;
        border-radius: 4px;
        transition: color 0.2s;
    }

    .back-btn:hover {
        color: #333;
    }

    .member-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .member-item {
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 6px;
        margin-bottom: 10px;
        background: #f9f9f9;
    }
</style>

<div class="container">
    {#if error}
        <p class="error">{error}</p>
    {:else}
        {#await $collectionData}
            <p>Loading collection details...</p>
        {:then data}
            {#if data}
                <div class="card">
                    <h2 class="title">Collection Details</h2>

                    <!-- Collection Name -->
                    <div class="section">
                        <h3 class="section-title">Collection Name</h3>
                        <div class="section-content">
                            <p>{data?.name || 'No name available'}</p>
                        </div>
                    </div>

                    <!-- Collection Owner -->
                    <div class="section">
                        <h3 class="section-title">Collection Owner</h3>
                        <div class="section-content">
                            {#await getUserName(get(owner))}
                                <p>Loading owner...</p>
                            {:then userName}
                                <p>{userName}</p>
                            {:catch}
                                <p class="error">Error loading owner data.</p>
                            {/await}
                        </div>
                    </div>

                    <!-- Collaborators -->
                    <div class="section">
                        <h3 class="section-title">Collaborators</h3>
                        {#if getMembersByRole(data?.members, 'collaborator').length > 0}
                            <div class="member-list">
                                {#each getMembersByRole(data?.members, 'collaborator') as collaborator}
                                    {#await getUserName(collaborator)}
                                        <div class="member-item">Loading collaborator...</div>
                                    {:then collaboratorName}
                                        <div class="member-item">{collaboratorName}</div>
                                    {:catch}
                                        <div class="member-item error">Error loading collaborator data.</div>
                                    {/await}
                                {/each}
                            </div>
                        {:else}
                            <p>No collaborators available.</p>
                        {/if}
                    </div>

                    <!-- Viewers -->
                    <div class="section">
                        <h3 class="section-title">Viewers</h3>
                        {#if getMembersByRole(data?.members, 'viewer').length > 0}
                            <div class="member-list">
                                {#each getMembersByRole(data?.members, 'viewer') as viewer}
                                    {#await getUserName(viewer)}
                                        <div class="member-item">Loading viewer...</div>
                                    {:then viewerName}
                                        <div class="member-item">{viewerName}</div>
                                    {:catch}
                                        <div class="member-item error">Error loading viewer data.</div>
                                    {/await}
                                {/each}
                            </div>
                        {:else}
                            <p>No viewers available.</p>
                        {/if}
                    </div>

                    <!-- Locations -->
                    <div class="section">
                        <h3 class="section-title">Locations</h3>
                        {#if data?.locations}
                            <div class="location-container">
                                {#each Object.entries(data?.locations) as [key, location]}
                                    <div class="location-box">
                                        <div class="location-content">
                                            <div class="location-info">
                                                <strong>Name:</strong> {location?.name || 'No name'}
                                            </div>
                                            <div class="location-info">
                                                <strong>Type:</strong> {location?.type || 'N/A'}
                                            </div>
                                            <div class="location-info">
                                                <strong>Address:</strong> {location?.address || 'N/A'}
                                            </div>
                                            <div class="location-info">
                                                <strong>Coordinates:</strong> {key}
                                            </div>
                                            <div class="location-info">
                                                <strong>Added At:</strong> {location?.added_at || 'N/A'}
                                            </div>
                                        </div>
                                        {#if get(owner) && isUserOwner(get(owner))}
                                            <div class="location-actions">
                                                <button class="delete-btn" on:click={() => deleteLocation(key)}>
                                                    Delete
                                                </button>
                                            </div>
                                        {/if}
                                    </div>
                                {/each}
                            </div>
                        {:else}
                            <p>No locations available.</p>
                        {/if}
                    </div>
                </div>
            {:else}
                <p>No data found for this collection.</p>
            {/if}
        {:catch}
            <p class="error">Failed to load collection details.</p>
        {/await}
    {/if}

    <a href="/" class="back-btn">← Back to Home</a>
</div>