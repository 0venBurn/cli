import { useEffect, useState } from 'react'
import { CircularProgress, useTheme } from '@mui/material'
import { Dayjs } from 'dayjs'

import { TimeDataChart } from './TimeDataChart'
import { minutesToHours } from './utils'
import { useCategoryTimeOverview } from '../../../api/pulse.api'

const categories = {
  coding: 'coding',
  browsing: 'browsing',
  debugging: 'debugging',
  communicating: 'communicating',
  designing: 'designing', // verify
}

interface Props {
  selectedDate: Dayjs
}
const CategoryChart = ({ selectedDate }: Props) => {
  const [totalMinutes, setTotalMinutes] = useState(0)
  const theme = useTheme()

  const {
    data: categoryOverview = [] as CodeClimbers.TimeOverview[][],
    isPending,
  } = useCategoryTimeOverview(selectedDate)
  const TODAY_INDEX = 0
  const todayOverview = categoryOverview[TODAY_INDEX] || []

  useEffect(() => {
    if (todayOverview.length > 0)
      setTotalMinutes(
        todayOverview.reduce((a, b) => {
          return a + b.minutes
        }, 0),
      )
  }, [todayOverview])

  const getCategoryMinutes = (
    overview: CodeClimbers.TimeOverview[],
    category = '',
  ) => {
    const item = overview.find((cat) => cat.category === category)
    let minutes = item?.minutes ?? 0

    if (category === categories.coding) {
      const debugItem =
        overview.find((cat) => cat.category === categories.debugging) ??
        ({ minutes: 0 } as CodeClimbers.TimeOverview)
      minutes += debugItem.minutes
    }

    return minutes
  }

  const getCategoryPercentage = (category = '') => {
    const todayMinutes = getCategoryMinutes(todayOverview, category)
    if (totalMinutes > 0) {
      return (todayMinutes / (3 * 60)) * 100 // 3 hours
    }

    return 0
  }

  if (isPending) return <CircularProgress />
  return (
    <>
      <TimeDataChart
        title="Coding"
        time={minutesToHours(
          getCategoryMinutes(todayOverview, categories.coding),
        )}
        progress={getCategoryPercentage(categories.coding)}
        color={theme.palette.graphColors.blue}
      />
      <TimeDataChart
        title="Communicating"
        time={minutesToHours(
          getCategoryMinutes(todayOverview, categories.communicating),
        )}
        progress={getCategoryPercentage(categories.communicating)}
        color={theme.palette.graphColors.purple}
      />
      <TimeDataChart
        title="Browsing"
        time={minutesToHours(
          getCategoryMinutes(todayOverview, categories.browsing),
        )}
        progress={getCategoryPercentage(categories.browsing)}
        color={theme.palette.graphColors.green}
      />
      <TimeDataChart
        title="Designing"
        time={minutesToHours(
          getCategoryMinutes(todayOverview, categories.designing),
        )}
        progress={getCategoryPercentage(categories.designing)}
        color={theme.palette.graphColors.orange}
      />
    </>
  )
}

export default CategoryChart
