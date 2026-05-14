import { useTranslation } from 'react-i18next'
import { useCallback } from 'react'

export function useI18n() {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language?.startsWith('ar')
  const isRTL = isArabic

  const toggle = useCallback(() => {
    const next = isArabic ? 'en' : 'ar'
    i18n.changeLanguage(next)
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = next
  }, [i18n, isArabic])

  return { t, i18n, isArabic, isRTL, toggle, lang: i18n.language }
}
