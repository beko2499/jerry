---
description: Deploy your app to Render
---

Since your code is already on GitHub at `https://github.com/beko2499/jerry`, you can easily deploy it using Render.

## Steps to Deploy

1.  **Log in to Render**: Go to [render.com](https://render.com) and log in.
2.  **New Static Site**: Click "New +" and select "Static Site".
3.  **Connect GitHub**: Select your repository (`beko2499/jerry`). You might need to give Render permission to access it first.
4.  **Configuration**:
    *   **Name**: Give your site a name (e.g., `jerry-services`).
    *   **Branch**: `master`
    *   **Build Command**: `npm install && npm run build`
    *   **Publish Directory**: `dist`
5.  **Deploy**: Click "Create Static Site".

Render will automatically detect the `render.yaml` file if you use the "Blueprints" feature, but setting it up manually as a Static Site is also very quick as shown above.

Your site will be live in a few minutes!
