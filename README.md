# Email Extraction Tool

A web application for extracting and analyzing information from email addresses. This application includes both a frontend built with React and a backend with MySQL database integration.

## Features

- Email verification and authentication
- 5-digit verification code system
- Email data extraction and analysis
- User dashboard with extracted email statistics
- MySQL database for data storage

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MySQL Server
- npm or yarn

### Database Setup

1. Create a MySQL database:

```sql
CREATE DATABASE email_extraction;
```

2. Run the database setup script:

```bash
mysql -u root -p email_extraction < db-setup.sql
```

### Backend Setup

1. Install backend dependencies:

```bash
npm install --prefix backend
```

2. Configure the database connection in `server.js` if needed.

3. Start the backend server:

```bash
node server.js
```

The backend server will run on http://localhost:5000.

### Frontend Setup

1. Install frontend dependencies:

```bash
npm install
```

2. Start the frontend development server:

```bash
npm run dev
```

The frontend will be available at http://localhost:8080.

## Usage

1. Open the application in your browser at http://localhost:8080
2. Enter your email address and password
3. Enter the 5-digit verification code (for testing, use code "12345")
4. Access the dashboard to view extracted email information

## API Endpoints

- `POST /api/register` - Register a new user
- `POST /api/login` - Login and receive verification code
- `POST /api/verify` - Verify the 5-digit code
- `POST /api/extract` - Extract information from an email
- `GET /api/extractions/:userId` - Get all extractions for a user
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/8d9f7020-97f6-4cf7-90ae-41252a34d3b3) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
