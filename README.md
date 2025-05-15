
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
### Query 1: (Task Description)
- Describe the query task and its real-world application.

### Query 1: (SQL Query)
```sql
SELECT * FROM locations WHERE timestamp > NOW() - INTERVAL '1 day';
```
- Explanation of variables used in the query.

### Query 1: Unexpected Value Handling
- How does the query handle missing or incorrect values?

### Query 2 ...

---

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
