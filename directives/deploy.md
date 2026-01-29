# Deploy FocusFlow Directive

## Goal
Deploy FocusFlow web app to production using Firebase Hosting.

## Inputs
- Completed Firebase project setup
- Built application (production bundle)
- Custom domain (optional)

## Steps

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Initialize Firebase Hosting
```bash
firebase init hosting
```

Configuration options:
- **Public directory**: `dist`
- **Single-page app**: Yes
- **Set up automatic builds**: No (for now)
- **Overwrite index.html**: No

### 4. Build Application
```bash
npm run build
```

This creates optimized production files in `dist/` directory.

### 5. Deploy to Firebase Hosting
```bash
firebase deploy --only hosting
```

### 6. Verify Deployment
- Firebase will provide a URL: `https://your-project.web.app`
- Open URL in browser
- Test all functionality:
  - Task creation
  - Timer functionality
  - Statistics view
  - Data persistence

## Outputs
- Live web application URL
- Firebase Hosting configuration
- Production build in `dist/` folder

## Optional: Custom Domain

### 1. Add Domain in Firebase Console
1. Navigate to Hosting → Add custom domain
2. Enter your domain name
3. Follow verification steps (add DNS records)

### 2. Update DNS
Add provided records to your domain's DNS settings:
- Type: A
- Name: @
- Value: [Firebase IP addresses]

### 3. Wait for SSL
Firebase automatically provisions SSL certificates (can take up to 24 hours).

## Edge Cases
- **Build errors**: Check for missing dependencies, run `npm install`
- **Large bundle**: Optimize imports, use code splitting
- **404 errors**: Ensure `dist/index.html` exists and rewrites configured
- **Slow loading**: Enable Firebase caching headers

## Continuous Deployment (Advanced)

### GitHub Actions
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: your-project-id
```

## Performance Optimization
- Enable compression in Firebase Hosting settings
- Use CDN for static assets
- Lazy load non-critical components
- Optimize images and fonts

## Monitoring
- Enable Firebase Analytics
- Set up performance monitoring
- Configure error tracking (e.g., Sentry)

## Rollback
If deployment has issues:
```bash
firebase hosting:channel:deploy rollback
```

## Cost Considerations
- Firebase free tier: 10 GB storage, 360 MB/day bandwidth
- Monitor usage in Firebase Console → Usage and Billing
- Set up budget alerts to avoid surprises
