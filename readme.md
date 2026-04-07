# 24Air Radar

24Air Radar is a web-based aircraft tracking system that displays live air traffic on an interactive world map.
The system retrieves aircraft position data from the OpenSky Network API and visualizes it using Leaflet.js.

This project was developed as part of the **HT8C 48 Software Development – Graded Unit 2 (GU2)** assessment.

---

# Project Overview

The purpose of the 24Air Radar system is to allow users to monitor aircraft movements across the world using an interactive map interface.

Users can view aircraft positions, inspect flight information, search for airports, and interact with map overlays to better understand air traffic.

The system demonstrates full-stack web development including frontend UI design, backend API integration, and database management.

---

# Features

• Live aircraft tracking using OpenSky API
• Interactive world map using Leaflet.js
• Aircraft position markers with information popups
• Airport search functionality
• Map filters and overlays (such as day/night view)
• User authentication system (login/register)
• User settings page
• Responsive UI for desktop and mobile devices
• Users can discuss aviation industry in our community page and post photos for other users to see.

---

# Technologies Used

## Frontend

HTML
CSS
JavaScript
Leaflet.js


## Backend

Node.js
Express.js
dotenv
mysql2
multer
nodemailer
bycrypt
multer


## Database

MySQL

## APIs

OpenSky Network API
Terminator Daynight Map API
Openweather Weather Map API
apitube News API

---

# System Requirements

To run the system locally you will need:

Node.js (v18 or later recommended)
MySQL Server
A modern web browser (Chrome, Edge, Firefox)

---

# Installation

## 1. Clone the Repository

git clone https://github.com/ARTI-INTEL/GU2-24Air-Radar

Navigate into the project folder:

cd 24air-radar

---

## 2. Install Backend Dependencies

Install dependencies:

npm install

---

## 3. Configure Environment Variables

Create a file called `.env` inside the backend folder.

Example configuration:

PORT=your port

DB_HOST=localhost
DB_USER=root
DB_PASSWORD='db password'
DB_NAME=db/schema name

JWT_SECRET=create a jwt secret here
JWT_EXPIRES_IN=7d

OPENSKY_CLIENT_ID=your api details here
OPENSKY_CLIENT_SECRET=your api details here

NEWS_API_KEY=your api details here

CORS_ORIGIN=http://127.0.0.1:(your port)

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your email
MAIL_PASS="your email pass"

RESET_LINK_BASE=http://localhost:(yourport)/html/newPW.html

---

## 4. Setup the Database

Create the database in MySQL:

Open the file database.sql in config folder:

'24Air Radar/config/database.sql'

copy the query in it and run it in your mysql database.

---

## 5. Start the Backend Server

First open command promt for the backend directory by:

Opening Command promt and running:

cd C:\Users\(user)\Downloads\GU2 24Air Radar

Or
Right clicking the Project folder in file explorer and click Open in Terminal

Run the server:

npm run dev

---

## 6. Launch the Frontend

Click the link provided in the IDE Terminal

24Air Radar Server Running on http://localhost:5500 (click this link)
---

# Project Structure

24Air-Radar
├───node_modules
│   .env
│   .gitignore
│   package-lock.json
│   package.json
│   readme.md
│   
├───config
│       database.sql
│       
├───logs
│       .gitkeep
│       2026-04-07-access.log
│       2026-04-07-app.log
│       
├───public
│   │   robots.txt
│   │   sitemap.xml
│   │   
│   ├───html
│   │       404.html
│   │       changePW.html
│   │       community.html
│   │       forgotPW.html
│   │       index.html
│   │       login.html
│   │       map.html
│   │       newPW.html
│   │       register.html
│   │       settings.html
│   │       
│   ├───images
│   │       airport.png
│   │       default-avatar.png
│   │       plane.png
│   │       
│   ├───scripts
│   │       community.js
│   │       map.js
│   │       script.js
│   │       
│   └───styles
│           index.css
│           style.css
│           
└───src
    │   db.js
    │   openskyToken.js
    │   server.js
    │   
    ├───jobs
    │       aircraftPoller.js
    │       newsPoller.js
    │       
    ├───middleware
    │       auth.middleware.js
    │       
    ├───routes
    │       aircraft.routes.js
    │       airports.routes.js
    │       auth.routes.js
    │       community.routes.js
    │       user.routes.js
    │       
    ├───uploads
    │       profile-img-1775503230023.jpeg
    │       
    └───utils
            logger.js
            mailer.js

---

# Database Structure

24airradar
│
├───aircraft_latest
│       icao24 (PK)
│       callsign
│       origin_country
│       latitude
│       longitude
│       baro_altitude
│       velocity
│       true_track
│       vertical_rate
│       on_ground
│       squawk
│       time_position
│       last_contact
│       updated_at
│
├───aircraft_positions
│       id (PK)
│       icao
│       time
│       lat
│       lon
│
├───airport
│       idAirport (PK)
│       Name
│       City
│       Country
│       IATA
│       ICAO
│       Longitude
│       latidude
│
├───comments
│       id (PK)
│       post_id
│       user_id
│       comment
│       created_at
│
├───news_cache
│       id (PK)
│       title
│       url
│       fetched_at
│
├───password_resets
│       id (PK)
│       user_id
│       token_hash
│       expires_at
│       used_at
│       created_at
│
├───posts
│       id (PK)
│       user_id
│       content
│       image_url
│       created_at
│
├───post_likes
│       id (PK)
│       post_id
│       user_id
│
└───user
        UserID (PK)
        UserEmail
        Username
        UserProfile
        Password

---

# API Endpoints

GET /api/aircraft
Returns aircraft positions currently tracked by the system.

GET /api/aircraft/:id
Returns detailed information about a specific aircraft.

POST /api/auth/login
Authenticates a user.

POST /api/auth/register
Creates a new user account.

(Add Community)
---

# Author

Name: Muhammad Faiq Imran
Organization: University Of Stirling
Last Updated: 07/04/2026

---
