# SSO Summary Email: Okta ↔ Tempus

**Template for sending to the customer (SSO specialist or project manager)**

---

## Subject
Tempus SSO Setup – Configuration Values and Quick Guide (Okta)

---

## Email Body

Hi [Name],

Please find below a summary for setting up Single Sign-On (SSO) between Okta and Tempus Resource. With SSO, your users can log in to Tempus using their existing Okta credentials – no separate password needed.

Please share this with your IT team or SSO specialist. The technical values in the table below are what they will need.

---

### Configuration Values (for your IT/SSO team)

| Setting | Value |
|---------|-------|
| **Audience URI** | [e.g. https://client.tempus-resource.com/sg] |
| **Single sign-on URL** | [e.g. https://client.tempus-resource.com/sg/home/saml] – must be lowercase |
| **Tempus URL** | [e.g. https://client.tempus-resource.com] |

---

### What happens next (high-level)

1. **In Okta:** Your IT team creates a new application for Tempus (similar to how you would add any other app like Microsoft 365). They use the values from the table above. Okta usually fills in some fields automatically.

2. **In Tempus:** We enable SSO in the system settings and connect it to your Okta setup. The easiest way is to use the metadata link from Okta – Tempus then configures itself automatically.

3. **User setup:** Each user who should use SSO needs their email address entered in Tempus, and SSO enabled for their account. The email must match their Okta login. We recommend testing with one user first before rolling it out to everyone.

---

### For your SSO specialist

- **Option A (recommended):** Paste the Okta metadata URL into Tempus → Save → Done.
- **Option B (manual):** Enter the values from the Okta metadata file manually. Note: For Tempus, the “SAML application id” should be the Entity ID from the Okta metadata – not the URL from the table above.

---

The detailed technical documentation is attached for your reference.

If you have any questions, please don’t hesitate to reach out.

Best regards,  
[Your name]
