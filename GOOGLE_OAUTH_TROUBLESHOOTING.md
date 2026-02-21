# Google OAuth Login Error - Troubleshooting for Your Friend

## 🚀 **Quick Fix (Do This First)**

### **1. Clear Everything & Restart**
```bash
# Clear cache
Ctrl+Shift+Delete (Windows)
Cmd+Shift+Delete (Mac)
# Select "Cookies and cached images/files" → Clear

# Restart dev server
npm run dev
```

### **2. Check Supabase Configuration**

Go to: https://app.supabase.com

1. Select your project (FleetFlow)
2. Left menu → **Authentication** → **Providers**
3. Find **Google**
4. Check that these URLs are added under "Redirect URIs":
   ```
   http://localhost:5173
   http://localhost:5173/
   ```

If they're missing, ADD them and save.

### **3. Test in Incognito Window**

1. Open **Incognito/Private window** (Ctrl+Shift+N / Cmd+Shift+N)
2. Go to http://localhost:5173
3. Click "Login with Google"
4. Try a different Google account if needed

---

## ❌ **If Still Getting Error...**

### **Check the Error Type:**

**Error Popup Shows:**
```
"redirect_uri_mismatch" 
"Invalid OAuth client"
"Authentication failed"
```

**→ See sections below**

---

## 🔧 **Detailed Fixes by Error Message**

### **❌ Error: "redirect_uri_mismatch"**

**Problem:** The URL doesn't match what's in Supabase

**Fix:**
1. Open DevTools → F12
2. Check the URL in address bar
3. Go to Supabase → Authentication → Providers → Google
4. Add that exact URL to "Redirect URIs"

Example:
```
If URL is: http://localhost:5173
Then add:  http://localhost:5173
           http://localhost:5173/
```

---

### **❌ Error: "Invalid client" or "Authentication failed"**

**Problem:** Google OAuth credentials not configured in Supabase

**Fix - Option A (Recommended - Already Set Up):**
1. Supabase should already have Google credentials
2. Clear cache and try again
3. Make sure Supabase project is correct

**Fix - Option B (If Option A doesn't work):**
1. Go to Supabase → Authentication → Providers → Google
2. Check if "Google providers enabled" is toggled ON
3. First time setup? Get credentials from Google Cloud:
   - https://console.cloud.google.com
   - Create OAuth 2.0 credentials
   - Add redirect: `https://hoyfwotvfdqypvnbsidn.supabase.co/auth/v1/callback`
   - Copy Client ID and Secret
   - Paste in Supabase

---

### **❌ Error: "Timeout" or "Connection Failed"**

**Problem:** Network or Supabase connection issue

**Fix:**
1. Check internet connection
2. Try again after few seconds
3. Reload page and try again
4. Check if Supabase is down: https://status.supabase.com

---

### **❌ Error: "CORS error" in Console**

**Problem:** Browser blocking cross-origin request

**Fix:**
1. Clear cookies: Ctrl+Shift+Delete
2. Use different browser (Chrome, Firefox, etc)
3. Disable VPN/Proxy temporarily
4. Check if Supabase domain is in allowed origins

---

### **❌ No Error but Page Keeps Reloading**

**Problem:** Redirect loop

**Fix:**
1. Clear all cookies for the domain
2. Hard refresh: Ctrl+Shift+R (Cmd+Shift+R Mac)
3. Try in Incognito/Private window
4. Check browser console for errors

---

## 🔍 **How to Check What's Wrong**

### **Step 1: Open Developer Console**
```
Windows: F12 or Ctrl+Shift+I
Mac: Cmd+Option+I
```

### **Step 2: Go to Console Tab**
- Look for any RED error messages
- Copy the error text

### **Step 3: Check Network Tab**
- Click "Network"
- Try Google login again
- Look for failed requests
- Failed request with "auth" or "token" in name = problem

### **Step 4: Check Application/Storage Tab**
- Look for Supabase cookies
- Should have multiple auth-related cookies
- If empty/missing = Supabase not setting cookies properly

---

## 📋 **Verification Checklist**

Run through this checklist:

- [ ] **Dev server running** on `http://localhost:5173`
- [ ] **Supabase redirect URIs** include `http://localhost:5173`
- [ ] **Cookies enabled** in browser
- [ ] **JavaScript enabled** in browser
- [ ] **Cache cleared** (Ctrl+Shift+Delete)
- [ ] **Page reloaded** after clearing cache (Ctrl+R)
- [ ] **Using same Google account** (not multiple profiles)
- [ ] **Internet connection** working
- [ ] **VPN/Proxy** disabled (if using one)
- [ ] **Date/Time** on computer is correct
- [ ] **Tried Incognito window** test

---

## 🆘 **Get Detailed Error Info**

Share this information to help debug:

1. **Screenshot of error message**
2. **Browser used** (Chrome, Firefox, Safari, Edge)
3. **Operating System** (Windows, Mac, Linux)
4. **Local URL** being used (e.g., localhost:5173)
5. **Console error** (F12 → Console → copy red error)
6. **Network tab error** (F12 → Network → details of failed request)

---

## 💡 **Alternative: Test with Email Login**

To test if the app works:

1. Try **Email + Password signup** instead:
   - Email: `test@example.com`
   - Password: `Test123!`
   - Role: Select one (e.g., Fleet Manager)
2. If email login works → Problem is specifically with Google
3. If email login also fails → Network or Supabase problem

---

## 🆔 **Check Supabase Status**

1. Go to your project dashboard
2. Look for green checkmark ✓ at top right
3. Check: https://status.supabase.com
4. If red/down → Wait for Supabase to recover

---

## 📞 **Still Not Working?**

1. **Screenshot error** and console logs
2. **Verify Supabase configuration** is saved
3. **Check Supabase Auth Logs:**
   - Supabase Dashboard → Authentication → Auth Logs
   - Look for failed login attempts
   - Share details

4. **Try fresh clone:**
   ```bash
   git clone [repo]
   cd fleetflow-odoo
   npm install
   npm run dev
   ```

---

## ✅ **Should Work Now!**

After checking above, Google login should work. If not:
- Email login should still work as backup
- Contact support with error details and screenshots
