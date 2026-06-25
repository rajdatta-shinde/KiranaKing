import LegalPage from "../components/LegalPage";

export default function PrivacyPolicy() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="June 23, 2026"
      intro="Your privacy matters to us. This policy explains what information KiranaKing collects, how we use it, and the choices you have."
      sections={[
        {
          heading: "Information we collect",
          body: (
            <p>
              We collect information you provide directly — such as your name, email, phone number,
              and delivery addresses — as well as order history and payment details processed
              securely by our payment partners. We also collect limited usage data to improve the
              service.
            </p>
          ),
        },
        {
          heading: "How we use your information",
          body: (
            <p>
              We use your information to process and deliver orders, provide customer support,
              personalize your experience, send order updates, and keep our platform secure. We do
              not sell your personal data.
            </p>
          ),
        },
        {
          heading: "Sharing your information",
          body: (
            <p>
              We share information only with trusted parties needed to run the service — such as
              delivery partners and payment processors — and when required by law. These parties are
              bound to handle your data securely.
            </p>
          ),
        },
        {
          heading: "Data security",
          body: (
            <p>
              We use industry-standard safeguards to protect your data. While no system is perfectly
              secure, we work continuously to keep your information safe and limit access to those
              who need it.
            </p>
          ),
        },
        {
          heading: "Your choices",
          body: (
            <p>
              You can view and update your account details and addresses at any time. You may request
              access to or deletion of your personal data by contacting our support team.
            </p>
          ),
        },
        {
          heading: "Changes to this policy",
          body: (
            <p>
              We may update this policy from time to time. When we do, we'll revise the "last updated"
              date above and, where appropriate, notify you of significant changes.
            </p>
          ),
        },
      ]}
    />
  );
}
