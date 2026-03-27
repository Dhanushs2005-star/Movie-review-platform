require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// ========== MONGODB CONNECTION ==========
console.log('🔄 Attempting MongoDB connection...');

const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error('❌ ERROR: MONGODB_URI not found in .env file');
  process.exit(1);
}

mongoose.connect(mongoURI, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
})
  .then(() => {
    console.log('✅ MongoDB connected successfully!');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:');
    console.error('Message:', err.message);
  });

// ========== SCHEMAS ==========

// Movie Schema
const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  year: { type: Number, required: true },
  director: String,
  genre: [String],
  userId: String,
  rating: Number,
  createdAt: { type: Date, default: Date.now }
});

const Movie = mongoose.model('Movie', movieSchema);

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// ========== REVIEW SCHEMA ==========
const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  text: {
    type: String,
    required: true
  },
  likes: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Review = mongoose.model('Review', reviewSchema);

// ========== MIDDLEWARE ==========

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

// ========== AUTH ROUTES ==========

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields required' });
    }
    
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Email or username already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });
    
    await newUser.save();
    
    res.status(201).json({
      message: 'User registered successfully',
      user: { _id: newUser._id, username, email }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: { _id: user._id, username: user.username, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/auth/me (Protected)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== MOVIE ROUTES ==========

// GET /api/movies
app.get('/api/movies', async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/movies (Protected)
app.post('/api/movies', authenticateToken, async (req, res) => {
  try {
    const { title, year, director, genre, rating } = req.body;
    
    if (!title || !year) {
      return res.status(400).json({ error: 'Title and year required' });
    }
    
    const newMovie = new Movie({
      title,
      year,
      director,
      genre: genre || [],
      rating: rating || 0,
      userId: req.user.userId
    });
    
    await newMovie.save();
    
    res.status(201).json({ message: 'Movie created', movie: newMovie });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/movies/:id
app.get('/api/movies/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    
    res.json(movie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/movies/:id
app.put('/api/movies/:id', async (req, res) => {
  try {
    const { title, year, director, genre, rating } = req.body;
    
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      { title, year, director, genre, rating },
      { new: true }
    );
    
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    
    res.json({ message: 'Movie updated', movie });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/movies/:id
app.delete('/api/movies/:id', async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    
    res.json({ message: 'Movie deleted', movie });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/reviews - Create review (Protected)
app.post('/api/reviews', authenticateToken, async (req, res) => {
  try {
    const { movieId, rating, text } = req.body;
    
    // Validate
    if (!movieId || !rating || !text) {
      return res.status(400).json({ error: 'movieId, rating, and text required' });
    }
    
    if (rating < 1 || rating > 10) {
      return res.status(400).json({ error: 'Rating must be between 1 and 10' });
    }
    
    // Check if movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    
    // Check if user already reviewed this movie
    const existingReview = await Review.findOne({
      userId: req.user.userId,
      movieId: movieId
    });
    
    if (existingReview) {
      return res.status(400).json({ error: 'You already reviewed this movie' });
    }
    
    // Create review
    const newReview = new Review({
      userId: req.user.userId,
      movieId: movieId,
      rating: rating,
      text: text
    });
    
    await newReview.save();
    
    // Populate user info
    await newReview.populate('userId', 'username');
    
    res.status(201).json({
      message: 'Review created',
      review: newReview
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== REVIEW ROUTES ==========

// POST /api/reviews - Create review (Protected)
app.post('/api/reviews', authenticateToken, async (req, res) => {
  try {
    const { movieId, rating, text } = req.body;
    
    // Validate
    if (!movieId || !rating || !text) {
      return res.status(400).json({ error: 'movieId, rating, and text required' });
    }
    
    if (rating < 1 || rating > 10) {
      return res.status(400).json({ error: 'Rating must be between 1 and 10' });
    }
    
    // Check if movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    
    // Check if user already reviewed this movie
    const existingReview = await Review.findOne({
      userId: req.user.userId,
      movieId: movieId
    });
    
    if (existingReview) {
      return res.status(400).json({ error: 'You already reviewed this movie' });
    }
    
    // Create review
    const newReview = new Review({
      userId: req.user.userId,
      movieId: movieId,
      rating: rating,
      text: text
    });
    
    await newReview.save();
    await newReview.populate('userId', 'username');
    
    res.status(201).json({
      message: 'Review created',
      review: newReview
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/reviews/movie/:movieId - Get all reviews for a movie
app.get('/api/reviews/movie/:movieId', async (req, res) => {
  try {
    const reviews = await Review.find({ movieId: req.params.movieId })
      .populate('userId', 'username')
      .sort({ createdAt: -1 });
    
    // Calculate average rating
    if (reviews.length === 0) {
      return res.json({
        reviews: [],
        averageRating: 0,
        totalReviews: 0
      });
    }
    
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = (sum / reviews.length).toFixed(1);
    
    res.json({
      reviews: reviews,
      averageRating: parseFloat(averageRating),
      totalReviews: reviews.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/reviews/:id - Get single review
app.get('/api/reviews/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('userId', 'username')
      .populate('movieId', 'title');
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/reviews/:id - Update review (Protected)
app.put('/api/reviews/:id', authenticateToken, async (req, res) => {
  try {
    const { rating, text } = req.body;
    
    // Find review
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    // Check if user owns review
    if (review.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'You can only update your own reviews' });
    }
    
    // Validate rating
    if (rating && (rating < 1 || rating > 10)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 10' });
    }
    
    // Update
    if (rating) review.rating = rating;
    if (text) review.text = text;
    
    await review.save();
    await review.populate('userId', 'username');
    
    res.json({
      message: 'Review updated',
      review: review
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/reviews/:id - Delete review (Protected)
app.delete('/api/reviews/:id', authenticateToken, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    // Check if user owns review
    if (review.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'You can only delete your own reviews' });
    }
    
    await Review.findByIdAndDelete(req.params.id);
    
    res.json({
      message: 'Review deleted',
      review: review
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// POST /api/reviews/:id/like - Like review
app.post('/api/reviews/:id/like', async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    ).populate('userId', 'username');
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    res.json({
      message: 'Review liked',
      review: review
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ MongoDB + Authentication enabled`);
});