# AirBNB_application
Full stack project made in course INFS7205

# link data
https://www.kaggle.com/datasets/tylerx/sydney-airbnb-open-data
eerst omzetten naar UTF8 via online converter
COPY 36662
COPY 13381265
$ psql -h localhost -p 5433 -U postgres -d postgres

greatly reduced dataset:postgres=# select count(*) from calendar;
  count
---------
 1136491


 🐍 Flask (Python)
Pros:

Excellent for data-heavy, analytical, or geospatial applications.

Seamless integration with PostGIS using libraries like psycopg2 or SQLAlchemy.

Native support for data science and processing (NumPy, Pandas, GeoPandas).

Easier if you plan to do advanced spatial queries or machine learning.

Cons:

Slower at handling high-concurrency requests compared to Node.js.

Requires WSGI server (like Gunicorn) for production performance.

python -m venv venv
in cmd
venv\Scripts\activate
