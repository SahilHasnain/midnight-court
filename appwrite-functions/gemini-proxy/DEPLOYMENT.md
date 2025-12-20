# Appwrite Gemini Proxy Function - Deployment Guide

## Step 1: Create Function in Appwrite Console

1. Go to Appwrite Console → Functions
2. Click "Create Function"
3. Name: `gemini-proxy`
4. Runtime: **Node.js 18.0** (or latest)
5. Execute Access: **Any** (or specific users if needed)

## Step 2: Add Environment Variable

In Function Settings → Variables:
- Key: `GEMINI_KEY`
- Value: `YOUR_GEMINI_API_KEY`

## Step 3: Deploy Code

### Option A: Manual Upload
1. Zip the contents of `appwrite-functions/gemini-proxy/` folder
2. Upload in Appwrite Console → Deployments → Manual

### Option B: CLI (Recommended)
```bash
# Install Appwrite CLI
npm install -g appwrite-cli

# Login
appwrite login

# Deploy
appwrite deploy function --functionId YOUR_FUNCTION_ID
```

## Step 4: Get Function ID

After creation, copy the **Function ID** from Appwrite Console.
You'll need this for frontend integration.

Example: `65abc123def456789`

## Step 5: Test Function

Use Appwrite Console → Execute tab:

**Request Body:**
```json
{
  "prompt": "Write a short poem about justice",
  "model": "gemini-1.5-flash"
}
```

**Expected Response:**
```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "Justice, a beacon bright..."
          }
        ]
      }
    }
  ]
}
```

## Step 6: Note Your Credentials

Save these for Phase 2:
- Appwrite Endpoint: `https://cloud.appwrite.io/v1` (or your self-hosted URL)
- Project ID: `YOUR_PROJECT_ID`
- Function ID: `YOUR_FUNCTION_ID`

---

## Troubleshooting

- **500 Error**: Check if `GEMINI_KEY` is set correctly
- **405 Error**: Ensure you're using POST method
- **Timeout**: Increase execution timeout in function settings (default 15s)

Ready for Phase 2 once deployed! ✅
