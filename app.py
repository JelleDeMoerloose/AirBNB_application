from flask import Flask, render_template, jsonify, send_from_directory
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


if __name__ == "__main__":
    app.run(debug=True)
