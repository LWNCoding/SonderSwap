# Environment Variables Configuration

This document explains how to configure environment variables for the SonderSwap application.

## Quick Start

1. Copy the example file: `cp .env.example .env`
2. Update the values in `.env` with your specific configuration
3. For frontend variables, also copy: `cp .env.local.example .env.local` (if it exists)

## Environment Files

### Backend (.env)
- **Purpose**: Server-side configuration
- **Loaded by**: Node.js server (server.js)
- **Package**: dotenv

### Frontend (.env.local)
- **Purpose**: Client-side configuration
- **Loaded by**: Vite build tool
- **Prefix**: Must start with `VITE_`

## Available Variables

### Server Configuration
| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment mode (development/production) |
| `PORT` | `3001` | Server port number |

### Database
| Variable | Default | Description |
|----------|---------|-------------|
| `MONGODB_URI` | From config/database.js | MongoDB connection string |
| `MONGODB_DATABASE` | `sonderswap` | Database name |

### Authentication
| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_SECRET` | `your-super-secret-jwt-key-change-in-production` | JWT signing secret |
| `JWT_EXPIRES_IN` | `7d` | Token expiration time |

### API Configuration
| Variable | Default | Description |
|----------|---------|-------------|
| `API_BASE_URL` | `http://localhost:3001/api` | Backend API URL |
| `FRONTEND_URL` | `http://localhost:5173` | Frontend URL |

### CORS
| Variable | Default | Description |
|----------|---------|-------------|
| `CORS_ORIGIN` | `http://localhost:5173,http://localhost:5174,http://localhost:5175` | Allowed origins (comma-separated) |

### Frontend (Vite)
| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:3001/api` | Backend API URL for frontend |
| `VITE_FRONTEND_URL` | `http://localhost:5173` | Frontend URL |
| `VITE_DEBUG` | `true` | Enable debug logging |

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit `.env` files** - They contain sensitive information
2. **Use strong JWT secrets** in production
3. **Rotate secrets regularly** in production environments
4. **Use different databases** for development and production
5. **Restrict CORS origins** in production

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use strong, unique secrets
3. Configure production database
4. Set appropriate CORS origins
5. Use HTTPS URLs for API and frontend

## Development

For local development, the default values should work out of the box. The application will:

- Run on port 3001 (backend) and 5173 (frontend)
- Connect to the configured MongoDB database
- Use the provided JWT secret
- Allow CORS from common development ports

## Troubleshooting

### Common Issues

1. **Database connection fails**: Check `MONGODB_URI` format
2. **CORS errors**: Verify `CORS_ORIGIN` includes your frontend URL
3. **API calls fail**: Ensure `VITE_API_BASE_URL` matches your backend URL
4. **JWT errors**: Verify `JWT_SECRET` is consistent between frontend and backend

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG=sonderswap:*
```

This will provide detailed logging for troubleshooting.
