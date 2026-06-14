# Placement Readiness Calculator & Career Analyzer

Placement Readiness Calculator & Career Analyzer is a high-fidelity, full-stack web application designed to help university students analyze their academic, coding, and soft skills to calculate a weighted placement readiness score. The application includes a Resume Parser, an AI Interview Question Generator, an AI Study Plan Generator, a Placement Tracker, and a complete Administrator Dashboard.

---

## Technical Stack

- **Frontend**: React.js (Vite), Tailwind CSS (Glassmorphism), Chart.js (react-chartjs-2), Lucide Icons
- **Backend**: Python Flask, Flask-SQLAlchemy (SQLite Database), Flask-JWT-Extended (Secure Authentication), Flask-CORS, PyPDF (for parsing resume PDFs)
- **Database**: SQLite (normalized tables for Users, Profiles, Scores, Applications, Companies, and Resume Scans)

---

## Folder Structure

```
Placement Readiness Calculator/
├── backend/
│   ├── app.py              # Main Flask server and REST routing endpoints
│   ├── auth.py             # User registration and secure JWT controllers
│   ├── models.py           # SQLite database models schema (SQLAlchemy)
│   ├── ai_helpers.py       # Readiness scoring, Interview Prep pool, and Study Plan scheduler
│   ├── analyzer.py         # PDF text extractor and resume score checklist evaluator
│   ├── seed.py             # Database initialization script seeding sample accounts & companies
│   └── requirements.txt    # Python backend module dependencies list
├── frontend/
│   ├── package.json        # Frontend React/Vite dependencies configuration
│   ├── vite.config.js      # Vite dev compiler configuration
│   ├── tailwind.config.js  # Tailwind CSS theme, font family, and dark class configurations
│   ├── postcss.config.js   # Autoprefixer PostCSS parser configuration
│   ├── index.html          # Entry HTML layout containing Google Fonts links
│   └── src/
│       ├── main.jsx        # App mounting and React strict mode bootstrap
│       ├── App.jsx         # App router registry, layouts, and role wrappers
│       ├── index.css       # Global styles defining custom glassmorphism layers and scrollbars
│       ├── components/
│       │   ├── Sidebar.jsx       # Responsive navigation sidebar supporting desktop/mobile views
│       │   ├── PrivateRoute.jsx  # Security router checking auth sessions and roles
│       │   ├── GlassCard.jsx     # Reusable glassmorphic UI container element
│       │   └── ThemeToggle.jsx   # Switch control enabling Dark/Light themes
│       ├── context/
│       │   ├── AuthContext.jsx   # Session context managing registration, login, and token state
│       │   └── ThemeContext.jsx  # Dark/Light theme class manager hook
│       ├── utils/
│       │   └── api.js            # Axios-like fetch client automatically attaching JWT tokens
│       └── pages/
│           ├── Login.jsx            # Sign in page with clickable demo auto-fill loaders
│           ├── Register.jsx         # SignUp page supporting detailed profile declarations
│           ├── Dashboard.jsx        # Analytics displaying gauge, radar, bar, and pie reports
│           ├── Profile.jsx          # Setup page adjusting CGPA, coding sliders, and counts
│           ├── CompanyChecker.jsx   # Grid comparing student metrics against recruiters criteria
│           ├── ResumeAnalyzer.jsx   # Upload page mapping resume files and finding skill gaps
│           ├── InterviewPrep.jsx    # Interactive mock prep drills with hint triggers & keys
│           ├── StudyPlanner.jsx     # Scheduler rendering checkable day calendars
│           ├── PlacementTracker.jsx # Kanban style board dragging job statuses
│           └── AdminDashboard.jsx   # Management console overriding student scores & company rules
└── README.md               # Application setup, execution, and deployment manual
```

---

## Weighted Scoring Engine (Calculations)

The readiness score is calculated out of 100% using weighted allocations:
1. **Aptitude (25% total weight)**:
   - Quantitative Reasoning: 10%
   - Logical Deduction: 10%
   - Verbal Ability: 5%
2. **Coding Skills (35% total weight)**:
   - Python: 5%
   - Java: 5%
   - SQL: 10%
   - Algorithms & DSA: 15%
3. **Communication Skills (20% total weight)**:
   - Spoken English/Speaking: 5%
   - Presentations: 10%
   - Group Discussions: 5%
4. **Academic & Project Strength (20% total weight)**:
   - Normalized CGPA (e.g. 8.5/10 CGPA = 8.5 points): 10%
   - Projects Count (Capped at 5 projects): 5%
   - Certifications Count (Capped at 5 certifications): 5%

### Score Classifications:
- **Under 50%**: *Not Ready* (Red indicator - Critical preparation required)
- **50% - 69%**: *Need Improvement* (Orange indicator - Review core conceptual gaps)
- **70% - 84%**: *Placement Ready* (Blue indicator - Ready for standard technical drives)
- **85% and above**: *Highly Placement Ready* (Green indicator - Qualifies for premium product roles)

---

## Setup & Execution Guide

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- Python (v3.10.0 or higher recommended)

### 1. Backend Server Setup
From the root workspace folder, navigate into `backend/` and install python requirements:
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run initial database seeding (generates database.db)
python seed.py

# Run the Flask local development server
python app.py
```
*The Flask backend server will launch on `http://localhost:5000/api`.*

### 2. Frontend React Setup
Open a new terminal session, navigate into `frontend/` folder, and bootstrap the UI:
```bash
cd frontend

# Install package dependencies
npm install

# Run the local Vite dev server
npm run dev
```
*The React development server will start on `http://localhost:5173/`.*

### 3. Login Credentials (Demo Accounts)
The database seed script generates pre-seeded credentials for immediate evaluation (accessible via quick-fill buttons on the login screen):
- **Demo Student User**:
  - Email: `student@placement.com`
  - Password: `studentpassword`
- **Demo Admin Coordinator**:
  - Email: `admin@placement.com`
  - Password: `adminpassword`

---

## REST API Specifications

### Authentication Blueprint (`/api/auth`)
- `POST /register`: Registers student profile or coordinator. Returns HTTP 210/400.
- `POST /login`: Validates password and returns access JWT token.
- `GET /me`: Returns profile metadata of current session user.

### Student Metric Interfaces (`/api`)
- `GET /profile`: Returns detailed profiles, scores, and computed weighted classifications.
- `POST /profile`: Updates scores, CGPA, and recomputes readiness statistics.
- `GET /companies`: Returns company listings tagged with eligibility boolean flags.
- `POST /tracker/applications`: Adds application track logs or updates pipeline status.
- `DELETE /tracker/applications/<id>`: Deletes application item from list.
- `POST /resume/analyze`: Extracts PDF text contents, evaluates keywords, lists gaps.
- `GET /resume/history`: Returns history logs of previous resume uploads.
- `POST /ai/interview-questions`: Generates 5 topic-focused questions, hints, and model answers.
- `POST /ai/study-plan`: Formulates day-by-day learning tasks focusing on the student's weakest scores.

### Administrative Controls (`/api/admin`)
- `GET /dashboard`: Gathers total counts, GPA aggregates, department charts, and student rows.
- `DELETE /users/<id>`: Permanently deletes student from database.
- `PUT /users/<id>/scores`: Allows coordinator to override specific scores or CGPA ratings.
- `POST /companies`: Creates or edits eligibility standards for corporate entities.
- `DELETE /companies/<id>`: Deletes company requirement standards.

---

## Deployment Guidelines

### 1. Production Build & Bundling
Generate the static assets bundle from the React project:
```bash
cd frontend
npm run build
```
This produces a production-optimized, static bundle in the `frontend/dist` directory.

### 2. Static Asset Hosting
The compiled `frontend/dist` files can be served directly from:
- A Content Delivery Network (Vercel, Netlify, Cloudflare Pages, AWS S3 + CloudFront).
- Configure the Flask backend to host the build files statically, or map requests using reverse-proxy systems like Nginx.

### 3. Database Migration
In a production deployment, replace SQLite with a managed relational service (e.g. PostgreSQL, MariaDB). Update `app.config['SQLALCHEMY_DATABASE_URI']` using environment variables.

### 4. Security Enhancements
- Enforce HTTPS protocol across all frontend pages and API endpoints.
- Store JWT secrets securely inside environment configurations, not code files.
- Enable HTTPOnly, Secure, SameSite cookie policies if migrating from localStorage.
- Implement rate-limiting headers on server endpoints.
