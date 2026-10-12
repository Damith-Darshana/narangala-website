import Link from "next/link";
import { HeroVideo } from "@/components/hero-video";

export default function Home() {
  return (
    <div className="home-shell space-y-10 pb-16">
      <div className="relative w-full overflow-hidden rounded-b-[2rem] shadow-2xl shadow-primary/10 md:rounded-[2rem] md:mt-6">
      <HeroVideo
        posterKey="mountain/hero-poster.webp"
        videoKey="mountain/hero.mp4"
        
      >
        <div className="max-w-3xl space-y-5 px-2 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">Badulla · Uva Province · Sri Lanka</p>
          <h1 className="text-5xl font-black tracking-[-0.05em] drop-shadow-lg md:text-8xl">
            Explore Narangala
          </h1>
          <p className="text-lg md:text-2xl text-white/90 drop-shadow-md">
            A quiet summit with a golden story
          </p>
          <div className="flex gap-3 justify-center pt-4 flex-wrap">
            <Link
              href="/trail"
              className="rounded-full bg-white px-6 py-3 font-semibold text-primary shadow-lg hover:-translate-y-0.5 hover:bg-white/90"
            >
              Trail Guide
            </Link>
            <Link
              href="/services"
              className="rounded-full border border-white/30 bg-black/30 px-6 py-3 font-semibold text-white backdrop-blur-md hover:-translate-y-0.5 hover:bg-black/60"
            >
              Local Services
            </Link>
          </div>
        </div>
      </HeroVideo>
      </div>

      {/* Card grid below the hero */}
      <section className="grid gap-4 px-4 md:grid-cols-2 md:px-0 lg:grid-cols-3">
        <Card
          href="/about"
          title="About the Mountain"
          desc="History, legends, and geography of Narangala."
        />
        <Card
          href="/trail"
          title="Trail Guide"
          desc="3km route with 10 waypoints, elevation profile, and safety tips."
        />
        <Card
          href="/weather"
          title="Weather & Forecast"
          desc="Current conditions and 7-day outlook."
        />
        <Card
          href="/services"
          title="Local Services"
          desc="Tuk-tuks, guides, camping gear, and food at the trailhead."
        />
        <Card
          href="/gallery"
          title="Photo Gallery"
          desc="Photos shared by hikers who climbed Narangala."
        />
        <Card
          href="/emergency"
          title="Emergency Contacts"
          desc="Police, ambulance, hospital, and mountain rescue numbers."
        />
        <Card
          href="/faq"
          title="FAQ"
          desc="12 answers to common questions."
        />
        <Card
          href="/blog"
          title="Blog"
          desc="Guides, legends, and photography tips."
        />
        <Card
          href="/register"
          title="Share Your Photos"
          desc="Join and upload up to 5 photos of your hike."
        />
      </section>
    </div>
  );
}

function Card({
  href,
  title,
  desc,
}: {
  href: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:border-accent/50 hover:bg-card hover:shadow-xl hover:shadow-primary/5"
    >
      <div className="mb-8 flex size-10 items-center justify-center rounded-full bg-muted text-primary transition group-hover:bg-accent group-hover:text-accent-foreground">↗</div>
      <h2 className="text-lg font-bold tracking-tight">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{desc}</p>
    </Link>
  );
}
