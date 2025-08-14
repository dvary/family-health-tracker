# Family Health Tracker

A comprehensive multi-user health tracking application for families to monitor health vitals, upload medical reports, and maintain health history.

## 🐳 Docker Deployment

This application is designed to run entirely in Docker containers. All unnecessary files have been removed for a clean Docker-only deployment.

## Features

- **Family Accounts**: Create sub-profiles for each family member (Dad, Mom, Kids, Grandparents)
- **Health Vitals Tracking**: Monitor BP, blood sugar, oxygen levels, weight, temperature, heart rate
- **Medical Reports**: Upload and store blood tests, X-rays, prescriptions, vaccinations, consultations
- **Health History**: Generate comprehensive health history for each family member
- **Secure Authentication**: JWT-based login system
- **File Storage**: Local storage for medical reports (configurable for AWS S3)
- **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS

## Tech Stack

- **Frontend**: React + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Authentication**: JWT
- **File Storage**: Local storage (AWS S3 ready)
- **Deployment**: Docker + Docker Compose

## Quick Start

### Prerequisites
- Node.js (v16+)
- PostgreSQL
- Docker & Docker Compose

### Option 1: Docker Deployment (Recommended)

#### Quick Start (Development)
1. Clone the repository
2. Navigate to the project directory
3. Start all services with Docker Compose:
   ```bash
   docker-compose up -d
   ```
4. The application will be available at:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Database: localhost:5432

#### Automated Deployment
For easier deployment, use the provided deployment scripts:

**Linux/macOS:**
```bash
chmod +x deploy.sh
./deploy.sh
```

**Windows PowerShell:**
```powershell
.\deploy.ps1
```

#### Production Deployment
1. Create a `.env` file with production values:
   ```bash
   cp .env.example .env
   # Edit .env with secure production values
   ```

2. Deploy using production configuration:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

#### Docker Commands Reference
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart services
docker-compose restart

# Update services
docker-compose up -d --build

# View running containers
docker-compose ps

# Access container shell
docker-compose exec backend sh
docker-compose exec postgres psql -U postgres -d family_health_tracker
```

### Option 2: Development Setup

1. **Set up the database:**
   ```bash
   docker-compose up -d postgres
   ```

2. **Backend setup:**
   ```bash
   cd backend
   npm install
   cp env.example .env
   # Edit .env with your database credentials
   npm run migrate
   npm run dev
   ```

3. **Frontend setup:**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Project Structure

```
family-health-tracker/
├── backend/                 # Node.js + Express API
│   ├── config/             # Database configuration
│   ├── middleware/         # Authentication & error handling
│   ├── routes/             # API routes
│   ├── database/           # Migration scripts
│   └── server.js           # Main server file
├── frontend/               # React + Tailwind UI
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   └── App.js          # Main app component
│   └── public/             # Static files
├── database/               # Database initialization
├── docker-compose.yml      # Docker configuration
└── README.md              # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register family account
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get user profile

### Family Management
- `GET /api/family/members` - Get family members
- `POST /api/family/members` - Add family member
- `GET /api/family/members/:id` - Get specific member
- `PUT /api/family/members/:id` - Update member
- `DELETE /api/family/members/:id` - Delete member

### Health Vitals
- `GET /api/health/vitals/:memberId` - Get vitals
- `POST /api/health/vitals` - Add vital
- `PUT /api/health/vitals/:id` - Update vital
- `DELETE /api/health/vitals/:id` - Delete vital

### Medical Reports
- `GET /api/health/reports/:memberId` - Get reports
- `POST /api/health/reports` - Upload report
- `DELETE /api/health/reports/:id` - Delete report

### Health History
- `GET /api/health/history/:memberId` - Get health history

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://postgres:password123@localhost:5432/family_health_tracker
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
CORS_ORIGIN=http://localhost:3000
```

## Database Schema

The application uses PostgreSQL with the following main tables:

- **families**: Family information
- **users**: User accounts and authentication
- **family_members**: Individual family member profiles
- **health_vitals**: Health vital measurements
- **medical_reports**: Medical report files and metadata

## Features in Detail

### Family Management
- Create and manage family member profiles
- Assign relationships (Dad, Mom, Kids, Grandparents, etc.)
- Store basic information (name, date of birth, gender)

### Health Vitals Tracking
- Track multiple vital types: blood pressure, blood sugar, oxygen, weight, temperature, heart rate
- Record values with units and notes
- View historical trends and data

### Medical Reports
- Upload various medical documents (PDF, images, documents)
- Categorize reports by type (blood test, X-ray, prescription, etc.)
- Secure file storage with access control

### Health History
- Comprehensive health summaries
- Statistical analysis of vital trends
- Recent activity tracking

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- File upload security
- Family-based access control

## Development

### Running Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

### Code Quality
- ESLint configuration for both frontend and backend
- Prettier formatting
- Consistent code style

## Deployment

### Production Deployment
1. Update environment variables for production
2. Set up a production PostgreSQL database
3. Configure file storage (AWS S3 recommended for production)
4. Build and deploy using Docker Compose

### AWS S3 Integration
To use AWS S3 for file storage:
1. Install AWS SDK: `npm install aws-sdk`
2. Configure AWS credentials
3. Update file upload logic in health routes
4. Set up S3 bucket with appropriate permissions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT

## Support

For support and questions, please open an issue in the repository.
