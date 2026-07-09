# CausalFunnel Analytics Dashboard

A small full-stack analytics application built for the **CausalFunnel Full Stack Engineer assignment**.

It tracks basic user interaction events on a demo storefront page, stores them in MongoDB, and visualizes them in a dashboard with **session timelines** and a **click heatmap**.

The goal of the project was to implement a simple end-to-end analytics flow covering **event tracking, backend ingestion, session aggregation, and frontend visualization**.

---

## Live Demo

* **Frontend:** https://causal-funnel-pi.vercel.app
* **Backend health check:** https://causalfunnel-v0cu.onrender.com/health

> **Note:** The backend is deployed on Render’s free tier, so the first request after inactivity may take a few seconds because of cold start.

---

## Assignment Coverage

This project implements the core requirements from the assignment.

### Event Tracking

* Tracks `page_view` events
* Tracks `click` events
* Stores a persistent `sessionId` in `localStorage`
* Sends event payloads to the backend API including:

  * `sessionId`
  * `eventType`
  * `pageUrl`
  * `timestamp`
  * `x` / `y` click coordinates for click events
  * `viewportWidth` / `viewportHeight`

### Backend APIs

* `POST /api/events` → receive and store events
* `GET /api/sessions` → list sessions with aggregated event counts
* `GET /api/sessions/:sessionId/events` → fetch ordered events for a session
* `GET /api/heatmap?pageUrl=...` → fetch click data for a page heatmap

### Dashboard

* Sessions list with event counts
* Ordered session timeline / user journey view
* Heatmap page selector
* Visual click heatmap rendered from tracked click positions

---

## Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS

### Backend

* Python
* Flask
* MongoEngine (ODM)
* Gunicorn (WSGI server)

### Database

* MongoDB / MongoDB Atlas

### Deployment

* Frontend: Vercel
* Backend: Render

### Local Development / Infrastructure

* Docker
* Docker Compose

---

## Project Structure

```text
CausalFunnel/
├── backend/
│   ├── app/
│   │   ├── controllers/
│   │   │   └── analytics_controller.py
│   │   ├── models/
│   │   │   └── event.py
│   │   ├── routes/
│   │   │   └── analytics_routes.py
│   │   ├── __init__.py
│   │   └── config.py
│   ├── run.py
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── HeatmapView.jsx
│   │   │   ├── SessionDetails.jsx
│   │   │   └── SessionsList.jsx
│   │   ├── utils/
│   │   │   └── analytics.js
│   │   ├── views/
│   │   │   ├── Dashboard.jsx
│   │   │   └── DemoPage.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml
└── README.md
```

---

# Architecture Overview

## 1) Tracking Layer

The frontend contains a lightweight client-side analytics tracker implemented in JavaScript.

It is responsible for:

* generating or reusing a `sessionId`
* sending a `page_view` event when the demo page is opened
* sending `click` events whenever the user clicks inside the tracked page
* attaching metadata such as timestamp, page URL, and viewport dimensions

### Session Handling

A session ID is stored in `localStorage` under a client-side key.
This means revisiting the page in the same browser continues the same session until local storage is cleared.

This is intentionally simple for the assignment and avoids adding cookie/session infrastructure that was not necessary for the scope of the exercise.

---

## 2) Backend API Layer

The Flask backend exposes a small analytics API for event ingestion and analytics retrieval. Routes are registered through a Blueprint and delegate to controller functions, mirroring a typical Express router/controller split.

### API Endpoints

#### `POST /api/events`

Stores an incoming analytics event.

**Example payload**

```json
{
  "sessionId": "session_abc123_1719240000000",
  "eventType": "click",
  "pageUrl": "/demo",
  "timestamp": "2026-06-24T18:20:00.000Z",
  "x": 681,
  "y": 324,
  "viewportWidth": 1536,
  "viewportHeight": 864
}
```

---

#### `GET /api/sessions`

Returns a list of sessions with aggregated metrics such as:

* total events
* page views
* clicks
* session start time
* session end time

This endpoint powers the dashboard’s sessions overview.

---

#### `GET /api/sessions/:sessionId/events`

Returns all events for a given session ordered by timestamp, allowing the frontend to render a session timeline / user journey view.

---

#### `GET /api/heatmap?pageUrl=/demo`

Returns click events for a page so the frontend can render a heatmap-like visualization.

---

## 3) Database Model

Events are stored in MongoDB using a structured `Event` document defined with MongoEngine.

### Event document shape

```json
{
  "sessionId": "session_abc123_1719240000000",
  "eventType": "click",
  "pageUrl": "/demo",
  "timestamp": "2026-06-24T18:20:00.000Z",
  "x": 681,
  "y": 324,
  "viewportWidth": 1536,
  "viewportHeight": 864
}
```

### Stored fields

Each event can include:

* `sessionId`
* `eventType`
* `pageUrl`
* `timestamp`
* `x`
* `y`
* `viewportWidth`
* `viewportHeight`

For `page_view` events, click coordinate fields are not required. This is enforced in the `Event` document's `clean()` validation hook, and again at the API layer before the document is saved.

### Indexed fields

The event collection is indexed for the main dashboard queries, such as:

* fetching a session timeline ordered by timestamp
* grouping / aggregating events by `sessionId`
* fetching click data for a specific page URL

---

## 4) Frontend Dashboard

The frontend contains two main user-facing areas:

### A) Demo Page

A simulated storefront page used to generate events.

It includes simple interactive elements such as:

* a product card
* CTA buttons like **Add to cart**, **Buy now**, and **Apply coupon**
* general click tracking across the page

This page exists mainly to produce realistic interaction data for the assignment.

---

### B) Dashboard

The dashboard has two primary views:

#### Sessions View

Displays:

* all tracked sessions
* total events, page views, and click counts per session
* session start/end information
* ordered event timeline for the selected session

This acts as a simple user journey / session inspection view.

#### Heatmap View

Displays:

* click activity for a selected page
* click points rendered visually over a simplified layout
* a quick view of interaction hotspots

The heatmap is intentionally lightweight and assignment-focused rather than a production-grade density map.

---

## How It Works

## 1) Event Tracking Flow

When a user opens the demo page:

1. the tracker generates or reuses a `sessionId`
2. a `page_view` event is sent to the backend
3. subsequent clicks on the page generate `click` events
4. each event is stored in MongoDB
5. the dashboard fetches aggregated session data and page click data through the analytics API

---

## 2) Session Aggregation

The sessions list is powered by a MongoDB aggregation pipeline (run via PyMongo's `aggregate()` on the underlying collection) that groups events by `sessionId` and computes:

* total number of events
* number of page views
* number of clicks
* earliest event timestamp
* latest event timestamp

This allows the frontend to show a concise session summary before drilling into the full event timeline.

---

## 3) Heatmap Rendering

For the heatmap view:

1. the frontend requests click data for a selected `pageUrl`
2. the backend returns click events for that page
3. the frontend plots click coordinates on a simplified layout
4. viewport dimensions can be used to normalize click positions across different screen sizes

This makes the heatmap more consistent than storing only raw click coordinates alone.

---

## Setup Instructions

## Prerequisites

Make sure you have the following installed if running locally without Docker:

* Python 3.12+ (or newer)
* pip
* Node.js 18+ (or newer), for the frontend
* npm
* MongoDB local instance **or** a MongoDB Atlas connection string

---

# Local Setup

## 1) Clone the repository

```bash
git clone <your-repository-url>
cd CausalFunnel
```

---

## 2) Backend setup

Go into the backend folder:

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file inside `backend/` with:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/causalfunnel_analytics
```

If using MongoDB Atlas, use your Atlas connection string instead:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/causalfunnel_analytics
```

Start the backend:

```bash
python run.py
```

> Run this from the `backend/` folder (not `backend/app/`) — `run.py` imports the `app` package relative to `backend/`.

The backend will run on:

```text
http://localhost:5000
```

---

## 3) Frontend setup

Open a second terminal and go into the frontend folder:

```bash
cd frontend
npm install
```

Create a `.env` file inside `frontend/` with:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

The frontend will run on:

```text
http://localhost:5173
```

---

# Running with Docker

A `docker-compose.yml` file is included for containerized local development.

## Start all services

From the repository root:

```bash
docker compose up --build
```

This starts:

* MongoDB
* Flask backend (served via Gunicorn)
* frontend app

### Default local ports

* Frontend: `http://localhost:5173`
* Backend: `http://localhost:5000`

---

# How to Use the App

## 1) Open the demo page

Go to the demo storefront page and click around on the interface:

* buttons
* product area
* empty areas on the page

This will generate:

* `page_view` events
* `click` events

---

## 2) Open the dashboard

Switch to the dashboard view.

### Sessions tab

* view tracked sessions
* select a session to inspect its ordered event timeline

### Heatmap tab

* choose a tracked page
* inspect click distribution visually

---

## API Summary

### `POST /api/events`

Stores a tracking event.

### `GET /api/sessions`

Returns sessions with aggregated counts.

### `GET /api/sessions/:sessionId/events`

Returns the event timeline for a session.

### `GET /api/heatmap?pageUrl=/demo`

Returns click coordinates for a page heatmap.

---

## Assumptions / Trade-offs

* Session identity is stored in `localStorage` for simplicity. This keeps repeat visits in the same browser under the same session until storage is cleared.
* Only two event types are tracked: `page_view` and `click`.
* The app uses a simulated storefront page to generate user interaction data for the assignment.
* The heatmap is a lightweight visual overlay rather than a production-grade density map.
* Viewport dimensions are stored with click events so click positions can be interpreted more consistently across different screen sizes.
* The backend uses MongoEngine's default lazy connection, with an explicit `ping` check on startup so a bad `MONGODB_URI` fails fast instead of surfacing on the first request.
* The backend is deployed on Render free tier, which may cause a short cold-start delay after inactivity.

---

## Possible Future Improvements

If this were extended beyond the assignment, some next improvements could be:

* automatic session expiry / inactivity-based session splitting
* support for additional event types such as scroll depth, button labels, form interactions, and route changes
* proper heatmap density aggregation instead of only visual click markers
* filtering by date range, page, or session attributes
* authentication and protected dashboard access
* analytics batching / retry queue on the client
* dashboard charts for top pages, click-through rates, and session funnels
* test coverage for the tracker, API routes, and aggregation logic

---

## Notes

This project was built specifically for the CausalFunnel Full Stack Engineer assignment to demonstrate:

* client-side event tracking
* API design for analytics ingestion and querying
* MongoDB-backed event storage
* dashboard visualization of session timelines and click behavior

The implementation is intentionally small in scope, but structured so it can be extended with richer analytics features if needed.