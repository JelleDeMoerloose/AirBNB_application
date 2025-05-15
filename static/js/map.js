// Initialize the map and set its center to Sydney's coordinates
const map = L.map('map').setView([-33.8688, 151.2093], 12); // Sydney lat/lon

// Tile layer from OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
}).addTo(map);

// Fetch Airbnb listings data from Flask API
fetch("/api/listings")
    .then(res => res.json())
    .then(data => {
        data.forEach(listing => {
            // Create a marker for each listing on the map
            const popupContent = `
            <div>
              <div class="listing-title">${listing.name}</div>
              <div class="listing-price">$${listing.price}</div>
              <div>ID: ${listing.id}</div>
            </div>
          `;

            // Add marker with popup
            L.marker([listing.lat, listing.lon])
                .addTo(map)
                .bindPopup(popupContent);
        });
    })
    .catch(error => console.error("Error fetching listings:", error));
