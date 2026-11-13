# Setting up sign-in and the database (Firebase) for QuizMaster

This guide is written for someone who has a Firebase project but has never set up sign-in before. You will use only two websites: the **Firebase Console** and **GitHub**. No terminal and no programs to install.

Take your time. After each part there is a line that says **You should see**, so you know it worked.

---

## Part 1: What you are setting up

**Firebase** is a free toolbox from Google that gives apps two things QuizMaster needs:

- **Authentication** is the "front door". It lets each player sign in (as a guest, or with Google) so the game knows who is who. Every player gets a private ID number.
- **Firestore** is the "filing cabinet". It stores nicknames, scores and shared questions online, so they are the same on every device.

Your website is public, so Firebase needs to know **which of your sites are allowed to use the front door**. That is why you will add your site's address in Part 3.

Firebase also checks every request against **security rules**, a set of written instructions that say who may read or change what. Those rules, not hidden buttons, are what keep the data safe.

**What QuizMaster uses:**

| Feature | Used? |
|---|---|
| Guest sign-in (Anonymous) | Yes |
| Google sign-in | Yes (optional for players) |
| Email and password sign-in | No. The game is made for young players, so it never asks for an email address |
| Firestore database | Yes |
| Storage (file uploads) | No. Leave it switched off |
| Admin area | No. There is no admin page, so no admin user is needed |

**You will need:** your Google account (the one that owns the Firebase project) and your GitHub account (the one that owns this repository).

---

## Part 2: Open your project and copy its settings

1. Go to **console.firebase.google.com** and sign in.
2. Click your project (for example **quizmaster-yourname**).
   *You should see the project's home page with your project name at the top left.*
3. Click the **gear icon** next to **Project Overview** at the top left, then **Project settings**.
4. Scroll down to the **Your apps** box.
   - **If you already see a web app** (an icon like `</>` with a name): click it.
   - **If there is no web app yet:** click the **`</>`** (Web) button, type a nickname such as `QuizMaster Web`, leave **Firebase Hosting** unticked, and click **Register app**. Then click **Continue to console**, and return to **Project settings** and your new app.
5. Find the block called **SDK setup and configuration** and choose **Config** (not npm). You will see a block of text like this:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "quizmaster-yourname.firebaseapp.com",
  projectId: "quizmaster-yourname",
  storageBucket: "quizmaster-yourname.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

*You should see six values.* Keep this page open: you will copy each value in Part 5.

> These six values are **not passwords**. They tell the website *which* Firebase project to talk to. They are visible to anyone who opens your site. The security rules (Part 6) protect your data.

---

## Part 3: Turn on sign-in and allow your site address

### Switch on the sign-in methods

1. In the left menu click **Build**, then **Authentication**.
2. If you see a **Get started** button, click it.
3. Click the **Sign-in method** tab.
4. Click **Anonymous**, switch **Enable** on, and click **Save**. (This is "Play as guest".)
5. Click **Google**, switch **Enable** on, choose your email as the **Project support email**, and click **Save**. (This is "Continue with Google". Skip this if you only want guest play, and then remove the Google button from `index.html`.)

*You should see **Anonymous** and **Google** listed with the status **Enabled**.*

### Allow your website address (authorized domains)

An **authorized domain** is a website address that is allowed to use sign-in. If your site's address is not on the list, sign-in fails with `auth/unauthorized-domain`.

1. Still in **Authentication**, click the **Settings** tab.
2. Click **Authorized domains**.
3. You should already see `localhost` and addresses ending in `.firebaseapp.com` or `.web.app`.
4. Click **Add domain** and type your GitHub Pages address **without** `https://` and **without** anything after the first slash. For example, if your site is `https://ada.github.io/quizmaster/`, type:

```text
ada.github.io
```

5. Click **Add**.
6. If you use your own domain name (see DEPLOYMENT.md, "Custom domain"), add it here too, for example `play.example.com`.

*You should see your `...github.io` address in the list.*

---

## Part 4: Check the database exists

1. In the left menu click **Build**, then **Firestore database**.
2. **If you see a Create database button:** click it. If it asks for an edition, choose **Standard**. Choose the location nearest to your players (you cannot change it later). For the security option choose **Start in production mode**, then click **Create**. You will replace the rules in Part 6.
3. **If you already see the tabs Data, Rules and Indexes:** the database exists. Go on to the next part.

*You should see the Firestore page with the tabs **Data**, **Rules**, **Indexes**, **Usage**.*

---

## Part 5: Add the six settings to GitHub as secrets

A **secret** is a value that GitHub stores privately and hands to the build only when it needs it. It never appears in your code. QuizMaster's build uses these six secrets to create the file that connects the site to your Firebase project.

1. Open your repository on **github.com**.
2. Click **Settings** (top row of tabs).
3. In the left menu click **Secrets and variables**, then **Actions**.
4. Click **New repository secret**.
5. In **Name** type the exact name from the table below, in **Secret** paste the value from your Firebase config (**only the text between the quotation marks**), and click **Add secret**.
6. Repeat for all six.

| Secret name (type exactly) | Copy this value from the config |
|---|---|
| `FIREBASE_API_KEY` | `apiKey` |
| `FIREBASE_AUTH_DOMAIN` | `authDomain` |
| `FIREBASE_PROJECT_ID` | `projectId` |
| `FIREBASE_STORAGE_BUCKET` | `storageBucket` |
| `FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
| `FIREBASE_APP_ID` | `appId` |

Names must be spelled exactly, in capital letters, with underscores. Do not add spaces or quotation marks to the values.

*You should see six secrets listed under **Repository secrets**. GitHub shows only their names; the values stay hidden.*

---

## Part 6: Publish the security rules

1. On **github.com**, open your repository and click the file **`firestore.rules`**.
2. Click the **copy icon** (**Copy raw file**) at the top right of the file view.
3. Go back to the Firebase Console: **Build > Firestore database > Rules** tab.
4. Click inside the large text box, press **Ctrl+A** (Cmd+A on a Mac) to select everything, and press **Delete**.
5. Paste the copied rules with **Ctrl+V** (Cmd+V on a Mac).
6. Click **Publish**.

*You should see a message that the rules were published, and the first line of the editor now reads `// QuizMaster Firestore Security Rules`.*

What these rules do, in plain words:

- Everything not mentioned is **denied**.
- Anyone can **read** quiz questions. Only signed-in players can **add** them, and only the player who made a question can **delete** it.
- A player can read and change **only their own** profile.
- A signed-in player can **add** a score for themselves, and only if the numbers add up (points must equal correct answers x 10, and a game must have 5 to 10 questions). Nobody can edit or delete scores.

---

## Part 7: Create the leaderboard index

The **Easy**, **Medium**, **Hard** and **Mixed** leaderboard tabs filter and sort at the same time. Firestore needs an **index** (a prepared list) for that. It is a one-time setup. (The **All** tab works without it.)

1. In **Firestore database**, click the **Indexes** tab.
2. Make sure **Manual** (not Automatic) is selected, and click **Create index**.
3. Fill in the form:
   - **Collection ID:** `scores`
   - First field: `difficulty`, **Ascending**
   - Second field: `points`, **Descending**
   - **Query scope:** Collection
4. Click **Create**.
5. Wait a few minutes. The index shows **Building**, then **Enabled**. Refresh the page now and then.

*You should see a row for `scores` with status **Enabled**.*

*Shortcut:* if a leaderboard tab shows "needs a one-time database index", open the browser's developer tools (press F12), open the **Console**, and click the long `console.firebase.google.com` link in the red message. It opens the same form already filled in.

---

## Part 8: Publish the site

1. On **github.com**, open **Settings > Pages**. Under **Build and deployment**, set **Source** to **GitHub Actions**.
2. Merge the update's pull request (see DEPLOYMENT.md, "Review and merge"), or, if it is already merged, open **Actions > Deploy site > Run workflow**.
3. Open the **Actions** tab and wait for the **Deploy site** run to show a **green tick**.

*You should see a green tick, and your site address (for example `https://ada.github.io/quizmaster/`) opens the game.*

If you see a red cross, see "Common errors" below and DEPLOYMENT.md, "How to read an error".

---

## Part 9: How to test that login works

1. Open your site in a normal browser window.
2. Click **Play as guest**. You should be asked for a nickname. Type one and click **Save name**.
3. You should arrive on the **Home** screen, which says "Welcome back, *your nickname*".
4. In the Firebase Console open **Authentication > Users**. *You should see one new user with the sign-in provider "Anonymous".*
5. Open **Firestore database > Data**. *You should see a `players` collection with one document.*
6. In the game, play a full quiz (choose a topic with at least 5 questions) and open the **Leaderboard**. *You should see your score.* A `scores` collection appears in Firestore.
7. Sign out from the round **account button** at the top right, then try **Continue with Google**. *You should see a Google window, and afterwards a nickname screen or the Home screen.*

---

## Part 10: Common errors and fixes

| What you see | Why | How to fix |
|---|---|---|
| `auth/unauthorized-domain` (or "This website address is not allowed for sign-in") | Your site's address is not an authorized domain | Part 3: add `yourname.github.io` (or your custom domain) |
| `auth/operation-not-allowed` | The sign-in method is not switched on | Part 3: enable **Anonymous** and/or **Google** |
| `auth/invalid-api-key`, "API key not valid", or the site never leaves "Loading" | A secret has a typo, extra spaces, or is missing | Part 5: re-enter the six secrets, then **Actions > Deploy site > Run workflow** |
| The build says "These GitHub secrets are missing or empty" | One or more secrets were not added | Part 5 |
| `permission-denied` or "Missing or insufficient permissions" | The rules were not published, or the data does not match them (for example a score outside 5 to 10 questions) | Part 6: publish the rules again. If you changed game settings, see CUSTOMIZING.md, "Game settings" |
| Leaderboard says "needs a one-time database index" (`failed-precondition`) | The index in Part 7 is missing or still building | Part 7 |
| The Google sign-in window does not open (popup blocked) | The browser blocks pop-ups | Allow pop-ups for the site, or use **Play as guest** |
| Google sign-in does not work inside the installed phone app | Some phones block the sign-in window inside installed apps | Sign in with Google in the browser first, or use a guest account |
| "User not verified" or a request to verify an email | Not used. QuizMaster does not use email sign-in | If you see this, you are using a different app or an old copy of the site |
| The browser's developer console (F12) says `Refused to connect` or `Refused to load` and mentions a Content Security Policy | The security policy in `index.html` blocks an address Firebase needs | Ask a developer to add the address to the policy. As a temporary fix, delete the `<meta http-equiv="Content-Security-Policy" ...>` line in `index.html` |
| Everything works on your computer but a phone shows old content | The phone keeps a saved copy | DEPLOYMENT.md, "Phones keep showing the old version" |

---

## Part 11: Glossary

- **API key:** a code in the Firebase settings that identifies your project to Google's servers. In a web app it is public and is not a password.
- **Authorized domain:** a website address that Firebase allows to use sign-in.
- **Security rules:** instructions stored in Firebase that decide who may read or change each piece of data. They are checked on Google's servers, so players cannot bypass them.
- **Secret:** a value stored privately in GitHub (Settings > Secrets and variables > Actions) and given to the build without ever appearing in the code.
- **Custom claim:** a label added to a user (for example "admin") that rules can check. QuizMaster has no admin area, so it does not use them.
- **Firestore:** Firebase's online database.
- **Index:** a prepared list that lets the database answer a filtered, sorted question quickly.
- **Anonymous (guest) sign-in:** an account with no email or password, tied to one browser.

---

## Part 12: What NOT to share or commit

Never put these in any file, issue, pull request or chat message:

- Passwords or recovery codes
- A **service account key** (a `.json` file downloaded from Firebase or Google Cloud)
- Any file named like `.env`, or anything that says **private key**

The six web settings from Part 2 are safe to publish, because they only identify the project. If you ever add something private by accident, tell GitHub's secret scanning (see DEPLOYMENT.md, "Turn on GitHub's security protections") and create a new key in the Firebase Console.

**Optional extra protection:** Firebase **App Check** makes it harder for other programs to use your database pretending to be your site. It is not switched on in this project, because it needs a separate reCAPTCHA key and a code change. It is a good future improvement if the game becomes popular. Firebase's free plan also has daily limits; if the game ever stops saving scores in the evening, check the **Usage** tab in Firestore.
