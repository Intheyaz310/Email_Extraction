# Email Extraction Application - Deployment Guide

This guide covers deployment options for the Email Extraction application, which consists of three main components:

1. **Frontend**: React/Vite application
2. **Backend**: Node.js/Express API
3. **AI Service**: Python/FastAPI service

## 🚀 Quick Deployment Options

### Option 1: Vercel (Recommended for Frontend + Backend)

#### Frontend Deployment
1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy Frontend**:
   ```bash
   vercel
   ```

3. **Set Environment Variables**:
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add: `VITE_API_URL` = your backend URL

#### Backend Deployment
1. **Deploy Backend**:
   ```bash
   cd backend
   vercel
   ```

2. **Set Environment Variables**:
   - `DB_HOST` = your database host
   - `DB_USER` = database username
   - `DB_PASSWORD` = database password
   - `DB_NAME` = database name
   - `JWT_SECRET` = your JWT secret
   - `PYTHON_SERVICE_URL` = your Python AI service URL

### Option 2: Netlify (Frontend Only)

1. **Connect Repository**:
   - Push code to GitHub
   - Connect repository in Netlify

2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Environment Variables**:
   - Add `VITE_API_URL` in Netlify dashboard

### Option 3: Heroku (Full Stack)

#### Frontend Deployment
1. **Create Heroku App**:
   ```bash
   heroku create your-app-name
   ```

2. **Add Buildpack**:
   ```bash
   heroku buildpacks:set mars/create-react-app
   ```

3. **Deploy**:
   ```bash
   git push heroku main
   ```

#### Backend Deployment
1. **Create Heroku App**:
   ```bash
   heroku create your-backend-name
   ```

2. **Add PostgreSQL**:
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

3. **Set Environment Variables**:
   ```bash
   heroku config:set JWT_SECRET=your-secret-key
   heroku config:set PYTHON_SERVICE_URL=your-python-service-url
   ```

4. **Deploy**:
   ```bash
   cd backend
   git push heroku main
   ```

#### Python AI Service Deployment
1. **Create Heroku App**:
   ```bash
   heroku create your-ai-service-name
   ```

2. **Deploy**:
   ```bash
   cd EMAILS_EXT
   git push heroku main
   ```

### Option 4: Docker (Local/Cloud)

#### Local Development
```bash
# Build and run all services
docker-compose up --build

# Access applications:
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# AI Service: http://localhost:8001
```

#### Cloud Deployment (AWS, GCP, Azure)
1. **Build Images**:
   ```bash
   docker build -f Dockerfile.frontend -t email-extraction-frontend .
   docker build -f backend/Dockerfile -t email-extraction-backend ./backend
   docker build -f EMAILS_EXT/Dockerfile -t email-extraction-ai ./EMAILS_EXT
   ```

2. **Push to Registry**:
   ```bash
   docker tag email-extraction-frontend your-registry/frontend:latest
   docker tag email-extraction-backend your-registry/backend:latest
   docker tag email-extraction-ai your-registry/ai:latest
   docker push your-registry/frontend:latest
   docker push your-registry/backend:latest
   docker push your-registry/ai:latest
   ```

## 🗄️ Database Setup

### Option 1: Cloud Database (Recommended)
- **AWS RDS**: MySQL 8.0
- **Google Cloud SQL**: MySQL 8.0
- **Azure Database**: MySQL 8.0
- **PlanetScale**: MySQL-compatible
- **Railway**: PostgreSQL (requires migration)

### Option 2: Local Database
```bash
# Using Docker
docker run --name mysql-email-extraction \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=email_extraction \
  -p 3306:3306 \
  -d mysql:8.0

# Run database setup
mysql -h localhost -u root -p < db-setup.sql
```

## 🔧 Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
```

### Backend (.env)
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=email_extraction
JWT_SECRET=your-super-secret-jwt-key
PYTHON_SERVICE_URL=http://localhost:8001
PORT=5000
NODE_ENV=production
```

### Python AI Service (.env)
```env
PORT=8001
```

## 📋 Pre-deployment Checklist

- [ ] Update all API URLs in frontend code
- [ ] Set up database and run migrations
- [ ] Configure environment variables
- [ ] Test all services locally
- [ ] Update CORS settings for production domains
- [ ] Set up SSL certificates
- [ ] Configure domain names
- [ ] Set up monitoring and logging

## 🔒 Security Considerations

1. **Environment Variables**: Never commit secrets to version control
2. **CORS**: Configure allowed origins for production
3. **Rate Limiting**: Ensure rate limiting is enabled
4. **HTTPS**: Use SSL certificates in production
5. **Database**: Use strong passwords and restrict access
6. **JWT**: Use strong, unique JWT secrets

## 📊 Monitoring & Logging

### Recommended Tools
- **Application Monitoring**: Sentry, LogRocket
- **Infrastructure**: AWS CloudWatch, Google Cloud Monitoring
- **Database**: MySQL Workbench, phpMyAdmin
- **Logs**: Winston (backend), structured logging

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Check CORS configuration in backend
   - Verify frontend API URL

2. **Database Connection**:
   - Verify database credentials
   - Check network connectivity
   - Ensure database is running

3. **Python Service Issues**:
   - Check Python dependencies
   - Verify spaCy model installation
   - Check service health endpoint

4. **Build Failures**:
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify all dependencies are installed

## 📞 Support

For deployment issues:
1. Check the logs in your hosting platform
2. Verify all environment variables are set
3. Test services individually
4. Check network connectivity between services

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

**Note**: Choose the deployment option that best fits your needs and budget. Vercel is recommended for quick deployment, while Docker provides more control and portability.
