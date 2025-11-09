const Post = require('../models/Post');
const Notification = require('../models/Notification');

exports.sendJoinRequest = async (req, res) => {
  try {
    const { message } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user is already a member
    if (post.members.includes(req.user._id)) {
      return res.status(400).json({ error: 'You are already a member of this team' });
    }

    // Check if user has already sent a request
    const existingRequest = post.requests.find(
      request => request.userId.toString() === req.user._id.toString()
    );

    if (existingRequest) {
      return res.status(400).json({ error: 'You have already sent a request to join this team' });
    }

    // Add request
    await post.addRequest(req.user._id, message);

    // Create notification for post creator
    const notification = new Notification({
      userId: post.creator,
      type: 'join_request',
      title: 'New Join Request',
      message: `${req.user.name} wants to join your team "${post.title}"`,
      payload: {
        postId: post._id,
        requestId: post.requests[post.requests.length - 1]._id,
        requesterId: req.user._id
      }
    });

    await notification.save();

    res.json({ 
      request: post.requests[post.requests.length - 1],
      message: 'Join request sent successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getRequests = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('requests.userId', 'name avatarUrl year branch skills roles');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to view requests' });
    }

    res.json({ requests: post.requests });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.respondToRequest = async (req, res) => {
  try {
    const { status } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to respond to requests' });
    }

    await post.respondToRequest(req.params.requestId, status);

    // Get the request to find the user
    const request = post.requests.id(req.params.requestId);
    
    // Create notification for requester
    const notification = new Notification({
      userId: request.userId,
      type: status === 'accepted' ? 'request_accepted' : 'request_rejected',
      title: status === 'accepted' ? 'Request Accepted' : 'Request Declined',
      message: status === 'accepted' 
        ? `Your request to join "${post.title}" has been accepted!` 
        : `Your request to join "${post.title}" has been declined.`,
      payload: {
        postId: post._id,
        teamId: post._id // Same as post ID for simplicity
      }
    });

    await notification.save();

    res.json({ 
      message: `Request ${status} successfully`,
      post 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};