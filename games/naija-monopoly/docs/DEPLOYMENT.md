# Deployment guide

This guide is for the site owner. You never need to run a command on your computer: everything happens on the GitHub website.

## How it works

Every time a change lands on the `main` branch, a GitHub robot (the *Deploy site* workflow) builds the website, runs checks and publishes it with GitHub Pages. Your live address is:

`https://babatundeawo.github.io/naija-monopoly/`

## One-time setup

1. Open the repository on GitHub and select **Settings**.
2. In the left menu select **Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.

You should see a note saying the site will be deployed by a workflow. You only do this once.

## Update text, colours or board data

1. Find the file (see [CUSTOMIZING.md](CUSTOMIZING.md)) and open it on GitHub.
2. Select the pencil icon, make your edit, then select **Commit changes**.
3. Choose **Create a new branch** and **Propose changes**, then **Create pull request**. This lets you check before anything goes live.
4. Wait for the checks at the bottom of the pull request. A green tick means they passed.
5. Select **Merge pull request**, then **Confirm merge**. The site updates in about a minute.

## Check that a deployment worked

1. Select the **Actions** tab.
2. Open the newest **Deploy site** run.
3. A green tick means success. A red cross means something failed.

## Read an error

Open the red run, then select the failed step (it has a red cross). Lines starting with `error` explain the problem, for example a broken link or a mistake in a JavaScript file. The most common cause is a typo in the file you last edited: open that pull request or commit and look at what changed.

If you see "Get Pages site failed", Pages is not switched on: repeat the one-time setup above.

## Roll back to a previous version

1. Open the **Pull requests** tab and select **Closed**.
2. Open the pull request you want to undo and select **Revert** near the bottom.
3. Select **Create pull request**, wait for the green tick, and merge it.

The previous version is published again. Nothing is ever lost, because GitHub keeps the full history.

## Use your own domain (optional)

1. Buy a domain from any registrar.
2. In **Settings > Pages**, type the domain under **Custom domain** and select **Save**.
3. At your registrar, add the DNS records GitHub shows in its [custom domain guide](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site). For `www.yourname.com`, add a `CNAME` record pointing to `babatundeawo.github.io`.
4. Back in Pages, tick **Enforce HTTPS** once it becomes available.

The build reads the address from GitHub automatically, so links, the sitemap and social previews update by themselves.

## Check the phone app after a change

1. Open the live address on an Android phone in Chrome. After a few seconds an **Install** button appears in the top bar. Tap it.
2. On iPhone, open it in Safari, tap **Share**, then **Add to Home Screen**.
3. Switch on airplane mode and open the app again. It should still load, and your last game is offered under **Resume**.
4. After you publish a change, open the installed app online twice. A **Refresh** notice appears; tap it to update.

If a phone keeps showing an old version, close the app fully and open it again while online.

## Windows app

The **Build Windows EXE** workflow builds the desktop version. Open the **Actions** tab, select the latest run of **Build Windows EXE**, and download **NaijaMonopoly-Windows** under **Artifacts**. Run it manually from the same page with **Run workflow**.

## Turn on automatic security scanning

1. **Settings > Code security** (or **Advanced Security**).
2. Switch on **Dependabot alerts**, **Secret scanning** and **Push protection**.
3. Switch on **Private vulnerability reporting** so people can use the process in [SECURITY.md](../SECURITY.md).
