import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";

const updated = "October 11, 2026";

const Section = ({ title, children }) => (
  <section className="space-y-3">
    <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">{title}</h2>
    <div className="space-y-3 leading-7 text-muted-foreground">{children}</div>
  </section>
);

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
        <Link to="/" className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-primary">
          <ArrowLeft size={16} /> Back to CodeSync
        </Link>

        <header className="mb-10 border-b border-border pb-8">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
            <ShieldCheck size={24} />
          </div>
          <p className="mb-2 text-sm font-medium text-primary">CodeSync · Legal</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Privacy Policy</h1>
          <p className="mt-3 text-sm text-muted-foreground">Last updated: {updated}</p>
          <p className="mt-5 max-w-3xl leading-7 text-muted-foreground">
            This policy explains how CodeSync handles information when you use the website to bring your coding-platform activity, developer profile, rankings and progress into one place.
          </p>
        </header>

        <div className="space-y-8">
          <Section title="1. Information we may collect">
            <p><strong className="text-foreground">Account information.</strong> When you sign in, we may receive account details such as your name, email address and profile image from the authentication provider you choose.</p>
            <p><strong className="text-foreground">Coding-platform information.</strong> Depending on the services and features you connect or use, CodeSync may process platform usernames, publicly available coding statistics, problem-solving activity, contest ratings, contribution/activity history, repository information and related metrics.</p>
            <p><strong className="text-foreground">Information you provide.</strong> This may include profile details, platform handles, settings and information you submit through forms or support requests.</p>
            <p><strong className="text-foreground">Technical information.</strong> The service and its hosting providers may process basic technical data needed to operate, secure and troubleshoot the website, such as request logs and browser/device information.</p>
          </Section>

          <Section title="2. How we use information">
            <ul className="list-disc space-y-2 pl-5">
              <li>Create and maintain your account and profile.</li>
              <li>Display combined coding activity, streaks, statistics, analytics, contest information and rankings.</li>
              <li>Connect to platforms you choose and refresh their data when you request or enable synchronization.</li>
              <li>Maintain, secure, debug and improve CodeSync.</li>
              <li>Respond to support requests and communicate important service-related information.</li>
            </ul>
          </Section>

          <Section title="3. Sign-in and connected services">
            <p>CodeSync may use Supabase for authentication and database services and Google OAuth for sign-in. If you connect an external coding platform, that platform may share information according to the permissions you approve and its own privacy policy.</p>
            <p>CodeSync is an independent service and is not affiliated with or endorsed by LeetCode, Codeforces, GeeksforGeeks, GitHub or Google. Each third-party service controls its own systems, data and privacy practices.</p>
            <p>Only connect accounts and grant permissions you understand. You can stop using a connected service; where a disconnect control is provided, use it to revoke or remove the connection. Revoking access at a provider may also be necessary through that provider's settings.</p>
          </Section>

          <Section title="4. Storage, service providers and sharing">
            <p>Information may be stored and processed by infrastructure providers used to run CodeSync, including Supabase and the website hosting provider. These providers process information to provide their services under their own terms and safeguards.</p>
            <p>We do not intend to sell your personal information. Information may be disclosed where necessary to operate or protect the service, comply with applicable law, enforce our terms, or address security and abuse concerns.</p>
            <p>Some profile, ranking or activity information may be visible to other users if you use a public-profile or leaderboard feature. Do not add information to a public profile that you do not want others to see.</p>
          </Section>

          <Section title="5. Retention and deletion requests">
            <p>Information is retained for as long as needed to provide the service, maintain account records, resolve disputes and meet applicable legal or security requirements. Retention may vary by data type and provider.</p>
            <p>To ask about accessing, correcting or deleting your information, contact <a className="font-medium text-primary underline underline-offset-4" href="mailto:amanthecoder001@gmail.com">amanthecoder001@gmail.com</a> from the email associated with your account and describe your request. We may need to verify that you control the account. Some records may need to be retained where required by law or for legitimate security purposes.</p>
          </Section>

          <Section title="6. Security">
            <p>We use the security features available from our service providers and take reasonable steps to protect information. No website, transmission or storage system can be guaranteed to be completely secure.</p>
          </Section>

          <Section title="7. Children and eligibility">
            <p>CodeSync is intended for people who can lawfully use the service under the laws applicable to them. If you believe a child has provided personal information inappropriately, contact us so we can review the request.</p>
          </Section>

          <Section title="8. Changes to this policy">
            <p>We may update this policy as CodeSync changes. The revised version will be posted on this page with an updated date. Continued use after an update means you acknowledge the revised policy, subject to rights provided by applicable law.</p>
          </Section>

          <Section title="9. Contact">
            <p>Questions or privacy requests: <a className="font-medium text-primary underline underline-offset-4" href="mailto:amanthecoder001@gmail.com">amanthecoder001@gmail.com</a>.</p>
          </Section>
        </div>

        <footer className="mt-12 flex flex-wrap gap-5 border-t border-border pt-6 text-sm text-muted-foreground">
          <Link to="/terms" className="transition hover:text-primary">Terms of Service</Link>
          <Link to="/" className="transition hover:text-primary">CodeSync home</Link>
        </footer>
      </div>
    </main>
  );
}
