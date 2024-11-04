# Nut No More - Roadmap (Replit & Node.js)

A structured plan for developing Nut No More, an Android mental health and habit-tracking app focused on accountability and daily progress tracking. This roadmap is designed for Replit, using HTML/CSS/JavaScript for the front end, Node.js for the backend, and JSON/SQLite for the database.

---

## Step 1: Project Setup & Planning

1. **Create a New Replit Project**:
   - Choose a blank template to start fresh with HTML, CSS, and JavaScript for the front end.
   - Use Node.js for the backend.

2. **Folder Structure**:
   - Organize files into folders like `public` for static assets, `views` for HTML files, and `data` for storage.
   - Set up basic files: `index.html`, `style.css`, `app.js` (for backend), and `database.json` or `database.sqlite` for data storage.

---

## Step 2: Front-End Development

### 2.1 Basic HTML Layout & CSS Styling

1. **HTML Structure**:
   - Create an `index.html` with essential sections for login, lobby, daily questions, and streak tracking.
   - Each screen (Login, Lobby, Daily Question, Streak) can be toggled with JavaScript.

2. **CSS Styling**:
   - Style with CSS to create a clean, user-friendly interface.
   - Use calming colors and simple layouts to encourage a supportive environment.

### 2.2 Implement Core Screens

1. **Login Screen**:
   - Create a simple form for login with an email and password input.
   - Use JavaScript to validate input and handle authentication requests.

2. **Lobby Screen**:
   - Add a section where users can create or join lobbies.
   - Display a list of available lobbies with a “Join” button for each.

3. **Daily Question Screen**:
   - Display a daily question asking users if they abstained from the behavior.
   - Include buttons for “Yes” or “No” responses.

4. **Streak Tracker**:
   - Show the user’s current streak and friend updates if available.
   - Style it as a simple scoreboard for tracking progress.

---

## Step 3: Backend Development with Node.js

### 3.1 Setting Up the Server

1. **Initialize Node.js Project**:
   - Run `npm init` in Replit to create a package.json file.
   - Install essential packages like Express for routing and `body-parser` for handling JSON requests.

2. **Create Express Server**:
   - In `app.js`, set up basic routes for each core feature (e.g., `/login`, `/lobby`, `/daily-question`, `/streak`).
   - Serve static files from the `public` folder for front-end assets.

3. **Routes for Core Features**:

   - **Authentication Route** (`/login`):
     - Verify user credentials against data in the JSON or SQLite file.

   - **Lobby Routes** (`/lobbies`, `/join-lobby`):
     - Create endpoints to list lobbies, create a new lobby, and add users to a lobby.

   - **Daily Question Route** (`/daily-question`):
     - Serve a daily question and receive user responses to update the streak.

   - **Streak Route** (`/streak`):
     - Handle logic to calculate and return the user’s current streak.

---

## Step 4: Database & Data Management

### 4.1 Database Setup

1. **Database Choice**:
   - **JSON**: Use a `database.json` file to store data for small-scale testing.
   - **SQLite**: Install `sqlite3` to store data in a lightweight relational database.

2. **Database Structure**:
   - **Users**: Track user credentials, streak count, and progress.
   - **Lobbies**: Store lobby names, members, and daily progress updates.
   - **Questions**: Keep a list of daily questions and responses.

### 4.2 CRUD Operations

1. **User Data**:
   - Create functions to handle user login, registration, and streak updates.
   - Store user progress in the JSON or SQLite database.

2. **Lobby Data**:
   - Add functions to create, join, and manage lobbies.
   - Update lobby data each day with user responses.

3. **Daily Question Data**:
   - Store a list of questions with associated Bible verses.
   - Implement logic to serve a new question daily and reset responses at midnight.

---

## Step 5: Real-Time Updates with WebSockets (Optional)

1. **Set Up WebSockets**:
   - Use `socket.io` to enable real-time updates between users and their friends in a lobby.

2. **Implement Real-Time Notifications**:
   - Notify friends in a lobby whenever a user checks in.
   - Update the streak count and progress in real-time.

---

## Step 6: Testing & Deployment

1. **Local Testing**:
   - Test core features in Replit to confirm that the front-end and back-end communicate correctly.
   - Simulate multiple users to test the lobby and streak tracking functionalities.

2. **Debugging**:
   - Use Replit’s console and browser developer tools for debugging.

3. **Deploying the App**:
   - Once ready, deploy directly from Replit or host the backend on a Node.js platform (like Heroku) if Replit’s limitations become restrictive.

---

## Step 7: Post-Launch Improvements

1. **Collect Feedback**:
   - Gather feedback from users on usability, streak tracking, and accountability features.

2. **Refine Real-Time Features**:
   - If using WebSockets, refine real-time updates based on user feedback.

3. **Add Data Persistence & Expandability**:
   - Once your app gains users, consider switching from JSON or SQLite to a scalable database like Firestore or PostgreSQL for more reliable data management.

---

This roadmap provides a foundational path for building "Nut No More" using Replit, Node.js, and local storage options. Let me know if you'd like more details on specific steps or code examples for any phase.
