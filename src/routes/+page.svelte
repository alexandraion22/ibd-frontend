<!-- <script>
    import logo from '$lib/assets/city-spotter-bg.png';
    import { onMount } from 'svelte';
    import { isAuthenticated } from '../stores/auth';

    let authenticated = false;

    isAuthenticated.subscribe(value => {
        authenticated = value;
    });

    function gotoDashboard() {
        window.location.href = "/dashboard";
    }

    function logout() {
        sessionStorage.removeItem('isAuthenticated');
        window.location.href = "/auth/login";
    }

    let map;

    const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    onMount(() => {
        if (window.google && window.google.maps) {
            initMap();
        } else {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
            script.async = true;
            script.defer = true;
            script.onload = initMap;
            document.head.appendChild(script);
        }
    });

    function initMap() {
        const mapElement = document.getElementById('map');
        if (mapElement) {
            map = new google.maps.Map(mapElement, {
                center: { lat: 44.4268, lng: 26.1025 },
                zoom: 12,
            });
        }
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
</style>

{#if authenticated}
    <button class="logout-btn" on:click={logout}>Logout</button>

    <div id="homescreen" class="flex flex-col items-center space-y-4 w-full h-screen px-20 pt-5">

        <div id="city-spotter-logo" class="w-80 h-55">
            <img alt="city-spotter-logo" src={logo}>
        </div>

        <div id="user-map-area" class="flex content-start space-x-10 w-full h-screen pt-5">

            <div id="map" class="bg-gray-800 w-[60%] h-[80%] pb-20 border rounded-md shadow-md">
            </div>
    
            <div id="user-area" class="flex flex-col space-y-2 max-h-max">
    
                <div>
                    <button id="btn-dashboard" on:click={() => {gotoDashboard()}} class="btn-primary">
                        See your stats
                    </button>
                </div>
    
                <div>
                    <button id="btn-dashboard" on:click={() => {gotoDashboard()}} class="btn-primary">
                        See your stats
                    </button>
                </div>
    
                <div>
                    <button id="btn-dashboard" on:click={() => {gotoDashboard()}} class="btn-primary">
                        See your stats
                    </button>
                </div>
    
            </div>

        </div>
    </div>
{/if} -->


<script>
    import logo from '$lib/assets/city-spotter-bg.png';
    import { isAuthenticated } from '../stores/auth';

    let authenticated = false;
    isAuthenticated.subscribe(value => {
        authenticated = value;
    });

    // Mocked collection data
    let collections = [
        { id: 1, name: "Collection 1" },
        { id: 2, name: "Collection 2" },
        { id: 3, name: "Collection 3" },
        { id: 4, name: "Collection 4" },
        { id: 5, name: "Collection 5" },
        { id: 6, name: "Collection 6" }
    ];

    let currentPage = 1;
    const itemsPerPage = 5;
    $: totalPages = Math.max(1, Math.ceil(collections.length / itemsPerPage));

    function nextPage() {
        if (currentPage < totalPages) currentPage++;
    }

    function prevPage() {
        if (currentPage > 1) currentPage--;
    }

    function editCollection(id) {
        console.log(`Edit collection with ID: ${id}`);
    }

    function deleteCollection(id) {
        console.log(`Delete collection with ID: ${id}`);
        collections = collections.filter(collection => collection.id !== id);

        if (currentPage > Math.ceil(collections.length / itemsPerPage)) {
            currentPage = Math.max(1, Math.ceil(collections.length / itemsPerPage));
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
    <!-- Logout Button -->
    <button class="logout-btn" on:click={logout}>Logout</button>

    <!-- Main Container -->
    <div class="container">

        <!-- Header -->
        <div class="header">
            <img alt="city-spotter-logo" src={logo} class="logo">
        </div>

        <!-- Main Content -->
        <div class="content">
            <div class="collections-header">
                <h2>My Collections</h2>
                <button id="btn-dashboard" on:click={() => {gotoDashboard()}} class="btn-primary">📊 View Statistics</button>
                <button id="btn-dashboard" class="btn-primary">+ New Collection</button>
            </div>

            {#each collections.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) as collection (collection.id)}
                <div class="collection-item">
                    <span>{collection.name}</span>
                    <div class="collection-buttons">
                        <button class="edit-btn" on:click={() => editCollection(collection.id)}>Edit</button>
                        <button class="delete-btn" on:click={() => deleteCollection(collection.id)}>Delete</button>
                        <button class="see-btn" on:click={() => seeCollection(collection.id)}>View</button>
                    </div>
                </div>
            {/each}
            
            {#if collections.length === 0}
                <p class="text-center text-gray-500">No collections available.</p>
            {/if}
        </div>

        <!-- Pagination Controls -->
        <div class="pagination">
            <button on:click={prevPage} disabled={currentPage === 1}>← Previous</button>
            <span>Page {currentPage} of {totalPages}</span>
            <button on:click={nextPage} disabled={currentPage === totalPages}>Next →</button>
        </div>
    </div>
{/if}
