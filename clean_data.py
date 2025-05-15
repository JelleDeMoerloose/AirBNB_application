import pandas as pd
import numpy as np
import csv

# --- Clean listings.csv, reading with latin-1 to capture Win1252 chars ---
listings_cols = [
    "id",
    "listing_url",
    "name",
    "summary",
    "description",
    "neighborhood_overview",
    "latitude",
    "longitude",
    "accommodates",
    "review_scores_rating",
]

# Read original with latin-1 so no byte gets dropped
listings = pd.read_csv(
    "./data/listings.csv",
    usecols=listings_cols,
    encoding="latin-1",  # <— change here
).replace({np.nan: None})

# (Optionally) normalize or strip invisible/control characters here…

# Write a *truly* UTF-8 file
listings.to_csv(
    "./data/listings_cleaned_subset.csv",
    index=False,
    encoding="utf-8",  # now safe
    quoting=csv.QUOTE_MINIMAL,
)

# --- Clean calendar.csv similarly ---
calendar = pd.read_csv(
    "./data/calendar.csv",
    usecols=["listing_id", "date", "available", "price"],
    encoding="latin-1",  # match above
).replace({np.nan: None})

calendar["price"] = (
    calendar["price"].str.replace(r"[\$,]", "", regex=True).astype(float)
)
calendar["available"] = calendar["available"].map({"t": True, "f": False})

calendar.to_csv(
    "./data/calendar_cleaned.csv",
    index=False,
    encoding="utf-8",
)

print("Data cleaning completed and saved to ./data/")
