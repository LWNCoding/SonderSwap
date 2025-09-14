# Vercel Deployment Guide

## 🚀 Single Project Deployment

This project is now configured for Vercel deployment as a single project with both frontend and backend.

## 📁 Project Structure

```
SonderSwap/
├── api/
│   ├── index.js          # Main API handler
│   └── lib/
│       └── db.js         # Database connection
├── src/                  # Frontend React app
├── dist/                 # Built frontend (generated)
├── vercel.json          # Vercel configuration
└── package.json         # Dependencies
```

## 🔧 Environment Variables

Set these in your Vercel project settings:

### Required Environment Variables:
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://lwncoding_db_user:TV26aPCnHe7yEppN@dev.xigvhak.mongodb.net/?retryWrites=true&w=majority&appName=dev
JWT_SECRET=your-production-jwt-secret-here
CORS_ORIGIN=https://your-domain.vercel.app
```

### Optional Environment Variables:
```
MONGODB_DATABASE=sonderswap
JWT_EXPIRES_IN=7d
API_BASE_URL=https://your-domain.vercel.app/api
FRONTEND_URL=https://your-domain.vercel.app
DEBUG=false
```

## 🚀 Deployment Steps

1. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect the configuration

2. **Set Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add all the required variables listed above

3. **Deploy**:
   - Click "Deploy" or push to your main branch
   - Vercel will build and deploy both frontend and backend

## 📡 API Endpoints

All API endpoints are available at `/api/*`:

- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get specific event
- `GET /api/categories` - Get event categories
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- And many more...

## 🔄 How It Works

1. **Frontend**: Built with Vite and served as static files
2. **Backend**: Serverless functions in the `api/` folder
3. **Database**: MongoDB Atlas (same as local development)
4. **Routing**: Vercel handles routing between frontend and API

## 🛠️ Local Development

To test locally with Vercel:

```bash
# Install Vercel CLI
npm i -g vercel

# Run locally
vercel dev
```

## 📝 Notes

- The API routes are in `api/index.js` and handle all backend logic
- Database connection is cached for performance
- CORS is configured for your production domain
- All existing functionality is preserved

## 🎉 Benefits

- ✅ Single deployment
- ✅ Automatic scaling
- ✅ Global CDN
- ✅ HTTPS by default
- ✅ Easy environment management
- ✅ No server management needed
