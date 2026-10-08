"use client";

import { saveWeather } from "@/actions/admin-content-actions";
import {
  ContentFormShell,
  Field,
  CheckboxField,
} from "@/components/admin/content-form-shell";
import type { WeatherInfo } from "@/lib/schema";

const CONDITIONS = [
  "sunny",
  "partly_cloudy",
  "cloudy",
  "rainy",
  "storm",
  "foggy",
  "misty",
];

export function WeatherEditor({ existing }: { existing?: WeatherInfo }) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <ContentFormShell
      action={saveWeather}
      submitLabel={existing ? "Save weather" : "Add weather"}
    >
      {existing && <input type="hidden" name="id" value={existing.id} />}

      <div className="grid gap-3 md:grid-cols-4">
        <Field
          label="Date"
          name="date"
          type="date"
          defaultValue={existing?.date ?? today}
          required
        />
        <div>
          <label className="block text-sm font-medium mb-1">Condition</label>
          <select
            name="condition"
            defaultValue={existing?.condition ?? "sunny"}
            className="w-full border rounded px-3 py-2"
          >
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {c.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <Field
          label="Temperature (°C)"
          name="temperatureCelsius"
          type="number"
          step="0.1"
          defaultValue={existing?.temperatureCelsius ?? "22"}
          required
        />
        <Field
          label="Feels like (°C)"
          name="feelsLikeCelsius"
          type="number"
          step="0.1"
          defaultValue={existing?.feelsLikeCelsius ?? ""}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Field
          label="Humidity (%)"
          name="humidityPercent"
          type="number"
          min="0"
          defaultValue={existing?.humidityPercent ?? 75}
          required
        />
        <Field
          label="Wind (km/h)"
          name="windSpeedKmh"
          type="number"
          min="0"
          defaultValue={existing?.windSpeedKmh ?? 0}
        />
        <Field
          label="Rain (mm)"
          name="precipitationMm"
          type="number"
          step="0.1"
          min="0"
          defaultValue={existing?.precipitationMm ?? "0"}
        />
        <div />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Field
          label="Sunrise (HH:MM)"
          name="sunriseTime"
          placeholder="06:05"
          defaultValue={existing?.sunriseTime ?? ""}
        />
        <Field
          label="Sunset (HH:MM)"
          name="sunsetTime"
          placeholder="18:15"
          defaultValue={existing?.sunsetTime ?? ""}
        />
      </div>

      <CheckboxField
        label="Hiking recommended"
        name="isHikingRecommended"
        defaultChecked={existing?.isHikingRecommended ?? true}
      />

      <Field
        label="Recommendation text"
        name="recommendationText"
        as="textarea"
        rows={2}
        defaultValue={existing?.recommendationText ?? ""}
      />

      <CheckboxField
        label="Show warning banner"
        name="hasWarning"
        defaultChecked={existing?.hasWarning ?? false}
      />

      <Field
        label="Warning text"
        name="warningText"
        as="textarea"
        rows={2}
        defaultValue={existing?.warningText ?? ""}
      />
    </ContentFormShell>
  );
}

