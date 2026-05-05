// FILE: src/lib/cycle/weather.ts
// Open-Meteo client — geocoding (city → lat/lon) and current/daily weather.
// No API key needed. EU-friendly. https://open-meteo.com

export interface GeocodeHit {
  name: string
  country: string
  admin1?: string
  lat: number
  lon: number
  timezone: string
}

export async function geocodeCity(query: string): Promise<GeocodeHit[]> {
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search')
  url.searchParams.set('name', query)
  url.searchParams.set('count', '5')
  url.searchParams.set('language', 'nl')
  url.searchParams.set('format', 'json')
  const res = await fetch(url.toString(), { next: { revalidate: 86400 } })
  if (!res.ok) return []
  const json: any = await res.json()
  return (json.results ?? []).map((r: any) => ({
    name:     r.name,
    country:  r.country,
    admin1:   r.admin1,
    lat:      r.latitude,
    lon:      r.longitude,
    timezone: r.timezone ?? 'Europe/Amsterdam',
  }))
}

export type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'snow' | 'clear-night'

export interface WeatherSnapshot {
  temp_c:    number
  precip_mm: number
  cloud_pct: number
  wind_kmh:  number
  condition: WeatherCondition
}

// Map WMO weather codes to our coarse condition buckets.
// https://open-meteo.com/en/docs#weathervariables
function mapCode(code: number, isDay: boolean): WeatherCondition {
  if (code === 0) return isDay ? 'sunny' : 'clear-night'
  if (code >= 1 && code <= 3) return 'cloudy'
  if (code >= 45 && code <= 48) return 'cloudy'        // fog
  if (code >= 51 && code <= 67) return 'rainy'         // drizzle / rain
  if (code >= 71 && code <= 77) return 'snow'
  if (code >= 80 && code <= 82) return 'rainy'         // rain showers
  if (code >= 85 && code <= 86) return 'snow'
  if (code >= 95 && code <= 99) return 'rainy'         // thunder
  return 'cloudy'
}

export async function fetchWeather(lat: number, lon: number, timezone = 'Europe/Amsterdam'): Promise<WeatherSnapshot | null> {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', String(lat))
  url.searchParams.set('longitude', String(lon))
  url.searchParams.set('current', 'temperature_2m,precipitation,cloud_cover,wind_speed_10m,weather_code,is_day')
  url.searchParams.set('timezone', timezone)
  const res = await fetch(url.toString(), { next: { revalidate: 1800 } })
  if (!res.ok) return null
  const json: any = await res.json()
  const c = json.current
  if (!c) return null
  return {
    temp_c:    Math.round(c.temperature_2m * 10) / 10,
    precip_mm: c.precipitation ?? 0,
    cloud_pct: c.cloud_cover ?? 0,
    wind_kmh:  Math.round(c.wind_speed_10m * 10) / 10,
    condition: mapCode(c.weather_code, Boolean(c.is_day)),
  }
}
