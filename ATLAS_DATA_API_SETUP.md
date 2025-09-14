# MongoDB Atlas Data API Setup Guide

This guide explains how to set up MongoDB Atlas Data API to avoid IP whitelist issues with Vercel deployment.

## 🚀 **Why Use Atlas Data API?**

- **No IP Whitelist Issues**: Works from any IP address
- **No Direct Database Connections**: Uses HTTP API instead
- **Better for Serverless**: Perfect for Vercel functions
- **Simpler Configuration**: Just need API key and endpoint

## 📋 **Step 1: Enable Data API in MongoDB Atlas**

1. **Go to MongoDB Atlas Dashboard**
   - Visit [cloud.mongodb.com](https://cloud.mongodb.com)
   - Select your project

2. **Navigate to Data API**
   - In the left sidebar, click **"Data API"**
   - If not visible, go to **"Services"** → **"Data API"**

3. **Create Data API**
   - Click **"Create Data API"**
   - Choose your cluster (e.g., "Cluster0")
   - Select your database (e.g., "sonderswap")
   - Click **"Create"**

4. **Get Your Credentials**
   - Copy the **API Endpoint URL** (looks like: `https://data.mongodb-api.com/app/data-xxxxx/endpoint/data/v1`)
   - Copy the **API Key** (long string starting with letters/numbers)

## 🔧 **Step 2: Update Environment Variables**

### **For Local Development (.env)**
```bash
# Add these to your .env file
ATLAS_API_BASE=https://data.mongodb-api.com/app/data-xxxxx/endpoint/data/v1
ATLAS_API_KEY=your-actual-api-key-here
ATLAS_CLUSTER_NAME=Cluster0
ATLAS_DATABASE=sonderswap
```

### **For Vercel Deployment**
1. Go to your Vercel project dashboard
2. Click **"Settings"** → **"Environment Variables"**
3. Add these variables:
   - `ATLAS_API_BASE`: Your Data API endpoint URL
   - `ATLAS_API_KEY`: Your Data API key
   - `ATLAS_CLUSTER_NAME`: Your cluster name (usually "Cluster0")
   - `ATLAS_DATABASE`: Your database name (usually "sonderswap")

## 🧪 **Step 3: Test the Setup**

### **Test API Endpoint**
```bash
curl https://sonder-swap.vercel.app/api/test
```

Should return:
```json
{
  "status": "ok",
  "atlasApiKey": "Set",
  "atlasApiBase": "Set"
}
```

### **Test Categories Endpoint**
```bash
curl https://sonder-swap.vercel.app/api/categories
```

Should return the "Trending Events" category with events array.

## 🔍 **Step 4: Verify Data API Access**

The Data API needs access to your collections. Make sure:

1. **Collections Exist**: `eventcategories` and `events` collections
2. **Data API Permissions**: 
   - Go to Data API settings
   - Ensure it has **"Read"** access to both collections
   - For writes, you'll need **"Write"** access too

## 🛠️ **API Endpoints Available**

- `GET /api/categories` - Get all event categories
- `GET /api/categories/:title/events` - Get events for a specific category
- `GET /api/events` - Get all events
- `GET /api/health` - Health check
- `GET /api/test` - Test endpoint with environment info

## 🚨 **Troubleshooting**

### **"ATLAS_API_KEY environment variable is not set"**
- Check that you've set the environment variable in Vercel
- Verify the variable name is exactly `ATLAS_API_KEY`

### **"Atlas API error: 401"**
- Check that your API key is correct
- Verify the API key hasn't expired

### **"Atlas API error: 404"**
- Check that your API endpoint URL is correct
- Verify the cluster name and database name

### **"Collection not found"**
- Ensure the collections exist in your database
- Check the collection names are exactly `eventcategories` and `events`

## ✅ **Benefits of This Approach**

1. **No IP Whitelist Management**: Works from anywhere
2. **Better Performance**: HTTP API is faster than direct DB connections
3. **Easier Scaling**: Perfect for serverless functions
4. **Simpler Debugging**: Clear HTTP error messages
5. **Better Security**: API keys instead of database credentials

## 🔄 **Migration from Direct MongoDB**

The API has been completely rewritten to use Atlas Data API instead of direct MongoDB connections. This eliminates all IP whitelist issues and provides better reliability for Vercel deployments.

---

**Need Help?** Check the MongoDB Atlas Data API documentation or contact support.
