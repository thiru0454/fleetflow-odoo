# Google OAuth Login Error - Complete Fix Guide

## 🔴 **Problem**

Your friend gets a login error when trying to sign in with Google because the **redirect URI doesn't match** what's configured in Supabase.

---

## ✅ **SOLUTION: Configure Google OAuth Correctly**

### **Step 1: Check Your Development Environment**

When running locally:
```bash
npm run dev
# App runs on: http://localhost:5173 (or similar)
```

When deployed:
```
https://yourdomain.com
```

### **Step 2: Update Vite Config (if needed)**

Make sure your `vite.config.ts` uses the same port everywhere:

```typescript
export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost",  // Change from "::" to "localhost"
    port: 5173,         // Standard Vite port
    hmr: {
      overlay: false,
    },
  },
  // ... rest of config
}));
```

### **Step 3: Go to Supabase Dashboard**

1. **Navigate to:** Authentication → Providers → Google
2. **Look for "Redirect URLs" section**
3. **Add BOTH URLs:**
   - `http://localhost:5173` (for development)
   - `http://localhost:3000` (if using that port)
   - `https://yourdomain.com` (when deployed in production)
   - `https://yourdomain.com/auth/callback` (sometimes needed)

### **Step 4: Copy Your Google OAuth Credentials**

In Supabase → Authentication → Providers → Google:
1. Check if "Google OAuth credentials" section exists
2. If not configured, you need to:
   - Go to Google Cloud Console: https://console.cloud.google.com
   - Create a new OAuth 2.0 credentials (type: Web Application)
   - Set **Authorized redirect URIs** to:
     ```
     https://hoyfwotvfdqypvnbsidn.supabase.co/auth/v1/callback
     ```
   - Copy the **Client ID** and **Client Secret**
   - Paste them into Supabase Google Provider settings

### **Step 5: Configure in Supabase OAuth Settings**

Add these redirect URIs to Supabase:
```
http://localhost:5173
http://localhost:5173/
http://127.0.0.1:5173
https://yourdomain.com
https://yourdomain.com/
```

---

## 🔧 **Update Your Code (Optional - Better Redirect Handling)**

In your `src/store/useStore.ts`, make the redirect more robust:

```typescript
loginWithGoogle: async () => {
  // Detect environment
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const isProduction = window.location.protocol === 'https:';
  
  let redirectUrl = window.location.origin;
  
  // More specific redirects if needed
  if (isDev) {
    redirectUrl = 'http://localhost:5173'; // or your dev port
  } else if (isProduction) {
    redirectUrl = 'https://yourdomain.com';
  }
  
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
    },
  });
},
```

---

## 🔐 **Google Cloud Console Setup (If Needed)**

If Google OAuth isn't set up:

1. **Go to:** https://console.cloud.google.com
2. **Create Project** → Name: "FleetFlow"
3. **Enable APIs:**
   - Click "Enable APIs and Services"
   - Search for "Google+ API"
   - Click Enable
4. **Create OAuth Credentials:**
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Add authorized redirect URIs:
     ```
     https://hoyfwotvfdqypvnbsidn.supabase.co/auth/v1/callback
     http://localhost:5173
     http://localhost:3000
     ```
   - Copy the **Client ID** and **Client Secret**
5. **Go to Supabase** → Authentication → Providers → Google
6. **Paste credentials** and save

---

## ✓ **Testing Steps**

1. **Clear browser cache & cookies** (important!)
   - Press `Ctrl+Shift+Delete` / `Cmd+Shift+Delete`
   - Clear cookies and cache

2. **Restart your dev server:**
   ```bash
   npm run dev
   # Wait for it to fully load
   ```

3. **Test login:**
   - Go to http://localhost:5173 (or your local URL)
   - Click "Login with Google"
   - Should redirect to Google login
   - Should redirect back and work!

4. **Check console for errors:**
   - Open DevTools: F12
   - Go to Console tab
   - Look for any error messages
   - Share the error if still not working

---

## 🐛 **Common Error Messages & Fixes**

### **Error: "redirect_uri_mismatch"**
**Cause:** URL doesn't match Supabase settings
**Fix:** Add the exact URL to Supabase redirect URIs

### **Error: "Invalid client"**
**Cause:** Google OAuth credentials not set up
**Fix:** Configure Google credentials in Supabase

### **Error: "Authentication failed"**
**Cause:** Browser cookies blocked
**Fix:** Check privacy settings, clear cache, use incognito window

### **Error: "Timeout"**
**Cause:** Network issue or slow response
**Fix:** Check internet, wait a moment, try again

### **Error: "CORS error"**
**Cause:** Domain not whitelisted
**Fix:** Add domain to Supabase allowed origins

---

## 📝 **Quick Checklist for Your Friend**

- [ ] Clear browser cache & cookies
- [ ] Make sure running on: http://localhost:5173
- [ ] Verify Supabase has redirect URIs added
- [ ] Google OAuth credentials configured in Supabase
- [ ] User not using VPN/Proxy
- [ ] JavaScript enabled in browser
- [ ] Cookies enabled for Supabase domain
- [ ] Restart dev server after config changes

---

## 🆘 **Still Getting Error?**

1. **Share the exact error message** with me
2. **Take a screenshot** of the error
3. **Check Supabase logs:**
   - Go to Supabase → Authentication → Auth Logs
   - Look for failed login attempts
   - Share the error details

4. **Test with different account:**
   - Try a different Google account
   - See if it's account-specific or system-wide

---

## 📱 **For Production/Deployment**

When you deploy (e.g., Vercel, Netlify):

1. **Update redirect URIs in Supabase:**
   ```
   https://yourdomain.com
   https://yourdomain.com/
   https://www.yourdomain.com
   ```

2. **Update in Google Cloud Console:**
   Same URLs

3. **Set environment variables** (if using):
   ```
   VITE_SUPABASE_URL=https://hoyfwotvfdqypvnbsidn.supabase.co
   VITE_SUPABASE_ANON_KEY=your_key_here
   ```

---

## 💡 **Pro Tips**

- Use Incognito/Private window if still having issues
- Don't share Google credentials (client ID is public, secret stays private)
- Test on both Chrome and Firefox
- Check that date/time on computer is correct (OAuth is time-sensitive)

---

**Quick Reference:**
- Your Supabase: https://hoyfwotvfdqypvnbsidn.supabase.co
- Dev redirect URL: http://localhost:5173
- Production redirect URL: https://yourdomain.com
