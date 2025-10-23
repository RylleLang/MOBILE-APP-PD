# MOBILE-APP-PD

## Firebase Setup

### Install Firebase CLI
1. Install the Firebase CLI globally:
```bash
npm install -g firebase-tools
```

2. Log in to Firebase:
```bash
firebase login
```

### Deploy Database Rules
The app uses Firebase Realtime Database with security rules that:
- Allow users to read/write their own profile data
- Allow users to read/write their own user data
- Allow admin users to read/write all user data

To deploy the rules:

1. Using Firebase CLI:
```bash
# Deploy only database rules
firebase deploy --only database

# Or deploy all Firebase config
firebase deploy
```

2. Or using Firebase Console:
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Select your project
   - Navigate to Realtime Database → Rules
   - Copy the contents of `firebase.rules.json`:
   ```json
   {
     "rules": {
       "userProfiles": {
         "$uid": {
           ".read": "auth != null && auth.uid === $uid",
           ".write": "auth != null && auth.uid === $uid"
         }
       },
       "users": {
         "$uid": {
           ".read": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('isAdmin').val() === true)",
           ".write": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('isAdmin').val() === true)"
         }
       },
       ".read": false,
       ".write": false
     }
   }
   ```
   - Click "Publish"

### Verify Rules Deployment
After deploying rules:
1. Sign in to the app
2. Go to Settings
3. Try updating your profile (name, contact, etc.)
4. Check Firebase Console → Realtime Database to see the updates

### Troubleshooting Database Access
If you see "permission_denied" errors:
1. Ensure you're signed in (check `auth.currentUser` exists)
2. Verify rules are deployed (check Firebase Console → Realtime Database → Rules)
3. Confirm you're updating the correct paths:
   - User profiles: `/userProfiles/{uid}`
   - User data: `/users/{uid}`
4. For admin access, ensure your user has `isAdmin: true` in their `/users/{uid}` data