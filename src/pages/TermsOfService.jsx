import { Link } from "react-router";
import { ArrowLeft, FileText } from "lucide-react";

const updated = "October 11, 2026";

const Section = ({ title, children }) => (
  <section className="space-y-3">
    <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">{title}</h2>
    <div className="space-y-3 leading-7 text-muted-foreground">{children}</div>
  </section>
);

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
        <Link to="/" className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-primary">
          <ArrowLeft size={16} /> Back to CodeSync
        </Link>

        <header className="mb-10 border-b border-border pb-8">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
            <FileText size={24} />
          </div>
          <p className="mb-2 text-sm font-medium text-primary">CodeSync · Legal</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Terms of Service</h1>
          <p className="mt-3 text-sm text-muted-foreground">Last updated: {updated}</p>
          <p className="mt-5 max-w-3xl leading-7 text-muted-foreground">
            These terms govern your use of CodeSync, a service that helps you view coding-platform activity, developer profiles, statistics and rankings in one place.
          </p>
        </header>

        <div className="space-y-8">
          <Section title="1. Accepting these terms">
            <p>By accessing or using CodeSync, you agree to these Terms of Service and the Privacy Policy. If you do not agree, do not use the service. If you use CodeSync on behalf of another person or organization, you confirm that you have authority to accept these terms for them.</p>
          </Section>

          <Section title="2. What CodeSync provides">
            <p>CodeSync may combine coding activity and information from services such as LeetCode, Codeforces, GeeksforGeeks and GitHub to show profiles, progress, consistency, analytics, contest information and rankings. Features may change, be unavailable, or be added or removed over time.</p>
            <p>CodeSync is an independent product and is not affiliated with or endorsed by those third-party services. Third-party names and marks belong to their respective owners.</p>
          </Section>

          <Section title="3. Accounts and security">
            <p>You are responsible for providing accurate information, maintaining access to your account and protecting your sign-in credentials. You must promptly notify us if you suspect unauthorized use of your account. Do not share authentication tokens or attempt to access another user's account without permission.</p>
          </Section>

          <Section title="4. Acceptable use">
            <p>You agree not to:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Use CodeSync in violation of applicable laws or another service's applicable rules.</li>
              <li>Attempt to disrupt, overload, probe or bypass the security of CodeSync or its providers.</li>
              <li>Scrape, automate access to, or misuse the service in ways that violate these terms or applicable third-party restrictions.</li>
              <li>Impersonate another person, submit misleading information, or use the service to harass or harm others.</li>
              <li>Reverse engineer or interfere with the service except where applicable law permits it.</li>
            </ul>
          </Section>

          <Section title="5. Third-party data and accuracy">
            <p>Statistics, ratings, contributions and other information may be obtained from third-party services, public sources or information you provide. Data may be delayed, incomplete, unavailable, or different from the source platform. CodeSync does not guarantee the accuracy or continuous availability of third-party information.</p>
            <p>You are responsible for ensuring that you have the right to connect or submit the accounts and information you use with CodeSync, and for reviewing the permissions requested by external services.</p>
          </Section>

          <Section title="6. Profiles and user content">
            <p>You retain any rights you have in information you submit. You grant CodeSync permission to process and display that information as needed to operate the features you use. If you publish a profile or participate in a leaderboard, relevant information may be visible to other users. Do not submit content that violates another person's rights or applicable law.</p>
          </Section>

          <Section title="7. Availability and changes">
            <p>We may modify, suspend or discontinue features to maintain, secure or improve CodeSync. We aim to keep the service useful but do not guarantee uninterrupted access, error-free operation or permanent availability of any feature or stored statistic.</p>
          </Section>

          <Section title="8. Disclaimers and limitation of liability">
            <p>To the extent permitted by applicable law, CodeSync is provided on an “as available” basis without warranties that the service will always be accurate, uninterrupted or suitable for a particular purpose. CodeSync is a tracking and analytics tool, not an official record maintained by the third-party platforms it displays.</p>
            <p>To the extent permitted by applicable law, CodeSync and its operators will not be liable for indirect, incidental, special or consequential loss arising from use of, or inability to use, the service. Nothing in these terms excludes liability that cannot lawfully be excluded.</p>
          </Section>

          <Section title="9. Suspension and termination">
            <p>We may restrict or suspend access if reasonably necessary to protect the service, users or third parties, address misuse, or comply with law. You may stop using CodeSync at any time. For account or data deletion requests, contact us using the details below.</p>
          </Section>

          <Section title="10. Changes to these terms">
            <p>We may revise these terms as the service evolves. We will post the current version on this page and update the date above. Your continued use after changes take effect indicates acceptance, to the extent permitted by applicable law.</p>
          </Section>

          <Section title="11. Contact">
            <p>Questions about these terms or requests relating to your account: <a className="font-medium text-primary underline underline-offset-4" href="mailto:amanthecoder001@gmail.com">amanthecoder001@gmail.com</a>.</p>
          </Section>
        </div>

        <footer className="mt-12 flex flex-wrap gap-5 border-t border-border pt-6 text-sm text-muted-foreground">
          <Link to="/privacy-policy" className="transition hover:text-primary">Privacy Policy</Link>
          <Link to="/" className="transition hover:text-primary">CodeSync home</Link>
        </footer>
      </div>
    </main>
  );
}
