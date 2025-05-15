// Initialize the map and set its center to Sydney's coordinates
const map = L.map('map').setView([-33.8688, 151.2093], 12); // Sydney lat/lon

// Tile layer from OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 30,
}).addTo(map);




function searchAndPlotListings(map, layerGroup) {
  // 1. Get the bounding box from the map
  const bounds = map.getBounds();
  const sw = bounds.getSouthWest(); // { lat, lng }
  const ne = bounds.getNorthEast();

  // 2. Read filter inputs
  const dateInput = document.getElementById('date').value;
  const minRating = parseFloat(document.getElementById('min_rating').value) || 0;
  const maxPrice = parseFloat(document.getElementById('max_price').value) || 1e9;

  // Basic validation
  if (!dateInput) {
    alert('Please select a date.');
    return;
  }

  // 3. Build query parameters
  const params = {
    min_lat: sw.lat,
    min_lng: sw.lng,
    max_lat: ne.lat,
    max_lng: ne.lng,
    date: dateInput,
    min_rating: minRating,
    max_price: maxPrice
  };
  console.log(bounds)

  const url = '/api/search_rectangle?' + new URLSearchParams(params).toString();

  // 4. Fetch and plot
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      return response.json();
    })
    .then(listings => {
      // Clear existing markers
      layerGroup.clearLayers();

      listings.forEach(listing => {
        const [
          id,
          listing_url,
          name,
          summary,
          description,
          neighborhood,
          latitude,
          longitude,
          accommodates,
          review_scores_rating,
          geom,
          price
        ] = listing;
        if (latitude && longitude) {
          const marker = L.marker([latitude, longitude]);
          marker.bindPopup(`
            <strong>${name}</strong><br/>
            Rating: ${review_scores_rating || 'N/A'}<br/>
            Price: $${price || 'N/A'}<br/>
            <a href="${listing_url}" target="_blank">View Listing</a>
          `);
          layerGroup.addLayer(marker);
        }
      });

      // Optionally, adjust map to fit the bounding box
      map.fitBounds(bounds);
    })
    .catch(err => {
      console.error(err);
      alert('Error fetching listings: ' + err.message);
    });
}
function highlightNearestHigher(refId, map, markerLayer) {
  fetch(`/api/nearest_higher/${refId}`)
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => { throw new Error(err.error); });
      }
      return response.json();
    })
    .then(data => {
      if (markerLayer) markerLayer.clearLayers();

      const redIcon = L.icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-red.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      const marker = L.marker([data.latitude, data.longitude], { icon: redIcon });
      marker.bindPopup(`
        <strong>${data.name}</strong><br/>
        Rating: ${data.review_scores_rating}<br/>
        Distance: ${Math.round(data.distance_meters)} m<br/>
        <a href="${data.listing_url}" target="_blank">View Listing</a>
      `);
      marker.addTo(markerLayer);
      map.setView([data.latitude, data.longitude], 15);
    })
    .catch(error => {
      console.error('Error fetching nearest higher-rated listing:', error);
      alert(error.message);
    });
}
// Example usage:
// Assume you have:
//   const map = L.map('map').setView([-33.8688, 151.2093], 12);
const markersLayer = L.layerGroup().addTo(map);
// And your inputs/popups already in the HTML:
document.getElementById('searchBtn').addEventListener('click', () => {
  searchAndPlotListings(map, markersLayer);
});