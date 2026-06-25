import { MapPinIcon, ClockIcon, ArrowRightIcon, SparklesIcon, TrendingUpIcon, UsersIcon } from "lucide-react";

const perks = [
  { icon: SparklesIcon, title: "Meaningful work", body: "Build products used by thousands of households every day." },
  { icon: TrendingUpIcon, title: "Grow fast", body: "Real ownership, mentorship, and room to level up quickly." },
  { icon: UsersIcon, title: "Great people", body: "A friendly, driven team that cares about the craft." },
];

const openings = [
  { title: "Senior Frontend Engineer", team: "Engineering", location: "Remote", type: "Full-time" },
  { title: "Backend Engineer (Node.js)", team: "Engineering", location: "Springfield, IL", type: "Full-time" },
  { title: "Delivery Operations Lead", team: "Operations", location: "Springfield, IL", type: "Full-time" },
  { title: "Product Designer", team: "Design", location: "Remote", type: "Contract" },
  { title: "Customer Support Associate", team: "Support", location: "Remote", type: "Part-time" },
];

export default function Careers() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="text-center">
        <p className="text-sm font-semibold text-app-orange uppercase tracking-wide">Careers</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-app-text">
          Build the future of grocery delivery
        </h1>
        <p className="mt-4 text-app-text-light max-w-2xl mx-auto">
          We're a small team with big ambitions. If you love solving hard problems and shipping
          fast, we'd love to hear from you.
        </p>
      </header>

      <section className="mt-12 grid sm:grid-cols-3 gap-5">
        {perks.map((p) => (
          <div key={p.title} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm text-center">
            <div className="mx-auto size-12 rounded-xl bg-app-green/10 flex items-center justify-center">
              <p.icon className="size-6 text-app-green" />
            </div>
            <h3 className="mt-4 font-semibold text-app-text">{p.title}</h3>
            <p className="mt-1 text-sm text-app-text-light">{p.body}</p>
          </div>
        ))}
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-bold text-app-text">Open positions</h2>
        <div className="mt-6 space-y-3">
          {openings.map((job) => (
            <a
              key={job.title}
              href={`mailto:careers@kiranaking.app?subject=Application: ${job.title}`}
              className="group flex items-center justify-between gap-4 bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:border-app-green transition-colors"
            >
              <div>
                <h3 className="font-semibold text-app-text group-hover:text-app-green transition-colors">
                  {job.title}
                </h3>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-app-text-light">
                  <span className="inline-flex items-center gap-1">
                    <span className="font-medium text-app-orange">{job.team}</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPinIcon className="size-3.5" /> {job.location}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ClockIcon className="size-3.5" /> {job.type}
                  </span>
                </div>
              </div>
              <ArrowRightIcon className="size-5 text-app-text-light group-hover:text-app-green group-hover:translate-x-1 transition-all" />
            </a>
          ))}
        </div>
      </section>

      <section className="mt-14 bg-app-green rounded-2xl px-6 py-12 text-center">
        <h2 className="text-2xl font-bold text-white">Don't see your role?</h2>
        <p className="mt-2 text-white/70 max-w-lg mx-auto">
          We're always looking for talented people. Send us your resume and tell us how you can help.
        </p>
        <a
          href="mailto:careers@kiranaking.app"
          className="mt-6 inline-block px-6 py-3 bg-app-orange text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
        >
          Get in Touch
        </a>
      </section>
    </div>
  );
}
