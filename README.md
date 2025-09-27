<div align="center">
  
  <!-- Logo placeholder - you can replace this with your actual logo -->
  <img src="./public/images/cohesion_logo.png" alt="Cohesion Logo" width="200"/>
  
  # 🎯 Cohesion - Advanced CBT Quiz Platform
  
  *Building Knowledge Through Connected Learning & Intelligent Assessment*
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Node.js](https://img.shields.io/badge/Node.js-16.0%2B-green.svg)](https://nodejs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Database-green.svg)](https://www.mongodb.com/)
  [![Express.js](https://img.shields.io/badge/Express.js-Framework-lightgrey.svg)](https://expressjs.com/)
  [![Live Demo](https://img.shields.io/badge/Live%20Demo-Available-brightgreen.svg)](https://cohesion-quizapp.onrender.com/)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/Nortcele7/CBT-Quiz-App/pulls)
  [![GitHub stars](https://img.shields.io/github/stars/Nortcele7/CBT-Quiz-App.svg)](https://github.com/Nortcele7/CBT-Quiz-App/stargazers)
  
  ## 🌐 Live Demo & Production Access
  
  **[🚀 Launch Cohesion →](https://cohesion-quizapp.onrender.com/)**
  
  Experience the full power of Cohesion without any setup! The live demo is hosted on Render with full production features.
  
  ### 🎮 Quick Demo Access:
  - 🎓 **Students**: Register with your email → Get OTP verification → Start taking quizzes
  - 👨‍🏫 **Educators**: Use `admin@gmail.com` for instant admin access and question management
  - 📧 **OTP System**: Full email verification with secure OTP delivery
  - ⚡ **Real-time**: Live question selection with ordered distribution algorithm
  
</div>

---

## 🎯 About Cohesion

**Cohesion** is a next-generation Computer-Based Testing (CBT) platform engineered with the MEN stack (MongoDB, Express.js, Node.js). Built for educational institutions, training centers, and organizations requiring robust assessment solutions, Cohesion delivers enterprise-grade features with intuitive user experience.

### 🌟 Why Choose Cohesion?

Cohesion represents the perfect synthesis of academic rigor and technological innovation. Our platform transforms traditional testing methodologies into engaging, data-driven assessment experiences that scale from individual learners to institutional deployments.

**🚀 Production-Ready Features:**
- 🔐 **Enterprise Security**: JWT + bcrypt authentication with OTP email verification
- 📊 **Advanced Analytics**: Real-time scoring with intelligent question distribution
- 🎨 **Responsive Design**: Modern UI with cross-device compatibility  
- � **Email Integration**: Automated OTP delivery with Gmail SMTP
- 📁 **Scalable Operations**: Bulk question import/export with JSON support
- 🎯 **Smart Distribution**: Ordered question selection across multiple subjects
- 📈 **Performance Tracking**: Comprehensive result analytics and feedback systems

### 🔥 Latest Updates (v2.0)

- ✅ **OTP Email Verification**: Secure user registration with email confirmation
- ✅ **Ordered Question Selection**: Intelligent distribution across subjects (English → Chemistry → Physics → Mathematics)
- ✅ **Enhanced Error Handling**: Production-ready error management and user feedback
- ✅ **Session Management**: Improved session handling with extended timeouts
- ✅ **Debug Tools**: Built-in diagnostic routes for deployment troubleshooting
- ✅ **Production Deployment**: Full Render.com compatibility with environment variable support

## ✨ Features

### 🔐 Advanced Authentication & Security
- **Multi-Step Registration**: Secure signup with email OTP verification
- **Password Security**: bcrypt hashing with salt rounds for maximum protection
- **JWT Authentication**: Stateless token-based authentication system
- **Session Management**: Secure session handling with configurable timeouts
- **Role-based Access Control**: Granular permissions for admin and user roles
- **Email Verification**: Gmail SMTP integration for secure OTP delivery
- **Production Security**: Environment variable protection and secure cookie handling

### 👨‍🏫 Admin Capabilities
- **Dual Question Management**:
  - 📝 **Manual Creation**: Add questions one by one via intuitive forms
  - 📤 **Bulk Upload**: Import questions from JSON files for efficiency
- **Admin Dashboard**: Centralized control panel for all operations

### 🎓 Enhanced Student Experience
- **Secure Registration**: Email verification with OTP before quiz access
- **Intelligent Test Generation**: 100 questions distributed across subjects in ordered fashion:
  - **1-Mark Questions (Q1-60)**: English (12) → Chemistry (14) → Physics (14) → Mathematics (20)
  - **2-Mark Questions (Q61-100)**: English (4) → Chemistry (8) → Physics (13) → Mathematics (15)
- **Interactive Quiz Interface**: Clean, distraction-free testing environment
- **Real-time Progress**: Live question navigation with attempt tracking
- **Instant Results**: Comprehensive performance analytics upon completion

### 📊 Advanced Scoring System
- **Intelligent Calculation**: Each question is scored as follows:
  - ✅ **Correct**: Full marks awarded
  - ❌ **Incorrect**: Negative marks deducted (configurable)
  - ⏸️ **Unanswered**: Zero points (no penalty)
- **Comprehensive Results**: 
  - Total points vs. possible points
  - Per-question breakdown with visual indicators
  - Color-coded answer feedback (Green: Correct, Red: Incorrect, Gray: Unanswered)

### 🎨 User Interface
- **Modern Design**: Built with TailwindCSS for responsive, mobile-friendly experience
- **EJS Templating**: Dynamic content rendering for personalized user experience

## 🏗️ System Architecture

### 📁 Project Structure

```
cohesion/
├── 📄 app.js                    # Main application server with routing
├── 📦 package.json              # Dependencies and npm scripts
├── 🔧 .env                      # Environment variables (not in repo)
├── � .env.example              # Environment template
├── �🗂️ models/
│   ├── 👤 user.js               # User schema with OTP fields
│   └── ❓ questions.js          # Question schema with subject categorization
├── 🎨 public/                   # Static assets (CSS, JS, images)
├── 🛡️ middleware/
│   └── auth.js                  # JWT authentication middleware
├── 👀 views/                    # EJS templates
│   ├── 📝 register.ejs          # User registration with validation
│   ├── 📧 verify-otp.ejs        # OTP verification interface
│   ├── 🔐 login.ejs             # Secure login interface
│   ├── 🏠 admin_landing_page.ejs # Admin dashboard
│   ├── 🎯 loggedin.ejs          # Interactive quiz interface
│   └── 📊 result.ejs            # Comprehensive results analytics
└── 📚 Documentation/
    ├── 🔧 OTP_TROUBLESHOOTING.md # Deployment troubleshooting guide
    └── � README.md             # This comprehensive guide
```

### 🔧 Technical Architecture

```mermaid
graph TB
    A[Client Browser] -->|HTTPS| B[Express.js Server]
    B -->|Authentication| C[JWT Middleware]
    B -->|Sessions| D[Express Session Store]
    B -->|Email| E[Nodemailer + Gmail SMTP]
    B -->|Database| F[MongoDB Atlas]
    
    F --> G[Users Collection]
    F --> H[Questions Collection]
    
    G -->|Fields| I[username, email, password, otp, otpExpiry, verified]
    H -->|Fields| J[question, options, subject, marks, correctAnswer]
    
    B -->|Routing| K[Public Routes]
    B -->|Routing| L[Protected Routes]
    
    K --> M[/, /register, /login, /verify-otp]
    L --> N[/questions, /admin, /results]
```

### 🚀 Deployment Architecture

**Production Environment: Render.com**
- **Web Service**: Auto-deployed from GitHub main branch
- **Database**: MongoDB Atlas cluster with SSL
- **Email Service**: Gmail SMTP with app-specific passwords
- **Environment Variables**: Secure config management
- **SSL/TLS**: Automatic HTTPS with Render's built-in certificates

## 🚀 Quick Start Guide

### 🌐 **Option 1: Try the Live Demo (Recommended)**

**[🔗 Launch Cohesion →](https://cohesion-quizapp.onrender.com/)**

Experience the full production environment with zero setup:
- **Students**: Complete registration with OTP verification → Take 100-question quiz
- **Educators**: Use `admin@gmail.com` for instant admin access and question management
- **Full Features**: All production features including email verification and intelligent question distribution

---

### 💻 **Option 2: Local Development Setup**

Perfect for developers, contributors, or organizations wanting custom deployments.

#### 📋 Prerequisites
- **Node.js** (v16.0 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (local or cloud) - [MongoDB Atlas](https://www.mongodb.com/atlas) recommended
- **Gmail Account** (for OTP email service) - [Setup App Password](https://support.google.com/accounts/answer/185833)
- **Git** - [Download here](https://git-scm.com/)

#### 🛠️ Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Nortcele7/CBT-Quiz-App.git
   cd CBT-Quiz-App
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env with your configuration
   nano .env  # or use your preferred editor
   ```

4. **Configure Environment Variables**
   ```env
   # MongoDB Connection
   MONGO_URI=mongodb://localhost:27017/cohesion_db
   # Or use MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/cohesion_db
   
   # Application Settings
   PORT=5000
   NODE_ENV=development
   
   # Email Configuration (for OTP)
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-app-specific-password
   
   # Security
   JWT_SECRET=your-super-secret-jwt-key
   SESSION_SECRET=your-session-secret-key
   ```

5. **Setup Gmail for OTP (Required)**
   ```bash
   # 1. Enable 2-Factor Authentication on your Gmail
   # 2. Generate App Password:
   #    - Google Account → Security → 2-Step Verification → App Passwords
   #    - Generate password for "Mail"
   #    - Use this 16-character password in EMAIL_PASS
   ```

6. **Initialize Database (Optional)**
   ```bash
   # The app will create collections automatically
   # But you can seed with sample questions:
   node scripts/seedQuestions.js  # If you create this script
   ```

7. **Start the application**
   ```bash
   # Development mode
   npm start
   # or
   node app.js
   
   # With auto-restart (if you have nodemon installed globally)
   nodemon app.js
   ```

8. **Access the application**
   ```
   🌐 Frontend: http://localhost:5000
   📧 Test OTP: http://localhost:5000/debug-email
   🧪 Test Email: http://localhost:5000/test-email?email=test@example.com
   📊 Session Debug: http://localhost:5000/debug-session
   ```

#### 🔧 Development Tools

```bash
# Install development dependencies (optional)
npm install -g nodemon        # Auto-restart on file changes
npm install -g mongodb-tools  # MongoDB utilities

# Useful development commands
npm run dev                   # If you add a dev script
npm run lint                  # If you add linting
npm run test                  # If you add tests
```

#### 🚨 Troubleshooting

**Common Issues & Solutions:**

1. **MongoDB Connection Failed**
   ```bash
   # Check if MongoDB is running
   brew services start mongodb-community  # macOS
   sudo systemctl start mongod             # Linux
   # Or use MongoDB Atlas cloud service
   ```

2. **OTP Email Not Sending**
   ```bash
   # Test email configuration
   curl "http://localhost:5000/debug-email"
   curl "http://localhost:5000/test-email?email=yourtest@gmail.com"
   
   # Check Gmail settings:
   # - 2FA enabled
   # - App password generated (not regular password)
   # - Less secure app access disabled (use app password instead)
   ```

3. **Session Expired Errors**
   ```bash
   # Check session configuration in app.js
   # Default: 30 minutes - increase if needed
   # Clear browser cookies and try again
   ```

4. **Port Already in Use**
   ```bash
   # Kill process on port 5000
   lsof -ti:5000 | xargs kill -9  # macOS/Linux
   # Or change PORT in .env file
   ```

> **💡 Pro Tip**: Check out the `OTP_TROUBLESHOOTING.md` file for detailed deployment and email configuration guidance!

## 🎮 How to Use Cohesion

### For Students 🎓
1. **Register & Verify**: 
   - Create account with email verification
   - Check email for 6-digit OTP code
   - Complete verification within 10 minutes
2. **Login**: Access your personalized dashboard
3. **Take Quiz**: 
   - Get 100 intelligently selected questions
   - Navigate through ordered subject distribution
   - Track progress in real-time
4. **View Results**: Get comprehensive performance analytics with subject-wise breakdown

### For Educators 👨‍🏫
1. **Admin Access**: Use `admin@gmail.com` during registration for admin privileges
2. **Question Management**: 
   - **Manual Creation**: Add individual questions with subject categorization
   - **Bulk Upload**: Import questions via JSON files for efficiency
   - **Subject Distribution**: Configure marks and subject weightings
3. **Analytics**: Monitor student performance and quiz statistics

### 🔧 System Admin Features
- **Debug Routes**: Built-in diagnostic tools for troubleshooting
- **Email Testing**: Test OTP delivery and email configuration
- **Session Management**: Monitor and debug user sessions
- **Environment Validation**: Check configuration and dependencies

## 📚 API Documentation

### 🔐 Authentication Endpoints

#### Registration Flow
```http
POST /create
Content-Type: application/x-www-form-urlencoded

username=johndoe&email=john@example.com&password=secret123&confirm_password=secret123&age=25
```

#### OTP Verification
```http
POST /verify-otp
Content-Type: application/x-www-form-urlencoded

otp=123456
```

#### Login
```http
POST /login
Content-Type: application/x-www-form-urlencoded

email=john@example.com&password=secret123
```

### 🎯 Quiz Endpoints

#### Get Questions (Protected)
```http
GET /questions
Authorization: Bearer <jwt-token>
Cookie: token=<jwt-token>
```

#### Submit Quiz Results (Protected)
```http
POST /result
Content-Type: application/json
Authorization: Bearer <jwt-token>

{
  "answers": {
    "question1_id": "A",
    "question2_id": "B",
    // ... more answers
  },
  "testId": "TEST-ABC123XYZ"
}
```

### 🛠️ Admin Endpoints

#### Create Question (Admin Only)
```http
POST /admin/create-question
Content-Type: application/x-www-form-urlencoded
Authorization: Bearer <admin-jwt-token>

question=What is 2+2?&optionA=3&optionB=4&optionC=5&optionD=6&correctAnswer=B&subject=Mathematics&marks=1
```

#### Upload Questions (Admin Only)
```http
POST /admin/upload-questions
Content-Type: multipart/form-data
Authorization: Bearer <admin-jwt-token>

questionsFile: <JSON file>
```

### 🧪 Debug Endpoints (Development)

#### Check Environment Variables
```http
GET /debug-email
```

#### Test Email Functionality
```http
GET /test-email?email=test@example.com
```

#### Session Debugging
```http
GET /debug-session?set=test@example.com
```

### 📊 Response Formats

#### Successful Registration
```json
{
  "success": true,
  "message": "OTP sent to email",
  "redirect": "/verify-otp"
}
```

#### Quiz Questions Response
```json
{
  "questions": [
    {
      "_id": "64f...",
      "question": "What is the capital of France?",
      "options": ["London", "Berlin", "Paris", "Madrid"],
      "subject": "Geography",
      "marks": 1
    }
  ],
  "testId": "TEST-ABC123XYZ",
  "totalQuestions": 100,
  "distribution": {
    "1mark": {"English": 12, "Chemistry": 14, "Physics": 14, "Mathematics": 20},
    "2mark": {"English": 4, "Chemistry": 8, "Physics": 13, "Mathematics": 15}
  }
}
```

#### Quiz Results Response
```json
{
  "totalScore": 85,
  "maxScore": 140,
  "percentage": 60.71,
  "breakdown": {
    "correct": 65,
    "incorrect": 25,
    "unanswered": 10
  },
  "subjectWise": {
    "English": {"score": 12, "total": 20},
    "Chemistry": {"score": 18, "total": 30},
    "Physics": {"score": 22, "total": 40},
    "Mathematics": {"score": 33, "total": 50}
  }
}
```

## 🛠️ Technology Stack & Dependencies

<div align="center">

| Technology                                                                                                     | Purpose         | Version | Key Features                    |
| -------------------------------------------------------------------------------------------------------------- | --------------- | ------- | ------------------------------- |
| ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)     | Backend Runtime | 16.0+   | Event-driven, Non-blocking I/O  |
| ![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)                              | Web Framework   | 5.1.0   | Fast, Minimalist Web Framework  |
| ![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)       | Database        | Atlas   | NoSQL, Document-based Storage   |
| ![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white) | CSS Framework   | 5.3     | Responsive, Mobile-first Design |
| ![EJS](https://img.shields.io/badge/EJS-8BC34A?style=for-the-badge)                                            | Template Engine | 3.1.10  | Server-side HTML Rendering      |
| ![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)                    | Authentication  | 9.0.2   | Stateless Token Authentication  |

</div>

### 📦 Complete Dependency List

#### **Core Application**
```json
{
  "express": "^5.1.0",           // Web application framework
  "mongoose": "^8.18.1",         // MongoDB ODM with validation
  "ejs": "^3.1.10",              // Embedded JavaScript templates
  "express-session": "^1.18.1",  // Session management middleware
  "cookie-parser": "^1.4.7"      // Cookie parsing middleware
}
```

#### **Security & Authentication**
```json
{
  "bcrypt": "^6.0.0",            // Password hashing with salt
  "jsonwebtoken": "^9.0.2",      // JWT token generation/verification
  "dotenv": "^17.2.2"            // Environment variable management
}
```

#### **Email & Communication**
```json
{
  "nodemailer": "^6.9.15"        // Email sending with SMTP support
}
```

#### **File Upload & Processing**
```json
{
  "multer": "^1.4.5-lts.1"       // Multipart form data handling
}
```

### 🏗️ Architecture Patterns

- **MVC Pattern**: Model-View-Controller separation
- **Middleware Chain**: Express.js middleware for request processing
- **RESTful API**: Clean URL structure and HTTP methods
- **Session-based Auth**: Secure session management with JWT tokens
- **Error Handling**: Comprehensive error catching and user feedback
- **Environment Config**: Secure configuration management with dotenv

### 📊 Performance Features

- **Connection Pooling**: MongoDB connection optimization
- **Session Store**: In-memory session management
- **Static File Serving**: Efficient asset delivery
- **Template Caching**: EJS template compilation optimization
- **Async/Await**: Modern JavaScript async patterns for better performance

## 🚀 Deployment Guide

### 🌐 Deploy to Render.com (Recommended)

1. **Prepare Repository**
   ```bash
   # Ensure all changes are committed
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Create Render Service**
   - Go to [Render.com](https://render.com)
   - Connect your GitHub repository
   - Create a new "Web Service"
   - Configure build settings:
     ```
     Build Command: npm install
     Start Command: node app.js
     ```

3. **Set Environment Variables**
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/cohesion_db
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-app-specific-password
   NODE_ENV=production
   PORT=10000
   ```

4. **Deploy**
   - Render will automatically deploy from your main branch
   - Monitor logs for any deployment issues
   - Test all functionality including OTP emails

### 🔧 Other Deployment Options

#### Heroku
```bash
# Install Heroku CLI and login
heroku create your-app-name
heroku config:set MONGO_URI="your-mongodb-uri"
heroku config:set EMAIL_USER="your-email"
heroku config:set EMAIL_PASS="your-app-password"
git push heroku main
```

#### DigitalOcean App Platform
```yaml
# app.yaml
name: cohesion-quiz-app
services:
- name: web
  source_dir: /
  github:
    repo: your-username/CBT-Quiz-App
    branch: main
  run_command: node app.js
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: MONGO_URI
    value: your-mongodb-uri
  - key: EMAIL_USER
    value: your-email
  - key: EMAIL_PASS
    value: your-app-password
```

#### Docker Deployment
```dockerfile
# Dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "app.js"]
```

```bash
# Build and run
docker build -t cohesion-quiz-app .
docker run -p 5000:5000 --env-file .env cohesion-quiz-app
```

## 🤝 Contributing

We welcome contributions to make Cohesion even better! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### 🛠️ Development Workflow

1. **Fork & Clone**
   ```bash
   git clone https://github.com/your-username/CBT-Quiz-App.git
   cd CBT-Quiz-App
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   # or
   git checkout -b fix/important-bug
   ```

3. **Set Up Development Environment**
   ```bash
   npm install
   cp .env.example .env
   # Configure your .env file
   npm start
   ```

4. **Make Changes & Test**
   ```bash
   # Test your changes locally
   npm test  # If tests exist
   
   # Test email functionality
   curl "http://localhost:5000/test-email?email=test@gmail.com"
   
   # Test registration flow
   # Manual testing through browser
   ```

5. **Commit & Push**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   # Use conventional commits: feat, fix, docs, style, refactor, test, chore
   git push origin feature/amazing-feature
   ```

6. **Create Pull Request**
   - Go to GitHub and create a PR
   - Fill out the PR template
   - Wait for review and feedback

### 📝 Contribution Guidelines

#### **Code Style**
- Use meaningful variable and function names
- Add comments for complex logic
- Follow existing code structure and patterns
- Use async/await instead of promises where possible

#### **Commit Messages**
Follow [Conventional Commits](https://www.conventionalcommits.org/):
```
feat: add email OTP verification system
fix: resolve session timeout issues  
docs: update API documentation
style: improve error message formatting
refactor: optimize question selection algorithm
test: add unit tests for authentication
chore: update dependencies
```

#### **Pull Request Requirements**
- [ ] Code follows existing style and conventions
- [ ] Changes are tested locally
- [ ] Documentation is updated if needed
- [ ] No breaking changes without discussion
- [ ] PR title follows conventional commits format

### 🐛 Bug Reports

Found a bug? Help us fix it:

1. **Check Existing Issues**: Search for similar bugs first
2. **Create Detailed Report**: Include:
   - Environment details (OS, Node version, browser)
   - Steps to reproduce
   - Expected vs actual behavior
   - Console errors or logs
   - Screenshots if applicable

### 💡 Feature Requests

Have an idea? We'd love to hear it:

1. **Check Roadmap**: See if it's already planned
2. **Create Feature Request**: Include:
   - Problem you're trying to solve
   - Proposed solution
   - Alternative solutions considered
   - Mock-ups or examples if helpful

### 🎯 Areas We Need Help With

- [ ] **Testing**: Unit tests, integration tests, end-to-end tests
- [ ] **Documentation**: API docs, user guides, video tutorials  
- [ ] **UI/UX**: Design improvements, accessibility features
- [ ] **Performance**: Database optimization, caching strategies
- [ ] **Features**: Mobile app, analytics dashboard, question import tools
- [ ] **Security**: Security audits, vulnerability assessments
- [ ] **Deployment**: Docker support, Kubernetes configs, CI/CD pipelines

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🌟 Acknowledgments

- Built with ❤️ by Shreyam Regmi
- Special thanks to the open-source community
- Powered by modern web technologies

---

<div align="center">
  
  **Made with ❤️ for Education by Shreyam Regmi**
  
  [🌐 Try Live Demo](https://cohesion-quizapp.onrender.com/) | [⭐ Star this repo](https://github.com/Nortcele7/CBT-Quiz-App) | [🐛 Report Issues](https://github.com/Nortcele7/CBT-Quiz-App/issues) | [💡 Request Features](https://github.com/Nortcele7/CBT-Quiz-App/issues)
  
</div>
