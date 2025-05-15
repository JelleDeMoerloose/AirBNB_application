
# AIRBNB_APPLICATION

## 1. Project Overview
### Motivation
- What problem does this web application solve?
- Why is this application useful in a real-world scenario?

### Web Application Functions
- List the main functionalities of the web application.
- Describe how high-dimensional queries are used in the application.

---

## 2. Technology Stack
### Programming Languages & Frameworks
- Backend: (e.g., Python with Flask/Django, Node.js, Java Spring Boot)
- Frontend: (e.g., React, Vue.js, HTML/CSS/JavaScript)
- Database: (e.g., PostgreSQL with PostGIS)

### Packages & Dependencies
- List any third-party packages used (e.g., `psycopg2`, `SQLAlchemy`, `express`, `pg-promise`)
- Briefly describe the purpose of each package.
---

## 3. Setup Instructions
### Environment Setup
For example,
```bash
# Install required dependencies
npm install  # For Node.js projects
```

### Database Configuration
- **Database Schema**: Provide an overview of the database structure.
- **How to Initialize Database**:
  ```bash
  psql -U username -d database_name -f init.sql
  ```
- **How to Load Data**: e.g., from a csv file.
  ```sql
  COPY table_name FROM 'path/to/data.csv' DELIMITER ',' CSV HEADER;
  ```
- **Customization of the Data (if any)**: e.g., convert attribute to TIMESTAMP type

---

## 4. Code Structure
### Frontend
- Location of frontend code: e.g., `client/`
- Key frontend functions related to querying the database.

### Backend
- Location of backend code: e.g., `server.js`
- Key API endpoints and their descriptions.

### Database Connection
- Location of the code that connects the backend to the database (e.g., `.env`).
- Example of how the application connects to the database:
  ```bash
    DB_HOST=localhost
    DB_USER=postgres
    DB_PASSWORD=111111
    DB_NAME=my_spatial_db
    DB_PORT=5432
  ```
---

## 5. Queries Implemented
### Query 1: Search Listings Within a Rectangle
This query finds all listings that fall within a rectangular bounding box (based on the current zoom level in Leaflet), are available on a specific date, and match user-specified filters for minimum rating and maximum price.
Real-world application: Users can visually explore available Airbnb listings on a map and filter based on price and rating in their desired area of Sydney.

### Query 1: (SQL Query)
```sql
SELECT DISTINCT l.*
FROM listings l
JOIN calendar c ON l.id = c.listing_id
WHERE 
    l.geom && ST_MakeEnvelope(%s, %s, %s, %s, 4326)
    AND c.date = %s
    AND c.available = TRUE
    AND l.review_scores_rating >= %s
    AND c.price <= %s;
```
%s: Placeholders for query parameters, passed from the Flask backend.

ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326): Creates a bounding box for spatial filtering.

c.date = %s: Filters availability for one specific day.

c.available = TRUE: Ensures the listing is not booked.

review_scores_rating >= %s: Filters for listings with sufficient quality.

c.price <= %s: Filters for listings within budget.

### Query 1: Unexpected Value Handling
Input types are validated and converted (e.g., float for coordinates, date for c.date).

If any parameter is missing, Flask returns a 400 error with a helpful message.

If no results match, the frontend receives an empty list.

### Query 2: Find Closest Available Listings to a Selected One
Given a listing ID, this query returns the nearest available listings on a specific date, with filters for rating and price.
Real-world application: If a user's preferred listing is unavailable or not ideal, the app can suggest alternatives nearby with similar or better quality and price.

### Query 2: (SQL Query)
```sql
SELECT DISTINCT l.*
FROM listings l
JOIN calendar c ON l.id = c.listing_id
WHERE 
    l.geom && ST_MakeEnvelope(%s, %s, %s, %s, 4326)
    AND c.date = %s
    AND c.available = TRUE
    AND l.review_scores_rating >= %s
    AND c.price <= %s;
```
l1.id = %s: The reference listing.

ST_Distance(...): Computes geospatial distance between listings.

Other filters are identical to Query 1.
### Query 2: Unexpected Value Handling
Ensures that the reference_listing_id exists before querying.

Returns a 404-style message if the listing doesn’t exist or no matches are found.

Input types (e.g., date, float) are validated.

### Query 3: Average Price and Rating Per Neighborhood
This query calculates the average price, average review rating, and number of available listings within a user-defined bounding box on a specific date.
Allows users to compare different areas of a city based on pricing and quality — useful for heatmaps or neighborhood-level analysis.

### Query 3: (SQL Query)
```sql
SELECT DISTINCT l.*
FROM listings l
JOIN calendar c ON l.id = c.listing_id
WHERE 
    l.geom && ST_MakeEnvelope(%s, %s, %s, %s, 4326)
    AND c.date = %s
    AND c.available = TRUE
    AND l.review_scores_rating >= %s
    AND c.price <= %s;
```
%s: Parameters from frontend — min_longitude, min_latitude, max_longitude, max_latitude, and the date.

ST_MakeEnvelope(...): Filters listings to only those within the visible map area.

AVG, COUNT: Used to generate aggregate statistics.

ROUND: Rounds numeric output for cleaner presentation

### Query 3: Unexpected Value Handling
Returns null for averages if no listings are found.

Backend checks coordinate formats and date validity.

Empty result or 0 count is handled gracefully in the frontend.

## 6. How to Run the Application
```bash
# Start Backend Server
node server.js

# Start Frontend
cd client
npm start
```
- Any additional instructions for running or testing the application.

---

## 7. Port Usage
List the localhost port used by the backend and frontend. E.g.,
- Backend Port: 3000
- Frontend Port: 3001

## 8. UI Address
E.g., [https:\\localhost:3000](http://localhost:3000/)

## 9. Additional Notes
- Any assumptions made in the project.
- Acknowledgement to external resources (lib, packages, GPTs) or research papers.

---
### Note
You are welcome to explore the potential of this project using Large Language Models (LLMs) such as ChatGPT or LLM-powered applications (e.g., Cursor). However, DeepSeek and any applications supported by DeepSeek are **NOT allowed** for this project!
