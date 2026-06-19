import { Star } from "@gravity-ui/icons";

const testimonials = [
  {
    rating: 5,
    quote:
      "StartupForge connected me with our CTO within 2 weeks. We've since raised a $3M seed round and scaled to 15 people.",
    name: "Mia Zhang",
    role: "Founder, Aethon Labs",
    avatar: "https://i.pravatar.cc/100?img=47",
  },
  {
    rating: 5,
    quote:
      "I left my corporate job to join a startup I found here. Best career decision I've ever made — shipped a product used by 200k people.",
    name: "Carlos Mendez",
    role: "Lead Engineer, PulseAI",
    avatar: "https://i.pravatar.cc/100?img=12",
  },
  {
    rating: 5,
    quote:
      "We built our entire design team through StartupForge. The quality of collaborators here is genuinely unmatched.",
    name: "Aisha Brooks",
    role: "CEO, TerraForm",
    avatar: "https://i.pravatar.cc/100?img=32",
  },
];

export default function SuccessStories() {
  return (
    <section className="bg-white py-24 px-5">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mb-16 text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-primary">
            Proof It Works
          </span>
          <h2 className="mt-3 text-4xl font-bold text-base-content">
            Success Stories
          </h2>
          <p className="mt-4 text-base text-base-content/60 max-w-md mx-auto leading-relaxed">
            Real teams, real results. Here are a few of the thousands of stories
            from our community.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="flex flex-col gap-5 rounded-2xl border border-base-200 bg-base-100 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex gap-1">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              <p className="text-sm leading-relaxed text-base-content/80">
                "{t.quote}"
              </p>

              <div className="flex items-center gap-3 mt-auto">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="h-11 w-11 rounded-full object-cover"
                />
                <div>
                  <p className="font-bold text-base-content text-sm">
                    {t.name}
                  </p>
                  <p className="text-sm text-base-content/50">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
