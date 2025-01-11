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


<!-- <script>
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';

    let collectionName = '';
    let error = '';
    let successMessage = '';
    let selectedLocations = [];
    let map;
    let apiKey = 'YOUR_GOOGLE_MAPS_API_KEY';

    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/collections/create_collection`;

    onMount(() => {
        const mapScript = document.createElement('script');
        mapScript.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
        mapScript.async = true;
        mapScript.defer = true;
        mapScript.onload = initMap;
        document.head.appendChild(mapScript);
    });

    function initMap() {
        const initialPosition = { lat: 44.4268, lng: 26.1025 };

        map = new google.maps.Map(document.getElementById('map'), {
            center: initialPosition,
            zoom: 12,
        });

        map.addListener('click', (event) => {
            const { lat, lng } = event.latLng.toJSON();
            selectedLocations.push({ lat, lng });

            new google.maps.Marker({
                position: { lat, lng },
                map,
            });
        });
    }

    async function handleAddCollection() {
        error = '';
        successMessage = '';

        if (!collectionName.trim()) {
            error = 'Collection name cannot be empty.';
            return;
        }

        if (selectedLocations.length === 0) {
            error = 'Please select at least one location on the map.';
            return;
        }

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
                },
                body: JSON.stringify({ 
                    collection_name: collectionName
                })
            });

            if (!response.ok) {
                const data = await response.json();
                error = data.message || 'Failed to create collection.';
                return;
            }

            const data = await response.json();
            successMessage = `Collection "${collectionName}" created successfully with ${selectedLocations.length} locations!`;
            collectionName = '';
            selectedLocations = [];
            map = null;
            initMap();
        } catch (err) {
            error = 'An error occurred. Please try again later.';
            console.error(err);
        }
    }
</script>

<style>
    #user-map-area {
        display: flex;
        align-items: start;
        gap: 2.5rem;
        width: 100%;
        height: 100vh;
        padding-top: 1.25rem;
    }

    #map {
        width: 60%;
        height: 80%;
        background-color: #2d3748;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        border: 1px solid #cbd5e0;
        margin-left: 2rem;
    }

    #user-area {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        align-items: center;
        margin-top: 10px;
    }

    input {
        border: 1px solid #cbd5e0;
        padding: 0.5rem;
        border-radius: 6px;
        width: 300px;
    }
</style>

<div id="user-map-area">
    <div id="map"></div>

    <div id="user-area">
        <h1 class="text-3xl font-bold mb-4">Add New Collection</h1>

        <input
            type="text"
            placeholder="Collection Name"
            bind:value={collectionName}
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
</div> -->
