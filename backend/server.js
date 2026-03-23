const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// Data file path
const dataFile = path.join(__dirname, 'movies.json');

// Initialize movies.json if doesn't exist
if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(dataFile, JSON.stringify([]));
}

console.log('✅ Server running on http://localhost:5000');
console.log('✅ Using JSON file storage');

// Helper: Read all movies
function getMovies() {
  const data = fs.readFileSync(dataFile, 'utf8');
  return JSON.parse(data);
}

// Helper: Save movies
function saveMovies(movies) {
  fs.writeFileSync(dataFile, JSON.stringify(movies, null, 2));
}

// GET /api/movies - Get all movies
app.get('/api/movies', (req, res) => {
  const movies = getMovies();
  res.json(movies);
});

// POST /api/movies - Create movie
app.post('/api/movies', (req, res) => {
  const { title, year, director, genre } = req.body;
  
  if (!title || !year) {
    return res.status(400).json({ error: 'Title and year required' });
  }
  
  const movies = getMovies();
  const newMovie = {
    _id: Date.now().toString(),
    title,
    year,
    director,
    genre: genre || [],
    createdAt: new Date()
  };
  
  movies.push(newMovie);
  saveMovies(movies);
  
  res.status(201).json({ message: 'Movie created', movie: newMovie });
});

// GET /api/movies/:id - Get single movie
app.get('/api/movies/:id', (req, res) => {
  const movies = getMovies();
  const movie = movies.find(m => m._id === req.params.id);
  
  if (!movie) {
    return res.status(404).json({ error: 'Movie not found' });
  }
  
  res.json(movie);
});

// PUT /api/movies/:id - Update movie
app.put('/api/movies/:id', (req, res) => {
  const { title, year, director, genre } = req.body;
  const movies = getMovies();
  const index = movies.findIndex(m => m._id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Movie not found' });
  }
  
  movies[index] = { ...movies[index], title, year, director, genre };
  saveMovies(movies);
  
  res.json({ message: 'Movie updated', movie: movies[index] });
});

// DELETE /api/movies/:id - Delete movie
app.delete('/api/movies/:id', (req, res) => {
  const movies = getMovies();
  const index = movies.findIndex(m => m._id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Movie not found' });
  }
  
  const deleted = movies.splice(index, 1);
  saveMovies(movies);
  
  res.json({ message: 'Movie deleted', movie: deleted[0] });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});