export type Locale = 'en' | 'bg'

export interface Translations {
  // Navigation
  nav: { today: string; forecast: string; radar: string; cities: string }
  // Condition labels
  cond: Record<string, string>
  // Section headers
  hourlyForecast: string
  sevenDay: string
  hourlyTemp: string
  chanceOfPrecip: string
  nextSevenDays: string
  // Detail card labels
  feelsLike: string
  humidity: string
  wind: string
  uvIndex: string
  visibility: string
  pressure: string
  airQuality: string
  sun: string
  // Computed sub-texts
  gusts: (g: number, u: string) => string
  dewPoint: (d: number, u: string) => string
  forecastDays: (n: number) => string
  uv: (n: number) => string
  aqi: (n: number) => string
  feelsLikeSub: (feels: number, actual: number) => string
  visibilitySub: (v: number) => string
  pressureSub: (p: number) => string
  // Days (Sun–Sat)
  days: [string, string, string, string, string, string, string]
  today: string
  now: string
  // Radar
  liveRadar: string
  loadingRadar: string
  noPrecip: (city: string) => string
  activePrecip: (city: string) => string
  intensity: string
  lightIntensity: string
  heavyIntensity: string
  // Cities
  citiesTitle: string
  searchPlaceholder: string
  addCity: string
  noCitiesFound: (q: string) => string
  searching: string
  // Onboarding
  slides: Array<{ title: string; body: string }>
  enableLocationTitle: string
  enableLocationBody: string
  useMyLocation: string
  locating: string
  chooseManually: string
  skip: string
  next: string
  getStarted: string
  // Alerts
  until: string
  tapForDetails: string
  inEffectUntil: string
  alertSource: string
  enableNotifications: string
  notificationsEnabled: string
  notificationsBlocked: string
  // App chrome
  copiedToClipboard: string
  somethingWentWrong: string
  unexpectedError: string
  tryAgain: string
  animOn: string
  animOff: string
  autoMode: string
  darkMode: string
  lightMode: string
  // Settings sheet
  settingsTitle: string
  language: string
  colorTheme: string
  brightness: string
  temperature: string
  animations: string
  share: string
  windSpeed: string
  layer: string
  layerPrecip: string
  layerSatellite: string
  // Condition alerts
  condAlerts: string
  alertOnRain: string
  alertOnSnow: string
  installTitle: string
  installBody: string
  install: string
  apiOk: string
  apiError: string
  rainNext2h: (mm: number) => string
  noRain: string
  forecastPrecip: string
  forecastWind: string
  forecastHumidity: string
  forecastPrecipMm: string
  forecastUV: string
  moon: string
  moonPhases: Record<string, string>
}

const en: Translations = {
  nav: { today: 'Today', forecast: 'Forecast', radar: 'Radar', cities: 'Cities' },
  cond: {
    'clear-day': 'Clear', 'clear-night': 'Clear',
    'partly-cloudy-day': 'Partly cloudy', 'partly-cloudy-night': 'Partly cloudy',
    'cloudy': 'Cloudy', 'rain': 'Rain', 'thunderstorm': 'Storms',
    'snow': 'Snow', 'fog': 'Fog',
  },
  hourlyForecast: 'Hourly forecast',
  sevenDay: '7-day forecast',
  hourlyTemp: 'Hourly temperature',
  chanceOfPrecip: 'Chance of precipitation',
  nextSevenDays: 'Next 7 days',
  feelsLike: 'Feels like',
  humidity: 'Humidity',
  wind: 'Wind',
  uvIndex: 'UV Index',
  visibility: 'Visibility',
  pressure: 'Pressure',
  airQuality: 'Air quality',
  sun: 'Sun',
  gusts: (g, u) => `Gusts ${g} ${u}`,
  dewPoint: (d, u) => `Dew point ${d}°${u}`,
  forecastDays: (n) => `${n}-day forecast`,
  uv: (n) => n <= 2 ? 'Low' : n <= 5 ? 'Moderate' : n <= 7 ? 'High' : n <= 10 ? 'Very High' : 'Extreme',
  aqi: (n) => n <= 20 ? 'Good' : n <= 40 ? 'Fair' : n <= 60 ? 'Moderate' : n <= 80 ? 'Poor' : n <= 100 ? 'Very Poor' : 'Extremely Poor',
  feelsLikeSub: (f, a) => f > a ? 'Warmer than actual' : f < a ? 'Cooler than actual' : 'Same as actual',
  visibilitySub: (v) => v >= 10 ? 'Clear' : 'Reduced',
  pressureSub: (p) => p >= 1013 ? 'High · stable' : 'Low · unsettled',
  days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  today: 'Today',
  now: 'Now',
  liveRadar: 'Live radar',
  loadingRadar: 'Loading radar…',
  noPrecip: (c) => `No significant precipitation near ${c} at this time.`,
  activePrecip: (c) => `Active precipitation detected near ${c}. Radar updates every 10 minutes.`,
  intensity: 'INTENSITY',
  lightIntensity: 'Light',
  heavyIntensity: 'Heavy',
  citiesTitle: 'Cities',
  searchPlaceholder: 'Search for a city or airport',
  addCity: 'Add a city',
  noCitiesFound: (q) => `No cities found for "${q}".`,
  searching: 'Searching...',
  slides: [
    { title: 'Weather that feels\nlike the sky', body: 'Времето днес paints every forecast with a living sky that shifts and breathes with the conditions outside.' },
    { title: 'Never get\ncaught out', body: 'Minute-by-minute precipitation, severe-weather alerts, and a radar you can scrub through time.' },
    { title: 'All your places,\none glance', body: 'Save the cities you love and switch between them with a single tap — each with its own sky.' },
  ],
  enableLocationTitle: 'Enable your location',
  enableLocationBody: 'Get accurate, hyper-local forecasts for exactly where you are — updated continuously.',
  useMyLocation: 'Use my location',
  locating: 'Locating…',
  chooseManually: 'Choose a city manually',
  skip: 'Skip',
  next: 'Next',
  getStarted: 'Get started',
  until: 'Until',
  tapForDetails: 'Tap for details',
  inEffectUntil: 'In effect until',
  alertSource: 'Source',
  enableNotifications: 'Enable alert notifications',
  notificationsEnabled: '🔔 Notifications enabled',
  notificationsBlocked: 'Notifications blocked in browser settings',
  copiedToClipboard: 'Copied to clipboard!',
  somethingWentWrong: 'Something went wrong',
  unexpectedError: 'An unexpected error occurred.',
  tryAgain: 'Try again',
  animOn: 'Anim on',
  animOff: 'Anim off',
  autoMode: '🌓 Auto',
  darkMode: '🌙 Dark',
  lightMode: '☀️ Light',
  settingsTitle: 'Settings',
  language: 'Language',
  colorTheme: 'Color theme',
  brightness: 'Brightness',
  temperature: 'Temperature',
  animations: 'Animations',
  share: 'Share weather',
  windSpeed: 'Wind speed',
  layer: 'Radar layer',
  layerPrecip: 'Precip',
  layerSatellite: 'Satellite',
  condAlerts: 'Condition alerts',
  alertOnRain: 'Notify when rain starts',
  alertOnSnow: 'Notify when snow starts',
  installTitle: 'Add to Home Screen',
  installBody: 'Install Времето днес for quick weather access',
  install: 'Install',
  apiOk: 'Weather data: connected',
  apiError: 'Weather data: offline',
  rainNext2h: (mm) => `Rain · ${mm} mm in next 2 h`,
  noRain: 'No rain in next 2 hours',
  forecastPrecip: 'Precip',
  forecastWind: 'Wind',
  forecastHumidity: 'Humidity',
  forecastPrecipMm: 'Rain (mm)',
  forecastUV: 'UV',
  moon: 'Moon',
  moonPhases: {
    'new': 'New Moon',
    'waxing-crescent': 'Waxing Crescent',
    'first-quarter': 'First Quarter',
    'waxing-gibbous': 'Waxing Gibbous',
    'full': 'Full Moon',
    'waning-gibbous': 'Waning Gibbous',
    'last-quarter': 'Last Quarter',
    'waning-crescent': 'Waning Crescent',
  },
}

const bg: Translations = {
  nav: { today: 'Днес', forecast: 'Прогноза', radar: 'Радар', cities: 'Градове' },
  cond: {
    'clear-day': 'Ясно', 'clear-night': 'Ясно',
    'partly-cloudy-day': 'Частично облачно', 'partly-cloudy-night': 'Частично облачно',
    'cloudy': 'Облачно', 'rain': 'Дъжд', 'thunderstorm': 'Гръмотевична буря',
    'snow': 'Сняг', 'fog': 'Мъгла',
  },
  hourlyForecast: 'Почасова прогноза',
  sevenDay: '7-дневна прогноза',
  hourlyTemp: 'Почасова температура',
  chanceOfPrecip: 'Вероятност за валежи',
  nextSevenDays: 'Следващите 7 дни',
  feelsLike: 'Усеща се',
  humidity: 'Влажност',
  wind: 'Вятър',
  uvIndex: 'УВ Индекс',
  visibility: 'Видимост',
  pressure: 'Налягане',
  airQuality: 'Кач. въздух',
  sun: 'Слънце',
  gusts: (g, u) => `Пориви ${g} ${u}`,
  dewPoint: (d, u) => `Точка на орос. ${d}°${u}`,
  forecastDays: (n) => `${n}-дневна прогноза`,
  uv: (n) => n <= 2 ? 'Ниски' : n <= 5 ? 'Умерени' : n <= 7 ? 'Високи' : n <= 10 ? 'Много високи' : 'Екстремни',
  aqi: (n) => n <= 20 ? 'Добро' : n <= 40 ? 'Задоволително' : n <= 60 ? 'Умерено' : n <= 80 ? 'Лошо' : n <= 100 ? 'Много лошо' : 'Изкл. лошо',
  feelsLikeSub: (f, a) => f > a ? 'По-топло от реалното' : f < a ? 'По-студено от реалното' : 'Равно на реалното',
  visibilitySub: (v) => v >= 10 ? 'Ясна' : 'Намалена',
  pressureSub: (p) => p >= 1013 ? 'Високо · стабилно' : 'Ниско · нестабилно',
  days: ['Нед', 'Пон', 'Вт', 'Ср', 'Чет', 'Пет', 'Съб'],
  today: 'Днес',
  now: 'Сега',
  liveRadar: 'Жив радар',
  loadingRadar: 'Зареждане на радара…',
  noPrecip: (c) => `Няма значителни валежи в близост до ${c}.`,
  activePrecip: (c) => `Активни валежи в близост до ${c}. Радарът се обновява на всеки 10 мин.`,
  intensity: 'ИНТЕНЗИВНОСТ',
  lightIntensity: 'Слаба',
  heavyIntensity: 'Силна',
  citiesTitle: 'Градове',
  searchPlaceholder: 'Търсете град или летище',
  addCity: 'Добавете град',
  noCitiesFound: (q) => `Няма намерени градове за „${q}".`,
  searching: 'Търсене...',
  slides: [
    { title: 'Времето,\nусетено като небето', body: 'Времето днес рисува всяка прогноза с живо небе, което се мени с условията навън.' },
    { title: 'Никога не бъди\nизненадан', body: 'Прецизни валежи по минута, предупреждения за тежко време и радар, с който превърташ времето.' },
    { title: 'Всички твои места,\nс един поглед', body: 'Запази любимите си градове и превключвай между тях с едно докосване — всеки с неговото небе.' },
  ],
  enableLocationTitle: 'Активирай местоположението',
  enableLocationBody: 'Получи точни прогнози за точното място, където се намираш — актуализирани непрекъснато.',
  useMyLocation: 'Използвай моето местоположение',
  locating: 'Локализиране…',
  chooseManually: 'Изберете ръчно град',
  skip: 'Пропусни',
  next: 'Напред',
  getStarted: 'Начало',
  until: 'До',
  tapForDetails: 'Докоснете за детайли',
  inEffectUntil: 'Важи до',
  alertSource: 'Източник',
  enableNotifications: 'Активирай известията за предупреждения',
  notificationsEnabled: '🔔 Известията са активирани',
  notificationsBlocked: 'Известията са блокирани в настройките',
  copiedToClipboard: 'Копирано в клипборда!',
  somethingWentWrong: 'Нещо се обърка',
  unexpectedError: 'Възникна неочаквана грешка.',
  tryAgain: 'Опитайте отново',
  animOn: 'Анимации вкл.',
  animOff: 'Анимации изкл.',
  autoMode: '🌓 Автом.',
  darkMode: '🌙 Тъмно',
  lightMode: '☀️ Светло',
  settingsTitle: 'Настройки',
  language: 'Език',
  colorTheme: 'Цветова тема',
  brightness: 'Яркост',
  temperature: 'Температура',
  animations: 'Анимации',
  share: 'Споделяне',
  windSpeed: 'Скорост на вятъра',
  layer: 'Слой на радара',
  layerPrecip: 'Валежи',
  layerSatellite: 'Сателит',
  condAlerts: 'Известия за условия',
  alertOnRain: 'При начало на дъжд',
  alertOnSnow: 'При начало на сняг',
  installTitle: 'Добавяне на началния екран',
  installBody: 'Инсталирайте Времето днес за бърз достъп',
  install: 'Инсталиране',
  apiOk: 'Данни: свързан',
  apiError: 'Данни: офлайн',
  rainNext2h: (mm) => `Дъжд · ${mm} мм в следващите 2 ч`,
  noRain: 'Без дъжд в следващите 2 часа',
  forecastPrecip: 'Валеж',
  forecastWind: 'Вятър',
  forecastHumidity: 'Влажност',
  forecastPrecipMm: 'Дъжд (мм)',
  forecastUV: 'УВ',
  moon: 'Луна',
  moonPhases: {
    'new': 'Нова луна',
    'waxing-crescent': 'Нарастващ сърп',
    'first-quarter': 'Първа четвърт',
    'waxing-gibbous': 'Нарастваща луна',
    'full': 'Пълнолуние',
    'waning-gibbous': 'Намаляваща луна',
    'last-quarter': 'Последна четвърт',
    'waning-crescent': 'Намаляващ сърп',
  },
}

export const translations: Record<Locale, Translations> = { en, bg }

// Additional languages (DE, FR, ES, PT, RO, TR) are available in git history.
// To re-enable: extend Locale type and add the translation objects back.

