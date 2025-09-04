========================================
TEMER PROPERTIES - CPANEL DEPLOYMENT GUIDE
========================================

📁 FOLDER STRUCTURE FOR CPANEL:
-------------------------------
Upload contents to: /home/[username]/public_html/
OR specific domain folder: /home/[username]/public_html/[yourdomain.com]/

📂 Required cPanel Setup:
- Node.js App enabled
- MongoDB Atlas connection (already configured)
- Minimum Node.js version: 18+

🚀 DEPLOYMENT STEPS:

1. UPLOAD PROJECT FILES
   - Upload ALL files from this deployment-package folder
   - Maintain folder structure exactly as shown

2. CPANEL NODE.JS APP SETUP
   - Go to cPanel → Node.js Applications
   - Click "Create Application"
   - Set Application Directory: public_html (or your domain folder)
   - Set Application URL: your domain
   - Set Application Startup File: dist/index.js
   - Node.js Version: 18+ (latest available)

3. INSTALL DEPENDENCIES
   - Open Terminal in cPanel
   - Navigate to your app directory
   - Run: npm install --production

4. START APPLICATION
   - In Node.js App settings, click "Start"
   - Your app will be live at your domain

⚠️  IMPORTANT NOTES:
- Database: Already configured with MongoDB Atlas (no setup needed)
- Static Files: Automatically served from dist/public/
- Port: Will be automatically assigned by cPanel
- Environment: Production mode enabled

✅ YOUR DATA IS SAFE:
All your data (properties, hero slides, blog posts) is stored in MongoDB Atlas cloud and will remain intact during deployment.

🔧 TROUBLESHOOTING:
- If app doesn't start: Check Node.js version (use 18+)
- If database connection fails: Whitelist cPanel server IP in MongoDB Atlas
- If images don't load: Ensure dist/public folder is uploaded correctly

📞 SUPPORT:
Your MongoDB connection string is already configured in server/db.ts
All API endpoints will work automatically once deployed.