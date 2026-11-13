# Deploying and updating QuizMaster

This guide is for the site owner. You never need a terminal. Everything happens on the GitHub website (and in the Firebase website for the sign-in setup).

## How deployment works, in plain words

1. You change something on GitHub (or merge a pull request).
2. GitHub automatically **builds** the site, **checks** it, and **publishes** it. This is a "workflow" called **Deploy site**.
3. After a minute or two the change is live.

If the checks find a real problem, the workflow stops with a red cross and **the live site stays exactly as it was**.

---

## Part 1: One-time setup (do this before the first merge)

Do the steps in this order. Each one says what you should see when it worked.

### 1. Add the Firebase secrets

The site needs six Firebase settings. They are stored as **repository secrets**, so they are not typed into the code.

Follow **[FIREBASE_LOGIN_SETUP.md](FIREBASE_LOGIN_SETUP.md), part 5**. It lists the six names and where to find each value.

You should see six secrets listed at **Settings > Secrets and variables > Actions**.

### 2. Tell GitHub Pages to use the automatic publisher

1. Open your repository on GitHub and click **Settings**.
2. In the left menu click **Pages**.
3. Under **Build and deployment**, find **Source** and change it to **GitHub Actions**.

You should see the Source box say **GitHub Actions**. (If it was set to "Deploy from a branch" before, that is exactly the thing to change.)

> **Order matters.** Do steps 1 and 2 first. Switch the Pages source only when you are ready to merge, because the live site is then published by the new workflow.

### 3. Allow your site address for sign-in

Follow **[FIREBASE_LOGIN_SETUP.md](FIREBASE_LOGIN_SETUP.md), part 3** (authorized domains). You only add the address once.

### 4. Publish the database rules and create the leaderboard index

Follow **FIREBASE_LOGIN_SETUP.md, parts 6 and 7**.

### 5. Fix your name in the README (two minutes)

The README contains `YOUR-USERNAME` in a few places (the Play link and the two status badges).

1. Open `README.md` on GitHub and click the **pencil icon**.
2. Use your browser's find tool to search for `YOUR-USERNAME` and replace each one with your GitHub user name.
3. Click **Commit changes**.

---

## Part 2: Review and merge the update

The update arrives as a **pull request** (a proposed change). Nothing is published until you merge it.

### Review the checks

1. Open the **Pull requests** tab and click the update.
2. Scroll down to the checks box. Wait until it shows **All checks have passed** with a green tick.
   - **Pull request checks** builds the site and runs the quality checks.
   - **CodeQL security scan** looks for security mistakes in the code.
3. To read details, click **Details** next to a check, then **Summary**. The **Site checks** box lists errors (red) and warnings (informational).
4. Optional: in the same summary you can open the **Lighthouse report** link to see speed, accessibility and search scores.

> GitHub Pages cannot show a live preview of a pull request. If you want to see the new design before it goes live, merge it, then follow "Roll back" below if you do not like it. Rolling back takes one click.

### Merge

1. On the pull request page click **Merge pull request**, then **Confirm merge**.
2. Open the **Actions** tab. A run called **Deploy site** starts. Wait for the green tick.
3. Open your site address (shown on the **Deploy site** run, under the **Publish** step as `github-pages`, and on the repository's right-hand side as **Deployments**).

### If you decide not to use the update

On the pull request page click **Close pull request**. Your live site is untouched.

---

## Part 3: Everyday updates

You can change almost anything on the GitHub website:

1. Open the file (for example `js/questions.js`).
2. Click the **pencil icon**, make your change, and click **Commit changes**.
3. A new **Deploy site** run starts by itself. When it shows a green tick the change is live.

See **[CUSTOMIZING.md](CUSTOMIZING.md)** for which file controls what.

For bigger changes, choose **Create a new branch and start a pull request** in the commit box. The pull request checks run first and nothing goes live until you merge.

## How to check that a deployment worked

1. Click the **Actions** tab.
2. Click the newest **Deploy site** run.
3. A **green tick** means it is live. A **red cross** means it stopped, and the live site did not change.

## How to read an error

1. Open the red run and click the job with the red cross (**Build and check**).
2. Click the step with the red cross. The text at the bottom of the step explains the problem.

| Message | What it means | What to do |
|---|---|---|
| `These GitHub secrets are missing or empty` | A Firebase secret was not added | Add it (FIREBASE_LOGIN_SETUP.md, part 5) and re-run |
| `Missing required file` | A file was deleted or renamed | Restore it from the file's **History** |
| `JavaScript syntax problem in js/...` | A typo in a code file | Open the file, find the line, fix it |
| `caches '...' but that file does not exist` | A file listed in `service-worker.js` is missing | Add the file or remove it from the list |
| `Get Pages site failed` or `Pages is not enabled` | Pages source is not set | Do step 2 above |

To run a failed deployment again after fixing the cause: **Actions > Deploy site > Run workflow**.

## Roll back to the previous version

The old version always stays in the repository history, so you can return to it.

**Easiest way (undo a merged pull request):**

1. Open the **Pull requests** tab, choose **Closed**, and click the update you merged.
2. Click **Revert** near the bottom. GitHub creates a new pull request that undoes the change.
3. Click **Create pull request**, wait for the checks, then **Merge pull request**.
4. **Deploy site** runs and publishes the previous version.

**Re-publish an older version:**

1. Open the **Actions** tab and click an older **Deploy site** run with a green tick.
2. Click **Re-run all jobs**. It publishes the code exactly as it was for that run.

## Phones keep showing the old version

The installed app keeps a saved copy for offline use. After a deployment it updates the next time it is opened with internet. If a phone still looks old:

1. Close the app completely and open it again (twice if needed).
2. If that does not help, in `service-worker.js` change `playbase-quizmaster-v3` to `playbase-quizmaster-v4` and commit. Every phone then replaces its saved copy.

## Custom domain (only if you want one)

1. **Settings > Pages > Custom domain**: type your domain (for example `play.example.com`) and click **Save**.
2. At your domain provider, add the DNS record GitHub tells you to add:
   - For a sub-domain such as `play.example.com`: a **CNAME** record pointing to `YOUR-USERNAME.github.io`.
   - For a bare domain such as `example.com`: four **A** records pointing to `185.199.108.153`, `185.199.109.153`, `185.199.110.153` and `185.199.111.153`.
3. Wait until GitHub shows a green tick next to the domain, then tick **Enforce HTTPS**.
4. Add the new domain to Firebase: **FIREBASE_LOGIN_SETUP.md, part 3**. Without this, sign-in will not work on the new address.

DNS changes can take from a few minutes to a day.

## Turn on GitHub's security protections (a few clicks)

1. Open **Settings > Code security** (it may be called **Advanced Security** or **Code security and analysis**).
2. Switch on **Dependabot alerts**, **Secret scanning** and **Push protection**. Secret scanning warns you if a password or key is ever added by mistake.
3. Switch on **Private vulnerability reporting**, so people can report problems privately.
4. The **CodeQL security scan** workflow and **Dependabot** (weekly update pull requests for the automation) are already set up in the repository.

If your repository is private, some of these features need a paid GitHub plan. Public repositories get them free.

## Good to know

- GitHub Pages and Firebase's free plan are enough for a family or class app. Do not add a payment card.
- Never paste passwords or private keys into any file in this repository. The six Firebase settings are the only configuration, and they live in secrets.
