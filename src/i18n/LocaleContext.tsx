import { createContext, useContext } from 'react'
import type { Locale, Translations } from './translations'
import { translations } from './translations'

interface LocaleContextValue {
  locale: Locale
  setLocale: (l: Locale) => void
  t: Translations
}

export const LocaleContext = createContext<LocaleContextValue>({
  locale: 'en',
  setLocale: () => {},
  t: translations.en,
})

export function useT(): Translations {
  return useContext(LocaleContext).t
}

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext)
}
