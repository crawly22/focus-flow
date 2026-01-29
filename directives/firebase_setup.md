# Firebase Setup Directive

## Goal
Set up Firebase project and configure FocusFlow web app to use Firebase Authentication and Firestore.

## Inputs
- Firebase account credentials
- Project domain/hosting requirements

## Steps

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `focusflow-adhd` or similar
4. Disable Google Analytics (optional for MVP)
5. Click "Create project"

### 2. Enable Firebase Services

#### Authentication
1. Navigate to Authentication → Get Started
2. Enable "Anonymous" sign-in method
3. (Optional) Enable Email/Password for future use

#### Firestore Database
1. Navigate to Firestore Database → Create Database
2. Start in **test mode** for development
3. Choose location closest to users (e.g., `asia-northeast3` for Korea)
4. Click "Enable"

#### Security Rules (Important!)
Update Firestore rules for data security:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && 
                          resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
    
    match /users/{userId} {
      allow read, write: if request.auth != null && 
                          userId == request.auth.uid;
    }
    
    match /timerSessions/{sessionId} {
      allow read, write: if request.auth != null && 
                          resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
    
    match /moodCheckIns/{checkInId} {
      allow read, write: if request.auth != null && 
                          resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
  }
}
```

### 3. Get Firebase Configuration
1. Navigate to Project Settings (gear icon)
2. Scroll to "Your apps" section
3. Click Web icon (</>) to add a web app
4. Register app with nickname: "FocusFlow Web"
5. Copy the Firebase configuration object

### 4. Configure Local Environment
1. Create `.env` file in project root
2. Add Firebase configuration:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Outputs
- Firebase project created and configured
- Authentication enabled (Anonymous)
- Firestore database created with security rules
- Local `.env` file configured

## Edge Cases
- **Billing required**: If you see billing warnings, Firebase's free tier is sufficient for development
- **Location locked**: Database location cannot be changed after creation
- **Security rules**: Always test rules before deploying to production

## Testing
1. Run the app locally: `npm run dev`
2. Open browser console
3. Verify authentication: Should see "User authenticated" log
4. Try creating a task
5. Check Firestore console to verify data is saved

## Common Issues
- **CORS errors**: Check Firebase console → Authentication → Settings → Authorized domains
- **Permission denied**: Verify Firestore security rules are set correctly
- **Config not found**: Ensure `.env` file is in project root and Vite is restarted
