<script>
  import { onMount } from 'svelte';

  let map;
  let infoWindow;
  let apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  onMount(() => {
    loadGoogleMapsScript().then(() => {
      initMap();
    }).catch(error => {
      console.error('Error loading Google Maps API:', error);
    });
  });

  function loadGoogleMapsScript() {
    return new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
      if (existingScript) {
        resolve(); // Script already loaded
        return;
      }

      const mapScript = document.createElement('script');
      mapScript.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      mapScript.async = true;
      mapScript.defer = true;
      mapScript.onload = resolve;
      mapScript.onerror = reject;
      document.head.appendChild(mapScript);
    });
  }

  function initMap() {
    const initialPosition = { lat: 44.4268, lng: 26.1025 };

    // Initialize map
    map = new google.maps.Map(document.getElementById('map'), {
      center: initialPosition,
      zoom: 12,
    });

    // Initialize InfoWindow for displaying location details
    infoWindow = new google.maps.InfoWindow();

    // Add click listener to the map
    map.addListener('click', async (event) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();

      const placeInfo = await getPlaceInfo(lat, lng);
      displayInfoWindow(placeInfo, event.latLng);
    });
  }

  async function getPlaceInfo(lat, lng) {
    return new Promise((resolve, reject) => {
      const service = new google.maps.places.PlacesService(map);
      const location = { lat, lng };

      const request = {
        location,
        radius: 50,
      };

      service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
          const place = results[0]; 
          console.log(place)
          resolve({
            name: place.name,
            type: place.types?.[0] || 'Unknown',
            coordinates: { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() },
          });
        } else {
          resolve({
            name: 'Unknown Place',
            type: 'Unknown',
            coordinates: { lat, lng },
          });
        }
      });
    });
  }

  function displayInfoWindow(placeInfo, position) {
    const { name, type, coordinates } = placeInfo;

    const content = `
      <div>
        <h3>${name}</h3>
        <p><strong>Type:</strong> ${type}</p>
        <p><strong>Coordinates:</strong> ${coordinates.lat.toFixed(5)}, ${coordinates.lng.toFixed(5)}</p>
      </div>
    `;

    infoWindow.setContent(content);
    infoWindow.setPosition(position);
    infoWindow.open(map);
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
</style>

<div id="user-map-area">
  <div id="map"></div>
</div>
