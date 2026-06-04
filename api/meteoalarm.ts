/**
 * Vercel Edge Function — proxy for EUMETNET MeteoAlarm Atom feeds.
 * Bypasses CORS so the browser can consume European weather warnings.
 *
 * GET /api/meteoalarm?lat=42.69&lon=23.32
 * Returns: WeatherAlert[] (empty array = no active warnings)
 */

export const config = { runtime: 'edge' }

// Country bounding boxes (lat-min, lat-max, lon-min, lon-max)
const BBOX: Array<[string, number, number, number, number]> = [
  ['BG', 41.2, 44.2, 22.3, 28.6],  // Bulgaria
  ['DE', 47.3, 55.1,  5.9, 15.0],  // Germany
  ['FR', 41.3, 51.2, -5.2,  9.6],  // France
  ['ES', 35.9, 43.8, -9.3,  4.3],  // Spain
  ['IT', 36.6, 47.1,  6.6, 18.5],  // Italy
  ['PL', 49.0, 54.9, 14.1, 24.2],  // Poland
  ['RO', 43.6, 48.3, 20.3, 29.7],  // Romania
  ['HU', 45.8, 48.6, 16.1, 22.9],  // Hungary
  ['NL', 50.7, 53.6,  3.3,  7.2],  // Netherlands
  ['BE', 49.5, 51.5,  2.5,  6.5],  // Belgium
  ['GR', 35.0, 42.0, 19.4, 29.6],  // Greece
  ['DK', 54.6, 57.8,  8.0, 15.3],  // Denmark
  ['NO', 57.4, 71.2,  4.5, 31.3],  // Norway
  ['SE', 55.3, 69.0, 10.9, 24.2],  // Sweden
  ['FI', 59.7, 70.1, 20.5, 31.6],  // Finland
  ['AT', 46.4, 49.1,  9.5, 17.2],  // Austria
  ['CH', 45.8, 47.8,  5.9, 10.5],  // Switzerland
  ['PT', 36.9, 42.2, -9.5, -6.0],  // Portugal
  ['CZ', 48.6, 51.1, 12.1, 18.9],  // Czechia
  ['SK', 47.7, 49.6, 16.8, 22.6],  // Slovakia
  ['SI', 45.4, 46.9, 13.4, 16.6],  // Slovenia
  ['HR', 42.4, 46.6, 13.5, 19.5],  // Croatia
  ['IE', 51.4, 55.4,-10.5, -6.0],  // Ireland
  ['LT', 53.9, 56.5, 21.0, 26.8],  // Lithuania
  ['LV', 55.7, 58.1, 20.9, 28.2],  // Latvia
  ['EE', 57.5, 59.7, 21.8, 28.2],  // Estonia
  ['LU', 49.4, 50.2,  5.7,  6.5],  // Luxembourg
  ['RS', 42.2, 46.2, 18.8, 23.0],  // Serbia
  ['BA', 42.5, 45.3, 15.7, 19.6],  // Bosnia
  ['MK', 40.9, 42.4, 20.4, 23.1],  // N. Macedonia
  ['AL', 39.6, 42.7, 19.3, 21.1],  // Albania
  ['ME', 41.8, 43.6, 18.4, 20.4],  // Montenegro
  ['CY', 34.5, 35.8, 32.2, 34.6],  // Cyprus
  ['MT', 35.8, 36.1, 14.2, 14.6],  // Malta
]

const FEED_NAME: Record<string, string> = {
  BG: 'bulgaria', DE: 'germany', FR: 'france', ES: 'spain',
  IT: 'italy', PL: 'poland', RO: 'romania', HU: 'hungary',
  NL: 'netherlands', BE: 'belgium', GR: 'greece', DK: 'denmark',
  NO: 'norway', SE: 'sweden', FI: 'finland', AT: 'austria',
  CH: 'switzerland', PT: 'portugal', CZ: 'czechia', SK: 'slovakia',
  SI: 'slovenia', HR: 'croatia', IE: 'ireland', LT: 'lithuania',
  LV: 'latvia', EE: 'estonia', LU: 'luxembourg', RS: 'serbia',
  BA: 'bosniaherzegovina', MK: 'northmacedonia', AL: 'albania',
  ME: 'montenegro', CY: 'cyprus', MT: 'malta',
}

function detectCountry(lat: number, lon: number): string | null {
  for (const [iso, latMin, latMax, lonMin, lonMax] of BBOX) {
    if (lat >= latMin && lat <= latMax && lon >= lonMin && lon <= lonMax) return iso
  }
  return null
}

function mapSeverity(title: string, capSev: string): 'Extreme' | 'Severe' | 'Moderate' {
  const t = (title + capSev).toLowerCase()
  if (t.includes('red') || t.includes('extreme')) return 'Extreme'
  if (t.includes('orange') || t.includes('severe') || t.includes('high')) return 'Severe'
  return 'Moderate'
}

function extractText(xml: string, tag: string): string {
  const cdataMatch = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`))
  if (cdataMatch) return cdataMatch[1].trim()
  const plain = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`))
  return plain ? plain[1].replace(/<[^>]+>/g, '').trim() : ''
}

export default async function handler(request: Request): Promise<Response> {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=900, s-maxage=900',
    'Access-Control-Allow-Origin': '*',
  }

  const { searchParams } = new URL(request.url)
  const lat = parseFloat(searchParams.get('lat') ?? 'NaN')
  const lon = parseFloat(searchParams.get('lon') ?? 'NaN')

  if (isNaN(lat) || isNaN(lon)) {
    return new Response(JSON.stringify([]), { headers })
  }

  const iso = detectCountry(lat, lon)
  const feedName = iso ? FEED_NAME[iso] : null
  if (!feedName) return new Response(JSON.stringify([]), { headers })

  try {
    const res = await fetch(
      `https://feeds.meteoalarm.org/feeds/meteoalarm-legacy-atom-${feedName}`,
      { headers: { Accept: 'application/atom+xml, application/xml, text/xml' } }
    )
    if (!res.ok) return new Response(JSON.stringify([]), { headers })

    const xml = await res.text()

    // Check for "no active warnings" feeds
    if (xml.includes('No active') || xml.includes('no active')) {
      return new Response(JSON.stringify([]), { headers })
    }

    const alerts: Array<{ kind: string; sev: 'Extreme' | 'Severe' | 'Moderate'; until: string; text: string }> = []

    // Extract all <entry> blocks
    const entries = [...xml.matchAll(/<entry[^>]*>([\s\S]*?)<\/entry>/g)]

    for (const match of entries) {
      const entry = match[1]
      const title = extractText(entry, 'title')
      if (!title || title.toLowerCase().includes('no active')) continue

      const summary = extractText(entry, 'summary')
      const capSev = extractText(entry, 'cap:severity')
      const capExpires = extractText(entry, 'cap:expires') || extractText(entry, 'updated')

      const expires = capExpires ? new Date(capExpires) : null
      const until = expires && !isNaN(expires.getTime())
        ? expires.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
        : 'Further notice'

      const text = summary.replace(/\s+/g, ' ').trim().slice(0, 280) || title

      alerts.push({
        kind: title.replace(/\s*-\s*[A-Z][a-z]+.*$/, '').trim() || 'Weather Warning',
        sev: mapSeverity(title, capSev),
        until,
        text: text || 'Weather warning in effect.',
      })
    }

    // Sort by severity: Extreme > Severe > Moderate
    const SEV_ORDER = { Extreme: 0, Severe: 1, Moderate: 2 }
    alerts.sort((a, b) => SEV_ORDER[a.sev] - SEV_ORDER[b.sev])

    return new Response(JSON.stringify(alerts.slice(0, 5)), { headers })
  } catch {
    return new Response(JSON.stringify([]), { headers })
  }
}
