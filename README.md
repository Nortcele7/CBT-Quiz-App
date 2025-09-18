# CBT Quiz App (MEN Stack)

A simple authentication and quiz web application built with MongoDB, Express.js, and Node.js (MEN stack). The app demonstrates user registration, login, JWT-based authentication, admin question management, and quiz-taking with scoring.

## Features

- User registration with hashed passwords (bcrypt)
- User login with JWT authentication (jsonwebtoken)
- Admin panel for adding quiz questions
- Quiz interface for users
- Result calculation with positive and negative marking
- Logout functionality
- EJS templating and TailwindCSS for UI

## Folder Structure

```
├── app.js                # Main application file
├── package.json          # Project metadata and dependencies
├── models/
│   ├── user.js           # User schema/model
│   └── questions.js      # Question schema/model
├── public/               # Static assets (images, CSS, JS)
├── views/                # EJS templates
│   ├── index.ejs         # Registration page
│   ├── login.ejs         # Login page
│   ├── admin.ejs         # Admin question creation
│   ├── loggedin.ejs      # Quiz interface
│   └── result.ejs        # Quiz results
```

## Setup Instructions

1. **Clone the repository**
2. **Install dependencies:**
   ```
   npm install
   ```
3. **Start MongoDB** (ensure it is running on `mongodb://127.0.0.1:27017/authtestapp`)
4. **Run the app:**
   ```
   node app.js
   ```
5. **Open in browser:**
   Visit [http://localhost:3000](http://localhost:3000)

## Usage

- **Register** a new user on the home page.
- **Login** as a user or as admin (`admin@gmail.com` for admin access).
- **Admin** can add quiz questions.
- **Users** can take quizzes and view results with scoring.
- **Logout** to end the session.

## Dependencies
- express
- mongoose
- ejs
- bcrypt
- jsonwebtoken
- cookie-parser

## License
ISC
