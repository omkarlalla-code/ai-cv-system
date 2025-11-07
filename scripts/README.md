# Scripts Directory

Utility scripts for database setup, testing, and deployment.

## 📦 Available Scripts

### 🗄️ Database Setup Scripts

#### `setup-database.sh`
**Purpose**: Complete database setup for local development

**Usage**:
```bash
chmod +x scripts/setup-database.sh
./scripts/setup-database.sh
```

**What it does**:
- Creates PostgreSQL database
- Runs main schema migrations
- Sets up tables for users, CVs, websites, notifications
- Configures database permissions

**Requirements**:
- PostgreSQL installed and running
- Sufficient permissions to create databases

---

#### `setup-neon-db.sh`
**Purpose**: Setup database on Neon (cloud PostgreSQL)

**Usage**:
```bash
chmod +x scripts/setup-neon-db.sh
./scripts/setup-neon-db.sh
```

**What it does**:
- Connects to Neon database
- Runs schema migrations
- Configures cloud database settings

**Requirements**:
- Neon account and connection string
- `DATABASE_URL` environment variable set

---

#### `setup-test-db.sh`
**Purpose**: Setup isolated test database

**Usage**:
```bash
chmod +x scripts/setup-test-db.sh
./scripts/setup-test-db.sh
```

**What it does**:
- Creates separate test database
- Runs schema for testing environment
- Seeds test data (optional)
- Configures test database isolation

**Requirements**:
- PostgreSQL installed
- Separate test database configuration

---

### 🧪 Testing Scripts

#### `test-fixes.sh`
**Purpose**: Run comprehensive test suite and verify fixes

**Usage**:
```bash
chmod +x scripts/test-fixes.sh
./scripts/test-fixes.sh
```

**What it does**:
- Runs backend unit tests
- Tests API endpoints
- Verifies bug fixes
- Generates test reports
- Checks code quality

**Requirements**:
- Backend dependencies installed (`npm install`)
- Test database configured
- Environment variables set

---

### 🚀 Deployment Scripts

#### `deploy.sh`
**Purpose**: Deploy application to production

**Usage**:
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh [environment]
```

**Arguments**:
- `environment` - Target environment (staging, production)

**What it does**:
- Builds frontend applications
- Runs production optimizations
- Deploys to specified environment
- Runs post-deployment checks
- Creates deployment logs

**Requirements**:
- All dependencies installed
- Production environment configured
- Deployment credentials set
- Database migrations up to date

---

## 🔧 Script Permissions

Make scripts executable:
```bash
chmod +x scripts/*.sh
```

Or individually:
```bash
chmod +x scripts/setup-database.sh
chmod +x scripts/setup-neon-db.sh
chmod +x scripts/setup-test-db.sh
chmod +x scripts/test-fixes.sh
chmod +x scripts/deploy.sh
```

## 📋 Common Workflows

### First-time Setup
```bash
# 1. Setup local database
./scripts/setup-database.sh

# 2. Run tests to verify setup
./scripts/test-fixes.sh
```

### Cloud Database Setup
```bash
# Setup Neon cloud database
export DATABASE_URL="postgresql://user:pass@host/db"
./scripts/setup-neon-db.sh
```

### Testing Workflow
```bash
# Setup test database
./scripts/setup-test-db.sh

# Run all tests
./scripts/test-fixes.sh
```

### Deployment Workflow
```bash
# Deploy to staging
./scripts/deploy.sh staging

# Deploy to production (after testing)
./scripts/deploy.sh production
```

## 🐛 Troubleshooting

### "Permission denied" Error
```bash
# Make script executable
chmod +x scripts/[script-name].sh
```

### Database Connection Issues
```bash
# Check PostgreSQL is running
pg_isready

# Verify connection string
echo $DATABASE_URL
```

### Script Fails During Execution
```bash
# Run with verbose output
bash -x scripts/[script-name].sh

# Check logs
tail -f /var/log/postgresql/postgresql.log
```

## 📝 Environment Variables

Scripts may require these environment variables:

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/bettercv
TEST_DATABASE_URL=postgresql://user:pass@localhost:5432/bettercv_test

# API Keys
ANTHROPIC_API_KEY=sk-ant-api01-xxxxx

# Security
JWT_SECRET=your-secret-key-here

# Deployment
DEPLOY_ENV=production
DEPLOY_HOST=your-server.com
```

## 🔗 Related Documentation

- **[Main README](../README.md)** - Project overview
- **[Quick Start](../docs/QUICK_START.md)** - Getting started guide
- **[Deployment Guide](../docs/DEPLOYMENT_GUIDE.md)** - Deployment instructions
- **[Development Guide](../docs/DEVELOPMENT.md)** - Development setup

---

## 💡 Tips

1. **Always test locally first** before deploying to production
2. **Backup your database** before running migration scripts
3. **Check script logs** if something goes wrong
4. **Use test database** for development and testing
5. **Keep scripts executable** with proper permissions

## 🆘 Need Help?

- Open an issue on GitHub
- Check the [documentation](../docs/)
- Review script source code for detailed comments
- Test in staging environment first

---

**Last Updated**: November 2025
