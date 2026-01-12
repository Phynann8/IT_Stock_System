# IT Asset & Inventory Management System

**Multi-File Version Setup Guide**

## 📁 Files Included

1. **index.html** - Main HTML structure and markup
2. **styles.css** - All styling and design system
3. **script.js** - All JavaScript functionality and Firebase logic
4. **README.md** - This setup guide

## 🚀 Quick Start

### Option 1: Using a Local Web Server (Recommended)

1. **Create a folder** for your project:
   ```
   mkdir it-asset-system
   cd it-asset-system
   ```

2. **Place all files in this folder:**
   - index.html
   - styles.css
   - script.js

3. **Start a local server** (choose one):

   **Python 3.x:**
   ```bash
   python -m http.server 8000
   ```

   **Python 2.x:**
   ```bash
   python -m SimpleHTTPServer 8000
   ```

   **Node.js (using http-server):**
   ```bash
   npm install -g http-server
   http-server
   ```

   **PHP:**
   ```bash
   php -S localhost:8000
   ```

4. **Open your browser** and navigate to:
   ```
   http://localhost:8000
   ```

### Option 2: Using VS Code Live Server

1. Install the "Live Server" extension in VS Code
2. Place all files in a folder
3. Right-click on `index.html` → "Open with Live Server"

## 📋 File Structure

```
it-asset-system/
├── index.html          (Main HTML file)
├── styles.css          (All CSS styles)
├── script.js           (All JavaScript code)
└── README.md           (This file)
```

## 🔄 How Files Work Together

### index.html
- Contains all HTML elements and structure
- Links to external `styles.css` file
- Links to external `script.js` file
- All modals and page templates are defined here

### styles.css
- Complete design system with CSS variables
- All responsive styles and animations
- Layout, typography, components, and animations
- Mobile-responsive media queries

### script.js
- Firebase configuration and initialization
- All JavaScript functions for CRUD operations
- User authentication logic
- Data loading and display functions
- Modal management and toast notifications

## 🔐 Firebase Configuration

The app is pre-configured with a Firebase project. No additional setup needed!

**Firebase Details:**
- **Project:** it-asset-system-2091b
- **Authentication:** Email/Password enabled
- **Database:** Cloud Firestore
- **Default Collections:** assets, categories, locations, users

## 👤 Test Credentials

When you first load the app:
1. Click "Sign Up" to create a new account
2. Or use the system to create test users as Admin

**Admin Features:**
- Create, edit, delete assets
- Manage users and roles
- Manage categories and locations
- View permissions dashboard

## ✨ Key Features

- 🔐 **Authentication** - Secure login/signup with Firebase
- 📊 **Dashboard** - Real-time asset statistics
- 💻 **Asset Management** - Add, view, and filter assets
- 📂 **Categories** - Organize assets by type
- 📍 **Locations** - Building, floor, and room hierarchy
- 👥 **User Management** - Admin controls for user roles
- 🔐 **Permissions** - Role-based access control (Admin, IT Staff, Viewer)
- 📥 **Export** - Export assets to CSV format
- 🔔 **Notifications** - Toast alerts for all actions

## 🛠️ Development Notes

### Making Changes

**To modify styles:**
1. Edit `styles.css`
2. Save the file
3. Refresh your browser (Ctrl+R or Cmd+R)

**To modify functionality:**
1. Edit `script.js`
2. Save the file
3. Refresh your browser

**To modify HTML structure:**
1. Edit `index.html`
2. Save the file
3. Refresh your browser

### CSS Variables

Common colors and spacing are defined at the top of `styles.css`:

```css
:root {
    --color-white: rgba(255, 255, 255, 1);
    --color-teal-500: rgba(33, 128, 141, 1);
    --space-8: 8px;
    --space-16: 16px;
    /* ... more variables ... */
}
```

Use these variables in CSS for consistent styling.

## 🔧 Troubleshooting

### "GET /styles.css 404" Error
- Make sure all three files (`index.html`, `styles.css`, `script.js`) are in the same folder
- Check that file names match exactly (case-sensitive on Linux/Mac)

### Firebase errors
- Ensure you have internet connection
- Check browser console (F12) for detailed error messages
- Clear browser cache and reload

### Styles not loading
- Clear browser cache (Ctrl+Shift+Delete)
- Make sure the CSS file path is correct in the HTML
- Try a different browser

### JavaScript not working
- Open browser developer tools (F12)
- Check the "Console" tab for errors
- Make sure `script.js` is in the same folder as `index.html`

## 📝 Adding More Features

### To add a new page:

1. **Add HTML in index.html:**
   ```html
   <div id="newPage" class="dashboard">
       <div class="page-title">New Page</div>
       <!-- Your content -->
   </div>
   ```

2. **Add navigation button in sidebar:**
   ```html
   <button class="nav-item" onclick="showPage('newPage')">📄 New Page</button>
   ```

3. **Add page title mapping in script.js:**
   ```javascript
   const titles = {
       // ... existing titles ...
       newPage: 'New Page Title'
   };
   ```

4. **Add JavaScript functions in script.js** for any functionality needed

## 📚 Resources

- **Firebase Documentation:** https://firebase.google.com/docs
- **CSS Guide:** https://developer.mozilla.org/en-US/docs/Web/CSS
- **JavaScript Guide:** https://developer.mozilla.org/en-US/docs/Web/JavaScript

## 🎯 Performance Tips

1. **Minify CSS and JS** for production (use online minifiers)
2. **Use a CDN** for Firebase scripts
3. **Optimize images** if you add any
4. **Cache management** - Firebase handles this automatically

## ✅ Deployment Ready

This app is ready to deploy to:
- **Vercel** (vercel.com)
- **Netlify** (netlify.com)
- **Firebase Hosting** (firebase.google.com/docs/hosting)
- **GitHub Pages** (pages.github.com)
- **Any web hosting provider**

Just upload the three files and you're good to go!

---

**Version:** 1.0 MVP  
**Last Updated:** December 2025  
**Support:** Check browser console for error messages
