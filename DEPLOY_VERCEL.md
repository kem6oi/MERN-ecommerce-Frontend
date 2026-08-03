# Deploying the React E-Commerce Frontend on Vercel

This guide provides a comprehensive, step-by-step walkthrough for deploying this MERN Stack E-commerce React frontend to **Vercel**. It covers client-side routing, production API URL configuration, environment variables, and two different methods for integrating your frontend with your backend API.

---

## Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Understanding Client-Side Routing (Why we need `vercel.json`)](#2-understanding-client-side-routing-why-we-need-verceljson)
3. [Configuring Your Backend API URL in Production](#3-configuring-your-backend-api-url-in-production)
   - [Method A: Vercel Rewrites (Proxying - Zero Code Changes)](#method-a-vercel-rewrites-proxying---zero-code-changes)
   - [Method B: React Environment Variables (Recommended Standard Practice)](#method-b-react-environment-variables-recommended-standard-practice)
4. [Step-by-Step Deployment Methods](#4-step-by-step-deployment-methods)
   - [Option 1: Deploying via Vercel Dashboard & GitHub (Recommended)](#option-1-deploying-via-vercel-dashboard--github-recommended)
   - [Option 2: Deploying via Vercel CLI](#option-2-deploying-via-vercel-cli)
5. [Common Troubleshooting & Best Practices](#5-common-troubleshooting--best-practices)

---

## 1. Prerequisites

Before you deploy, make sure you have:
- A [Vercel Account](https://vercel.com/) (sign up for free using your GitHub/GitLab account).
- Your frontend repository pushed to GitHub or another Git provider (if using Option 1).
- Your backend API deployed on a cloud service (e.g., Vercel, Render, Heroku, AWS, DigitalOcean) and its live URL (e.g., `https://api.yourdomain.com`).

---

## 2. Understanding Client-Side Routing (Why we need `vercel.json`)

This application is built with **Create React App** and uses **React Router** for client-side navigation.

### The Problem:
When navigating inside the application, React Router handles transitions dynamically. However, if a user reloads the page on a route like `/checkout` or directly visits `https://your-app.vercel.app/profile`, Vercel's servers will look for a physical file named `/checkout` or `/profile` on the server. Since it doesn't exist, Vercel returns a **404 Page Not Found** error.

### The Solution:
We have added a `vercel.json` file to the root of the repository. This file instructs Vercel to route all page requests to `/index.html`, letting React Router take over and render the correct page:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 3. Configuring Your Backend API URL in Production

In development, this app uses `"proxy": "http://localhost:8080"` inside `package.json` to route relative API calls (like `fetch('/products')`) to your local backend. In production, this proxy setting is ignored.

To connect your deployed frontend to your deployed backend, choose **one** of the two methods below:

### Method A: Vercel Rewrites (Proxying - Zero Code Changes)

If you do not want to modify any JavaScript files in this codebase, you can use Vercel's built-in **Rewrites** to proxy backend requests.

1. Locate the `vercel.json` file in the root of your project.
2. Replace `https://your-backend-api-url.com` with your **live backend API URL**:

```json
{
  "rewrites": [
    {
      "source": "/create-payment-intent",
      "destination": "https://your-live-backend-api.com/create-payment-intent"
    },
    {
      "source": "/cart/:path*",
      "destination": "https://your-live-backend-api.com/cart/:path*"
    },
    {
      "source": "/orders/:path*",
      "destination": "https://your-live-backend-api.com/orders/:path*"
    },
    {
      "source": "/users/:path*",
      "destination": "https://your-live-backend-api.com/users/:path*"
    },
    {
      "source": "/products/:path*",
      "destination": "https://your-live-backend-api.com/products/:path*"
    },
    {
      "source": "/categories/:path*",
      "destination": "https://your-live-backend-api.com/categories/:path*"
    },
    {
      "source": "/brands/:path*",
      "destination": "https://your-live-backend-api.com/brands/:path*"
    },
    {
      "source": "/auth/:path*",
      "destination": "https://your-live-backend-api.com/auth/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This method is extremely powerful because all of your existing relative fetch requests (e.g. `fetch('/products')`) will work seamlessly without editing any React files.

---

### Method B: React Environment Variables (Recommended Standard Practice)

Alternatively, you can prefix your fetch requests with an environment variable. Create React App looks for environment variables starting with `REACT_APP_`.

1. **Modify API files**: Update your fetch calls to use a global config or an environment variable. For example:
   ```javascript
   // In src/features/product/productAPI.js
   const API_URL = process.env.REACT_APP_API_URL || '';

   export function fetchProductById(id) {
     return new Promise(async (resolve) => {
       const response = await fetch(`${API_URL}/products/` + id);
       const data = await response.json();
       resolve({ data });
     });
   }
   ```
2. Repeat this for all other API files inside `src/features/` (`authAPI.js`, `cartAPI.js`, `orderAPI.js`, `userAPI.js`, and `src/pages/StripeCheckout.js`).
3. Add the variable to Vercel during deployment:
   - Key: `REACT_APP_API_URL`
   - Value: `https://your-live-backend-api.com` *(with no trailing slash)*

*If you choose Method B, you should simplify your `vercel.json` to only contain the single client-side routing fallback:*
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 4. Step-by-Step Deployment Methods

### Option 1: Deploying via Vercel Dashboard & GitHub (Recommended)

This is the easiest and most robust method. It sets up automatic continuous deployment (CD), meaning Vercel will redeploy your app every time you push to GitHub.

1. Push your code to your GitHub repository:
   ```bash
   git add .
   git commit -m "Configure for Vercel deployment"
   git push origin main
   ```
2. Go to the [Vercel Dashboard](https://vercel.com/dashboard) and log in.
3. Click the **Add New...** button and select **Project**.
4. Find your GitHub repository in the list and click **Import**.
5. Configure the project settings:
   - **Project Name**: Choose a name (e.g. `react-ecommerce-frontend`).
   - **Framework Preset**: Select **Create React App** (Vercel usually auto-detects this).
   - **Root Directory**: `./` (leave default).
   - **Build and Output Settings**: Leave as default.
     - Build Command: `npm run build`
     - Output Directory: `build`
     - Install Command: `npm install`
6. (Optional) Under **Environment Variables**, add any required variables if you used Method B:
   - **Key**: `REACT_APP_API_URL`
   - **Value**: `https://your-live-backend-api.com`
7. Click **Deploy**. Vercel will build and host your app in under a minute!

---

### Option 2: Deploying via Vercel CLI

If you prefer deploying directly from your terminal:

1. Install the Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```
2. Log in to your Vercel account via terminal:
   ```bash
   vercel login
   ```
3. Run the deployment command from the project root directory:
   ```bash
   vercel
   ```
4. Follow the interactive prompts:
   - *Set up and deploy?* **Yes**
   - *Which scope?* Select your personal account/team.
   - *Link to existing project?* **No** (unless redeploying)
   - *What's your project's name?* Press Enter to keep default or choose a new one.
   - *In which directory is your code located?* `./`
   - *Want to modify settings?* **No** (Vercel will auto-detect CRA settings)
5. Wait for the development build to deploy. Once done, Vercel will provide a **Preview URL**.
6. When you are ready to deploy to production, run:
   ```bash
   vercel --prod
   ```

---

## 5. Common Troubleshooting & Best Practices

### 1. CORS Errors (Cross-Origin Resource Sharing)
If your frontend loads but requests to your backend fail with a CORS error:
- Make sure your **backend** server has CORS configured to accept requests from your frontend Vercel domain (`https://your-app.vercel.app`).
- If using Node.js/Express with the `cors` middleware, configure it like this on your backend:
  ```javascript
  const cors = require('cors');
  app.use(cors({
    origin: 'https://your-frontend-vercel-domain.vercel.app',
    credentials: true
  }));
  ```

### 2. Cookies and Session Authentication
This application uses Passport JS and session cookies. Vercel routes are served over HTTPS by default.
- Ensure your backend session cookies are configured with `sameSite: "none"` and `secure: true` in production, so they can be set across different domains (Vercel frontend domain vs. backend API domain).
- Make sure to pass `credentials: 'include'` in all fetch requests on the frontend if using Method B. (The default relative routes already do this implicitly when proxied, but explicit CORS requests require it).

### 3. Stripe Checkout Page
If using Stripe payments:
- Ensure you set your Stripe Publishable Key as an environment variable in Vercel if it is dynamically loaded.
- Ensure your webhook and redirection URLs in Stripe Dashboard are pointed to your production backend and production Vercel frontend.
