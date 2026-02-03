# 🔔 HCPSS Alert Monitor

**Real-time monitoring for Howard County Public School System status updates**

Monitor https://status.hcpss.org/ for alerts and get notifications via email, desktop, and SMS!

---

## 🚀 How to Use (GitHub Only - No Local Setup!)

### **Step 1: Download These Files**
You should have these 4 files:
- `index.html`
- `styles.css`
- `app.js`
- `README.md` (this file)

### **Step 2: Create GitHub Repository**

1. Go to https://github.com and sign in (or create account)
2. Click the **"+"** in top right → **"New repository"**
3. **Repository name**: `hcpss-alert-monitor`
4. ✅ Make it **Public**
5. Click **"Create repository"**

### **Step 3: Upload Files**

On your new repository page:

1. Click **"uploading an existing file"** link
2. **Drag and drop** all 4 files (or click "choose your files")
3. Scroll down and click **"Commit changes"**

### **Step 4: Enable GitHub Pages**

1. Click **"Settings"** tab (top of your repo)
2. Click **"Pages"** in left sidebar
3. Under **"Source"**:
   - Branch: `main`
   - Folder: `/ (root)`
4. Click **"Save"**
5. **Wait 1-2 minutes** for deployment

### **Step 5: Access Your Live App! 🎉**

Your app will be live at:
```
https://YOUR_USERNAME.github.io/hcpss-alert-monitor/
```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

## ✨ Features

- ✅ **Real-time monitoring** of HCPSS status page
- ✅ **Smart duplicate detection** - won't re-alert for same update
- ✅ **Multi-channel notifications**: Email, Desktop, SMS
- ✅ **Alert history** with export to JSON
- ✅ **Dark green theme** - professional and easy on eyes
- ✅ **Google OAuth** authentication (demo mode)
- ✅ **Works on any device** - fully responsive

---

## 📱 How to Use the App

1. **Click "Sign In"** (demo mode works immediately)
2. **Click "Start Monitoring"** to begin watching for updates
3. **Allow notifications** when prompted (for desktop alerts)
4. **Configure settings** for your notification preferences
5. **View alerts** in Dashboard and History tabs

---

## 🎨 Customize Your App

### Change Colors
Edit `styles.css` and find these color codes:
- Primary green: `#4ade80`
- Dark background: `#0a3d2c`
- Light text: `#86efac`

Replace with your preferred colors!

### Change Check Interval
Edit `app.js` and find:
```javascript
checkInterval: 60,  // Change this number (in seconds)
```

### Add Real HCPSS Integration
Currently uses demo alerts. To connect to real HCPSS status:
1. Edit `checkForUpdates` function in `app.js`
2. Add API call to scrape/check actual status page
3. Parse the response for alerts

---

## 🐛 Troubleshooting

**"Page not found" error?**
- Wait 2-3 minutes after enabling Pages
- Check Settings → Pages shows green checkmark
- Verify you used correct URL

**Notifications not working?**
- Click "Allow" when browser asks for permission
- Must use HTTPS (GitHub Pages uses HTTPS automatically)
- Check Settings tab to enable notifications

**Files not uploading?**
- Make sure all 4 files are selected
- Try uploading one at a time if needed
- Check file names match exactly

---

## 📚 Advanced: Connect to Real API

Want to connect to actual HCPSS status updates? You'll need to:

1. **Use a web scraping service** (like Puppeteer or Cheerio)
2. **Or integrate with HCPSS API** (if available)
3. **Or use Claude API** to check the page (as designed)

For Claude API integration, you'll need:
```javascript
// In app.js, replace the checkForUpdates function with:
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [{ role: 'user', content: 'Check HCPSS status...' }]
  })
});
```

---

## 🤝 Contributing

Want to improve this app?

1. Fork the repository
2. Make your changes
3. Submit a Pull Request

---

## 📄 License

MIT License - feel free to use and modify!

---

## 💡 Tips

- **Bookmark your app** for quick access
- **Enable desktop notifications** for real-time alerts
- **Export alert history** regularly (Download button in History tab)
- **Share with other parents** - just send them your GitHub Pages URL!
- **Star the repo** ⭐ to bookmark it on GitHub

---

## 🆘 Need Help?

1. **Check the Troubleshooting section** above
2. **Open an Issue** on GitHub
3. **Ask in Discussions** tab

---

**That's it! Your HCPSS Alert Monitor is ready to use! 🎉**

No installation, no Node.js, no command line - just upload to GitHub and go!
