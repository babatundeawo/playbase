# Setup guide: applying the update with GitHub Desktop

For the site owner. You never type a command. Everything is a click in GitHub Desktop, File Explorer or the GitHub website.

## A. GitHub website

1. Open `https://github.com/babatundeawo/naija-monopoly`. You should see the file list. If you see "404", sign in first.
2. Select **Settings > Pages**. Under **Build and deployment**, **Source** must say **GitHub Actions**. If not, choose it from the dropdown.
3. The repository must be **Public** (Settings > General > scroll to the bottom). GitHub Free only publishes public sites.

## B. GitHub Desktop

1. Select **Repository > Show in Explorer**.
2. In File Explorer, select **View > Show > Hidden items**. You should now see a faded `.github` folder.
3. Back in GitHub Desktop select **Current Branch > New Branch**, name it `app-upgrade`, and select **Create Branch**.
4. Extract the ZIP **into the repository folder** (right-click the ZIP, **Extract All**, and pick the folder shown in step 1). If the ZIP unpacks into a new folder called `naija-monopoly-main`, copy everything inside it, not the folder itself.
5. If Windows asks about existing files, choose **Replace the files in the destination**.
6. GitHub Desktop lists the changed files on the left. You should see about 30 files. Nothing should say "node_modules".
7. In **Summary** type: `Add offline install, autosave and system fonts`. Select **Commit to app-upgrade**.
8. Select **Publish branch**, then **Create Pull Request**. Your browser opens GitHub.

## C. GitHub website again

1. On the pull request page select **Create pull request**.
2. Wait for the checks at the bottom. A green tick means the build passed. A red cross: open **Details**, read the line starting with `error`, and send it to me.
3. To look at the built site first, open the **Actions** tab, the newest run, and download **site-preview** under **Artifacts**.
4. Select **Merge pull request**, then **Confirm merge**.
5. Open the **Actions** tab. The newest **Deploy site** run should end with a green tick, and its **Publish** step shows your address.
6. Turn on protection: **Settings > Code security**, switch on **Dependabot alerts**, **Secret scanning** and **Push protection**.

**Roll back:** open **Pull requests > Closed**, open the merged pull request, select **Revert**, then **Create pull request** and merge it.

## D. Phone

1. Android Chrome: open the address, wait a few seconds, tap **Install**.
2. iPhone Safari: **Share > Add to Home Screen > Add**.
3. Start a game, close the app, open it again, and tap **Resume**.
4. Switch on airplane mode and open it. It should still load.

## E. Check list

- The home page loads with no missing images.
- Dark and light themes both work (moon or sun button).
- A game can be started, a die rolled, and a property bought.
- Reloading the page offers **Resume**.
- Airplane mode: the app still opens.

## F. Troubleshooting

1. **The `.github` folder is missing after extract:** hidden items are off. Repeat B2, then extract again.
2. **Blank page:** Pages Source is not **GitHub Actions** (A2).
3. **Actions shows a red cross at "Get Pages site failed":** Pages is not switched on (A2).
4. **Old version on the phone:** close the app completely and reopen it online; tap **Refresh** when it appears.
5. **No Install button:** it only appears on HTTPS in Chrome or Edge after a short visit. On iPhone use Share > Add to Home Screen.
6. **Resume does not appear:** the browser blocks storage (private browsing), or the game was in the middle of a decision when closed. Games save between turns.
7. **Build fails on a link or file:** the message names the file. Open it from the pull request and fix the name.
8. **Custom domain stops working:** re-enter it in Settings > Pages and check your DNS records.
9. **Windows app workflow fails:** it is separate from the website; the site still publishes.
10. **Page looks unstyled offline on the first visit:** the app must be opened once online so it can download itself.

## G. Everyday updates

1. Edit the file on GitHub with the pencil icon, or change it on your PC.
2. In GitHub Desktop, write a short summary and select **Commit to main** (or use a branch for safety).
3. Select **Push origin**.
4. Watch the **Actions** tab for the green tick.
