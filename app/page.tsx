import Link from "next/link";
import { HeroVideo } from "@/components/hero-video";

export default function Home() {
  return (
    <div className="space-y-8 ">
      <HeroVideo
        posterKey="mountain/hero-poster.webp"
        videoKey="mountain/hero.mp4"
        className="relative w-full h-[50vh] md:h-[70vh] overflow-hidden rounded-lg"
      >
        <div className="max-w-3xl text-white space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold drop-shadow-lg">
            Explore Narangala
          </h1>
          <p className="text-lg md:text-2xl text-white/90 drop-shadow-md">
            The Golden Mountain of Uva Province
          </p>
          <div className="flex gap-3 justify-center pt-4 flex-wrap">
            <Link
              href="/trail"
              className="bg-white text-black px-6 py-3 rounded font-medium hover:bg-gray-100"
            >
              Trail Guide
            </Link>
            <Link
              href="/services"
              className="bg-black/60 backdrop-blur text-white border border-white/30 px-6 py-3 rounded font-medium hover:bg-black/80"
            >
              Local Services
            </Link>
          </div>
        </div>
      </HeroVideo>

      {/* Card grid below the hero */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 px-6 md:px-0">
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
      className="border rounded-lg p-5 hover:bg-gray-50 transition"
    >
      <h2 className="font-semibold text-lg">{title}</h2>
      <p className="text-sm text-gray-600 mt-1">{desc}</p>
    </Link>
  );
}