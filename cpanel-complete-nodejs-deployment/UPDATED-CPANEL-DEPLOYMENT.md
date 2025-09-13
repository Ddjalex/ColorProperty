# 🚀 UPDATED: Complete cPanel Node.js Deployment Guide

## ⚠️ SECURITY-SAFE DEPLOYMENT PROCESS

### 📋 **Step 1: Upload Application Files**

Upload ALL these files to your cPanel root directory:

```
📁 Your cPanel Root/
├── 📄 app.js                    ← Entry point
├── 📄 package.json              ← Dependencies
├── 📄 .htaccess                 ← URL routing
├── 📁 server/                   ← Backend source
├── 📁 client/                   ← Frontend source
├── 📁 shared/                   ← Shared types
├── 📁 scripts/                  ← Database seeding
│   └── 📄 seed.js               ← Creates admin & sample data
└── 📄 Other files...
```

---

## 🔐 **Step 2: Set Environment Variables in cPanel**

**Go to cPanel → Node.js App → Environment Variables**

Add these variables:

```
NODE_ENV = production
PORT = 3000
MONGODB_URI = your_mongodb_atlas_connection_string_here
JWT_SECRET = your_super_strong_secret_key_32_characters_minimum
```

**🔥 IMPORTANT**: 
- Replace `your_mongodb_atlas_connection_string_here` with your actual MongoDB Atlas URI
- Replace `your_super_strong_secret_key_32_characters_minimum` with a strong secret key

---

## ⚙️ **Step 3: Configure Node.js Application**

1. **Login to cPanel**
2. **Go to "Node.js Selector" or "Node.js App"**
3. **Click "Create Application"**
4. **Configure:**
   - **Node.js Version**: 18.x or higher
   - **Application Mode**: Production
   - **Application Root**: Your domain directory
   - **Application Startup File**: `app.js`

---

## 📦 **Step 4: Install Dependencies & Build**

In the cPanel Node.js interface:

1. **Click "Run NPM Install"** (installs dependencies)
2. **Wait for completion** (2-3 minutes)
3. **In the terminal section, run**:
   ```bash
   npm run build
   ```
4. **Wait for build to complete**

---

## 🗃️ **Step 5: Seed Database (Create Admin & Properties)**

In the cPanel Node.js terminal:

```bash
node scripts/seed.js
```

This creates:
- ✅ **Admin user**: `admin@temer.com` / `admin123`
- ✅ **Sample properties** (including featured ones for hero slider)

---

## ▶️ **Step 6: Start Application**

1. **Click "Restart" in Node.js interface**
2. **Visit your website**: https://temerrealestatesales.com
3. **Should load without WebSocket errors!**

---

## 🔍 **Step 7: Test Everything**

### Test Website Loading:
- ✅ **Homepage loads**: https://temerrealestatesales.com
- ✅ **No console errors**
- ✅ **Properties display**
- ✅ **Hero slider works**

### Test Admin Login:
- ✅ **Go to**: https://temerrealestatesales.com/admin/login
- ✅ **Login**: `admin@temer.com` / `admin123`
- ✅ **Dashboard loads**

---

## ✅ **Expected Results**

After deployment:
- ❌ **No WebSocket errors** (disabled in production)
- ✅ **Admin login works**
- ✅ **Properties display**
- ✅ **Hero slider works**
- ✅ **All features functional**

---

## 🚨 **Troubleshooting**

### "Cannot GET /"
- **Fix**: Check if Node.js app is running in cPanel

### "Internal Server Error"
- **Fix**: Check environment variables are set correctly

### "Database connection failed"
- **Fix**: Verify MONGODB_URI in environment variables

### "Admin login fails"
- **Fix**: Run seeding script: `node scripts/seed.js`

---

## 🔒 **Security Notes**

- ✅ **No credentials in code** (uses environment variables)
- ✅ **WebSocket disabled in production** (prevents errors)
- ✅ **Strong JWT secrets required**
- ✅ **Database connection secured**

This deployment is **production-ready and secure**!