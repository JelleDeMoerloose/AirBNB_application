-- 1. Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Drop any existing tables
DROP TABLE IF EXISTS calendar;
DROP TABLE IF EXISTS listings;

-- 3. Create the final listings table (with a geometry column)
CREATE TABLE listings (
    id                      INT             PRIMARY KEY,
    listing_url             TEXT,
    name                    TEXT,
    summary                 TEXT,
    description             TEXT,
    neighborhood_overview   TEXT,
    latitude                DOUBLE PRECISION,
    longitude               DOUBLE PRECISION,
    accommodates            INT,
    review_scores_rating    DOUBLE PRECISION,
    geom                    GEOMETRY(Point, 4326)
);

-- 4. Create the final calendar table (no FK yet, composite PK)
CREATE TABLE calendar (
    listing_id  INT,
    date        DATE,
    available   BOOLEAN,
    price       DOUBLE PRECISION,
    PRIMARY KEY (listing_id, date)
);
SET CLIENT_ENCODING TO 'utf8';
-- 5. Bulk‐load CSV data into listings (no trailing semicolon!)COPY listings(id,listing_url,name,summary,description,neighborhood_overview,latitude,longitude,accommodates,review_scores_rating)
\copy listings(id,listing_url,name,summary,description,neighborhood_overview,latitude,longitude,accommodates,review_scores_rating) from 'C:\\Users\\Lolma\\Documents\\infoprojects\\Master\\HighDimTech\\Taak\\AirBNB_application\\data\\listings_cleaned_subset.csv' with (FORMAT CSV, HEADER)

\copy calendar(listing_id,date,available,price) from 'C:\\Users\\Lolma\\Documents\\infoprojects\\Master\\HighDimTech\\Taak\\AirBNB_application\\data\\calendar_cleaned.csv' with (FORMAT CSV, HEADER)


-- 7. Populate the PostGIS geometry column from lat/lon
UPDATE listings
SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- 8. Remove any calendar rows whose listing_id doesn’t exist
DELETE FROM calendar
WHERE listing_id NOT IN (SELECT id FROM listings);

-- 9. Add the foreign‐key constraint now that data is clean
ALTER TABLE calendar
ADD CONSTRAINT calendar_listing_id_fkey
FOREIGN KEY (listing_id) REFERENCES listings(id);

#delete items from dataset--> to bigg
DELETE FROM calendar
WHERE date < '2019-07-01' OR date > '2019-07-07';

#This reclaims space, updates statistics, and rebuilds indexes:
VACUUM FULL ANALYZE;
REINDEX TABLE calendar;
