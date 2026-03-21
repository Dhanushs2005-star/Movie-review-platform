const express = require('express');
const app = express();

app.use(express.json());

// Exercise 1: GET /api/hello
app.get('/api/hello', (req, res) => {
  // code...
});

// Exercise 2: GET /api/movies
app.get('/api/movies', (req, res) => {
  // code...
});

// Exercise 3: GET /api/movies/:id
app.get('/api/movies/:id', (req, res) => {
  // code...
});

// Exercise 4: POST /api/movies
app.post('/api/movies', (req, res) => {
  // code...
});

// Exercise 5: POST /api/movies/validate
app.post('/api/movies/validate', (req, res) => {
  // code...
});

// Exercise 6: GET /api/status/:code
app.get('/api/status/:code', (req, res) => {
  // code...
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});