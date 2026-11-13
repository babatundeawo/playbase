# Deployment

The site is published by `.github/workflows/deploy.yml` every time something is merged into `main`.

## One-time setup

1. **Settings > Pages > Build and deployment > Source**: choose **GitHub Actions**.
2. **Settings > Secrets and variables > Actions**: add the six QuizMaster Firebase values as repository secrets, with the same names the old QuizMaster repo used:
   `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`, `FIREBASE_STORAGE_BUCKET`, `FIREBASE_MESSAGING_SENDER_ID`, `FIREBASE_APP_ID`.
   Without them the deploy stops with a message naming the missing ones. Pull requests do not need them.
3. **Firebase console (QuizMaster project) > Authentication > Settings > Authorized domains**: `babatundeawo.github.io` is already allowed if the old site worked, so nothing changes there. Google sign-in will keep working at the new address.

## What each game keeps

- QuizMaster keeps its Firebase project and `firestore.rules`.
- Kingdom Quiz keeps its Firebase Realtime Database and `database.rules.json`.
- Naija Monopoly's Windows `.exe` build is not part of this site. It stays in the old repository for now.

## Addresses

| Page | Address |
| --- | --- |
| Hub | `https://babatundeawo.github.io/playbase/` |
| A game | `https://babatundeawo.github.io/playbase/games/<id>/` |
| Details link | `https://babatundeawo.github.io/playbase/#<id>` |

## Rolling back

Open the Actions tab, pick an earlier successful "Build and deploy" run, and choose **Re-run all jobs**.
