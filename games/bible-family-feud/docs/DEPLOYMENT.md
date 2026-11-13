# Deployment guide

This guide is for the site owner. You never need a terminal or any software on your computer. Everything happens on the GitHub website.

## How publishing works

The website lives in this repository. Whenever a change reaches the **main** branch, GitHub automatically:

1. Builds the site and checks it (all questions have 8 answers, no broken file links, scripts are valid).
2. Publishes it to GitHub Pages.

This takes about one to two minutes. You do not press a publish button.

## One-time setup: switch Pages to GitHub Actions

Do this once, right after the redesign pull request is merged (see the next section).

1. Open the repository on GitHub and select **Settings** (top row of tabs).
2. In the left menu select **Pages**.
3. Under **Build and deployment**, find **Source** and choose **GitHub Actions**.
4. Select the **Actions** tab, choose **Deploy site** on the left, select **Run workflow** (right side), then the green **Run workflow** button.

**You should see:** after a minute or two, a green tick next to the run, and your site address shown under Settings > Pages.

While you do these steps the live site stays online, because the old publishing method keeps serving the merged files until the new one takes over.

## Reviewing and merging the redesign pull request

A pull request is a proposed change that waits for your approval. Nothing changes on the live site until you merge it.

1. Select the **Pull requests** tab and open **Rebrand: premium redesign**.
2. Scroll to the checks at the bottom. A green tick next to **Build and check** means the files are healthy. Yellow or red marks on **Lighthouse report** and **Link check** are advisory only.
3. To try the new site before merging, select **Checks** (or **Details** beside a check), open the **Deploy site** run, scroll to **Artifacts** and download **site-preview**. Unzip it and open `index.html`. The game works from your computer; the two-window Host Answer View sync needs the live site, so test that after merging.
4. Happy? Select **Merge pull request**, then **Confirm merge**. Not happy? Select **Close pull request**. Nothing on the live site changes.

## Updating questions or text

1. Open the file on GitHub (for example `js/questions.js`) and select the pencil icon.
2. Make your change and select **Commit changes…**, then **Commit changes** again.
3. Watch the **Actions** tab. A green tick means it is live. See [CUSTOMIZING.md](CUSTOMIZING.md) for what lives where.

For a change you want someone to review first, choose **Create a new branch… and start a pull request** instead.

## Checking whether a deployment worked

Select the **Actions** tab. The newest run of **Deploy site** is at the top:

- **Green tick** means it is live.
- **Yellow circle** means it is still running.
- **Red cross** means something failed and the live site is unchanged. Open the run, select the failed step, and read the lines marked with a red **Error**. A message such as `"Question 12" must have exactly 8 answers` names the exact file and problem. Fix that file and commit again.

If the **Deploy to GitHub Pages** step says Pages is not enabled or is not set to GitHub Actions, complete the one-time setup above.

## Going back to an earlier version

Every version stays in GitHub's history, so you can always undo a change.

1. Select the **Pull requests** tab, then **Closed**, and open the pull request that made the change you want to undo.
2. Select **Revert** near the top. GitHub prepares a new pull request that undoes it.
3. Select **Create pull request**, then **Merge pull request**. The site republishes with the earlier version.

For a change made directly with the pencil icon, open the **Code** tab, select the clock icon (**History**), open the commit, and select **Revert**.

## Using your own web address (optional)

1. Buy a domain from any registrar.
2. In the repository, open **Settings > Pages**, type the domain under **Custom domain**, and select **Save**. GitHub adds a file called `CNAME` for you. The next deployment automatically uses the new address in links and search tags.
3. At your registrar, add the DNS records GitHub shows in its [custom domain guide](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site). Check **Enforce HTTPS** once it becomes available (this can take up to a day).

## Security switches to turn on

These are free and take a minute. They live in **Settings > Advanced Security** (or **Code security**):

1. **Dependency graph** and **Dependabot alerts**: select **Enable**.
2. **Secret scanning** and **Push protection**: select **Enable**. GitHub will warn you if a password or key is ever added by mistake.
3. **Code scanning**: the included CodeQL workflow already runs weekly and on every change. Results appear under the **Security** tab.
4. **Private vulnerability reporting**: select **Enable** so visitors can report problems privately.

The site stores no personal data and has no login, so there are no secrets or database settings to manage.

## Good to know

- **Search address:** pages, the sitemap and sharing previews use `https://rccgkd.github.io/bible-family-feud/` by default. If your address differs, the build corrects it automatically.
- **Pull request previews:** GitHub Pages cannot host a live preview for each pull request. The downloadable **site-preview** file described above is the alternative.
- **Fonts:** Archivo and Inter load from Google Fonts. Without internet the game uses your device's standard fonts and still works.
