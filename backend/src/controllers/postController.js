const Post = require('../models/Post');
const Team = require('../models/Team');
const Notification = require('../models/Notification');

exports.createPost = async (req, res) => {
  try {
    const {
      title,
      description,
      competitionType,
      requiredRoles,
      requiredSkills,
      location,
      expireAt
    } = req.body;

    const post = new Post({
      title,
      description,
      competitionType,
      requiredRoles: JSON.parse(requiredRoles),
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : JSON.parse(requiredSkills || '[]'),
      location,
      expireAt: new Date(expireAt),
      creator: req.user._id,
      collegeDomain: req.user.collegeDomain
    });

    await post.save();

    // Create team for this post
    const team = new Team({
      postId: post._id,
      creator: req.user._id,
      members: [req.user._id],
      chatRoomId: `team_${post._id}`
    });

    await team.save();

    res.status(201).json({ post });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      skill,
      competitionType,
      year,
      branch,
      sort = 'newest',
      search
    } = req.query;

    const query = {
      collegeDomain: req.user.collegeDomain,
      status: 'open',
      expireAt: { $gt: new Date() }
    };

    // Apply filters
    if (role) {
      query['requiredRoles.role'] = role;
    }

    if (skill) {
      query.requiredSkills = { $in: [new RegExp(skill, 'i')] };
    }

    if (competitionType) {
      query.competitionType = competitionType;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    const sortOptions = {
      newest: { createdAt: -1 },
      'expiring-soon': { expireAt: 1 },
      'most-requested': { interestedCount: -1 }
    };

    const posts = await Post.find(query)
      .populate('creator', 'name avatarUrl year branch')
      .sort(sortOptions[sort] || sortOptions.newest)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('creator', 'name avatarUrl year branch skills roles linkedinUrl githubUrl resumeUrl')
      .populate('requests.userId', 'name avatarUrl year branch skills roles')
      .populate('members', 'name avatarUrl year branch');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user is from same college
    if (post.collegeDomain !== req.user.collegeDomain) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ post });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this post' });
    }

    const allowedUpdates = ['title', 'description', 'requiredRoles', 'requiredSkills', 'location', 'status'];
    const updates = req.body;

    allowedUpdates.forEach(update => {
      if (updates[update] !== undefined) {
        post[update] = updates[update];
      }
    });

    await post.save();
    res.json({ post });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    post.status = 'closed';
    await post.save();

    res.json({ message: 'Post closed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};