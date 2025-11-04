// Post routes
// Handles CRUD operations for posts

const express = require('express');
const Post = require('../models/Post');
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// File upload setup (disk storage)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = file.originalname.split('.').pop();
    cb(null, `${uniqueSuffix}.${ext}`);
  },
});

const upload = multer({ storage });

/**
 * POST /api/posts
 * Create a new post
 * Protected route - requires authentication
 * Body: { content }
 */
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { content } = req.body;

    // Validate input
    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Post content is required' });
    }

    // Create new post
    const post = await Post.create({
      userId: req.user._id,
      username: req.user.name,
      content: content.trim(),
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
    });

    res.status(201).json(post);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * GET /api/posts
 * Get all posts sorted by creation date (latest first)
 * Public route - no authentication required
 */
router.get('/', async (req, res) => {
  try {
    // Find all posts and sort by createdAt in descending order (newest first)
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Edit post content (owner only)
router.patch('/:id', protect, async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this post' });
    }
    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Post content is required' });
    }
    post.content = content.trim();
    await post.save();
    res.json(post);
  } catch (error) {
    console.error('Edit post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add a comment
router.post('/:id/comments', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Comment text is required' });
    }
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    post.comments.push({
      userId: req.user._id,
      username: req.user.name,
      text: text.trim(),
    });
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a comment (by comment owner or post owner)
router.delete('/:postId/comments/:commentId', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    const isPostOwner = post.userId.toString() === req.user._id.toString();
    const isCommentOwner = comment.userId.toString() === req.user._id.toString();
    if (!isPostOwner && !isCommentOwner) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }
    comment.remove();
    await post.save();
    res.json(post);
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * DELETE /api/posts/:id
 * Delete a post
 * Protected route - users can only delete their own posts
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check if post exists
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user owns the post
    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    // Delete the post
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * PUT /api/posts/:id/like
 * Like or unlike a post
 * Protected route - requires authentication
 */
router.put('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check if post exists
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user._id.toString();
    const likedByArray = post.likedBy.map(id => id.toString());

    // Check if user has already liked the post
    if (likedByArray.includes(userId)) {
      // Unlike: remove user from likedBy array and decrement likes
      post.likedBy = post.likedBy.filter(id => id.toString() !== userId);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      // Like: add user to likedBy array and increment likes
      post.likedBy.push(userId);
      post.likes += 1;
    }

    await post.save();
    res.json(post);
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * GET /api/posts/user/:userId
 * Get all posts by a specific user
 * Public route - no authentication required
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

