import { useState, useMemo } from 'react'
import { startOfWeek, format, subWeeks, parseISO } from 'date-fns'

function getWeekStart(date = new Date()) {
  return startOfWeek(date, { weekStartsOn: 1 }) // Monday
}

export function useWeek() {
  const [currentWeek, setCurrentWeek] = useState(() => format(getWeekStart(), 'yyyy-MM-dd'))

  const prevWeek = useMemo(() => {
    const d = parseISO(currentWeek)
    return format(subWeeks(d, 1), 'yyyy-MM-dd')
  }, [currentWeek])

  const nextWeek = useMemo(() => {
    const d = parseISO(currentWeek)
    return format(subWeeks(d, -1), 'yyyy-MM-dd')
  }, [currentWeek])

  const goToPrev = () => setCurrentWeek(prevWeek)
  const goToNext = () => setCurrentWeek(nextWeek)
  const goToCurrent = () => setCurrentWeek(format(getWeekStart(), 'yyyy-MM-dd'))

  return { currentWeek, prevWeek, nextWeek, setCurrentWeek, goToPrev, goToNext, goToCurrent }
}
