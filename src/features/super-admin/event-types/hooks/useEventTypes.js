import { useState, useEffect, useCallback } from 'react'
import eventTypeService from '../services/event-type-service'

const PER_PAGE = 10

export function useEventTypes() {
	const [eventTypes, setEventTypes] = useState([])
	const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, total_active: 0, total_steps: 0 })
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [page, setPage] = useState(1)
	const [search, setSearch] = useState('')
	const [startDate, setStartDate] = useState('')
	const [endDate, setEndDate] = useState('')

	const fetch = useCallback(async (currentPage, currentSearch, currentStart, currentEnd) => {
		try {
			setLoading(true)
			const params = { page: currentPage, per_page: PER_PAGE }
			if (currentSearch) params.search = currentSearch
			if (currentStart) params.start_date = currentStart
			if (currentEnd) params.end_date = currentEnd
			const data = await eventTypeService.getEventTypes(params)
			setEventTypes(data.data)
			setMeta({ 
				current_page: data.current_page, 
				last_page: data.last_page, 
				total: data.total,
				total_active: data.total_active,
				total_steps: data.total_steps
			})
			setError(null)
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to load event types')
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => { setPage(1) }, [search, startDate, endDate])
	useEffect(() => { fetch(page, search, startDate, endDate) }, [fetch, page, search, startDate, endDate])

	const refetch = useCallback(() => fetch(page, search, startDate, endDate), [fetch, page, search, startDate, endDate])

	return { eventTypes, meta, loading, error, page, setPage, search, setSearch, startDate, setStartDate, endDate, setEndDate, refetch, perPage: PER_PAGE }
}
