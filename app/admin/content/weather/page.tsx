import Link from "next/link";
import { db } from "@/lib/db";
import { weatherInfo } from "@/lib/schema";
import { desc } from "drizzle-orm";
import { WeatherEditor } from "@/components/admin/weather-editor";
import { DeleteWeatherButton } from "@/components/admin/delete-weather-button";

export default async function WeatherAdminPage() {
  const all = await db
    .select()
    .from(weatherInfo)
    .orderBy(desc(weatherInfo.date))
    .limit(30);

  const today = new Date().toISOString().slice(0, 10);
  const todayEntry = all.find((w) => w.date === today);

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/content" className="text-sm underline">
          ← Content
        </Link>
        <h1 className="text-2xl font-bold mt-2">Weather</h1>
        <p className="text-gray-600 mt-1">
          Add or edit daily weather entries. Users see today + 7-day forecast.
        </p>
      </header>

      <section className="border rounded-lg p-4">
        <h2 className="font-semibold mb-3">
          {todayEntry ? `Edit today's weather (${today})` : `Add today's weather (${today})`}
        </h2>
        <WeatherEditor existing={todayEntry} />
      </section>

      <section>
        <h2 className="font-semibold mb-3">Recent entries ({all.length})</h2>
        {all.length === 0 ? (
          <p className="text-gray-500 text-sm">No entries yet.</p>
        ) : (
          <ul className="space-y-2">
            {all.map((w) => (
              <li key={w.id} className="border rounded-lg">
                <details>
                  <summary className="p-3 cursor-pointer flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium">{w.date}</span> ·{" "}
                      <span className="capitalize">
                        {w.condition.replace("_", " ")}
                      </span>{" "}
                      · {w.temperatureCelsius}°C
                    </div>
                    <DeleteWeatherButton id={w.id} />
                  </summary>
                  <div className="p-3 border-t">
                    <WeatherEditor existing={w} />
                  </div>
                </details>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}