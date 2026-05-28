# Privacy Policy — Sweet News

**Effective Date:** [EFFECTIVE DATE — insert before publishing]
**Last Updated:** May 28, 2026
**Operator:** Sweet News LLC, Denver, Colorado

> **⚠ Legal Notice:** This document is a foundational privacy policy drafted to accurately reflect the current technical architecture of Sweet News. It has not been reviewed by a licensed attorney. **[LEGAL REVIEW BY A QUALIFIED ATTORNEY IS STRONGLY RECOMMENDED BEFORE PUBLISHING OR DISTRIBUTING THIS POLICY TO END USERS.]**

---

## 1. Introduction

Sweet News ("we," "us," or "our") operates a late-night delivery service available at [sweetnews.co / your production domain] and as a progressive web application (PWA) installable on iOS and Android devices.

This Privacy Policy explains what information we collect, why we collect it, how we use and protect it, and what choices you have regarding your information. By using the Sweet News service — whether as a customer placing an order or as a driver applicant — you agree to the practices described in this policy.

---

## 2. Information We Collect

### 2.1 Account Information

**Customers** sign in using Google Sign-In (OAuth 2.0). When you create an account, we receive and store the following from your Google account:

- Email address
- Display name
- Profile photo URL

**Driver applicants** create accounts using an email address and password via Firebase Authentication. No profile photo is required at signup; drivers may optionally upload a photo during the application process.

We assign each account an internal role (`customer`, `driver_pending`, `driver_active`) that controls what features of the service you can access.

### 2.2 Delivery Information

When you place an order, we collect:

- **Recipient name** — the name you provide for delivery
- **Delivery address** — the street address you enter or confirm
- **Order contents** — the items, quantities, and prices in your cart
- **Order total** — including the delivery fee

This information is stored in your order history and is accessible to you, to your assigned delivery driver, and to Sweet News administrators.

### 2.3 Order History

We maintain a record of your completed, cancelled, and in-progress orders. Each order record includes the items ordered, the total amount charged, the delivery address, the order status, the date and time, and — for delivered orders — the rating you gave your driver.

### 2.4 Driver Application Data

When you apply to join the Sweet News driver fleet, we collect:

- Full legal name
- Email address
- Phone number
- City you intend to deliver in
- Vehicle type (Car, Scooter, Bicycle, or Motorcycle — optional)
- Browser user agent string (collected automatically for security purposes)
- Date and time of submission

Driver applications are stored in our database and are accessible only to Sweet News administrators.

### 2.5 Approximate Location

When you first open Sweet News, our server automatically reads the approximate city and region associated with your IP address using geolocation data provided by our hosting infrastructure (Vercel). This is used solely to pre-fill your delivery address field as a convenience. **We do not collect or store your precise GPS location.**

The detected city and region may be stored in your browser's local storage as part of your delivery profile (see Section 2.6).

### 2.6 Data Stored on Your Device

Sweet News stores the following data locally in your browser's `localStorage` — this data does not leave your device except where noted:

| Storage Key | Contents | Purpose |
|---|---|---|
| `sweetnews-cart-storage` | Items in your current cart (names, prices, quantities) | Preserve your cart between sessions |
| `sweetnews-profile-storage` | Delivery name, delivery address, detected city/region, push notification preference | Pre-fill delivery form fields |
| `sweetnews-orders-storage` | A local cache of your order history | Display orders instantly while live data loads |
| `sn-install-dismissed` | A flag indicating you dismissed the app install prompt | Prevent repeated prompts |
| `sn-driver-waitlist-submitted` | A timestamp of your driver waitlist submission | Prevent duplicate submissions for 30 days |

This data is stored unencrypted in your browser. You can clear it at any time by clearing your browser's site data.

### 2.7 Push Notification Token

If you grant permission for push notifications, we collect a Firebase Cloud Messaging (FCM) token associated with your device and browser. This token is stored in your user profile in our database and is used exclusively to send you order status updates (e.g., "Your order is on the way"). You can revoke this permission at any time through your browser or device notification settings.

---

## 3. Information We Do Not Collect

We want to be explicit about what we do **not** collect:

- **Payment card data.** Your credit card number, CVV, and billing details are entered directly into Stripe's secure payment form and are processed entirely by Stripe. Sweet News never receives, transmits, or stores your raw card data. We store only a Stripe Payment Intent reference ID in your order record.
- **Precise GPS coordinates.** We use only IP-based approximate location (city and region level) to assist with address pre-fill.
- **Browsing or behavioral analytics.** Sweet News does not use Google Analytics, Mixpanel, Segment, Hotjar, or any third-party analytics or tracking library.
- **Cookies.** Sweet News does not set or read browser cookies. User sessions are managed via Firebase Authentication using browser localStorage.
- **Advertising identifiers.** We do not collect advertising IDs, IDFA, or similar identifiers.

---

## 4. How We Use Your Information

We use the information we collect for the following purposes only:

| Purpose | Data Used |
|---|---|
| Authenticate your account and maintain your session | Email, Firebase Auth credentials |
| Process and fulfill your delivery orders | Name, delivery address, order contents, payment reference |
| Display your order history and tracking status | Order records |
| Assign and notify delivery drivers | Order address, customer name, items |
| Pre-fill your delivery address for convenience | IP-approximate city and region |
| Send order status push notifications | FCM device token |
| Review driver applications and manage the fleet | Applicant name, email, phone, city, vehicle type |
| Prevent fraudulent or duplicate waitlist submissions | Email (duplicate check), user agent, localStorage flag |
| Operate, maintain, and improve the service | All of the above |

We do not use your information for advertising, behavioral profiling, or any purpose not listed above.

---

## 5. We Do Not Sell Your Data

Sweet News does not sell, rent, lease, or trade your personal information to any third party, including data brokers, advertisers, or marketing services. Your data is used solely to operate and secure the Sweet News service.

---

## 6. Third-Party Services

Sweet News is built on several third-party infrastructure providers. Each provider processes data according to their own privacy policies, which we encourage you to review.

### 6.1 Firebase / Google

We use Firebase (a Google product) for:

- **Firebase Authentication** — manages user accounts and sign-in sessions
- **Cloud Firestore** — stores user profiles, orders, driver applications, and waitlist entries
- **Firebase Storage** — stores driver profile photos
- **Firebase Cloud Messaging (FCM)** — delivers push notifications to your device

All data stored in Firestore and Firebase Storage is encrypted at rest and in transit by Google. Firebase operates on Google Cloud infrastructure with SOC 2, ISO 27001, and other certifications.

**Google Privacy Policy:** [https://policies.google.com/privacy](https://policies.google.com/privacy)

### 6.2 Stripe

We use Stripe to process payment card transactions. When you complete a purchase:

- Your card details are entered directly into Stripe's hosted CardElement component, which is rendered in a Stripe-controlled iframe.
- Card data is transmitted directly from your browser to Stripe's PCI-DSS Level 1 certified infrastructure.
- Sweet News receives only a Payment Intent ID confirming a successful charge.

**Stripe Privacy Policy:** [https://stripe.com/privacy](https://stripe.com/privacy)

### 6.3 Vercel

Our application is hosted on Vercel. When you access Sweet News, Vercel's servers process your request and, as part of normal hosting operations, read IP-based geolocation headers (`x-vercel-ip-city`, `x-vercel-ip-country-region`, etc.) which we use to pre-fill your city field. Vercel may retain standard server access logs per their own policy.

**Vercel Privacy Policy:** [https://vercel.com/legal/privacy-policy](https://vercel.com/legal/privacy-policy)

### 6.4 Resend

We use Resend to send internal order notification emails to Sweet News staff when a new order is placed. These emails include order details (items, total, delivery address). Resend does not receive customer email addresses and does not send emails directly to customers.

**Resend Privacy Policy:** [https://resend.com/legal/privacy-policy](https://resend.com/legal/privacy-policy)

---

## 7. Data Storage and Security

Your data is stored in Google Cloud Firestore (via Firebase), which provides:

- **Encryption at rest** using AES-256
- **Encryption in transit** using TLS 1.2+
- **Access control** — data is protected by Firestore Security Rules that restrict reads and writes to authorized users only (customers can only access their own orders; drivers can only access orders assigned to them; administrators have full access)

We do not operate our own database servers. We rely on Firebase's managed infrastructure and its associated security certifications.

Payment data is stored and secured entirely by Stripe under PCI-DSS Level 1 compliance.

No security system is impenetrable. In the event of a data breach that affects your personal information, we will notify affected users in accordance with applicable law.

---

## 8. Data Retention

| Data Type | Retention Period |
|---|---|
| Customer account (email, name, photo) | Retained while your account is active. Deleted upon written request. |
| Order history | [DATA RETENTION PERIOD — e.g., "Retained for 2 years from the order date, then deleted."] |
| Driver waitlist applications | [DATA RETENTION PERIOD — e.g., "Retained for 1 year from submission date, or until the application is resolved."] |
| Driver profile (active drivers) | Retained for the duration of the driver relationship plus [PERIOD] after termination. |
| Push notification tokens | Deleted when you revoke notification permission or delete your account. |
| Browser localStorage data | Persists until you clear your browser's site data. Not controlled by Sweet News. |

To request deletion of your account and associated data, email us at **sweetnewsowl@gmail.com** with the subject line "Data Deletion Request."

---

## 9. Your Rights and Choices

Regardless of where you are located, you have the following rights with respect to your personal information:

- **Access:** Request a copy of the personal information we hold about you.
- **Correction:** Request that inaccurate information be corrected.
- **Deletion:** Request that your account and associated personal data be deleted.
- **Notification opt-out:** Revoke push notification permission at any time in your browser or device settings. This does not affect your ability to use the service.
- **Data portability:** Request your data in a portable format.

To exercise any of these rights, contact us at **sweetnewsowl@gmail.com**.

We do not engage in automated decision-making or profiling that produces legal or similarly significant effects.

**Applicable Privacy Laws:** Sweet News is located in Denver, Colorado. We comply with all applicable state and federal privacy laws. If you have questions about your privacy rights under your state's laws, please contact us at sweetnewsowl@gmail.com and we will assist you.

---

## 10. Children's Privacy

Sweet News is not directed to children under the age of 13, and we do not knowingly collect personal information from anyone under 13. If you believe a child under 13 has provided us with personal information, please contact us at **sweetnewsowl@gmail.com** and we will promptly delete that information.

---

## 11. Changes to This Policy

We may update this Privacy Policy from time to time. When we do, we will update the "Last Updated" date at the top of this document. For material changes, we will make reasonable efforts to notify users (for example, by posting a notice in the app or sending an email to the address associated with your account).

Continued use of Sweet News after a policy update constitutes your acceptance of the revised policy.

---

## 12. Contact Us

If you have questions, concerns, or requests regarding this Privacy Policy or the handling of your personal information, please contact us:

**Sweet News LLC**
Denver, Colorado
**Email:** sweetnewsowl@gmail.com

We aim to respond to all privacy-related inquiries within **[RESPONSE TIMEFRAME — e.g., 30 days]**.

---

*Sweet News LLC — Denver, CO — Est. 2023*
