# EchoMail — Voice-First Email

Problem 56 — Voice-First Email for Visually Impaired Users  
Domain: Accessibility  
Student: Shubhangini  
USN: 1EP24CS144

## What this prototype demonstrates

- Spoken briefing before the inbox list
- Five-level audio concept represented by Summary / Full text / Details interactions
- Chapter-based navigation for long threads
- Attachment summary and row-by-row reading
- Voice reply with read-back before Send
- Headphones-only privacy mode
- Text-size controls
- Dark mode and high-contrast mode
- Voice commands using the Web Speech API
- Keyboard/touch alternatives for important actions

## Important

This is a UI/UX prototype with sample email data. It does NOT connect to a real mailbox.

Speech recognition and speech synthesis depend on browser support and microphone permissions.

## Run locally

From this folder:

```bash
python -m http.server 8000
```

Then open:

http://localhost:8000

For the best demo, use a browser with Web Speech API support and headphones.

## Suggested demo flow

1. Click "Play briefing".
2. Open "Q3 budget approval".
3. Select Chapter 3 — Decision asked.
4. Open Attachments.
5. If prompted, enable Headphones only.
6. Read the attachment summary.
7. Return to the thread and choose Reply by voice.
8. Allow microphone access and dictate a short reply.
9. Check the read-back and send.

## GitHub

Create a new GitHub repository, then run:

```bash
git init
git add .
git commit -m "Initial EchoMail accessibility prototype"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/echomail-voice-email.git
git push -u origin main
```

Replace YOUR-USERNAME with your GitHub username.
