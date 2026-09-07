# Movie Review Platform

A full-stack movie review platform where users can discover movies, view movie details, write and manage reviews, rate movies, and maintain a personal watchlist.

## Features

* User registration and login
* JWT-based authentication
* Secure password hashing
* Movie search and discovery
* Movie details and popular movies
* Create, read, update, and delete reviews
* Movie ratings
* Personal watchlist
* Protected API routes
* Responsive React frontend
* TMDB API integration

## Tech Stack

### Frontend

* React.js
* Vite
* Axios
* CSS / Tailwind CSS

### Backend

* Node.js
* Express.js
* REST APIs
* JWT
* bcrypt

### Database

* MongoDB
* Mongoose

### External API

* TMDB API

### Deployment

* Vercel
* Render
* MongoDB Atlas

## Architecture

```text
React + Vite
     |
     | Axios / REST API
     ↓
Node.js + Express
     |
     ├── JWT Authentication
     ├── User Management
     ├── Review Management
     ├── Watchlist
     |
     ├──────────────→ MongoDB Atlas
     |
     └──────────────→ TMDB API
```

## Authentication Flow

```text
User Login
    ↓
React Frontend
    ↓
POST /api/auth/login
    ↓
Express Controller
    ↓
Find User in MongoDB
    ↓
Compare Password using bcrypt
    ↓
Generate JWT
    ↓
Return Token
    ↓
Store Token in Frontend
```

For protected requests:

```text
React
  ↓
Authorization: Bearer <JWT>
  ↓
JWT Middleware
  ↓
Verify Token
  ↓
req.user
  ↓
Controller
  ↓
MongoDB
  ↓
Response
```

## Project Structure

```text
Movie-Review-Platform/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   ├── package.json
│   └── ...
│
└── backend/
    ├── controllers/
    ├── models/
    ├── routes/
    ├── middleware/
    ├── server.js
    └── package.json
```

## API Endpoints

### Authentication

| Method | Endpoint             | Description         |
| ------ | -------------------- | ------------------- |
| POST   | `/api/auth/register` | Register a new user |
| POST   | `/api/auth/login`    | Login user          |

### User

| Method | Endpoint             | Description                      |
| ------ | -------------------- | -------------------------------- |
| GET    | `/api/users/profile` | Get authenticated user's profile |

### Movies

| Method | Endpoint              | Description        |
| ------ | --------------------- | ------------------ |
| GET    | `/api/movies/popular` | Get popular movies |
| GET    | `/api/movies/search`  | Search movies      |
| GET    | `/api/movies/:id`     | Get movie details  |

### Reviews

| Method | Endpoint                | Description             |
| ------ | ----------------------- | ----------------------- |
| POST   | `/api/reviews`          | Create a review         |
| GET    | `/api/reviews/:movieId` | Get reviews for a movie |
| PUT    | `/api/reviews/:id`      | Update a review         |
| DELETE | `/api/reviews/:id`      | Delete a review         |

### Watchlist

| Method | Endpoint                  | Description                 |
| ------ | ------------------------- | --------------------------- |
| POST   | `/api/watchlist`          | Add movie to watchlist      |
| GET    | `/api/watchlist`          | Get user's watchlist        |
| DELETE | `/api/watchlist/:movieId` | Remove movie from watchlist |

## Environment Variables

### Backend

Create a `.env` file inside the `backend` directory:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
TMDB_API_KEY=your_tmdb_api_key
FRONTEND_URL=your_frontend_url
```

### Frontend

Create a `.env` file inside the `frontend` directory:

```env
VITE_API_URL=your_backend_url
```

Never commit `.env` files or API keys to GitHub.

## Installation

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd Movie-Review-Platform
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure backend environment variables

Create the backend `.env` file and add the required variables.

### 4. Start the backend

```bash
npm start
```

### 5. Install frontend dependencies

Open another terminal:

```bash
cd frontend
npm install
```

### 6. Start the frontend

```bash
npm run dev
```

The application will then be available locally through the Vite development server.

## Screenshots

### Home Page

![Home Page](screenshots/home.png)

### Movie Details

![Movie Details](screenshots/movie-details.png)

### Login

![Login](screenshots/login.png)

### Reviews

![Reviews](screenshots/reviews.png)

## Deployment

The frontend is deployed using **Vercel**, while the backend is deployed using **Render**.

```text
User
 ↓
Vercel
 ↓
React Frontend
 ↓
Render
 ↓
Node.js + Express API
 ↓
MongoDB Atlas / TMDB
```

## Security

* Passwords are hashed using bcrypt.
* Authentication is implemented using JWT.
* Protected routes require a valid JWT.
* Password fields are excluded when returning user profile information.
* API keys and database credentials are stored using environment variables.

## Future Improvements

* Social login
* Personalized movie recommendations
* Advanced filtering and sorting
* User profiles and activity history
* Pagination for reviews and movies
* Movie genres and advanced discovery
* Automated testing

## Author

**Dhanush S**
