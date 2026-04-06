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

OPENSKY_CLIENT_ID=your_opensky_id
OPENSKY_CLIENT_SECRET=your_opensky_secret

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=24air_radar

---

## 4. Setup the Database

Create the database in MySQL:

CREATE DATABASE 24air_radar;

Import the provided SQL schema file.

---

## 5. Start the Backend Server

First open command promt for the backend directory by:

Opening Command promt and running:

cd C:\Users\faiqi\Documents\Coding\VS Code Codes\Assignments\GU2 24Air Radar\Backend

Or
Right clicking the backend folder in file explorer and click Open in Terminal

Run the backend server:

npm run dev

---

## 6. Launch the Frontend

Click the link provided in the IDE Terminal

24Air Radar Server Running on http://localhost:5500 (click this link)
---

# Project Structure

24Air-Radar
├───node_modules
│   .config
│   .env
│   .gitignore
│   package-lock.json
│   package.json
│   readme.md
│   
├───public
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
    │       1775214541084-Screenshot 2026-02-27 200052.png
    │
    └───utils
            mailer.js

---

# Database Structure

(Add DB Structure)

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

---
