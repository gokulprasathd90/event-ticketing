# Event Ticketing Backend Server

A Node.js/Express server with MongoDB integration for the Event Ticketing application.

## 🚀 Features

- **User Authentication**: JWT-based authentication for users and organizers
- **Event Management**: CRUD operations for events with organizer permissions
- **Registration System**: Track event registrations and ticket sales
- **MongoDB Integration**: Robust data models with validation
- **RESTful API**: Clean, documented API endpoints
- **Security**: Password hashing, input validation, and JWT tokens

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## 🛠️ Installation

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Copy `config.env` to `.env`
   - Update MongoDB connection string
   - Set JWT secret

4. **Start MongoDB:**
   - Local: `mongod`
   - Or use MongoDB Atlas (cloud)

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `config.env`:

```env
MONGODB_URI=mongodb://localhost:27017/event-ticketing
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
NODE_ENV=development
```

### MongoDB Connection

- **Local MongoDB**: `mongodb://localhost:27017/event-ticketing`
- **MongoDB Atlas**: Use connection string from Atlas dashboard

## 🚀 Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will run on `http://localhost:5000`

## 📚 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /profile` - Get user profile
- `PUT /profile` - Update profile
- `PUT /change-password` - Change password

### Events (`/api/events`)
- `GET /` - Get all published events
- `GET /featured` - Get featured events
- `GET /:id` - Get single event
- `POST /` - Create event (organizer only)
- `PUT /:id` - Update event (organizer only)
- `DELETE /:id` - Delete event (organizer only)
- `GET /organizer/my-events` - Get organizer's events
- `GET /:id/stats` - Get event statistics

### Users (`/api/users`)
- `GET /profile` - Get user profile
- `PUT /profile` - Update profile
- `GET /registrations` - Get user registrations
- `GET /registrations/:id` - Get registration details
- `PUT /registrations/:id/cancel` - Cancel registration
- `GET /favorites` - Get favorite events
- `GET /dashboard` - Get user dashboard
- `GET /search-events` - Search events

## 🗄️ Database Models

### User
- Basic info (name, email, phone)
- Authentication (password, userType)
- Profile settings

### Event
- Event details (title, description, category)
- Venue information
- Date and time
- Ticket types and pricing
- Organizer reference

### Registration
- User and event references
- Ticket details
- Payment status
- Check-in information

## 🔐 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Express-validator middleware
- **Role-based Access**: Organizer vs User permissions
- **Data Sanitization**: MongoDB injection protection

## 🧪 Testing the API

### Test Endpoint
```bash
curl http://localhost:5000/api/test
```

### Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "userType": "user"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

## 📁 Project Structure

```
server/
├── models/          # MongoDB schemas
│   ├── User.js
│   ├── Event.js
│   └── Registration.js
├── routes/          # API endpoints
│   ├── auth.js
│   ├── events.js
│   └── users.js
├── server.js        # Main server file
├── package.json     # Dependencies
├── config.env       # Environment template
└── README.md        # This file
```

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check if MongoDB is running
   - Verify connection string in `.env`
   - Check network/firewall settings

2. **Port Already in Use**
   - Change PORT in `.env`
   - Kill existing process: `lsof -ti:5000 | xargs kill`

3. **JWT Token Issues**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Ensure proper Authorization header

### Logs

Check console output for detailed error messages and debugging information.

## 🔄 Next Steps

1. **Connect Frontend**: Update React app to use these API endpoints
2. **Add Payment Integration**: Stripe, PayPal, etc.
3. **Email Notifications**: Send confirmation emails
4. **File Uploads**: Event images and user avatars
5. **Real-time Updates**: WebSocket integration
6. **Analytics**: Event performance metrics

## 📞 Support

For issues or questions, check the console logs and ensure all dependencies are properly installed.

