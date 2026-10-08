import Link from "next/link";

const items = [
  {
    href: "/admin/content/mountain",
    title: "Mountain Information",
    desc: "Name, elevation, description, legend, history",
  },
  {
    href: "/admin/content/trail",
    title: "Trail Information",
    desc: "Distance, difficulty, safety tips, best months",
  },
  {
    href: "/admin/content/waypoints",
    title: "Trail Waypoints",
    desc: "Start, viewpoints, cave, summit — with coordinates",
  },
  {
    href: "/admin/content/weather",
    title: "Weather",
    desc: "Current conditions and forecasts",
  },
  {
    href: "/admin/content/faqs",
    title: "FAQs",
    desc: "Frequently asked questions",
  },
  {
    href: "/admin/content/emergency",
    title: "Emergency Contacts",
    desc: "Police, hospital, ambulance, rescue numbers",
  },
];

export default function ContentAdminHome() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Content</h1>
        <p className="text-gray-600 mt-1">
          Manage the static content that appears across the site.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="border rounded-lg p-5 hover:bg-gray-50"
          >
            <div className="font-semibold">{item.title}</div>
            <div className="text-sm text-gray-500 mt-1">{item.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}