🚀 TeamUp - College Team Collaboration Platform
A full-stack web application that helps college students find teammates for hackathons, projects, and coding competitions. Built with the MERN stack (MongoDB, Express.js, React, Node.js) and real-time chat features.

✨ Features
🤝 Team Finding
Create Posts - Post about your project and specify required roles/skills

Browse Opportunities - Filter posts by roles, skills, competition types

Interested System - Like posts to show interest with live count updates

Detailed Views - Beautiful popups with complete post details

💬 Real-Time Chat
One-to-One Messaging - WhatsApp-like chat interface

Online Status - See when users are online

Typing Indicators - Real-time typing notifications

Message Status - Sent, delivered, and read receipts

Conversation Management - Auto-create and manage conversations

👤 User Profiles
Complete Profiles - Skills, roles, bio, social links, resume

Profile Popups - Click any user avatar to view their profile

College Verification - Auto-verify using college email domains

Skill Management - Add and manage your skills and preferred roles

🎯 College-Focused
College-Only Access - Connect only with students from your college

Domain Verification - Automatic college domain detection

Campus Networking - Build your campus tech community

🛠️ Tech Stack
Frontend
React - Component-based UI framework

React Router - Client-side routing

Axios - HTTP client for API calls

Socket.IO Client - Real-time communication

Context API - State management

Backend
Node.js - Runtime environment

Express.js - Web framework

MongoDB - NoSQL database

Mongoose - MongoDB object modeling

JWT - Authentication tokens

Socket.IO - Real-time WebSocket communication

Cloudinary - File upload and management

bcryptjs - Password hashing

Create backend/.env file:

# Database
MONGODB_URI=mongodb://localhost:27017/teamup
# or for MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/teamup

# Authentication
JWT_SECRET=your_super_secret_jwt_key_change_in_production

# Cloudinary (File Uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Server
PORT=5000
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:3000

teamup/
├── 📂 backend/
│   ├── 📂 controllers/          # Business logic handlers
│   │   ├── authController.js    # Authentication logic
│   │   ├── postController.js    # Post CRUD operations
│   │   ├── userController.js    # User profile management
│   │   ├── messageController.js # Message handling
│   │   └── requestController.js # Team join requests
│   ├── 📂 models/               # MongoDB schemas
│   │   ├── User.js              # User model with college verification
│   │   ├── Post.js              # Post model with roles/skills
│   │   ├── Conversation.js      # Chat conversation model
│   │   ├── Message.js           # Message model with status tracking
│   │   ├── Team.js              # Team management
│   │   └── Notification.js      # Notification system
│   ├── 📂 routes/               # Express route definitions
│   │   ├── auth.js              # Authentication routes
│   │   ├── users.js             # User profile routes
│   │   ├── posts.js             # Post management routes
│   │   ├── messages.js          # Message API routes
│   │   └── requests.js          # Team request routes
│   ├── 📂 middleware/           # Custom middleware
│   │   └── auth.js              # JWT authentication middleware
│   ├── 📂 sockets/              # Socket.IO handlers
│   │   └── socketHandler.js     # Real-time chat implementation
│   ├── 📂 utils/                # Utility functions
│   │   └── cloudinary.js        # File upload utilities
│   ├── app.js                   # Express app configuration
│   └── package.json
│
├── 📂 frontend/
│   ├── 📂 components/           # React components
│   │   ├── 📂 auth/             # Authentication components
│   │   │   ├── Login.js         # Login form
│   │   │   └── Signup.js        # Registration form
│   │   ├── 📂 posts/            # Post-related components
│   │   │   ├── PostCard.js      # Individual post display
│   │   │   ├── PostList.js      # Posts list with filters
│   │   │   ├── CreatePost.js    # Post creation form
│   │   │   ├── InterestedButton.js # Like functionality
│   │   │   └── PostDetailsPopup.js # Post detail modal
│   │   ├── 📂 chat/             # Messaging components
│   │   │   ├── DMButton.js      # Direct message button
│   │   │   └── ChatModal.js     # Chat popup modal
│   │   ├── 📂 users/            # User profile components
│   │   │   ├── Profile.js       # Profile management
│   │   │   └── UserProfilePopup.js # User detail modal
│   │   └── 📂 common/           # Shared components
│   │       ├── Layout.js        # Main layout wrapper
│   │       ├── Header.js        # Navigation header
│   │       └── ProtectedRoute.js # Route protection
│   ├── 📂 contexts/             # React context providers
│   │   ├── AuthContext.js       # Authentication state
│   │   ├── ChatContext.js       # Chat functionality
│   │   └── RealChatContext.js   # Real-time messaging
│   ├── 📂 pages/                # Page components
│   │   ├── Home.js              # Landing page
│   │   ├── Dashboard.js         # User dashboard
│   │   └── Messages.js          # Chat interface
│   ├── 📂 services/             # API service layer
│   │   ├── api.js               # Main API configuration
│   │   └── messageService.js    # Message API functions
│   ├── App.js                   # Main App component
│   ├── index.js                 # React DOM rendering
│   ├── index.css                # Global styles
│   └── package.json
│
└── README.md
MongoDB (local or Atlas)

Cloudinary account (for file uploads)
🔧 API Documentation
Authentication Endpoints
POST /api/auth/signup
Create a new user account with college email verification.

Request Body:

json
{
  "name": "John Doe",
  "email": "john@college.edu",
  "password": "securepassword",
  "year": 2,
  "branch": "Computer Science"
}
Response:

json
{
  "message": "Account created successfully!",
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@college.edu",
    "year": 2,
    "branch": "Computer Science",
    "collegeDomain": "college.edu",
    "isVerified": true
  }
}
POST /api/auth/login
Authenticate user and return JWT token.

Request Body:

json
{
  "email": "john@college.edu",
  "password": "securepassword"
}
Posts Endpoints
GET /api/posts
Get all posts with filtering and pagination.

Query Parameters:

page - Page number (default: 1)

limit - Posts per page (default: 10)

role - Filter by required role

skill - Filter by skills

competitionType - Filter by type

sort - Sort by newest, expiring-soon, most-requested

search - Search in title and description

POST /api/posts
Create a new team post.

Request Body:

json
{
  "title": "Need React Developer for Hackathon",
  "description": "Looking for a frontend developer...",
  "competitionType": "hackathon",
  "requiredRoles": [
    {"role": "Frontend", "count": 2},
    {"role": "Designer", "count": 1}
  ],
  "requiredSkills": ["React", "JavaScript", "CSS"],
  "location": "Online",
  "expireAt": "2024-12-31T23:59:59.000Z"
}
POST /api/posts/:id/toggle-interest
Toggle interest in a post.

Response:

json
{
  "interestedCount": 5,
  "isInterested": true
}
Messaging Endpoints
GET /api/messages/conversations
Get all conversations for the current user.

GET /api/messages/conversation/:otherUserId
Get or create a conversation with another user.

POST /api/messages/send
Send a new message.

Request Body:

json
{
  "conversationId": "conversation_id",
  "receiverId": "user_id",
  "text": "Hello, I'm interested in your project!"
}
User Endpoints
GET /api/users/me
Get current user's profile.

PUT /api/users/me
Update user profile.

Request Body:

json
{
  "name": "John Doe",
  "year": 3,
  "branch": "Computer Science",
  "skills": ["React", "Node.js", "MongoDB"],
  "roles": ["Fullstack", "Backend"],
  "bio": "Passionate developer...",
  "linkedinUrl": "https://linkedin.com/in/johndoe",
  "githubUrl": "https://github.com/johndoe"
}
POST /api/users/me/avatar
Upload user avatar (multipart/form-data).

POST /api/users/me/resume
Upload user resume - PDF only (multipart/form-data).

💬 Real-Time Events
Socket.IO Events
Client to Server:
join_conversation - Join a conversation room

send_message - Send a new message

typing_start - Start typing indicator

typing_stop - Stop typing indicator

mark_message_read - Mark messages as read

Server to Client:
new_message - Receive new message

user_typing - Typing indicators

user_status - Online/offline status

conversation_updated - Conversation list updates

messages_read - Read receipts

🎨 UI Components Overview
PostCard Component
Displays post summary with roles and skills

Interactive interested button with live count

Direct message button to contact post creator

Clickable user profiles

View details popup trigger

Messages Component
Two-panel chat interface (conversations list + chat area)

Real-time message delivery

Online status indicators

Typing indicators

Message status (sent/delivered/read)

UserProfilePopup Component
Comprehensive user information display

Skills and roles visualization

Social links integration

Direct messaging access

Responsive modal design

🔒 Security Features
JWT-based authentication with secure token storage

College domain verification for user registration

Password hashing with bcryptjs

Rate limiting on authentication endpoints

CORS configuration for frontend-backend communication

Input validation and sanitization

File type validation for uploads

MongoDB injection prevention with Mongoose

📱 Responsive Design
The application is fully responsive and optimized for:

Desktop (1200px+): Full feature set with multi-column layouts

Tablet (768px - 1199px): Adapted layouts with maintained functionality

Mobile (< 768px): Single-column layouts with touch-friendly interfaces

🚀 Deployment
Backend Deployment (Heroku/Railway)
Set environment variables in deployment platform

Ensure MongoDB connection string is configured

Update CORS origins for production domain

Deploy from GitHub repository

Frontend Deployment (Netlify/Vercel)
Set build environment variables

Configure redirects for client-side routing

Update API URLs for production

Connect to GitHub for automatic deployments

Environment Variables for Production
env
# Backend
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
FRONTEND_URL=https://yourdomain.com

# Frontend
REACT_APP_API_URL=https://yourapi.domain.com/api
REACT_APP_SOCKET_URL=https://yourapi.domain.com
🐛 Troubleshooting
Common Issues
MongoDB Connection Failed

Check MongoDB URI in environment variables

Verify network connectivity to MongoDB instance

Ensure database user has correct permissions

Socket.IO Connection Issues

Verify Socket.IO URL configuration

Check CORS settings on backend

Ensure JWT token is being sent with socket connection

File Upload Failures

Verify Cloudinary configuration

Check file size and type restrictions

Ensure proper multipart/form-data encoding

Real-time Features Not Working

Check WebSocket support in browser

Verify Socket.IO server is running

Check network connectivity for WebSocket connections

Debug Mode
Enable detailed logging by setting NODE_ENV=development and check browser console for frontend debugging.

🤝 Contributing
We welcome contributions! Please see our Contributing Guidelines for details.

Fork the repository

Create a feature branch: git checkout -b feature/amazing-feature

Commit your changes: git commit -m 'Add amazing feature'

Push to the branch: git push origin feature/amazing-feature

Open a Pull Request

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments
College community for feedback and testing

Open source libraries that made this project possible

Inspiration from existing team collaboration platforms
