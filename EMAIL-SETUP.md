# Sending Real Emails from the Kiosk (EmailJS Setup)

The kiosk is a static HTML/CSS/JS app with no backend server, so it can't
send email on its own — browsers can't open an SMTP connection directly.
[EmailJS](https://www.emailjs.com/) solves this: it lets a static page send
real email through your own Gmail/Outlook/SMTP account via their API, no
server required. This is already wired into `app.js` and `index.html` —
you just need to plug in three values.

## 1. Create an EmailJS account
Sign up free at https://www.emailjs.com/ (free tier: 200 emails/month —
plenty for testing).

## 2. Connect an email service
In the EmailJS dashboard: **Email Services → Add New Service**. Pick Gmail,
Outlook, or your own SMTP, and follow the OAuth/connection prompts. Note
the **Service ID** it generates (e.g. `service_abc1234`).

## 3. Create an email template
**Email Templates → Create New Template**. Build the email however you like
using these variable names (they match what the kiosk sends):

| Variable | What it is |
|---|---|
| `{{to_email}}` | The requester's email — set this as the template's **To** address |
| `{{name}}` | Name they typed |
| `{{class_year}}` | The class year of the composite they selected |
| `{{affiliation}}` | Their affiliation: Alumni, Family, Friend, Faculty, or Student |
| `{{phone}}` | Phone they entered (may be blank) |
| `{{address}}` | Address they entered (may be blank) |

Example template body:
```
Hi {{name}},

Thanks for requesting your {{class_year}} Digital Composite from the
University of Michigan College of Pharmacy. Your copy is attached
(or linked below).

— UM College of Pharmacy
```
Note the **Template ID** (e.g. `template_xyz789`).

## 4. Get your Public Key
**Account → General → Public Key**. Copy it.

## 5. Plug the three values into the app
Open `app.js` and find this block near the top:
```js
var EMAILJS_CONFIG = {
  publicKey: "YOUR_EMAILJS_PUBLIC_KEY",
  serviceId: "YOUR_EMAILJS_SERVICE_ID",
  templateId: "YOUR_EMAILJS_TEMPLATE_ID"
};
```
Replace all three placeholder strings with the real values from steps 2–4.

## 6. Test it
Run the kiosk locally (`python3 -m http.server 8000`, see README.md),
search for any class year, tap **Email Composite**, fill in a **real email
address you can check**, and tap **Submit**. Within a few seconds you
should get the email. Errors (bad keys, network issues, etc.) show up in
the browser console and as an on-screen message instead of silently
failing.

If the three config values are still placeholders, the app runs in
**demo mode**: the form still validates and shows the confirmation screen,
but nothing is sent — useful for testing the on-screen flow before your
EmailJS account is ready. A console warning tells you when this is
happening.

## About attaching the actual photo
EmailJS's free tier does **not** support file attachments, so out of the
box this sends a text email confirming the request — it doesn't attach the
composite image itself. You have two realistic options for a real deployment:

1. **Upgrade to an EmailJS paid plan**, which supports attachments — you'd
   pass the composite photo as a base64 attachment in `templateParams`.
2. **Host the composite photos somewhere public** (e.g. S3, a CDN, or your
   own web server) and include a direct download link in the email template
   instead of an attachment — usually the more practical choice for images
   that can be several MB each.

Either way, that's a decision for your actual class-photo hosting setup —
happy to wire up whichever approach you pick.
