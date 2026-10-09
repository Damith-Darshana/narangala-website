import { db } from "@/lib/db";
import { weatherInfo } from "@/lib/schema";
import { desc, gte } from "drizzle-orm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Weather & Forecast",
  description:
    "Current weather conditions and 7-day forecast for Narangala Mountain, Badulla, Sri Lanka.",
};


export const revalidate = 600;

const conditionEmoji: Record<string, string> = {
  sunny: "☀️",
  partly_cloudy: "⛅",
  cloudy: "☁️",
  rainy: "🌧️",
  storm: "⛈️",
  foggy: "🌫️",
  misty: "💨",
};

export default async function WeatherPage() {
  const today = new Date().toISOString().slice(0, 10);
  const forecast = await db
    .select()
    .from(weatherInfo)
    .where(gte(weatherInfo.date, today))
    .orderBy(desc(weatherInfo.date))
    .limit(7);

  const [current] = forecast;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Weather at Narangala</h1>

      {!current && (
        <p className="text-gray-500">
          No weather data yet. Admin can add it in the admin panel (Phase 3).
        </p>
      )}

      {current && (
        <section className="border rounded-lg p-6 bg-gradient-to-br from-blue-50 to-white">
          <div className="flex items-center gap-4">
            <span className="text-5xl">
              {conditionEmoji[current.condition] ?? "🌤"}
            </span>
            <div>
              <div className="text-3xl font-bold">
                {current.temperatureCelsius}°C
              </div>
              <div className="text-sm text-gray-600 capitalize">
                {current.condition.replace("_", " ")} · {current.date}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-sm">
            <Info label="Feels like" value={`${current.feelsLikeCelsius}°C`} />
            <Info label="Humidity" value={`${current.humidityPercent}%`} />
            <Info label="Wind" value={`${current.windSpeedKmh} km/h`} />
            <Info label="Rain" value={`${current.precipitationMm} mm`} />
          </div>
          {current.recommendationText && (
            <p className="mt-4 text-sm bg-white rounded p-3 border">
              💡 {current.recommendationText}
            </p>
          )}
          {current.hasWarning && current.warningText && (
            <p className="mt-2 text-sm bg-red-50 border border-red-300 rounded p-3">
              ⚠️ {current.warningText}
            </p>
          )}
        </section>
      )}

      {forecast.length > 1 && (
        <section>
          <h2 className="text-2xl font-semibold mb-3">Forecast</h2>
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-7">
            {forecast.slice(1).map((day) => (
              <div key={day.id} className="border rounded p-3 text-center">
                <div className="text-xs text-gray-500">{day.date}</div>
                <div className="text-2xl my-2">
                  {conditionEmoji[day.condition] ?? "🌤"}
                </div>
                <div className="font-semibold">{day.temperatureCelsius}°C</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}