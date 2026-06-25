import type { ReactNode } from "react";

interface LegalSection {
  heading: string;
  body: ReactNode;
}

interface LegalPageProps {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

export default function LegalPage({ title, updated, intro, sections }: LegalPageProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-10">
        <header>
          <h1 className="text-3xl sm:text-4xl font-bold text-app-text">{title}</h1>
          <p className="mt-2 text-sm text-app-text-light">Last updated: {updated}</p>
          <p className="mt-5 text-app-text-light">{intro}</p>
        </header>

        <div className="mt-10 space-y-8">
          {sections.map((section, i) => (
            <section key={section.heading}>
              <h2 className="text-lg font-semibold text-app-text">
                {i + 1}. {section.heading}
              </h2>
              <div className="mt-2 text-sm leading-relaxed text-app-text-light space-y-2">
                {section.body}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-12 text-sm text-app-text-light">
          Questions? Contact us at{" "}
          <a href="mailto:support@kiranaking.app" className="text-app-green font-medium hover:underline">
            support@kiranaking.app
          </a>
          .
        </p>
      </div>
    </div>
  );
}
