from datetime import datetime
from flask import Flask, render_template, jsonify, request, send_from_directory
import psycopg2
from dotenv import load_dotenv
import os

# Load .env variables
load_dotenv()

app = Flask(__name__)

# Use environment variables
conn = psycopg2.connect(
    dbname=os.getenv("DB_NAME"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    host=os.getenv("DB_HOST"),
    port=os.getenv("DB_PORT"),
)


@app.route("/")
def map_view():
    return render_template("home.html")


@app.route("/api/listings")
def get_listings():
    cur = conn.cursor()
    cur.execute(
        """
        SELECT id, name, ST_X(geom), ST_Y(geom)
        FROM listings
        WHERE geom IS NOT NULL
        LIMIT 1000
    """
    )
    data = [
        {"id": row[0], "name": row[1], "lon": row[2], "lat": row[3]}
        for row in cur.fetchall()
    ]
    cur.close()
    return jsonify(data)


@app.route("/api/search_rectangle", methods=["GET"])
def search_rectangle():
    try:
        cur = conn.cursor()

        # 1. Parse & validate
        min_lat = float(request.args["min_lat"])
        min_lng = float(request.args["min_lng"])
        max_lat = float(request.args["max_lat"])
        max_lng = float(request.args["max_lng"])
        date_str = request.args["date"]
        min_rating = float(request.args.get("min_rating", 0))
        max_price = float(request.args.get("max_price", 1e9))

        # Validate date format
        try:
            search_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return jsonify({"error": "Invalid date format, expected YYYY-MM-DD"}), 400

        # 2. Prepare and execute query
        sql = """
        SELECT DISTINCT l.* , c.price
        FROM listings l
        JOIN calendar c ON l.id = c.listing_id
        WHERE 
            l.geom @ ST_MakeEnvelope(%s, %s, %s, %s, 4326)
            AND c.date = %s
            AND c.available = TRUE
            AND l.review_scores_rating >= %s
            AND c.price <= %s;
        """
        params = (
            min_lng,
            min_lat,
            max_lng,
            max_lat,
            search_date,
            min_rating,
            max_price,
        )
        cur.execute(sql, params)
        results = cur.fetchall()

        return jsonify(results), 200

    except KeyError as ke:
        # Missing required parameter
        return jsonify({"error": "Missing parameter", "parameter": str(ke)}), 400

    except ValueError as ve:
        # Invalid float conversion, etc.
        return jsonify({"error": "Invalid parameter type", "details": str(ve)}), 400

    except Exception as ex:
        # Catch-all for unexpected errors
        app.logger.exception("Unexpected error in search_rectangle")
        return jsonify({"error": "Internal server error", "details": str(ex)}), 500


@app.route("/api/nearest_higher/<int:ref_id>", methods=["GET"])
def nearest_higher(ref_id):
    try:
        # Step 1: Retrieve the reference listing's rating and geometry
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT review_scores_rating, geom
            FROM listings
            WHERE id = %s
        """,
            (ref_id,),
        )
        ref_listing = cursor.fetchone()
        if not ref_listing:
            return jsonify({"error": "Reference listing not found."}), 404

        ref_rating = ref_listing[0]
        ref_geom = ref_listing[1]

        # Step 2: Find the nearest listing with a higher rating
        cursor.execute(
            """
            SELECT
                id,
                listing_url,
                name,
                latitude,
                longitude,
                review_scores_rating,
                ST_Distance(%s::geography, geom::geography) AS distance_meters
            FROM listings
            WHERE
                id <> %s
                AND review_scores_rating > %s
            ORDER BY
                geom <-> %s
            LIMIT 1
        """,
            (ref_geom, ref_id, ref_rating, ref_geom),
        )
        nearest = cursor.fetchone()
        if not nearest:
            return jsonify({"error": "No higher-rated neighbor found."}), 404

        return jsonify(nearest)

    except Exception as e:
        app.logger.error(f"Error fetching nearest higher-rated listing: {e}")
        return jsonify({"error": "Internal server error."}), 500


if __name__ == "__main__":
    app.run(debug=True)
