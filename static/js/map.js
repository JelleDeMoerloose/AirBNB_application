// Initialize the map and set its center to Sydney's coordinates
const map = L.map('map').setView([-33.8688, 151.2093], 12); // Sydney lat/lon

// Tile layer from OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 30,
}).addTo(map);

const markersLayer = L.layerGroup().addTo(map);




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
             <button id="nearestBtn-${id}">Find Nearest Higher</button>
          `);
          marker.on('popupopen', function () {
            const button = document.getElementById(`nearestBtn-${id}`);
            if (button) {
              button.addEventListener('click', function () {
                highlightNearestHigher(id);
              });
            }
          });
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
function highlightNearestHigher(refId) {
  fetch(`/api/nearest_higher/${refId}`)
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => { throw new Error(err.error); });
      }
      return response.json();
    })
    .then(data => {
      console.log(data)

      const [
        id,
        listing_url,
        name,
        latitude,
        longitude,
        review_scores_rating,
        distance
      ] = data;

      const marker = L.marker([latitude, longitude]);
      marker.bindPopup(`
        <strong>${name}</strong><br/>
        Rating: ${review_scores_rating}<br/>
        Distance: ${Math.round(distance)} m<br/>
        <a href="${listing_url}" target="_blank">View Listing</a>
         <button id="nearestBtn-${id}">Find Nearest Higher</button>
      `);
      marker.on('popupopen', function () {
        const button = document.getElementById(`nearestBtn-${id}`);
        if (button) {
          button.addEventListener('click', function () {
            highlightNearestHigher(id);
          });
        }
      });
      markersLayer.clearLayers();
      marker.addTo(markersLayer);
      map.setView([latitude, longitude], 15);
    })
    .catch(error => {
      console.error('Error fetching nearest higher-rated listing:', error);
      alert(error.message);
    });
}
function fetchStats() {
  // 1. Get the current map bounds
  const bounds = map.getBounds();
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();


  // 3. Build query parameters
  const params = new URLSearchParams({
    min_lat: sw.lat.toString(),
    min_lng: sw.lng.toString(),
    max_lat: ne.lat.toString(),
    max_lng: ne.lng.toString(),
  });

  // 4. Perform the API call
  fetch(`/api/stats?${params.toString()}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      // 5. Handle the response data
      console.log('Average Rating:', data.avg_rating);
      console.log('Listing Count:', data.listing_count);

      // Update your UI here with the fetched data
      document.getElementById("avgRating").innerHTML = data.avg_rating
      document.getElementById("listingCount").innerHTML = data.listing_count
    })
    .catch(error => {
      console.error('Failed to fetch stats:', error);
    });
}


// Example usage:
// Assume you have:
//   const map = L.map('map').setView([-33.8688, 151.2093], 12);
// And your inputs/popups already in the HTML:
document.getElementById('searchBtn').addEventListener('click', () => {
  searchAndPlotListings(map, markersLayer);
})
document.getElementById('refreshStatsBtn').addEventListener('click', () => {
  fetchStats();
})