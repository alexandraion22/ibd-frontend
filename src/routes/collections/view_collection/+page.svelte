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
            fetchCollectionData();
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
        padding: 20px;
        min-height: 100vh;
        background: linear-gradient(to bottom, #ffffff, #f4f4f4);
    }

    .card {
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        padding: 24px;
        margin: 12px;
        width: 90%;
        max-width: 800px;
        transition: box-shadow 0.3s ease-in-out;
    }

    .card:hover {
        box-shadow: 0 6px 14px rgba(0, 0, 0, 0.15);
    }

    .title {
        font-size: 1.8rem;
        font-weight: bold;
        color: #333333;
        text-align: center;
        margin-bottom: 24px;
        padding-bottom: 4px;
    }

    .section {
        margin-top: 16px;
    }

    .section h3 {
        font-size: 1.2rem;
        font-weight: bold;
        color: #555555;
        margin-bottom: 8px;
    }

    .no-data {
        color: #888888;
        font-style: italic;
    }

    .error {
        color: #d9534f;
        margin-top: 20px;
        font-size: 1rem;
        text-align: center;
    }

    .location-item {
        background: #f9f9f9;
        border-radius: 8px;
        margin: 8px 0;
        padding: 16px;
        text-align: left;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    }

    .back-btn {
        margin-top: 24px;
        text-decoration: none;
        background: #007bff;
        color: white;
        padding: 10px 20px;
        border-radius: 8px;
        font-weight: 600;
        transition: background 0.3s ease;
        text-align: center;
    }

    .back-btn:hover {
        background: #0056b3;
    }

    .loading {
        font-size: 1.2rem;
        color: #666666;
    }

    .delete-btn {
        background-color: #dc3545;
        color: white;
        margin-left: 8px;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
    }

    .delete-btn:hover {
        background-color: #c82333;
    }
</style>

<div class="container">
    {#if error}
        <p class="error">{error}</p>
    {:else}
        {#await $collectionData}
            <p class="loading">Loading collection details...</p>
        {:then data}
            {#if data}
                <div class="card">
                    <h2 class="title">Collection Details</h2>

                    <div class="section">
                        <h3 style="display: inline; margin-right: 8px;">Collection Name:</h3>
                        <span>{data?.name || 'No name available'}</span>
                    </div>

                    <div class="section">
                        <h3 style="display: inline; margin-right: 8px;">Collection Owner:</h3>
                        <span>
                            {#await getUserName(get(owner))}
                                Loading owner...
                            {:then userName}
                                {userName}
                            {:catch}
                                <span class="no-data">Error loading owner data</span>
                            {/await}
                        </span>
                    </div>

                    <div class="section">
                        <h3>Collaborators:</h3>
                        {#if getMembersByRole(data?.members, 'collaborator').length > 0}
                            <ul>
                                {#each getMembersByRole(data?.members, 'collaborator') as collaborator}
                                    {#await getUserName(collaborator)}
                                        <li>Loading collaborator...</li>
                                    {:then collaboratorName}
                                        <li>{collaboratorName}</li>
                                    {:catch}
                                        <li class="no-data">Error loading collaborator data</li>
                                    {/await}
                                {/each}
                            </ul>
                        {:else}
                            <p class="no-data">No Collaborators available</p>
                        {/if}
                    </div>

                    <div class="section">
                        <h3>Viewers:</h3>
                        {#if getMembersByRole(data?.members, 'viewer').length > 0}
                            <ul>
                                {#each getMembersByRole(data?.members, 'viewer') as viewer}
                                    {#await getUserName(viewer)}
                                        <li>Loading viewer...</li>
                                    {:then viewerName}
                                        <li>{viewerName}</li>
                                    {:catch}
                                        <li class="no-data">Error loading viewer data</li>
                                    {/await}
                                {/each}
                            </ul>
                        {:else}
                            <p class="no-data">No Viewers available</p>
                        {/if}
                    </div>

                    <div class="section">
                        <h3>Locations:</h3>
                        {#if data?.locations}
                            <ul>
                                {#each Object.entries(data?.locations) as [key, location]}
                                    <div id="location-box" class="flex items-center space-x-4">
                                        <li class="location-item">
                                            <strong>Name:</strong> {location?.name || 'No name'} <br/>
                                            <strong>Type:</strong> {location?.type || 'N/A'} <br/>
                                            <strong>Address:</strong> {location?.address || 'N/A'} <br/>
                                            <strong>Coordinates:</strong> {key} <br/>
                                            <strong>Added At:</strong> {location?.added_at || 'N/A'} 
                                        </li>
                                        {#if get(owner) && isUserOwner(get(owner))}
                                            <button class="delete-btn" onclick={() => deleteLocation(key)}>Delete</button>
                                        {/if}
                                    </div>
                                {/each}
                            </ul>
                        {:else}
                            <p class="no-data">No Locations available</p>
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
