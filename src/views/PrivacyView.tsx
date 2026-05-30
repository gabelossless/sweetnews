import { motion } from 'motion/react';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { OwlMascot } from '../components/atoms/OwlMascot';

export default function PrivacyView() {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-10 bg-black/90 backdrop-blur-xl border-b border-white/[0.05] px-5 py-4 flex items-center gap-3">
        <button
          onClick={() => history.back()}
          className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center hover:bg-white/10 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={16} className="text-white/70" />
        </button>
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-[#e60023]" />
          <span className="text-sm font-black uppercase tracking-widest text-white/70">Privacy Policy</span>
        </div>
      </header>

      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-[680px] mx-auto px-5 py-10 pb-20"
      >
        <div className="flex flex-col items-center mb-10 text-center">
          <OwlMascot size={56} className="mb-4" />
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white mb-1">Privacy Policy</h1>
          <p className="text-[11px] text-white/35 font-medium uppercase tracking-widest">
            Sweet News LLC · Denver, Colorado
          </p>
          <p className="text-[11px] text-white/25 mt-2">Effective: May 30, 2026 · Last Updated: May 30, 2026</p>
        </div>

        <div className="space-y-8 text-[14px] leading-relaxed text-white/70">

          <Section title="1. Introduction">
            <p>
              Sweet News ("we," "us," or "our") operates a late-night delivery service available at sweetnews.co and as a
              progressive web application (PWA) installable on iOS and Android devices.
            </p>
            <p className="mt-3">
              This Privacy Policy explains what information we collect, why we collect it, how we use and protect it, and
              what choices you have. By using Sweet News — whether placing an order or applying as a driver — you agree to
              the practices described here.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <SubSection title="2.1 Account Information">
              <p>
                <strong className="text-white">Customers</strong> sign in using Google Sign-In (OAuth 2.0). We receive and
                store your email address, display name, and profile photo URL.
              </p>
              <p className="mt-2">
                <strong className="text-white">Driver applicants</strong> create accounts using email and password. We assign
                each account an internal role (<code className="text-[#ff8090] text-[12px]">customer</code>,{' '}
                <code className="text-[#ff8090] text-[12px]">driver_pending</code>,{' '}
                <code className="text-[#ff8090] text-[12px]">driver_active</code>) that controls service access.
              </p>
            </SubSection>

            <SubSection title="2.2 Delivery Information">
              <p>When you place an order we collect: recipient name, delivery address, order contents and quantities,
                and order total. This is accessible to you, your delivery driver, and Sweet News administrators.</p>
            </SubSection>

            <SubSection title="2.3 Order History">
              <p>We maintain a record of completed, cancelled, and in-progress orders including items, total, address,
                status, date/time, and driver ratings.</p>
            </SubSection>

            <SubSection title="2.4 Driver Application Data">
              <p>When you apply to drive we collect: full legal name, email, phone number, city, vehicle type (optional),
                browser user agent, and submission date/time. Applications are accessible to administrators only.</p>
            </SubSection>

            <SubSection title="2.5 Approximate Location">
              <p>On first open, our server reads the approximate city and region from your IP address (via Vercel
                infrastructure) to pre-fill your delivery address. <strong className="text-white">We do not collect
                or store your precise GPS location.</strong></p>
            </SubSection>

            <SubSection title="2.6 Data Stored on Your Device">
              <p className="mb-3">Sweet News stores the following data locally in your browser's localStorage — it does not leave your device except where noted:</p>
              <div className="overflow-x-auto">
                <table className="w-full text-[12px] border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.08]">
                      <th className="text-left py-2 pr-4 text-white/50 font-black uppercase tracking-wider">Key</th>
                      <th className="text-left py-2 pr-4 text-white/50 font-black uppercase tracking-wider">Contents</th>
                      <th className="text-left py-2 text-white/50 font-black uppercase tracking-wider">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="text-white/50">
                    {[
                      ['sweetnews-cart-storage', 'Cart items', 'Preserve cart between sessions'],
                      ['sweetnews-profile-storage', 'Delivery name, address, city/region', 'Pre-fill delivery form'],
                      ['sweetnews-orders-storage', 'Order history cache', 'Display orders instantly offline'],
                      ['sn-install-dismissed', 'Install prompt flag', 'Prevent repeated prompts'],
                      ['sn-driver-waitlist-submitted', 'Submission timestamp', 'Prevent duplicate submissions (30 days)'],
                    ].map(([key, contents, purpose]) => (
                      <tr key={key} className="border-b border-white/[0.04]">
                        <td className="py-2 pr-4 font-mono text-[11px] text-[#ff8090]">{key}</td>
                        <td className="py-2 pr-4">{contents}</td>
                        <td className="py-2">{purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SubSection>

            <SubSection title="2.7 Push Notification Token">
              <p>If you grant push notification permission, we collect an FCM token stored in your user profile to send
                order status updates. You can revoke this in your browser or device notification settings at any time.</p>
            </SubSection>
          </Section>

          <Section title="3. Information We Do Not Collect">
            <ul className="space-y-2 list-none">
              {[
                ['Payment card data', 'Your card details go directly to Stripe — Sweet News never receives, transmits, or stores raw card data. We store only a Stripe Payment Intent reference ID.'],
                ['Precise GPS', 'Only IP-based city/region level approximation.'],
                ['Analytics', 'No Google Analytics, Mixpanel, Segment, Hotjar, or any third-party tracking.'],
                ['Cookies', 'We set no browser cookies. Sessions are managed via Firebase Authentication.'],
                ['Advertising identifiers', 'No IDFA, ad IDs, or similar identifiers.'],
              ].map(([label, desc]) => (
                <li key={label} className="flex gap-3">
                  <span className="text-[#e60023] font-black mt-0.5">✕</span>
                  <span><strong className="text-white">{label}</strong> — {desc}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="4. How We Use Your Information">
            <div className="overflow-x-auto">
              <table className="w-full text-[12px] border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="text-left py-2 pr-6 text-white/50 font-black uppercase tracking-wider">Purpose</th>
                    <th className="text-left py-2 text-white/50 font-black uppercase tracking-wider">Data Used</th>
                  </tr>
                </thead>
                <tbody className="text-white/50">
                  {[
                    ['Authenticate and maintain session', 'Email, Firebase Auth credentials'],
                    ['Process and fulfill deliveries', 'Name, address, items, payment reference'],
                    ['Display order history and tracking', 'Order records'],
                    ['Assign and notify drivers', 'Order address, customer name, items'],
                    ['Pre-fill delivery address', 'IP-approximate city and region'],
                    ['Send order push notifications', 'FCM device token'],
                    ['Review driver applications', 'Name, email, phone, city, vehicle type'],
                    ['Prevent duplicate waitlist submissions', 'Email, user agent, localStorage flag'],
                  ].map(([purpose, data]) => (
                    <tr key={purpose} className="border-b border-white/[0.04]">
                      <td className="py-2.5 pr-6">{purpose}</td>
                      <td className="py-2.5">{data}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="5. We Do Not Sell Your Data">
            <p>Sweet News does not sell, rent, lease, or trade your personal information to any third party, including
              data brokers, advertisers, or marketing services. Your data is used solely to operate and secure the service.</p>
          </Section>

          <Section title="6. Third-Party Services">
            <SubSection title="6.1 Firebase / Google">
              <p>We use Firebase for Authentication, Cloud Firestore (user profiles, orders, applications), Firebase Storage
                (driver photos), and Firebase Cloud Messaging (push notifications). All data is encrypted at rest and in
                transit by Google.</p>
              <ExternalLink href="https://policies.google.com/privacy">Google Privacy Policy</ExternalLink>
            </SubSection>
            <SubSection title="6.2 Stripe">
              <p>Card data goes directly from your browser into Stripe's CardElement iframe — PCI-DSS Level 1 certified.
                Sweet News receives only a Payment Intent ID.</p>
              <ExternalLink href="https://stripe.com/privacy">Stripe Privacy Policy</ExternalLink>
            </SubSection>
            <SubSection title="6.3 Vercel">
              <p>Our app is hosted on Vercel. As part of normal hosting, Vercel processes request IP geolocation headers
                which we use to pre-fill your city. Vercel may retain standard server access logs.</p>
              <ExternalLink href="https://vercel.com/legal/privacy-policy">Vercel Privacy Policy</ExternalLink>
            </SubSection>
            <SubSection title="6.4 Resend">
              <p>We use Resend to send internal order notification emails to Sweet News staff. These include order details
                only. Resend does not receive customer email addresses and does not email customers.</p>
              <ExternalLink href="https://resend.com/legal/privacy-policy">Resend Privacy Policy</ExternalLink>
            </SubSection>
          </Section>

          <Section title="7. Data Storage and Security">
            <p>Your data lives in Google Cloud Firestore (AES-256 at rest, TLS 1.2+ in transit) protected by Firestore
              Security Rules — customers can only access their own orders; drivers only see assigned orders; admins have
              full access. Payment data is secured entirely by Stripe under PCI-DSS Level 1 compliance.</p>
            <p className="mt-3">In the event of a breach affecting your personal information, we will notify affected users
              in accordance with applicable law.</p>
          </Section>

          <Section title="8. Data Retention">
            <div className="overflow-x-auto">
              <table className="w-full text-[12px] border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="text-left py-2 pr-6 text-white/50 font-black uppercase tracking-wider">Data Type</th>
                    <th className="text-left py-2 text-white/50 font-black uppercase tracking-wider">Retention Period</th>
                  </tr>
                </thead>
                <tbody className="text-white/50">
                  {[
                    ['Customer account', 'Retained while active. Deleted upon written request.'],
                    ['Order history', 'Retained for 2 years from order date, then deleted.'],
                    ['Driver applications', 'Retained for 1 year from submission or until resolved.'],
                    ['Active driver profile', 'Retained for duration of relationship plus 1 year after termination.'],
                    ['Push notification tokens', 'Deleted when you revoke permission or delete your account.'],
                    ['Browser localStorage', 'Persists until you clear browser site data. Not controlled by Sweet News.'],
                  ].map(([type, period]) => (
                    <tr key={type} className="border-b border-white/[0.04]">
                      <td className="py-2.5 pr-6 text-white/70">{type}</td>
                      <td className="py-2.5">{period}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4">To request deletion, email <strong className="text-white">sweetnewsowl@gmail.com</strong> with
              subject "Data Deletion Request."</p>
          </Section>

          <Section title="9. Your Rights and Choices">
            <ul className="space-y-2 list-none">
              {[
                ['Access', 'Request a copy of your personal information.'],
                ['Correction', 'Request that inaccurate information be corrected.'],
                ['Deletion', 'Request account and associated data deletion.'],
                ['Notification opt-out', 'Revoke push notifications in browser/device settings anytime.'],
                ['Data portability', 'Request your data in a portable format.'],
              ].map(([right, desc]) => (
                <li key={right} className="flex gap-3">
                  <span className="text-emerald-400 font-black mt-0.5">✓</span>
                  <span><strong className="text-white">{right}</strong> — {desc}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4">Contact us at <strong className="text-white">sweetnewsowl@gmail.com</strong> to exercise any right. We aim to respond within 30 days.</p>
          </Section>

          <Section title="10. Children's Privacy">
            <p>Sweet News is not directed to children under 13 and we do not knowingly collect information from anyone under
              13. Contact <strong className="text-white">sweetnewsowl@gmail.com</strong> if you believe a child under 13 has
              provided us information and we will promptly delete it.</p>
          </Section>

          <Section title="11. Changes to This Policy">
            <p>We may update this policy from time to time. When we do, we update the "Last Updated" date above. For material
              changes we will make reasonable efforts to notify users. Continued use after an update constitutes acceptance
              of the revised policy.</p>
          </Section>

          <Section title="12. Contact Us">
            <address className="not-italic">
              <strong className="text-white">Sweet News LLC</strong><br />
              Denver, Colorado<br />
              <a href="mailto:sweetnewsowl@gmail.com" className="text-[#e60023] hover:text-[#ff2060] transition-colors">
                sweetnewsowl@gmail.com
              </a>
            </address>
          </Section>

          <div className="pt-6 border-t border-white/[0.05] text-center text-[10px] text-white/20 uppercase tracking-widest font-black">
            Sweet News LLC · Denver, CO · Est. 2023
          </div>
        </div>
      </motion.main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 mb-4 pb-2 border-b border-white/[0.06]">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <h3 className="text-[12px] font-black text-white/60 mb-2">{title}</h3>
      {children}
    </div>
  );
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block mt-2 text-[12px] text-[#e60023] hover:text-[#ff2060] transition-colors underline underline-offset-2"
    >
      {children} ↗
    </a>
  );
}
