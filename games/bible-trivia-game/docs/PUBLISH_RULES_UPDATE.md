# Publish the updated voting rules (one time, 2 minutes)

This update tightens the Ask the Audience rules: each phone can vote **once** per round, and votes sent after the 20-second timer are refused. Saving the file in GitHub does **not** change Firebase, so you paste the new rules in yourself. Until you do, voting keeps working exactly as before.

1. Open [console.firebase.google.com](https://console.firebase.google.com) and click your project, **kingdom-quiz-feeb8**.
2. In the left menu click **Build**, then **Realtime Database**.
3. Click the **Rules** tab. You should see a code editor with the current rules.
4. Click inside the editor, press **Ctrl + A** to select everything, then **Delete**.
5. Open `database.rules.json` from this repository (on github.com, click the file, then the **Copy raw file** button at the top right of the code).
6. Click in the Firebase editor and press **Ctrl + V** to paste.
7. Click **Publish**. You should see a message that the rules were published.

**To check it worked:** start a game, join from a phone, use Ask the Audience and vote. The vote should appear on the host's screen.

**If you see a red error** on the Rules tab, the paste was cut short. Repeat steps 4 to 6 and make sure the pasted text starts with `{` and ends with `}`.
**If voting stops working**, paste your previous rules back (Firebase keeps a history; click **Rules history** in the Rules tab) and tell me what you saw.
