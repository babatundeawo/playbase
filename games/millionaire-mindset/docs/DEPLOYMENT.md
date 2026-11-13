# How the site is published

Every time a change is merged into `main`, GitHub Actions builds the site and publishes it to GitHub Pages at https://babatundeawo.github.io/Millionaire-Mindset/. You do nothing extra.

## Steps run by Actions

1. Install the tools
2. Type check (reports problems, does not stop the publish)
3. Game tests, colour contrast check
4. Build the site
5. Check the built site (manifest, icons, offline file list, security hash)
6. Lighthouse report (informational)
7. Publish

If steps 3, 4 or 5 fail, nothing is published and the live site stays as it was.

## Update the site

**From GitHub Desktop:** change files, write a short summary, commit to a branch, Publish branch, Create Pull Request, merge on github.com.

**On github.com:** open a file, press the pencil, edit, then commit to a new branch and open a pull request.

Watch progress in the **Actions** tab. A green tick means it is live (allow a minute).

## Roll back

Open the last pull request on github.com and press **Revert**. Merge the new pull request. The site returns to the earlier version.

## Custom domain (optional)

1. Repository **Settings → Pages → Custom domain**, enter the domain.
2. At your domain provider, add the DNS records GitHub shows.
3. Tick **Enforce HTTPS** when it becomes available.
4. Edit `homepage` in `package.json` to the new address, because links and share previews use it.

Phones that installed the old address will need to install again.

## Notes

- The repository must stay public on the GitHub Free plan for Pages to work.
- No secrets are needed. Firebase is not used.
- GitHub Pages cannot set security headers, so the content security policy is set inside the page.
