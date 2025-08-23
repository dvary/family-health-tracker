# 🏥 Life Vault

> **A comprehensive family health management platform** - Track health vitals, store medical reports, and maintain complete health histories for your entire family.

[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://www.docker.com/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?logo=postgresql)](https://www.postgresql.org/)

## ✨ Features

### 👨‍👩‍👧‍👦 Family Management
- **Multi-member profiles** - Create and manage profiles for all family members
- **Role-based access** - Admin and family member roles with appropriate permissions
- **Secure authentication** - JWT-based login system with password protection

### 📊 Health Tracking
- **Vital monitoring** - Track BP, blood sugar, oxygen levels, weight, temperature, heart rate
- **Trend analysis** - View historical data and health patterns
- **Smart notifications** - Get alerts for abnormal readings

### 📋 Medical Records
- **Document upload** - Store blood tests, X-rays, prescriptions, vaccinations
- **Secure storage** - Local file storage with AWS S3 ready integration
- **Easy retrieval** - Quick access to all medical documents

### 🎨 Modern Interface
- **Responsive design** - Works perfectly on desktop, tablet, and mobile
- **Beautiful UI** - Clean, intuitive interface built with React and Tailwind CSS
- **Mobile-first** - Optimized for mobile web app usage

## 🚀 Quick Start

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)
- Git

### 1. Clone & Deploy
```bash
# Clone the repository
git clone https://github.com/dvary/life-vault.git
cd life-vault

# Start all services
docker-compose up -d
```

### 2. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Database**: localhost:5432

### 3. Create Your First Account
1. Visit http://localhost:3000
2. Click "Create Family Account"
3. Fill in your family details
4. Start adding family members!

## 🛠️ Tech Stack

| Component | Technology | Version |
|-----------|------------|---------|
| **Frontend** | React + Tailwind CSS | 18+ |
| **Backend** | Node.js + Express | 18+ |
| **Database** | PostgreSQL | 15+ |
| **Authentication** | JWT + bcrypt | Latest |
| **Deployment** | Docker + Docker Compose | Latest |
| **File Storage** | Local (S3 ready) | - |

## 📁 Project Structure

```
life-vault/
├── 🐳 docker-compose.yml          # Main deployment configuration
├── 📁 backend/                    # Node.js API server
│   ├── 📁 config/                # Database & app configuration
│   ├── 📁 middleware/            # Auth & validation middleware
│   ├── 📁 routes/                # API endpoints
│   ├── 📁 database/              # Migration scripts
│   └── 🚀 server.js              # Main server entry point
├── 📁 frontend/                   # React application
│   ├── 📁 src/
│   │   ├── 📁 components/        # React components
│   │   ├── 📁 contexts/          # React contexts
│   │   └── 🎯 App.js             # Main app component
│   └── 📁 public/                # Static assets
├── 📁 database/                   # Database initialization
└── 📖 README.md                   # This file
```

## 🔧 Development

### Local Development Setup
```bash
# 1. Start database only
docker-compose up -d postgres

# 2. Backend development
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev

# 3. Frontend development
cd frontend
npm install
npm start
```

### Docker Commands
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Update & rebuild
docker-compose up -d --build

# Stop all services
docker-compose down

# Access containers
docker-compose exec backend sh
docker-compose exec postgres psql -U postgres -d family_health_tracker
```

## 🔌 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new family account |
| `POST` | `/api/auth/login` | User login |
| `GET` | `/api/auth/profile` | Get user profile |

### Family Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/family/members` | Get all family members |
| `POST` | `/api/family/members` | Add new family member |
| `PUT` | `/api/family/members/:id` | Update member details |
| `DELETE` | `/api/family/members/:id` | Delete family member |

### Health Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health/vitals/:memberId` | Get member vitals |
| `POST` | `/api/health/vitals` | Add new vital reading |
| `PUT` | `/api/health/vitals/:id` | Update vital reading |
| `DELETE` | `/api/health/vitals/:id` | Delete vital reading |

### Medical Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health/reports/:memberId` | Get member reports |
| `POST` | `/api/health/reports` | Upload medical report |
| `DELETE` | `/api/health/reports/:id` | Delete medical report |

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt encryption for all passwords
- **Input Validation** - Comprehensive validation and sanitization
- **CORS Protection** - Cross-origin request security
- **Role-based Access** - Admin and member permission levels
- **File Upload Security** - Safe document upload handling

## 🗄️ Database Schema

### Core Tables
- **`families`** - Family information and settings
- **`users`** - User accounts and authentication
- **`family_members`** - Individual family member profiles
- **`health_vitals`** - Vital measurements and readings
- **`medical_reports`** - Medical documents and metadata

### Key Relationships
- Each family can have multiple members
- Each member can have multiple vitals and reports
- Role-based access control for data visibility

## 🌐 Environment Configuration

### Backend Environment Variables
```env
# Database
DATABASE_URL=postgresql://postgres:password123@localhost:5432/family_health_tracker

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# CORS
CORS_ORIGIN=http://localhost:3000
```

## 🚀 Production Deployment

### 1. Environment Setup
```bash
# Copy and configure environment
cp .env.example .env
# Edit .env with production values
```

### 2. Deploy with Docker
```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up -d --build
```

### 3. AWS S3 Integration (Optional)
```bash
# Install AWS SDK
npm install aws-sdk

# Configure S3 credentials and bucket
# Update file upload logic in health routes
```

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# Run all tests
npm run test:all
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/dvary/life-vault/issues)
- **Documentation**: Check the [Wiki](https://github.com/dvary/life-vault/wiki)
- **Discussions**: [GitHub Discussions](https://github.com/dvary/life-vault/discussions)

## 🙏 Acknowledgments

- Built with ❤️ for families worldwide
- Powered by modern web technologies
- Designed for simplicity and security

---

**Made with ❤️ by the Life Vault Team**
