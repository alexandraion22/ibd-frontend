<script>
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
{/if}
