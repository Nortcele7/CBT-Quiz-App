# CBT Quiz App (MEN Stack)

A simple authentication and quiz web application built with MongoDB, Express.js, and Node.js (MEN stack). The app demonstrates user registration, login, JWT-based authentication, admin question management, and quiz-taking with scoring.

## Features

- User registration with hashed passwords (bcrypt)
- User login with JWT authentication (jsonwebtoken)
- Admin landing page with two modes:
   - **Create Questions**: Add questions one by one via a form
   - **Upload Questions**: Bulk upload questions from a JSON file
- Quiz interface for users
- Result calculation with positive and negative marking
   - Each question is scored as follows:
      - **Correct**: Full marks for the question
      - **Incorrect**: Negative marks (if set for the question)
      - **Unanswered**: 0 points
   - The result page displays:
      - Total points obtained and total possible points
      - Per-question breakdown: marks, obtained points, and status (Correct/Incorrect/Unanswered)
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
│   ├── admin_landing_page.ejs # Admin landing page (choose create/upload)
│   ├── admin_create_questions.ejs # Admin: create questions via form
│   ├── admin_upload.ejs  # Admin: upload questions from JSON
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
- **Admin** can:
   - **Create Questions**: Add questions one by one using the form on the "Create Questions" page.
   - **Upload Questions**: Upload a JSON file containing an array of questions on the "Upload Questions" page. The questions will be parsed and added to the database in bulk.
- **Users** can take quizzes and view results with detailed scoring:
   - See total points and possible points
   - See per-question feedback: obtained marks, correct/incorrect/unanswered status, and color-coded answers
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
