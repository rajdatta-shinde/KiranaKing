import LegalPage from "../components/LegalPage";

export default function TermsOfService() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="June 23, 2026"
      intro="Welcome to KiranaKing. By using our website and services, you agree to these terms. Please read them carefully."
      sections={[
        {
          heading: "Acceptance of terms",
          body: (
            <p>
              By accessing or using KiranaKing, you agree to be bound by these Terms of Service and
              our Privacy Policy. If you do not agree, please do not use the service.
            </p>
          ),
        },
        {
          heading: "Your account",
          body: (
            <p>
              You are responsible for keeping your account credentials secure and for all activity
              under your account. Please provide accurate information and notify us of any
              unauthorized use.
            </p>
          ),
        },
        {
          heading: "Orders and pricing",
          body: (
            <p>
              All orders are subject to product availability and acceptance. Prices and offers may
              change without notice. We reserve the right to cancel orders in cases of pricing errors
              or suspected fraud.
            </p>
          ),
        },
        {
          heading: "Delivery",
          body: (
            <p>
              We aim to deliver your orders quickly and reliably. Delivery times are estimates and may
              vary due to factors outside our control, such as weather or traffic.
            </p>
          ),
        },
        {
          heading: "Returns and refunds",
          body: (
            <p>
              If something isn't right with your order, contact us promptly. Eligible items may be
              refunded or replaced in line with our support policies.
            </p>
          ),
        },
        {
          heading: "Acceptable use",
          body: (
            <p>
              You agree not to misuse the service, interfere with its operation, or use it for any
              unlawful purpose. We may suspend or terminate accounts that violate these terms.
            </p>
          ),
        },
        {
          heading: "Limitation of liability",
          body: (
            <p>
              KiranaKing is provided "as is." To the extent permitted by law, we are not liable for
              indirect or incidental damages arising from your use of the service.
            </p>
          ),
        },
        {
          heading: "Changes to these terms",
          body: (
            <p>
              We may update these terms from time to time. Continued use of the service after changes
              take effect constitutes acceptance of the revised terms.
            </p>
          ),
        },
      ]}
    />
  );
}
