# Smart Parking System - MERN Stack

A comprehensive IoT-based smart parking system with camera-based license plate detection, automatic gate control, and billing management.

## Tools & Technologies Used

### Backend
- **Node.js** & **Express.js**: RESTful API server
- **MongoDB** & **Mongoose**: Database and ODM
- **JWT**: Authentication
- **Nodemailer**: Email notifications
- **bcryptjs**: Password hashing
- **dotenv**: Environment variable management
- **CORS**: Cross-origin resource sharing

### Frontend
- **React** (Vite): UI development
- **React Router**: Routing
- **Axios**: API requests
- **Radix UI**: Advanced UI components
- **Tailwind CSS**: Utility-first CSS framework
- **PostCSS**: CSS processing

### AI & Plate Detection
- **Python** (OpenCV, pytesseract, ultralytics): License plate recognition

### Configuration & Tooling
- **TypeScript**: Type safety (Next.js app)
- **Next.js**: SSR/SSG for dashboard
- **ESLint**: Linting
- **Nodemon**: Development server
- **Date-fns**: Date utilities

---

## Project Structure

```
smart-parking-system/
├── backend/                 # Node.js Express Server
│   ├── models/             # MongoDB Models
│   ├── routes/             # API Routes
│   ├── middleware/         # Authentication & Middleware
│   ├── scripts/            # Database Scripts
│   └── server.js           # Main Server File
└── frontend/               # React Frontend (Vite)
    ├── src/
    │   ├── components/     # React Components
    │   ├── pages/          # Page Components
    │   ├── context/        # React Context
    │   └── services/       # API Services
    └── public/
```

## Features

### 🚗 **Core Functionality**
- **License Plate Detection**: Camera-based vehicle identification
- **Automatic Gate Control**: Arduino-controlled entry/exit gates
- **Real-time Monitoring**: Live vehicle tracking and status
- **Billing System**: Automatic time-based billing calculation
- **Admin Dashboard**: Comprehensive management interface

### 🔐 **Authentication**
- JWT-based secure authentication
- Protected admin routes
- Session management

### 📊 **Dashboard Features**
- Real-time statistics (parked vehicles, entries, exits, revenue)
- Recent activity monitoring
- Vehicle search and filtering
- Historical data with CSV export

### 🏗 **Database Collections**

#### EntryVehicle Collection
\`\`\`javascript
{
  licensePlate: String,
  entryTime: Date,
  vehicleType: String,
  cameraId: String,
  imageUrl: String,
  status: String
}
\`\`\`

#### ExitVehicle Collection
\`\`\`javascript
{
  licensePlate: String,
  entryTime: Date,
  exitTime: Date,
  duration: String,
  totalMinutes: Number,
  amount: Number,
  vehicleType: String
}
\`\`\`

## Installation & Setup

### Backend Setup

1. **Navigate to backend directory**
   \`\`\`bash
   cd backend
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Configure environment variables**
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   \`\`\`

4. **Seed the database**
   \`\`\`bash
   npm run seed
   \`\`\`

5. **Start the server**
   \`\`\`bash
   npm run dev
   \`\`\`

### Frontend Setup

1. **Navigate to frontend directory**
   \`\`\`bash
   cd frontend
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Configure environment variables**
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your API URL
   \`\`\`

4. **Start the development server**
   \`\`\`bash
   npm start
   \`\`\`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/verify` - Verify JWT token
- `POST /api/auth/create-admin` - Create admin user

### Vehicles
- `GET /api/vehicles/current` - Get currently parked vehicles
- `GET /api/vehicles/history` - Get parking history
- `GET /api/vehicles/recent-entries` - Get recent entries
- `GET /api/vehicles/recent-exits` - Get recent exits
- `POST /api/vehicles/entry` - Record vehicle entry (IoT endpoint)
- `POST /api/vehicles/exit` - Record vehicle exit (IoT endpoint)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## IoT Integration

### For Hardware Team (Arduino/Camera Integration)

#### Vehicle Entry Endpoint
\`\`\`javascript
POST /api/vehicles/entry
Content-Type: application/json

{
  "licensePlate": "ABC123",
  "vehicleType": "Car",
  "cameraId": "CAM001",
  "imageUrl": "optional_image_url"
}
\`\`\`

#### Vehicle Exit Endpoint
\`\`\`javascript
POST /api/vehicles/exit
Content-Type: application/json

{
  "licensePlate": "ABC123",
  "cameraId": "CAM001",
  "imageUrl": "optional_image_url"
}
\`\`\`

### Response Format
\`\`\`javascript
{
  "success": true,
  "message": "Vehicle entry recorded successfully",
  "data": {
    "licensePlate": "ABC123",
    "entryTime": "2023-12-07T10:30:00.000Z",
    "vehicleType": "Car",
    "status": "parked"
  }
}
\`\`\`

## Billing Configuration

### Pricing Structure (per hour)
- **Car**: $5.00/hour
- **SUV**: $6.00/hour  
- **Motorcycle**: $3.00/hour
- **Truck**: $8.00/hour

### Calculation Logic
- Duration is calculated from entry to exit time
- Billing is rounded up to the nearest hour
- Minimum charge is 1 hour

## Default Credentials

**Admin Login:**
- Username: `admin`
- Password: `admin123`

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React** - UI library
- **React Router** - Routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling

## Development Commands

### Backend
\`\`\`bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
npm run seed     # Seed database with sample data
\`\`\`

### Frontend
\`\`\`bash
npm start        # Start development server
npm run build    # Build for production
npm test         # Run tests
\`\`\`

## Production Deployment

### Environment Variables
Ensure these are set in production:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Strong JWT secret key
- `NODE_ENV=production`
- `PORT` - Server port (default: 5000)

### Security Considerations
- Change default admin credentials
- Use strong JWT secrets
- Enable HTTPS in production
- Implement rate limiting
- Add input validation and sanitization

## Team Integration

### For AI/Image Processing Team
- Use the vehicle entry/exit endpoints to send license plate data
- Include confidence scores and image URLs in requests
- Handle API errors gracefully

### For Hardware/IoT Team
- Arduino gate control should trigger after successful API calls
- Implement retry logic for network failures
- Consider offline mode for network outages

## Contributing

1. Create feature branches from `main`
2. Follow existing code style and conventions
3. Add tests for new features
4. Update documentation as needed
5. Submit pull requests for review