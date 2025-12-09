# AWS SES Production Access - Antwort an AWS Support

## 📧 Antwort-E-Mail (Englisch)

---

**Subject:** Re: Request for Production Access - Additional Information (Case ID: 176527947800231)

---

Hello AWS SES Support Team,

Thank you for your response. I'm happy to provide detailed information about our use case for Amazon SES.

## Use Case Overview

We operate a professional services website (https://manuel-weiss.ch) that provides HR consulting and digitalization services. We need Amazon SES to send **transactional emails only** for our user authentication and account management system.

## Email Sending Details

### 1. Email Types and Frequency

We plan to send the following types of transactional emails:

**A. User Registration & Email Verification (Primary Use Case)**
- **Purpose:** Send verification codes to new users who register on our website
- **Frequency:** Approximately 10-50 emails per day (depending on new registrations)
- **Recipients:** Only users who actively register on our website
- **Example:** When a user creates an account, we send a 6-digit verification code via email

**B. Two-Factor Authentication (2FA) Codes**
- **Purpose:** Send TOTP/SMS verification codes for users who enable 2FA
- **Frequency:** Approximately 5-20 emails per day (only when users log in with 2FA enabled)
- **Recipients:** Only authenticated users who have enabled 2FA
- **Example:** When a user logs in with 2FA enabled, we send a verification code

**C. Password Reset Requests**
- **Purpose:** Send password reset links/codes when users request password resets
- **Frequency:** Approximately 2-10 emails per day (only when users request password resets)
- **Recipients:** Only users who explicitly request password resets
- **Example:** When a user clicks "Forgot Password", we send a reset code

**Total Expected Volume:**
- **Daily:** 20-80 transactional emails per day
- **Monthly:** Approximately 600-2,400 emails per month
- **Peak:** Up to 200 emails per day during high registration periods

### 2. Recipient List Management

**Our recipient management process:**

- **Opt-in Only:** All recipients must explicitly register on our website. We do not send unsolicited emails.
- **Double Opt-in:** Users must verify their email address before their account is activated.
- **User-Initiated:** All emails are triggered by user actions (registration, login, password reset).
- **No Marketing Emails:** We do not send promotional, marketing, or bulk emails through SES.
- **Account-Based:** All emails are sent to registered users only, tied to their user accounts in our AWS Cognito User Pool.

**Technical Implementation:**
- We use AWS Cognito User Pool for user management
- Email addresses are collected during user registration
- Users must verify their email before account activation
- All email sending is automated through AWS Cognito and our application

### 3. Bounce and Complaint Management

**Our bounce and complaint handling procedures:**

**A. Bounce Management:**
- We monitor bounce rates through AWS SES bounce notifications
- Hard bounces (>5% bounce rate) will trigger automatic account suspension
- We remove invalid email addresses from our system immediately upon hard bounce
- We use AWS SNS to receive bounce notifications and process them automatically
- Our system logs all bounces for review and analysis

**B. Complaint Management:**
- We monitor complaint rates through AWS SES complaint notifications
- If complaint rate exceeds 0.1%, we will investigate and take corrective action
- We provide clear unsubscribe options in all emails (though our emails are transactional)
- We use AWS SNS to receive complaint notifications
- All complaints are logged and reviewed

**C. Unsubscribe Management:**
- Since our emails are transactional (verification codes, password resets), users cannot unsubscribe from these essential emails
- However, we clearly state in our emails that these are transactional messages
- Users can delete their accounts if they no longer wish to receive any emails

**D. Monitoring and Alerts:**
- We monitor bounce and complaint rates daily
- We have alerts set up for bounce rates >5% or complaint rates >0.1%
- We review and clean our recipient list regularly

### 4. Email Content Examples

**Example 1: Email Verification Code**

```
Subject: Bestätigen Sie Ihre E-Mail-Adresse - Manuel Weiss

Hallo [username],

vielen Dank für Ihre Registrierung bei Manuel Weiss Professional Services!

Bitte bestätigen Sie Ihre E-Mail-Adresse mit dem folgenden Code:

[6-digit code]

Dieser Code ist 24 Stunden gültig.

Mit freundlichen Grüßen
Manuel Weiss
https://manuel-weiss.ch
```

**Example 2: Password Reset Code**

```
Subject: Passwort zurücksetzen - Manuel Weiss

Hallo [username],

Sie haben eine Passwort-Zurücksetzung angefordert.

Bitte verwenden Sie den folgenden Code zum Zurücksetzen Ihres Passworts:

[6-digit code]

Dieser Code ist 1 Stunde gültig.

Falls Sie diese Anfrage nicht gestellt haben, ignorieren Sie diese E-Mail.

Mit freundlichen Grüßen
Manuel Weiss
https://manuel-weiss.ch
```

**Email Content Quality:**
- All emails are in German (our primary market)
- Clear, professional language
- No promotional content
- Essential information only
- Clear call-to-action (verification code)
- Contact information included

### 5. Verified Identity

**We have verified the following domain identity:**
- **Domain:** manuel-weiss.ch
- **Status:** Verified (SPF, DKIM, DMARC configured)
- **MX Records:** Configured for email receiving
- **SES Configuration:** Domain verified in SES

We also have verified email addresses:
- weiss-manuel@gmx.de
- manuelalexanderweiss@gmail.com

### 6. Technical Implementation

**Our email sending infrastructure:**
- **Service:** AWS Cognito User Pool (eu-central-1_8gP4gLK9r)
- **Region:** eu-central-1 (Frankfurt)
- **Email Templates:** Configured in Cognito User Pool
- **Sending Method:** Automated through AWS Cognito and our application
- **Monitoring:** AWS CloudWatch for metrics and alerts

### 7. Compliance and Best Practices

**We follow AWS SES best practices:**
- ✅ Verified domain identity (manuel-weiss.ch)
- ✅ SPF, DKIM, DMARC records configured
- ✅ Double opt-in for new users
- ✅ Clear email content (no spam triggers)
- ✅ Bounce and complaint monitoring
- ✅ Rate limiting to prevent abuse
- ✅ User-initiated emails only
- ✅ No marketing or promotional content

## Summary

We are requesting production access to send **transactional emails only** for our user authentication system. Our use case is straightforward:

- **Purpose:** User registration verification, 2FA codes, password resets
- **Volume:** 20-80 emails per day (600-2,400 per month)
- **Recipients:** Only registered users who opt-in
- **Content:** Transactional codes and verification links only
- **Compliance:** Verified domain, bounce/complaint monitoring, opt-in only

We have a verified domain identity (manuel-weiss.ch) and follow all AWS SES best practices. We are committed to maintaining high email quality and low bounce/complaint rates.

Please let me know if you need any additional information. I'm happy to provide more details if needed.

Thank you for your consideration.

Best regards,
Manuel Weiss
manuel-weiss.ch

---

## 📋 Checkliste für Ihre Antwort

- [ ] Kopieren Sie den Text oben
- [ ] Gehen Sie zu: https://console.aws.amazon.com/support/home#/case/?displayId=176527947800231&language=en
- [ ] Klicken Sie auf "Add comment" oder "Reply"
- [ ] Fügen Sie den Text ein
- [ ] Senden Sie die Antwort

---

## ⚠️ Wichtige Hinweise

1. **Antworten Sie über die AWS Support Console** (nicht per E-Mail, da die E-Mail-Adresse keine eingehenden E-Mails akzeptiert)

2. **Fügen Sie alle Details hinzu**, die in der Antwort enthalten sind

3. **Warten Sie auf die Antwort** (innerhalb von 24 Stunden)

4. **Prüfen Sie den Status** regelmäßig in der AWS Console

---

## ✅ Nach dem Senden

Nachdem Sie die Antwort gesendet haben:
1. Warten Sie auf die Antwort von AWS (24 Stunden)
2. Prüfen Sie den Status in der AWS Console
3. Sobald Production Access gewährt wurde, können Sie E-Mails an alle Adressen senden

