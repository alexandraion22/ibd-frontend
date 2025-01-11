<script>
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';

    let collectionId = '';
    let collectionData = writable(null);
    let error = '';

    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/collections/get_collection`;

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
            const response = await fetch(`${apiUrl}/${collectionId}`, {
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
        } catch (err) {
            console.error(err);
            error = 'An error occurred while fetching collection data.';
        }
    }

    function getMembersByRole(members, role) {
        return Object.entries(members || {}).filter(([_, memberRole]) => memberRole === role).map(([id]) => id);
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
        background: linear-gradient(to bottom, #f9fafb, #e5e7eb);
    }

    .card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
        padding: 24px;
        margin: 12px;
        width: 90%;
        max-width: 700px;
        text-align: center;
        transition: transform 0.3s ease-in-out;
    }

    .card:hover {
        transform: translateY(-4px);
    }

    .title {
        font-size: 2rem;
        font-weight: bold;
        color: #1f2937;
        margin-bottom: 20px;
    }

    .section {
        margin-top: 16px;
        text-align: left;
    }

    .section h3 {
        font-size: 1.2rem;
        font-weight: 600;
        color: #374151;
        margin-bottom: 8px;
    }

    .section p {
        font-size: 1rem;
        color: #4b5563;
    }

    .no-data {
        color: #9ca3af;
        font-style: italic;
    }

    .error {
        color: #dc2626;
        margin-top: 20px;
        font-size: 1rem;
    }

    .location-item {
        background: #f3f4f6;
        border-radius: 8px;
        margin: 8px 0;
        padding: 12px;
        text-align: left;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .location-item strong {
        font-weight: 600;
    }

    .back-btn {
        margin-top: 24px;
        text-decoration: none;
        background: #2563eb;
        color: white;
        padding: 10px 20px;
        border-radius: 8px;
        font-weight: 600;
        transition: background 0.3s;
    }

    .back-btn:hover {
        background: #1d4ed8;
    }

    .loading {
        font-size: 1.2rem;
        color: #6b7280;
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
                    <h2 class="title">📦 Collection Details</h2>

                    <div class="section">
                        <h3>🏷️ Name:</h3>
                        {#if data?.name}
                            <p>{data.name}</p>
                        {:else}
                            <p class="no-data">No name available</p>
                        {/if}
                    </div>

                    <div class="section">
                        <h3>👤 Owner:</h3>
                        {#if getMembersByRole(data?.members, 'owner').length > 0}
                            <p>{getMembersByRole(data?.members, 'owner')[0]}</p>
                        {:else}
                            <p class="no-data">No Owner available</p>
                        {/if}
                    </div>

                    <div class="section">
                        <h3>🤝 Collaborators:</h3>
                        {#if getMembersByRole(data?.members, 'collaborator').length > 0}
                            <ul>
                                {#each getMembersByRole(data?.members, 'collaborator') as collaborator}
                                    <li>{collaborator}</li>
                                {/each}
                            </ul>
                        {:else}
                            <p class="no-data">No Collaborators available</p>
                        {/if}
                    </div>

                    <div class="section">
                        <h3>👀 Viewers:</h3>
                        {#if getMembersByRole(data?.members, 'viewer').length > 0}
                            <ul>
                                {#each getMembersByRole(data?.members, 'viewer') as viewer}
                                    <li>{viewer}</li>
                                {/each}
                            </ul>
                        {:else}
                            <p class="no-data">No Viewers available</p>
                        {/if}
                    </div>

                    <div class="section">
                        <h3>📍 Locations:</h3>
                        {#if data?.locations}
                            <ul>
                                {#each Object.entries(data.locations) as [key, location]}
                                    <li class="location-item">
                                        <strong>Coordinates:</strong> {key} <br />
                                        <strong>Added At:</strong> {location?.added_at || 'N/A'} <br />
                                        <strong>Name:</strong> {location?.name || 'No name'}
                                    </li>
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
