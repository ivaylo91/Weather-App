export type Locale = 'en' | 'bg' | 'de' | 'fr' | 'es' | 'pt' | 'ro' | 'tr'

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
    { title: 'Weather that feels\nlike the sky', body: 'Sora paints every forecast with a living sky that shifts and breathes with the conditions outside.' },
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
  installBody: 'Install Sora for quick weather access',
  install: 'Install',
  apiOk: 'Weather data: connected',
  apiError: 'Weather data: offline',
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
    { title: 'Времето,\nусетено като небето', body: 'Sora рисува всяка прогноза с живо небе, което се мени с условията навън.' },
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
  installBody: 'Инсталирайте Sora за бърз достъп до времето',
  install: 'Инсталиране',
  apiOk: 'Данни: свързан',
  apiError: 'Данни: офлайн',
}

const de: Translations = {
  nav: { today: 'Heute', forecast: 'Vorhersage', radar: 'Radar', cities: 'Städte' },
  cond: {
    'clear-day': 'Klar', 'clear-night': 'Klar',
    'partly-cloudy-day': 'Teilweise bewölkt', 'partly-cloudy-night': 'Teilweise bewölkt',
    'cloudy': 'Bewölkt', 'rain': 'Regen', 'thunderstorm': 'Gewitter',
    'snow': 'Schnee', 'fog': 'Nebel',
  },
  hourlyForecast: 'Stündliche Vorhersage', sevenDay: '7-Tage-Vorhersage',
  hourlyTemp: 'Stündliche Temperatur', chanceOfPrecip: 'Niederschlagswahrscheinlichkeit',
  nextSevenDays: 'Nächste 7 Tage',
  feelsLike: 'Gefühlt', humidity: 'Luftfeuchtigkeit', wind: 'Wind',
  uvIndex: 'UV-Index', visibility: 'Sichtweite', pressure: 'Luftdruck',
  airQuality: 'Luftqualität', sun: 'Sonne',
  gusts: (g, u) => `Böen ${g} ${u}`,
  dewPoint: (d, u) => `Taupunkt ${d}°${u}`,
  uv: (n) => n <= 2 ? 'Gering' : n <= 5 ? 'Mäßig' : n <= 7 ? 'Hoch' : n <= 10 ? 'Sehr hoch' : 'Extrem',
  aqi: (n) => n <= 20 ? 'Gut' : n <= 40 ? 'Mäßig' : n <= 60 ? 'Mittel' : n <= 80 ? 'Schlecht' : n <= 100 ? 'Sehr schlecht' : 'Extrem schlecht',
  feelsLikeSub: (f, a) => f > a ? 'Wärmer als tatsächlich' : f < a ? 'Kälter als tatsächlich' : 'Wie tatsächlich',
  visibilitySub: (v) => v >= 10 ? 'Klar' : 'Eingeschränkt',
  pressureSub: (p) => p >= 1013 ? 'Hoch · stabil' : 'Niedrig · unbeständig',
  days: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
  today: 'Heute', now: 'Jetzt', liveRadar: 'Live-Radar',
  loadingRadar: 'Radar wird geladen…',
  noPrecip: (c) => `Kein nennenswerter Niederschlag nahe ${c}.`,
  activePrecip: (c) => `Niederschlag nahe ${c}. Radar alle 10 Min.`,
  intensity: 'INTENSITÄT', lightIntensity: 'Leicht', heavyIntensity: 'Stark',
  citiesTitle: 'Städte', searchPlaceholder: 'Stadt oder Flughafen suchen',
  addCity: 'Stadt hinzufügen',
  noCitiesFound: (q) => `Keine Städte für „${q}" gefunden.`, searching: 'Suche...',
  slides: [
    { title: 'Wetter, das sich anfühlt\nwie der Himmel', body: 'Sora malt jede Vorhersage mit einem lebendigen Himmel, der sich mit den Wetterbedingungen verändert.' },
    { title: 'Nie mehr\nüberrascht werden', body: 'Minutengenaue Niederschläge, Unwetterwarnungen und ein Radar, das du durch die Zeit scrollen kannst.' },
    { title: 'Alle deine Orte,\nein Blick', body: 'Speichere deine Lieblingsstädte und wechsle mit einem Tippen – jede mit eigenem Himmel.' },
  ],
  enableLocationTitle: 'Standort aktivieren',
  enableLocationBody: 'Genaue, hyperlokale Vorhersagen genau für deinen Standort – kontinuierlich aktualisiert.',
  useMyLocation: 'Meinen Standort verwenden', locating: 'Wird geortet…',
  chooseManually: 'Stadt manuell auswählen',
  skip: 'Überspringen', next: 'Weiter', getStarted: 'Loslegen',
  until: 'Bis', tapForDetails: 'Für Details tippen', inEffectUntil: 'Gültig bis',
  alertSource: 'Quelle', enableNotifications: 'Wetterwarnungen aktivieren',
  notificationsEnabled: '🔔 Benachrichtigungen aktiviert',
  notificationsBlocked: 'Benachrichtigungen im Browser blockiert',
  copiedToClipboard: 'In die Zwischenablage kopiert!',
  somethingWentWrong: 'Etwas ist schiefgelaufen',
  unexpectedError: 'Ein unerwarteter Fehler ist aufgetreten.', tryAgain: 'Erneut versuchen',
  animOn: 'Anim ein', animOff: 'Anim aus',
  autoMode: '🌓 Auto', darkMode: '🌙 Dunkel', lightMode: '☀️ Hell',
  settingsTitle: 'Einstellungen', language: 'Sprache', colorTheme: 'Farbthema',
  brightness: 'Helligkeit', temperature: 'Temperatur', animations: 'Animationen',
  share: 'Wetter teilen', windSpeed: 'Windgeschwindigkeit',
  layer: 'Radar-Schicht', layerPrecip: 'Niederschlag', layerSatellite: 'Satellit',
  forecastDays: (n) => `${n}-Tage-Vorhersage`,
  condAlerts: 'Konditionsbenachrichtigungen', alertOnRain: 'Bei Regenbeginn benachrichtigen',
  alertOnSnow: 'Bei Schneebeginn benachrichtigen',
  installTitle: 'Zum Startbildschirm hinzufügen',
  installBody: 'Sora für schnellen Wetterzugang installieren',
  install: 'Installieren',
  apiOk: 'Wetterdaten: verbunden',
  apiError: 'Wetterdaten: offline',
}

const fr: Translations = {
  nav: { today: "Aujourd'hui", forecast: 'Prévisions', radar: 'Radar', cities: 'Villes' },
  cond: {
    'clear-day': 'Ensoleillé', 'clear-night': 'Dégagé',
    'partly-cloudy-day': 'Partiellement nuageux', 'partly-cloudy-night': 'Partiellement nuageux',
    'cloudy': 'Nuageux', 'rain': 'Pluie', 'thunderstorm': 'Orages',
    'snow': 'Neige', 'fog': 'Brouillard',
  },
  hourlyForecast: 'Prévisions horaires', sevenDay: 'Prévisions 7 jours',
  hourlyTemp: 'Température horaire', chanceOfPrecip: 'Probabilité de pluie',
  nextSevenDays: '7 prochains jours',
  feelsLike: 'Ressenti', humidity: 'Humidité', wind: 'Vent',
  uvIndex: 'Indice UV', visibility: 'Visibilité', pressure: 'Pression',
  airQuality: "Qualité de l'air", sun: 'Soleil',
  gusts: (g, u) => `Rafales ${g} ${u}`,
  dewPoint: (d, u) => `Point de rosée ${d}°${u}`,
  uv: (n) => n <= 2 ? 'Faible' : n <= 5 ? 'Modéré' : n <= 7 ? 'Élevé' : n <= 10 ? 'Très élevé' : 'Extrême',
  aqi: (n) => n <= 20 ? 'Bon' : n <= 40 ? 'Acceptable' : n <= 60 ? 'Modéré' : n <= 80 ? 'Mauvais' : n <= 100 ? 'Très mauvais' : 'Dangereux',
  feelsLikeSub: (f, a) => f > a ? 'Plus chaud que réel' : f < a ? 'Plus froid que réel' : 'Comme la réalité',
  visibilitySub: (v) => v >= 10 ? 'Dégagée' : 'Réduite',
  pressureSub: (p) => p >= 1013 ? 'Haute · stable' : 'Basse · instable',
  days: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
  today: "Aujourd'hui", now: 'Maintenant', liveRadar: 'Radar en direct',
  loadingRadar: 'Chargement du radar…',
  noPrecip: (c) => `Aucune précipitation significative près de ${c}.`,
  activePrecip: (c) => `Précipitations actives près de ${c}. Radar toutes les 10 min.`,
  intensity: 'INTENSITÉ', lightIntensity: 'Légère', heavyIntensity: 'Forte',
  citiesTitle: 'Villes', searchPlaceholder: 'Rechercher une ville ou un aéroport',
  addCity: 'Ajouter une ville',
  noCitiesFound: (q) => `Aucune ville trouvée pour « ${q} ».`, searching: 'Recherche...',
  slides: [
    { title: 'La météo qui ressemble\nau ciel', body: 'Sora peint chaque prévision avec un ciel vivant qui évolue avec les conditions extérieures.' },
    { title: 'Ne soyez plus jamais\npris de court', body: 'Précipitations minute par minute, alertes météo et un radar que vous pouvez faire défiler dans le temps.' },
    { title: 'Tous vos endroits,\nd\'un coup d\'œil', body: "Sauvegardez vos villes préférées et basculez entre elles d'un geste – chacune avec son propre ciel." },
  ],
  enableLocationTitle: 'Activer la localisation',
  enableLocationBody: 'Obtenez des prévisions précises et hyper-locales pour exactement où vous êtes – mises à jour en continu.',
  useMyLocation: 'Utiliser ma position', locating: 'Localisation…',
  chooseManually: 'Choisir une ville manuellement',
  skip: 'Passer', next: 'Suivant', getStarted: 'Commencer',
  until: "Jusqu'à", tapForDetails: 'Appuyer pour les détails',
  inEffectUntil: "En vigueur jusqu'à", alertSource: 'Source',
  enableNotifications: 'Activer les alertes météo',
  notificationsEnabled: '🔔 Notifications activées',
  notificationsBlocked: 'Notifications bloquées dans le navigateur',
  copiedToClipboard: 'Copié dans le presse-papiers !',
  somethingWentWrong: "Quelque chose s'est mal passé",
  unexpectedError: 'Une erreur inattendue est survenue.', tryAgain: 'Réessayer',
  animOn: 'Anim activée', animOff: 'Anim désactivée',
  autoMode: '🌓 Auto', darkMode: '🌙 Sombre', lightMode: '☀️ Clair',
  settingsTitle: 'Paramètres', language: 'Langue', colorTheme: 'Thème de couleur',
  brightness: 'Luminosité', temperature: 'Température', animations: 'Animations',
  share: 'Partager la météo', windSpeed: 'Vitesse du vent',
  layer: 'Couche radar', layerPrecip: 'Précip.', layerSatellite: 'Satellite',
  forecastDays: (n) => `Prévisions ${n} jours`,
  condAlerts: 'Alertes météo', alertOnRain: 'Notifier au début de la pluie',
  alertOnSnow: 'Notifier au début de la neige',
  installTitle: "Ajouter à l'écran d'accueil",
  installBody: 'Installez Sora pour un accès rapide à la météo',
  install: 'Installer',
  apiOk: 'Données météo : connecté',
  apiError: 'Données météo : hors ligne',
}

const es: Translations = {
  nav: { today: 'Hoy', forecast: 'Pronóstico', radar: 'Radar', cities: 'Ciudades' },
  cond: {
    'clear-day': 'Despejado', 'clear-night': 'Despejado',
    'partly-cloudy-day': 'Parcialmente nublado', 'partly-cloudy-night': 'Parcialmente nublado',
    'cloudy': 'Nublado', 'rain': 'Lluvia', 'thunderstorm': 'Tormentas',
    'snow': 'Nieve', 'fog': 'Niebla',
  },
  hourlyForecast: 'Pronóstico por hora', sevenDay: 'Pronóstico de 7 días',
  hourlyTemp: 'Temperatura horaria', chanceOfPrecip: 'Probabilidad de lluvia',
  nextSevenDays: 'Próximos 7 días',
  feelsLike: 'Sensación', humidity: 'Humedad', wind: 'Viento',
  uvIndex: 'Índice UV', visibility: 'Visibilidad', pressure: 'Presión',
  airQuality: 'Calidad del aire', sun: 'Sol',
  gusts: (g, u) => `Ráfagas ${g} ${u}`,
  dewPoint: (d, u) => `Punto de rocío ${d}°${u}`,
  uv: (n) => n <= 2 ? 'Bajo' : n <= 5 ? 'Moderado' : n <= 7 ? 'Alto' : n <= 10 ? 'Muy alto' : 'Extremo',
  aqi: (n) => n <= 20 ? 'Buena' : n <= 40 ? 'Aceptable' : n <= 60 ? 'Moderada' : n <= 80 ? 'Mala' : n <= 100 ? 'Muy mala' : 'Pésima',
  feelsLikeSub: (f, a) => f > a ? 'Más cálido que el real' : f < a ? 'Más frío que el real' : 'Igual al real',
  visibilitySub: (v) => v >= 10 ? 'Despejada' : 'Reducida',
  pressureSub: (p) => p >= 1013 ? 'Alta · estable' : 'Baja · variable',
  days: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  today: 'Hoy', now: 'Ahora', liveRadar: 'Radar en vivo',
  loadingRadar: 'Cargando radar…',
  noPrecip: (c) => `Sin precipitaciones significativas cerca de ${c}.`,
  activePrecip: (c) => `Precipitaciones activas cerca de ${c}. Radar cada 10 min.`,
  intensity: 'INTENSIDAD', lightIntensity: 'Débil', heavyIntensity: 'Fuerte',
  citiesTitle: 'Ciudades', searchPlaceholder: 'Buscar ciudad o aeropuerto',
  addCity: 'Agregar ciudad',
  noCitiesFound: (q) => `No se encontraron ciudades para "${q}".`, searching: 'Buscando...',
  slides: [
    { title: 'El tiempo que se siente\ncomo el cielo', body: 'Sora pinta cada pronóstico con un cielo vivo que cambia con las condiciones del exterior.' },
    { title: 'Nunca más te\npilles desprevenido', body: 'Precipitaciones minuto a minuto, alertas de tiempo severo y un radar que puedes desplazar en el tiempo.' },
    { title: 'Todos tus lugares,\nde un vistazo', body: 'Guarda tus ciudades favoritas y cambia entre ellas con un toque – cada una con su propio cielo.' },
  ],
  enableLocationTitle: 'Activar ubicación',
  enableLocationBody: 'Obtén pronósticos precisos e hiperlocales exactamente donde estás – actualizados continuamente.',
  useMyLocation: 'Usar mi ubicación', locating: 'Localizando…',
  chooseManually: 'Elegir ciudad manualmente',
  skip: 'Omitir', next: 'Siguiente', getStarted: 'Empezar',
  until: 'Hasta', tapForDetails: 'Toca para detalles', inEffectUntil: 'Vigente hasta',
  alertSource: 'Fuente', enableNotifications: 'Activar alertas meteorológicas',
  notificationsEnabled: '🔔 Notificaciones activadas',
  notificationsBlocked: 'Notificaciones bloqueadas en el navegador',
  copiedToClipboard: '¡Copiado al portapapeles!',
  somethingWentWrong: 'Algo salió mal',
  unexpectedError: 'Ocurrió un error inesperado.', tryAgain: 'Intentar de nuevo',
  animOn: 'Anim activada', animOff: 'Anim desactivada',
  autoMode: '🌓 Auto', darkMode: '🌙 Oscuro', lightMode: '☀️ Claro',
  settingsTitle: 'Ajustes', language: 'Idioma', colorTheme: 'Tema de color',
  brightness: 'Brillo', temperature: 'Temperatura', animations: 'Animaciones',
  share: 'Compartir el tiempo', windSpeed: 'Velocidad del viento',
  layer: 'Capa del radar', layerPrecip: 'Precipitación', layerSatellite: 'Satélite',
  forecastDays: (n) => `Pronóstico de ${n} días`,
  condAlerts: 'Alertas de condiciones', alertOnRain: 'Avisar cuando empieza la lluvia',
  alertOnSnow: 'Avisar cuando empieza la nieve',
  installTitle: 'Añadir a la pantalla de inicio',
  installBody: 'Instala Sora para acceso rápido al tiempo',
  install: 'Instalar',
  apiOk: 'Datos meteorológicos: conectado',
  apiError: 'Datos meteorológicos: sin conexión',
}

const pt: Translations = {
  nav: { today: 'Hoje', forecast: 'Previsão', radar: 'Radar', cities: 'Cidades' },
  cond: {
    'clear-day': 'Céu limpo', 'clear-night': 'Céu limpo',
    'partly-cloudy-day': 'Parcialmente nublado', 'partly-cloudy-night': 'Parcialmente nublado',
    'cloudy': 'Nublado', 'rain': 'Chuva', 'thunderstorm': 'Trovoada',
    'snow': 'Neve', 'fog': 'Nevoeiro',
  },
  hourlyForecast: 'Previsão por hora', sevenDay: 'Previsão de 7 dias',
  hourlyTemp: 'Temperatura por hora', chanceOfPrecip: 'Probabilidade de chuva',
  nextSevenDays: 'Próximos 7 dias',
  feelsLike: 'Sensação', humidity: 'Humidade', wind: 'Vento',
  uvIndex: 'Índice UV', visibility: 'Visibilidade', pressure: 'Pressão',
  airQuality: 'Qualidade do ar', sun: 'Sol',
  gusts: (g, u) => `Rajadas ${g} ${u}`,
  dewPoint: (d, u) => `Ponto de orvalho ${d}°${u}`,
  uv: (n) => n <= 2 ? 'Baixo' : n <= 5 ? 'Moderado' : n <= 7 ? 'Alto' : n <= 10 ? 'Muito alto' : 'Extremo',
  aqi: (n) => n <= 20 ? 'Bom' : n <= 40 ? 'Aceitável' : n <= 60 ? 'Moderado' : n <= 80 ? 'Mau' : n <= 100 ? 'Muito mau' : 'Péssimo',
  feelsLikeSub: (f, a) => f > a ? 'Mais quente que o real' : f < a ? 'Mais frio que o real' : 'Igual ao real',
  visibilitySub: (v) => v >= 10 ? 'Boa' : 'Reduzida',
  pressureSub: (p) => p >= 1013 ? 'Alta · estável' : 'Baixa · instável',
  days: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  today: 'Hoje', now: 'Agora', liveRadar: 'Radar ao vivo',
  loadingRadar: 'A carregar radar…',
  noPrecip: (c) => `Sem precipitação significativa perto de ${c}.`,
  activePrecip: (c) => `Precipitação ativa perto de ${c}. Radar a cada 10 min.`,
  intensity: 'INTENSIDADE', lightIntensity: 'Fraca', heavyIntensity: 'Forte',
  citiesTitle: 'Cidades', searchPlaceholder: 'Pesquisar cidade ou aeroporto',
  addCity: 'Adicionar cidade',
  noCitiesFound: (q) => `Nenhuma cidade encontrada para "${q}".`, searching: 'A pesquisar...',
  slides: [
    { title: 'O tempo que parece\no céu', body: 'Sora pinta cada previsão com um céu vivo que muda com as condições do exterior.' },
    { title: 'Nunca seja\napanhado de surpresa', body: 'Precipitação minuto a minuto, alertas de mau tempo e um radar que pode avançar no tempo.' },
    { title: 'Todos os seus lugares,\nnuma vista', body: 'Guarde as suas cidades favoritas e alterne entre elas com um toque — cada uma com o seu próprio céu.' },
  ],
  enableLocationTitle: 'Ativar localização',
  enableLocationBody: 'Obtenha previsões precisas e hiperlocais exatamente onde está — atualizadas continuamente.',
  useMyLocation: 'Usar a minha localização', locating: 'A localizar…',
  chooseManually: 'Escolher cidade manualmente',
  skip: 'Saltar', next: 'Seguinte', getStarted: 'Começar',
  until: 'Até', tapForDetails: 'Toque para detalhes', inEffectUntil: 'Válido até',
  alertSource: 'Fonte', enableNotifications: 'Ativar alertas meteorológicos',
  notificationsEnabled: '🔔 Notificações ativadas',
  notificationsBlocked: 'Notificações bloqueadas no navegador',
  copiedToClipboard: 'Copiado para a área de transferência!',
  somethingWentWrong: 'Algo correu mal',
  unexpectedError: 'Ocorreu um erro inesperado.', tryAgain: 'Tentar novamente',
  animOn: 'Anim ativa', animOff: 'Anim desativa',
  autoMode: '🌓 Auto', darkMode: '🌙 Escuro', lightMode: '☀️ Claro',
  settingsTitle: 'Definições', language: 'Idioma', colorTheme: 'Tema de cor',
  brightness: 'Brilho', temperature: 'Temperatura', animations: 'Animações',
  share: 'Partilhar o tempo', windSpeed: 'Velocidade do vento',
  layer: 'Camada de radar', layerPrecip: 'Precipitação', layerSatellite: 'Satélite',
  forecastDays: (n) => `Previsão de ${n} dias`,
  condAlerts: 'Alertas de condições', alertOnRain: 'Avisar quando começar a chover',
  alertOnSnow: 'Avisar quando começar a nevar',
  installTitle: 'Adicionar ao ecrã inicial',
  installBody: 'Instale o Sora para acesso rápido ao tempo',
  install: 'Instalar', apiOk: 'Dados meteorológicos: ligado', apiError: 'Dados meteorológicos: sem ligação',
}

const ro: Translations = {
  nav: { today: 'Azi', forecast: 'Prognoză', radar: 'Radar', cities: 'Orașe' },
  cond: {
    'clear-day': 'Senin', 'clear-night': 'Senin',
    'partly-cloudy-day': 'Parțial noros', 'partly-cloudy-night': 'Parțial noros',
    'cloudy': 'Noros', 'rain': 'Ploaie', 'thunderstorm': 'Furtună',
    'snow': 'Ninsoare', 'fog': 'Ceață',
  },
  hourlyForecast: 'Prognoză orară', sevenDay: 'Prognoză 7 zile',
  hourlyTemp: 'Temperatură orară', chanceOfPrecip: 'Probabilitate precipitații',
  nextSevenDays: 'Următoarele 7 zile',
  feelsLike: 'Se simte', humidity: 'Umiditate', wind: 'Vânt',
  uvIndex: 'Indice UV', visibility: 'Vizibilitate', pressure: 'Presiune',
  airQuality: 'Calitatea aerului', sun: 'Soare',
  gusts: (g, u) => `Rafale ${g} ${u}`,
  dewPoint: (d, u) => `Punct de rouă ${d}°${u}`,
  uv: (n) => n <= 2 ? 'Scăzut' : n <= 5 ? 'Moderat' : n <= 7 ? 'Ridicat' : n <= 10 ? 'Foarte ridicat' : 'Extrem',
  aqi: (n) => n <= 20 ? 'Bun' : n <= 40 ? 'Acceptabil' : n <= 60 ? 'Moderat' : n <= 80 ? 'Slab' : n <= 100 ? 'Foarte slab' : 'Periculos',
  feelsLikeSub: (f, a) => f > a ? 'Mai cald decât real' : f < a ? 'Mai rece decât real' : 'Ca realul',
  visibilitySub: (v) => v >= 10 ? 'Bună' : 'Redusă',
  pressureSub: (p) => p >= 1013 ? 'Ridicată · stabilă' : 'Scăzută · instabilă',
  days: ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'],
  today: 'Azi', now: 'Acum', liveRadar: 'Radar live',
  loadingRadar: 'Se încarcă radarul…',
  noPrecip: (c) => `Fără precipitații semnificative lângă ${c}.`,
  activePrecip: (c) => `Precipitații active lângă ${c}. Radar la fiecare 10 min.`,
  intensity: 'INTENSITATE', lightIntensity: 'Slabă', heavyIntensity: 'Puternică',
  citiesTitle: 'Orașe', searchPlaceholder: 'Caută un oraș sau aeroport',
  addCity: 'Adaugă oraș',
  noCitiesFound: (q) => `Niciun oraș găsit pentru „${q}".`, searching: 'Se caută...',
  slides: [
    { title: 'Vremea care se simte\nca cerul', body: 'Sora pictează fiecare prognoză cu un cer viu care se schimbă odată cu condițiile.' },
    { title: 'Nu fi niciodată\nluat prin surprindere', body: 'Precipitații minut cu minut, alerte meteo și un radar prin care poți derula în timp.' },
    { title: 'Toate locurile tale,\ndintr-o privire', body: 'Salvează orașele preferate și comută între ele cu o atingere — fiecare cu cerul său.' },
  ],
  enableLocationTitle: 'Activează localizarea',
  enableLocationBody: 'Obțineți prognoze precise și hiperlocale exact acolo unde vă aflați — actualizate continuu.',
  useMyLocation: 'Folosește locația mea', locating: 'Se localizează…',
  chooseManually: 'Alege manual un oraș',
  skip: 'Sari', next: 'Următor', getStarted: 'Începe',
  until: 'Până la', tapForDetails: 'Atinge pentru detalii', inEffectUntil: 'Valabil până la',
  alertSource: 'Sursă', enableNotifications: 'Activează alertele meteo',
  notificationsEnabled: '🔔 Notificări activate',
  notificationsBlocked: 'Notificările sunt blocate în browser',
  copiedToClipboard: 'Copiat în clipboard!',
  somethingWentWrong: 'Ceva a mers prost',
  unexpectedError: 'A apărut o eroare neașteptată.', tryAgain: 'Încearcă din nou',
  animOn: 'Anim activă', animOff: 'Anim dezactivată',
  autoMode: '🌓 Auto', darkMode: '🌙 Întunecat', lightMode: '☀️ Luminos',
  settingsTitle: 'Setări', language: 'Limbă', colorTheme: 'Temă culori',
  brightness: 'Luminozitate', temperature: 'Temperatură', animations: 'Animații',
  share: 'Distribuie vremea', windSpeed: 'Viteza vântului',
  layer: 'Strat radar', layerPrecip: 'Precipitații', layerSatellite: 'Satelit',
  forecastDays: (n) => `Prognoză ${n} zile`,
  condAlerts: 'Alerte condiții', alertOnRain: 'Anunță când începe ploaia',
  alertOnSnow: 'Anunță când începe ninsoarea',
  installTitle: 'Adaugă pe ecranul principal',
  installBody: 'Instalează Sora pentru acces rapid la vreme',
  install: 'Instalează', apiOk: 'Date meteo: conectat', apiError: 'Date meteo: offline',
}

const tr: Translations = {
  nav: { today: 'Bugün', forecast: 'Tahmin', radar: 'Radar', cities: 'Şehirler' },
  cond: {
    'clear-day': 'Açık', 'clear-night': 'Açık',
    'partly-cloudy-day': 'Parçalı bulutlu', 'partly-cloudy-night': 'Parçalı bulutlu',
    'cloudy': 'Bulutlu', 'rain': 'Yağmur', 'thunderstorm': 'Fırtına',
    'snow': 'Kar', 'fog': 'Sis',
  },
  hourlyForecast: 'Saatlik tahmin', sevenDay: '7 günlük tahmin',
  hourlyTemp: 'Saatlik sıcaklık', chanceOfPrecip: 'Yağış olasılığı',
  nextSevenDays: 'Sonraki 7 gün',
  feelsLike: 'Hissedilen', humidity: 'Nem', wind: 'Rüzgar',
  uvIndex: 'UV Endeksi', visibility: 'Görüş', pressure: 'Basınç',
  airQuality: 'Hava kalitesi', sun: 'Güneş',
  gusts: (g, u) => `Rüzgar ${g} ${u}`,
  dewPoint: (d, u) => `Çiy noktası ${d}°${u}`,
  uv: (n) => n <= 2 ? 'Düşük' : n <= 5 ? 'Orta' : n <= 7 ? 'Yüksek' : n <= 10 ? 'Çok yüksek' : 'Aşırı',
  aqi: (n) => n <= 20 ? 'İyi' : n <= 40 ? 'Kabul edilebilir' : n <= 60 ? 'Orta' : n <= 80 ? 'Kötü' : n <= 100 ? 'Çok kötü' : 'Tehlikeli',
  feelsLikeSub: (f, a) => f > a ? 'Gerçekten daha sıcak' : f < a ? 'Gerçekten daha soğuk' : 'Gerçek gibi',
  visibilitySub: (v) => v >= 10 ? 'İyi' : 'Azalmış',
  pressureSub: (p) => p >= 1013 ? 'Yüksek · kararlı' : 'Alçak · dengesiz',
  days: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'],
  today: 'Bugün', now: 'Şimdi', liveRadar: 'Canlı radar',
  loadingRadar: 'Radar yükleniyor…',
  noPrecip: (c) => `${c} yakınında önemli yağış yok.`,
  activePrecip: (c) => `${c} yakınında aktif yağış. Radar her 10 dakikada güncellenir.`,
  intensity: 'YOĞUNLUK', lightIntensity: 'Hafif', heavyIntensity: 'Yoğun',
  citiesTitle: 'Şehirler', searchPlaceholder: 'Şehir veya havalimanı ara',
  addCity: 'Şehir ekle',
  noCitiesFound: (q) => `"${q}" için şehir bulunamadı.`, searching: 'Aranıyor...',
  slides: [
    { title: 'Gökyüzü gibi hissettiren\nhava durumu', body: 'Sora her tahmini, dışarıdaki koşullarla değişen canlı bir gökyüzüyle boyar.' },
    { title: 'Hiç hazırlıksız\nyakalanma', body: 'Dakika dakika yağış, şiddetli hava uyarıları ve zamanda gezdirebildiğiniz bir radar.' },
    { title: 'Tüm yerleriniz,\nbir bakışta', body: 'Sevdiğiniz şehirleri kaydedin ve aralarında tek dokunuşla geçin — her biri kendi gökyüzüyle.' },
  ],
  enableLocationTitle: 'Konumu etkinleştir',
  enableLocationBody: 'Tam olarak bulunduğunuz yer için doğru, hiper-yerel tahminler alın — sürekli güncellenir.',
  useMyLocation: 'Konumumu kullan', locating: 'Konumlanıyor…',
  chooseManually: 'Şehri manuel seç',
  skip: 'Atla', next: 'İleri', getStarted: 'Başla',
  until: 'Kadar', tapForDetails: 'Detaylar için dokun', inEffectUntil: 'Geçerlilik süresi',
  alertSource: 'Kaynak', enableNotifications: 'Hava uyarılarını etkinleştir',
  notificationsEnabled: '🔔 Bildirimler etkin',
  notificationsBlocked: 'Bildirimler tarayıcıda engellenmiş',
  copiedToClipboard: 'Panoya kopyalandı!',
  somethingWentWrong: 'Bir şeyler yanlış gitti',
  unexpectedError: 'Beklenmeyen bir hata oluştu.', tryAgain: 'Tekrar dene',
  animOn: 'Animasyon açık', animOff: 'Animasyon kapalı',
  autoMode: '🌓 Otomatik', darkMode: '🌙 Koyu', lightMode: '☀️ Açık',
  settingsTitle: 'Ayarlar', language: 'Dil', colorTheme: 'Renk teması',
  brightness: 'Parlaklık', temperature: 'Sıcaklık', animations: 'Animasyonlar',
  share: 'Havayı paylaş', windSpeed: 'Rüzgar hızı',
  layer: 'Radar katmanı', layerPrecip: 'Yağış', layerSatellite: 'Uydu',
  forecastDays: (n) => `${n} günlük tahmin`,
  condAlerts: 'Koşul uyarıları', alertOnRain: 'Yağmur başlayınca bildir',
  alertOnSnow: 'Kar başlayınca bildir',
  installTitle: 'Ana ekrana ekle',
  installBody: 'Hızlı erişim için Sora\'yı yükle',
  install: 'Yükle', apiOk: 'Hava verileri: bağlı', apiError: 'Hava verileri: çevrimdışı',
}

export const translations: Record<Locale, Translations> = { en, bg, de, fr, es, pt, ro, tr }
