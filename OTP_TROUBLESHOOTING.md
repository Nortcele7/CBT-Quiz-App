# 🔧 OTP Email Troubleshooting Guide for Render Deployment

## Current Issue
Your OTP email functionality works locally but fails on Render. This is a common deployment issue with several potential causes.

## ✅ What I've Fixed

### 1. **Enhanced Error Handling**
- Added comprehensive try-catch blocks in `sendOTPEmail()` function
- Added connection verification before sending emails
- Improved error logging with detailed messages
- Added graceful error handling in registration route

### 2. **Debug Routes Added**
- **`/debug-email`** - Check if environment variables are properly set
- **`/test-email?email=your@email.com`** - Test email sending functionality directly

### 3. **Better User Experience**
- If email fails, user gets clear error message instead of crash
- Failed registrations clean up the created user automatically
- Detailed error reporting for troubleshooting

## 🚨 Common Render Deployment Issues

### **1. Gmail Security Settings**
**Problem**: Gmail blocks "less secure apps" by default
**Solution**: Use Gmail App Passwords instead of regular password

**Steps**:
1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account settings → Security → 2-Step Verification
3. Generate an "App Password" for "Mail"
4. Use this 16-character app password in `EMAIL_PASS` environment variable

### **2. Environment Variables**
**Problem**: Environment variables not properly set on Render
**Solution**: Double-check Render environment configuration

**Steps**:
1. Go to your Render dashboard
2. Select your web service
3. Go to "Environment" tab
4. Ensure these variables are set:
   - `EMAIL_USER`: Your Gmail address
   - `EMAIL_PASS`: Your Gmail app password (not regular password)

### **3. SMTP Port Issues**
**Problem**: Some hosting providers block certain SMTP ports
**Solution**: Use alternative SMTP configuration

**Alternative Gmail Config** (if current fails):
```javascript
let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});
```

### **4. Network/Firewall Issues**
**Problem**: Render might block outgoing SMTP connections
**Solution**: Use alternative email services

**Recommended Alternatives**:
- **SendGrid** (free tier: 100 emails/day)
- **Mailgun** (free tier: 5000 emails/month)
- **AWS SES** (very reliable, pay-per-use)

## 🧪 Testing Steps

### **Step 1: Check Environment Variables**
Visit: `https://your-render-url.com/debug-email`
- Should show ✅ for both EMAIL_USER and EMAIL_PASS

### **Step 2: Test Email Functionality**
Visit: `https://your-render-url.com/test-email?email=your-test-email@gmail.com`
- Check the response for detailed error information

### **Step 3: Check Render Logs**
1. Go to Render dashboard → Your service → Logs
2. Look for error messages when OTP sending fails
3. Common errors:
   - "Invalid login" → Wrong app password
   - "Connection timeout" → SMTP blocked
   - "Auth failed" → Security settings issue

## 🔄 Quick Fix - Alternative Email Service (SendGrid)

If Gmail continues to fail, here's a quick SendGrid setup:

### 1. Install SendGrid
```bash
npm install @sendgrid/mail
```

### 2. Replace Email Function
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendOTPEmail(email, otp) {
  try {
    const msg = {
      to: email,
      from: process.env.FROM_EMAIL, // Your verified sender email
      subject: 'OTP Verification for Cohesion',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #2E86C1;">Cohesion - OTP Verification</h2>
          <p>Your <strong>One-Time Password (OTP)</strong> for verification is:</p>
          <p style="font-size: 20px; font-weight: bold; color: #E74C3C;">${otp}</p>
          <p>This OTP is valid for <strong>10 minutes</strong>.</p>
        </div>
      `
    };
    
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### 3. Environment Variables for SendGrid
- `SENDGRID_API_KEY`: Your SendGrid API key
- `FROM_EMAIL`: Your verified sender email

## 💡 Next Steps

1. **First**: Try the Gmail App Password approach
2. **Check**: Use the debug routes to identify the exact issue
3. **Monitor**: Render logs for detailed error messages
4. **Alternative**: Switch to SendGrid if Gmail remains problematic

## 📞 Need Help?
If you're still having issues after trying these solutions, share:
1. Results from `/debug-email` route
2. Results from `/test-email` route  
3. Any error messages from Render logs

The enhanced error handling will now provide much better debugging information!