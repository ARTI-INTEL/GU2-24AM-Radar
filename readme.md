# 24Air Radar

24Air Radar is a web-based aircraft tracking system that displays live air traffic on an interactive world map.
The system retrieves aircraft position data from the OpenSky Network API and visualizes it using Leaflet.js.

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


---

# System Requirements

To run the system locally you will need:

Node.js (v18 or later recommended)
MySQL Server
A modern web browser (Chrome, Edge, Firefox)

---

# Installation and Run

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

## 6. Open the Frontend

Click the link provided in the Terminal

24Air Radar Server Running on http://localhost:5500 (click this link)
---

## 7. Shutdown the Server

When your done you can then shut down the server.

Go into the Terminal and click Ctrl + C.

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

## Authentication
POST /api/auth/register
Registers a new user account. Body: { email, username, password }

POST /api/auth/login
Authenticates a user and returns a JWT token. Body: { email, password }

POST /api/auth/forgot-password
Sends a password reset link to the provided email. Body: { email }

POST /api/auth/reset-password
Resets the user's password using a valid reset token. Body: { token, newPassword }

## User
PATCH /api/user/password
Updates the authenticated user's password. Requires Bearer token. Body: { currentPassword, newPassword }

PATCH /api/user/avatar
Uploads and updates the authenticated user's profile picture. Requires Bearer token. Body: multipart/form-data { avatar: file }

## Aircraft
GET /api/aircraft?minLat=&maxLat=&minLon=&maxLon=
Returns all aircraft currently within the specified bounding box.

GET /api/aircraft/:icao/track
Returns the past position history of a specific aircraft by ICAO24 code.

## Airports
GET /api/airports?minLat=&maxLat=&minLon=&maxLon=
Returns all airports within the specified bounding box.

GET /api/airports/search?q=
Searches airports by name, city, IATA code, ICAO code, or country.

## Community
POST /api/community/post
Creates a new community post. Body: multipart/form-data { content, user_id, image (optional) }

GET /api/community/posts
Returns all community posts ordered by most recent.

POST /api/community/like
Likes a post. Body: { post_id, user_id }

POST /api/community/comment
Adds a comment to a post. Body: { post_id, user_id, comment }

GET /api/community/comments/:postId
Returns all comments for a specific post.

## System
GET /health
Returns the server and database connection status.

---

# Author

Name: Muhammad Faiq Imran
Organization: University Of Stirling
Last Updated: 07/04/2026

---
