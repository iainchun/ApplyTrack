# ApplyTrack

ApplyTrack is a full-stack job application tracking platform designed to help users organize and manage their job search in one place.

The project was built as an opportunity to develop and integrate a complete web application across the frontend, backend, database, authentication, and containerized development environment.

## Tech Stack

### Frontend
- Next.js
- TypeScript
- React

### Backend
- Python
- FastAPI
- REST APIs

### Database
- PostgreSQL

### Development & Deployment
- Docker
- Docker Compose
- Git

## Features

- User authentication
- Job application creation and management
- Application status tracking
- REST API backend
- Persistent PostgreSQL storage
- Database schema migrations
- Containerized frontend, backend, and database

## Architecture

ApplyTrack is separated into independent frontend and backend services.

The Next.js frontend communicates with the FastAPI backend through REST API endpoints. The backend handles application logic, authentication, and database operations, while PostgreSQL provides persistent data storage.

Docker Compose is used to run the application services together in a consistent development environment.

## Development & Debugging

A significant part of developing ApplyTrack involved troubleshooting and improving the integration between different parts of the application.

Examples include:

- Debugging frontend/backend communication issues
- Resolving authentication and module import problems
- Troubleshooting PostgreSQL persistence
- Managing database schema changes with Alembic
- Resolving Docker and container configuration issues
- Testing API endpoints during development

These iterations helped improve the reliability and maintainability of the application rather than treating the project as a one-time implementation.

## Running Locally

### 1. Clone the repository

git clone <repository-url>
cd ApplyTrack

### 2. Configure environment variables

Copy the example environment file:

cp .env.example .env

Update the values in `.env` as needed.

### 3. Start the application

docker compose up --build

### 4. API Documentation

Once the backend is running, FastAPI's interactive API documentation is available at:

http://localhost:8000/docs

## Future Improvements

- Expand automated backend and frontend testing
- Add CI/CD workflows
- Improve logging and error handling
- Expand application filtering and search
- Add analytics and dashboard functionality
- Further harden authentication and authorization
