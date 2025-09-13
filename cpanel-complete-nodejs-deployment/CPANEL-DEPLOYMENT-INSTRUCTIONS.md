# 🚀 Complete cPanel Node.js Deployment Guide

## ⚠️ CRITICAL: You must deploy as Node.js application, NOT static files

### 📋 **Pre-Requirements**
1. cPanel hosting with **Node.js support** 
2. MongoDB Atlas account and connection string
3. Node.js version 18+ on your hosting

---

## 🗂️ **Step 1: Upload Files**

Upload ALL these files to your cPanel account:

```
📁 temerrealestatesales.com/
├── 📄 app.js                    ← Entry point (REQUIRED)
├── 📄 package.json              ← Dependencies (REQUIRED)
├── 📄 .htaccess                 ← URL routing (REQUIRED)
├── 📄 .env                      ← Environment variables (REQUIRED)
├── 📁 dist/                     ← Built application (REQUIRED)
│   ├── 📄 index.js              ← Server bundle
│   └── 📁 public/               ← Frontend files
├── 📁 server/                   ← Source files (REQUIRED)
├── 📁 client/                   ← Source files (REQUIRED)
├── 📁 shared/                   ← Source files (REQUIRED)
└── 📄 Other files...
```

---

## ⚙️ **Step 2: Create Environment Variables**

Create `.env` file with:

```env
NODE_ENV=production
PORT=3000

# 🔥 REPLACE WITH YOUR MONGODB ATLAS CONNECTION STRING
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/temer_properties

# 🔐 REPLACE WITH A STRONG SECRET (32+ characters)
JWT_SECRET=your-super-secret-jwt-key-here-minimum-32-characters-for-security
```

**⚠️ IMPORTANT**: Replace the MongoDB connection string and JWT secret with your actual values!

---

## ⚙️ **Step 3: cPanel Node.js Configuration**

1. **Login to cPanel**
2. **Go to "Node.js Selector"**
3. **Click "Create Application"**
4. **Configure as follows:**
   - **Node.js Version**: 18.x or higher
   - **Application Mode**: Production
   - **Application Root**: `/public_html` (or your domain folder)
   - **Application URL**: Your domain
   - **Application Startup File**: `app.js`
   - **Passenger Log File**: Enable

5. **Click "Create"**

---

## 📦 **Step 4: Install Dependencies**

In cPanel Node.js interface:

1. **Click "Run NPM Install"** (this installs all dependencies)
2. **Wait for completion** (may take 2-3 minutes)
3. **Check for any errors**

---

## ▶️ **Step 5: Start Application**

1. **Click "Restart" in Node.js interface**
2. **Visit your website**: https://temerrealestatesales.com
3. **Check it loads properly**

---

## 🔍 **Step 6: Test Admin Login**

1. **Go to**: https://temerrealestatesales.com/admin/login
2. **Login with**:
   - **Email**: `admin@temer.com`
   - **Password**: `admin123`
3. **Should work now!**

---

## 🗃️ **Step 7: Add Sample Data**

If properties are missing:

1. **Login to admin**
2. **Go to Properties section**
3. **Add sample properties**
4. **Mark some as "Featured" for hero slider**

---

## ✅ **Expected Results**

After successful deployment:

- ✅ **Website loads**: https://temerrealestatesales.com
- ✅ **No WebSocket errors** in browser console
- ✅ **Admin login works**: /admin/login
- ✅ **Properties display** (after adding them)
- ✅ **Hero slider works** (with featured properties)
- ✅ **All API endpoints work**

---

## 🚨 **Troubleshooting**

### Problem: "Cannot GET /"
- **Solution**: Node.js app not running. Check cPanel Node.js status.

### Problem: "Internal Server Error"
- **Solution**: Check environment variables in `.env` file.

### Problem: "Database connection failed"
- **Solution**: Verify MongoDB connection string in `.env`.

### Problem: Still seeing WebSocket errors
- **Solution**: Clear browser cache (Ctrl+F5) after deployment.

---

## 📞 **Support**

If you need help:
1. Check cPanel error logs
2. Verify all files uploaded correctly
3. Ensure Node.js app is running in cPanel
4. Confirm environment variables are set

Remember: This is a **Node.js application**, not static hosting!