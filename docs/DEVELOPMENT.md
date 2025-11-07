# Development Guide

This guide covers setting up and running the BetterCV application in development mode.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Development Setup](#development-setup)
- [Docker Development](#docker-development)
- [Manual Setup](#manual-setup)
- [Database Migrations](#database-migrations)
- [Running Tests](#running-tests)
- [Code Style](#code-style)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **npm** 8+ (comes with Node.js)

### Optional

- **Docker** & **Docker Compose** ([Download](https://www.docker.com/get-started))
- **Git** ([Download](https://git-scm.com/downloads))
- **Anthropic API Key** ([Get one here](https://console.anthropic.com/))

## Quick Start

The fastest way to get started is with Docker:

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/ai-cv-system.git
cd ai-cv-system

# 2. Copy environment file
cp .env.example .env

# 3. Add your Anthropic API key to .env
# Edit .env and set ANTHROPIC_API_KEY=your_key_here

# 4. Start all services
docker-compose -f docker-compose.dev.yml up

# 5. Access the application
# Dashboard: http://localhost:3002
# Builder: http://localhost:3001
# API: http://localhost:3000
# API Docs: http://localhost:3000/api-docs
```

That's it! The application is now running with hot reload enabled.

## Development Setup

### 1. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Update `.env` with your configuration:

```bash
# Minimum required configuration
ANTHROPIC_API_KEY=your_anthropic_api_key_here
JWT_SECRET=generate_a_random_secret_here
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bettercv
```

Generate a secure JWT secret:

```bash
# Option 1: OpenSSL
openssl rand -hex 64

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Database Setup

Create the PostgreSQL database:

```bash
# Using psql
createdb bettercv

# Or using SQL
psql -U postgres -c "CREATE DATABASE bettercv;"
```

Run the initial schema:

```bash
cd database
psql -U postgres -d bettercv -f schema.sql
psql -U postgres -d bettercv -f builder-schema.sql
psql -U postgres -d bettercv -f seed-templates.sql
```

Run migrations:

```bash
node migrate.js up
```

## Docker Development

### Using Docker Compose

Start all services:

```bash
docker-compose -f docker-compose.dev.yml up
```

Start specific services:

```bash
# Only database
docker-compose -f docker-compose.dev.yml up postgres

# Backend and database
docker-compose -f docker-compose.dev.yml up postgres backend

# Everything
docker-compose -f docker-compose.dev.yml up
```

### Docker Compose Profiles

Enable optional services using profiles:

```bash
# With pgAdmin (database UI)
docker-compose -f docker-compose.dev.yml --profile with-pgadmin up

# With Redis (caching)
docker-compose -f docker-compose.dev.yml --profile with-redis up

# With Mailhog (email testing)
docker-compose -f docker-compose.dev.yml --profile with-mailhog up

# With Nginx (production-like setup)
docker-compose -f docker-compose.dev.yml --profile with-nginx up

# All optional services
docker-compose -f docker-compose.dev.yml \
  --profile with-pgadmin \
  --profile with-redis \
  --profile with-mailhog \
  --profile with-nginx \
  up
```

### Useful Docker Commands

```bash
# View logs
docker-compose -f docker-compose.dev.yml logs -f

# View logs for specific service
docker-compose -f docker-compose.dev.yml logs -f backend

# Stop all services
docker-compose -f docker-compose.dev.yml down

# Stop and remove volumes (⚠️ deletes data)
docker-compose -f docker-compose.dev.yml down -v

# Rebuild images
docker-compose -f docker-compose.dev.yml build

# Restart a service
docker-compose -f docker-compose.dev.yml restart backend

# Execute command in running container
docker-compose -f docker-compose.dev.yml exec backend npm test

# Access database
docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -d bettercv
```

## Manual Setup

If you prefer not to use Docker:

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Dashboard
cd ../frontend/dashboard
npm install

# Builder
cd ../builder
npm install
```

### 2. Start PostgreSQL

Ensure PostgreSQL is running:

```bash
# Check if running
pg_isready

# Start PostgreSQL (varies by OS)
# macOS (Homebrew)
brew services start postgresql@14

# Linux (systemd)
sudo systemctl start postgresql

# Windows
# Use PostgreSQL service in Services panel
```

### 3. Run Database Migrations

```bash
cd database
node migrate.js up
```

### 4. Start Development Servers

Open three terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Runs on http://localhost:3000
```

**Terminal 2 - Dashboard:**
```bash
cd frontend/dashboard
npm run dev
# Runs on http://localhost:3002
```

**Terminal 3 - Builder:**
```bash
cd frontend/builder
npm run dev
# Runs on http://localhost:3001
```

## Database Migrations

### Run Migrations

```bash
cd database
node migrate.js up
```

### Check Migration Status

```bash
node migrate.js list
```

### Rollback Last Migration

```bash
node migrate.js down
```

### Create New Migration

1. Create migration files:
   ```bash
   cd database/migrations
   touch 003_add_feature.sql
   touch 003_add_feature.rollback.sql
   ```

2. Write the migration SQL

3. Test the migration:
   ```bash
   cd ..
   node migrate.js up
   node migrate.js down
   node migrate.js up
   ```

See [database/migrations/README.md](database/migrations/README.md) for detailed migration documentation.

## Running Tests

### Backend Tests

```bash
cd backend
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Frontend Tests

```bash
# Dashboard
cd frontend/dashboard
npm test

# Builder
cd frontend/builder
npm test
```

### Integration Tests

```bash
cd backend
npm run test:integration
```

## Code Style

### Linting

```bash
# Backend
cd backend
npm run lint

# Fix automatically
npm run lint:fix

# Dashboard
cd frontend/dashboard
npm run lint

# Builder
cd frontend/builder
npm run lint
```

### Formatting

We use Prettier for code formatting:

```bash
# Format all files
npm run format

# Check formatting
npm run format:check
```

### Git Hooks

Pre-commit hooks automatically run linting and formatting:

```bash
# Install hooks
npm run prepare

# Skip hooks (not recommended)
git commit --no-verify
```

## API Documentation

### Swagger UI

Access interactive API documentation at:

```
http://localhost:3000/api-docs
```

### Generate API Documentation

```bash
cd backend
npm run docs:generate
```

### API Testing

Use the built-in Swagger UI or tools like:

- **Postman**: Import `docs/postman_collection.json`
- **cURL**: See examples in `docs/api_examples.md`
- **HTTPie**: `http GET localhost:3000/api/templates`

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/my-feature
```

### 2. Make Changes

Edit code with hot reload enabled (changes apply automatically).

### 3. Run Tests

```bash
npm test
```

### 4. Commit Changes

```bash
git add .
git commit -m "feat: add my feature"
```

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Test changes
- `chore:` - Build/tooling changes

### 5. Push and Create PR

```bash
git push origin feature/my-feature
```

Then create a Pull Request on GitHub.

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use a different port
PORT=3001 npm run dev
```

### Database Connection Errors

```bash
# Check PostgreSQL is running
pg_isready

# Check connection string
psql $DATABASE_URL

# Reset database
dropdb bettercv
createdb bettercv
cd database
psql -U postgres -d bettercv -f schema.sql
node migrate.js up
```

### Docker Issues

```bash
# Remove all containers and volumes
docker-compose -f docker-compose.dev.yml down -v

# Remove images
docker-compose -f docker-compose.dev.yml down --rmi all

# Clean rebuild
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up
```

### Node Modules Issues

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Migration Errors

```bash
# Check migration status
cd database
node migrate.js list

# Rollback and retry
node migrate.js down
node migrate.js up

# Manual fix
psql $DATABASE_URL
# Run SQL commands manually
```

## Development Tools

### pgAdmin

Access database UI at http://localhost:5050

**Login:**
- Email: admin@bettercv.com
- Password: admin

### Mailhog

Test emails at http://localhost:8025

Configure backend to use Mailhog:
```env
SMTP_HOST=localhost
SMTP_PORT=1025
```

### Redis Commander

If using Redis, install Redis Commander:

```bash
npm install -g redis-commander
redis-commander
```

Access at http://localhost:8081

## Environment Variables

See `.env.comprehensive.example` for all available configuration options.

### Essential Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `ANTHROPIC_API_KEY` | Claude API key | ✅ |
| `JWT_SECRET` | Secret for JWT signing | ✅ |
| `NODE_ENV` | Environment (development/production) | ✅ |
| `PORT` | Backend server port | ⬜ |
| `FRONTEND_URL` | Frontend URL for CORS | ⬜ |
| `SMTP_HOST` | Email server host | ⬜ |

## Additional Resources

- [API Documentation](API_DOCUMENTATION.md)
- [Production Deployment](PRODUCTION_DEPLOYMENT.md)
- [Security Guidelines](SECURITY_FIXES.md)
- [Testing Guide](TEST_PLAN.md)
- [Database Migrations](database/migrations/README.md)

## Getting Help

- **Issues**: [GitHub Issues](https://github.com/yourusername/ai-cv-system/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/ai-cv-system/discussions)
- **Email**: support@bettercv.com

## License

See [LICENSE](LICENSE) file for details.
