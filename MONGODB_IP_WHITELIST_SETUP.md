# MongoDB Atlas IP Whitelist Setup for Vercel

This guide explains how to configure MongoDB Atlas IP whitelist to allow Vercel deployments to connect to your database.

## 🚀 **Why This Approach?**

- **Direct Database Connection**: Uses MongoDB Node.js driver directly
- **Better Performance**: No API overhead
- **Simpler Setup**: Just need to whitelist Vercel's IP ranges
- **More Reliable**: Direct connection is more stable than API calls

## 📋 **Step 1: Get Vercel's IP Addresses**

First, let's find out what IP addresses Vercel is using:

### **Method 1: Use the IP Check Endpoint**
```bash
curl https://sonder-swap.vercel.app/api/ip
```

This will show you the exact IP address Vercel is using for your deployment.

### **Method 2: Vercel's Known IP Ranges**
Vercel uses these IP ranges that you should whitelist:

**Vercel's IP Ranges:**
- `76.76.19.0/24`
- `76.76.20.0/24` 
- `76.76.21.0/24`
- `76.76.22.0/24`
- `76.76.23.0/24`
- `76.76.24.0/24`
- `76.76.25.0/24`
- `76.76.26.0/24`
- `76.76.27.0/24`
- `76.76.28.0/24`
- `76.76.29.0/24`
- `76.76.30.0/24`
- `76.76.31.0/24`

## 🛠️ **Step 2: Configure MongoDB Atlas IP Whitelist**

### **Option A: Quick Setup (Allow All IPs)**
1. **Go to MongoDB Atlas Dashboard**
   - Visit [cloud.mongodb.com](https://cloud.mongodb.com)
   - Select your project

2. **Navigate to Network Access**
   - In the left sidebar, click **"Network Access"**

3. **Add IP Address**
   - Click **"Add IP Address"**
   - Choose **"Allow Access from Anywhere"**
   - Enter `0.0.0.0/0`
   - Comment: "Vercel deployment access"
   - Click **"Confirm"**

### **Option B: Specific IP Ranges (More Secure)**
1. **Go to MongoDB Atlas Dashboard**
   - Visit [cloud.mongodb.com](https://cloud.mongodb.com)
   - Select your project

2. **Navigate to Network Access**
   - In the left sidebar, click **"Network Access"**

3. **Add Vercel IP Ranges**
   - Click **"Add IP Address"**
   - Choose **"Add IP Address"**
   - Enter: `76.76.19.0/24`
   - Comment: "Vercel IP Range 1"
   - Click **"Add"**
   - Repeat for other ranges above

## 🔧 **Step 3: Set Environment Variables in Vercel**

Go to your Vercel project dashboard and add these environment variables:

```
MONGODB_URI=mongodb+srv://lwncoding_db_user:TV26aPCnHe7yEppN@dev.xigvhak.mongodb.net/?retryWrites=true&w=majority&appName=dev
MONGODB_DATABASE=sonderswap
CORS_ORIGIN=https://sonder-swap.vercel.app
```

## 🧪 **Step 4: Test the Setup**

### **Test API Endpoint**
```bash
curl https://sonder-swap.vercel.app/api/test
```

Should return:
```json
{
  "status": "ok",
  "mongoUri": "Set"
}
```

### **Test Categories Endpoint**
```bash
curl https://sonder-swap.vercel.app/api/categories
```

Should return the "Trending Events" category with events array.

### **Test Category Events**
```bash
curl https://sonder-swap.vercel.app/api/categories/Trending%20Events/events
```

Should return events with IDs [1, 2, 3, 4, 13, 20, 7, 15, 24, 11].

## 🚨 **Troubleshooting**

### **"Could not connect to any servers"**
- Check that IP addresses are whitelisted in MongoDB Atlas
- Verify the MONGODB_URI is correct
- Check that the database name is correct

### **"Authentication failed"**
- Verify the username and password in MONGODB_URI
- Check that the user has proper permissions

### **"Database not found"**
- Verify MONGODB_DATABASE environment variable
- Check that the database exists in Atlas

## ✅ **Benefits of This Approach**

1. **Direct Connection**: No API overhead
2. **Better Performance**: Faster than Data API
3. **Full MongoDB Features**: Access to all MongoDB operations
4. **Easier Debugging**: Direct connection errors are clearer
5. **More Reliable**: Less moving parts than Data API

## 🔄 **Current Status**

The API has been updated to use the MongoDB Node.js driver directly with:
- ✅ **Connection Caching**: Reuses connections in serverless environment
- ✅ **Proper Error Handling**: Clear error messages
- ✅ **Vercel Optimized**: Works well with Vercel's serverless functions
- ✅ **No Dependencies**: Just needs IP whitelist configuration

---

**Next Step**: Configure the IP whitelist in MongoDB Atlas and test the API!
