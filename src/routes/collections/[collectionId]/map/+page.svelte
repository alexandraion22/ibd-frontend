<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  let map;
  let apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  let customPopup = null;
  let mapContainer;
  let addLocationUrl = `${import.meta.env.VITE_API_BASE_URL}/locations/create_location`;
  let collectionId = $page.params.collectionId;

  onMount(() => {
    loadGoogleMapsScript()
      .then(() => initMap())
      .catch(error => console.error('Error loading Google Maps API:', error));
  });

  function loadGoogleMapsScript() {
    return new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
      if (existingScript) {
        resolve();
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

    map = new google.maps.Map(document.getElementById('map'), {
      center: initialPosition,
      zoom: 12,
      clickableIcons: true,
      disableDefaultUI: false,
    });

    mapContainer = document.getElementById('map');

    map.addListener('click', async (event) => {
      const placeId = event.placeId;

      if (placeId) {
        event.stop();
        try {
          const placeInfo = await getPlaceDetails(placeId);
          displayCustomPopup(placeInfo, event);
        } catch (error) {
          console.error('Error fetching place details:', error);
        }
      }
    });
  }

  function getPlaceDetails(placeId) {
    return new Promise((resolve, reject) => {
      const service = new google.maps.places.PlacesService(map);

      const request = {
        placeId,
        fields: ['name', 'formatted_address', 'types', 'geometry', 'place_id'],
      };

      service.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          resolve({
            name: place.name || 'Unknown Place',
            address: place.formatted_address || 'No address available',
            type: place.types?.[0] || 'Unknown',
            coordinates: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            },
          });
        } else {
          reject('Failed to fetch place details');
        }
      });
    });
  }

  async function handleAddLocation(placeInfo) {
    let coordLat = placeInfo?.coordinates?.lat;
    let coordLng = placeInfo?.coordinates?.lng;
    let coords = coordLat + "-" + coordLng;
    coords = coords.replaceAll(".", "-");
    placeInfo.coordinates = coords;

    try {
      const response = await fetch(`${addLocationUrl}/${collectionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,
          },
        body: JSON.stringify(placeInfo),
      });

      if (!response.ok) {
        throw new Error('Failed to add location');
      }

      const result = await response.json();
      alert('Location added successfully!');
      if (customPopup) {
        customPopup.remove();
      }
    } catch (error) {
      console.error('Error adding location:', error);
      alert('Failed to add location. Please try again.');
    }
  }

  function displayCustomPopup(placeInfo, event) {
    if (customPopup) {
      customPopup.remove();
    }

    const { name, address, type, coordinates } = placeInfo;

    customPopup = document.createElement('div');
    customPopup.className = 'custom-popup';
    customPopup.innerHTML = `
      <div class="popup-content">
        <div class="popup-header">
          <h3>${name}</h3>
        </div>
        <div class="popup-body">
          <p><span>Location Type:</span> ${type}</p>
          <p><span>Coordinates:</span><br>${coordinates.lat.toFixed(5)}, ${coordinates.lng.toFixed(5)}</p>
        </div>
        <div class="popup-footer">
          <button class="add-button">Add Location</button>
        </div>
      </div>
    `;

    const containerRect = mapContainer.getBoundingClientRect();
    const x = event.domEvent.clientX - containerRect.left;
    const y = event.domEvent.clientY - containerRect.top;

    customPopup.style.left = `${x + 10}px`;
    customPopup.style.top = `${y - 10}px`;
    
    mapContainer.appendChild(customPopup);
    
    const addButton = customPopup.querySelector('.add-button');
    addButton.addEventListener('click', () => handleAddLocation(placeInfo));
    
    const closePopupHandler = (e) => {
      if (!customPopup.contains(e.target) && e.target !== customPopup) {
        customPopup.remove();
        document.removeEventListener('click', closePopupHandler);
      }
    };
    
    setTimeout(() => {
      document.addEventListener('click', closePopupHandler);
    }, 100);
  }
</script>

<style>
  #user-map-area {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100vh;
    padding: 1.25rem;
  }

  #map {
    width: 95%;
    height: 95%;
    background-color: #2d3748;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
    position: relative;
    overflow: hidden;
  }

  :global(.custom-popup) {
    position: absolute;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
    z-index: 9999;
    width: 220px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
  }

  :global(.popup-content) {
    color: #1a202c;
    font-size: 13px;
  }

  :global(.popup-header) {
    padding: 8px 12px;
    border-bottom: 1px solid #e2e8f0;
    background-color: #f8fafc;
  }

  :global(.popup-header h3) {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #2d3748;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  :global(.popup-body) {
    padding: 8px 12px;
  }

  :global(.popup-body p) {
    margin: 4px 0;
    line-height: 1.4;
    font-size: 12px;
  }

  :global(.popup-body p span) {
    font-weight: 600;
    color: #4a5568;
  }

  :global(.popup-footer) {
    padding: 8px 12px;
    border-top: 1px solid #e2e8f0;
    background-color: #f8fafc;
    display: flex;
    justify-content: flex-end;
  }

  :global(.add-button) {
    background-color: #4299e1;
    color: white;
    border: none;
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  :global(.add-button:hover) {
    background-color: #3182ce;
  }

  :global(.add-button:active) {
    background-color: #2b6cb0;
  }
</style>

<div id="user-map-area">
  <div id="map"></div>
</div>
