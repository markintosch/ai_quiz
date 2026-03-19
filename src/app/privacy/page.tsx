import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy — Brand PWRD Media AI Maturity Assessment',
  description: 'How Brand PWRD Media collects, uses and protects your personal data when you take the AI Maturity Assessment.',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
            Brand PWRD Media
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Privacy Policy</h1>
          <p className="text-gray-500 text-sm">
            Last updated: 14 March 2026 &nbsp;·&nbsp; Version 1.0
          </p>
        </div>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

          {/* 1 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Who we are</h2>
            <p>
              Brand PWRD Media B.V. ("we", "us", "our") is the data controller for personal
              data collected through the AI Maturity Assessment at this website. You can reach us at{' '}
              <a href="mailto:mark@brandpwrdmedia.com"
                 className="text-blue-600 underline hover:text-blue-800">
                mark@brandpwrdmedia.com
              </a>.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">2. What data we collect</h2>
            <p>When you complete the AI Maturity Assessment we collect:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Your <strong>name</strong> and <strong>email address</strong></li>
              <li>Your <strong>job title</strong>, <strong>company name</strong>, industry and company size</li>
              <li>Your <strong>quiz answers</strong> (scored responses to each question)</li>
              <li>Your calculated <strong>AI Maturity Score</strong> and dimension breakdown</li>
              <li>The <strong>date and time</strong> you completed the assessment</li>
            </ul>
            <p className="mt-2">
              We do <strong>not</strong> collect payment information, sensitive personal data
              (as defined under GDPR Article 9), or any data from people under the age of 18.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Why we collect it and our legal basis</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="text-left px-4 py-2 font-semibold w-1/2">Purpose</th>
                    <th className="text-left px-4 py-2 font-semibold">Legal basis (GDPR Art. 6)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="px-4 py-2">Generate and deliver your personalised results report</td>
                    <td className="px-4 py-2">Performance of a contract / your request (Art. 6(1)(b))</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-2">Send you a summary email with your score and recommendations</td>
                    <td className="px-4 py-2">Consent (Art. 6(1)(a))</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">Follow up with you about Brand PWRD Media services</td>
                    <td className="px-4 py-2">Consent (Art. 6(1)(a))</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-2">Aggregate, anonymised benchmarking and research</td>
                    <td className="px-4 py-2">Legitimate interest (Art. 6(1)(f))</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              Where we rely on consent you can withdraw it at any time by emailing us (see Section 7).
              Withdrawal does not affect processing already carried out.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">4. How we store and protect your data</h2>
            <p>
              Your data is stored securely in <strong>Supabase</strong> (PostgreSQL database),
              hosted on infrastructure within the European Union. We use row-level security,
              encrypted connections (TLS), and service-role key isolation to protect your data
              from unauthorised access.
            </p>
            <p className="mt-2">
              Email delivery is handled by <strong>Resend</strong>. We do not sell or share your
              personal data with any third party for their own marketing purposes.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">5. How long we keep your data</h2>
            <p>
              We retain your personal data for <strong>3 years</strong> from the date you completed
              the assessment, unless you ask us to delete it sooner. Anonymised, aggregated
              benchmark data (with no personally identifiable information) may be kept indefinitely.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Cookies and tracking</h2>
            <p>
              This assessment does <strong>not</strong> use advertising cookies or third-party
              tracking pixels. We use only the minimum browser storage required for the quiz
              to function correctly (e.g. keeping your progress while you complete it).
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Your rights</h2>
            <p>Under GDPR you have the right to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Access</strong> — request a copy of the personal data we hold about you</li>
              <li><strong>Rectification</strong> — ask us to correct inaccurate data</li>
              <li><strong>Erasure</strong> — ask us to delete your data ("right to be forgotten")</li>
              <li><strong>Restriction</strong> — ask us to pause processing your data</li>
              <li><strong>Portability</strong> — receive your data in a structured, machine-readable format</li>
              <li><strong>Object</strong> — object to processing based on legitimate interest</li>
              <li><strong>Withdraw consent</strong> — at any time, for consent-based processing</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, email us at{' '}
              <a href="mailto:mark@brandpwrdmedia.com"
                 className="text-blue-600 underline hover:text-blue-800">
                mark@brandpwrdmedia.com
              </a>. We will respond within <strong>30 days</strong>.
            </p>
            <p className="mt-2">
              You also have the right to lodge a complaint with your national data protection
              authority. In the Netherlands this is the{' '}
              <a href="https://autoriteitpersoonsgegevens.nl"
                 target="_blank"
                 rel="noopener noreferrer"
                 className="text-blue-600 underline hover:text-blue-800">
                Autoriteit Persoonsgegevens
              </a>.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Changes to this policy</h2>
            <p>
              We may update this policy from time to time. When we do, we will update the
              "Last updated" date at the top. Material changes will be communicated by email
              to respondents where we hold contact details.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">9. Contact</h2>
            <p>
              Questions about this policy or how we handle your data? Contact us at:
            </p>
            <address className="not-italic mt-2 text-gray-600">
              Brand PWRD Media B.V.<br />
              <a href="mailto:mark@brandpwrdmedia.com"
                 className="text-blue-600 underline hover:text-blue-800">
                mark@brandpwrdmedia.com
              </a>
            </address>
          </section>

        </div>

        {/* Back link */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link href="/a"
                className="text-sm text-gray-500 hover:text-gray-800 underline">
            ← Back to the assessment
          </Link>
        </div>

      </div>
    </main>
  )
}
