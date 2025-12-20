# Appwrite Backend Setup Guide

## Overview

Midnight Court uses Appwrite Functions to securely proxy API calls, keeping sensitive API keys on the server side.

## Architecture

```
Frontend (Expo App)
    ↓ (fetch with public credentials)
Appwrite Functions (Proxy Layer)
    ↓ (API keys stored securely)
External APIs (Gemini, Unsplash, Pexels)
```

## Prerequisites

1. Appwrite account (free tier works)
2. API Keys:
   - Google Gemini API key
   - Unsplash API key
   - Pexels API key

## Setup Steps

### 1. Create Appwrite Project

1. Go to [Appwrite Console](https://cloud.appwrite.io)
2. Create new project
3. Note your Project ID

### 2. Deploy Functions

Deploy these 3 functions:

#### A. Gemini Proxy Function

**Location:** `appwrite-functions/gemini-proxy/`

1. Create function named `gemini-proxy`
2. Runtime: Node.js 18.0
3. Upload code from `appwrite-functions/gemini-proxy/`
4. Add environment variable:
   - `GEMINI_KEY` = Your Gemini API key
5. Note the Function ID

#### B. Citation Proxy Function

**Location:** `appwrite-functions/citation-proxy/`

1. Create function named `citation-proxy`
2. Runtime: Node.js 18.0
3. Upload code from `appwrite-functions/citation-proxy/`
4. Add environment variable:
   - `GEMINI_KEY` = Your Gemini API key (same as above)
5. Note the Function ID

#### C. Image Proxy Function

**Location:** `appwrite-functions/image-proxy/`

1. Create function named `image-proxy`
2. Runtime: Node.js 18.0
3. Upload code from `appwrite-functions/image-proxy/`
4. Add environment variables:
   - `UNSPLASH_KEY` = Your Unsplash API key
   - `PEXELS_KEY` = Your Pexels API key
5. Note the Function ID

### 3. Configure Frontend

1. Copy `.env.example` to `.env`
2. Fill in your values:

```env
EXPO_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
EXPO_PUBLIC_GEMINI_FUNCTION_ID=gemini_function_id
EXPO_PUBLIC_CITATION_FUNCTION_ID=citation_function_id
EXPO_PUBLIC_IMAGE_FUNCTION_ID=image_function_id
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run App

```bash
npx expo start
```

## Security Benefits

✅ **Before:** API keys exposed in app bundle
❌ Anyone could extract and misuse keys

✅ **After:** API keys only in Appwrite (server-side)
✅ Frontend only has public Appwrite credentials
✅ Keys never bundled with app

## Testing

Test each feature:
- Slide generation (Gemini)
- Citation search (Gemini)
- Image search (Unsplash/Pexels)

Check console for successful API calls.

## Troubleshooting

**Function execution fails:**
- Check environment variables are set correctly
- Check function logs in Appwrite Console

**"Function not found" error:**
- Verify Function IDs in `.env` are correct
- Ensure functions are deployed and active

**Rate limiting:**
- Appwrite free tier: 750K executions/month
- Should be sufficient for development

## Cost Estimate

- Appwrite: Free tier (750K executions/month)
- Gemini: Free tier (1500 RPM)
- Unsplash: Free tier (50 req/hour)
- Pexels: Free tier (200 req/hour)

**Total: $0/month for development** 🎉
