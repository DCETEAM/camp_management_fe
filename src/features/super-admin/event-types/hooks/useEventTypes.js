import { useState, useEffect, useCallback } from 'react'
import eventTypeService from '../services/event-type-service'

const PER_PAGE = 10

export function useEventTypes() {
	const [eventTypes, setEventTypes] = useState([])
	const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [page, setPage] = useState(1)
	const [search, setSearch] = useState('')

	const fetch = useCallback(async (currentPage, currentSearch) => {
		try {
			setLoading(true)
			const data = await eventTypeService.getEventTypes({
				page: currentPage,
				per_page: PER_PAGE,
				search: currentSearch || undefined,
			})
			setEventTypes(data.data)
			setMeta({ current_page: data.current_page, last_page: data.last_page, total: data.total })
			setError(null)
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to load event types')
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => { setPage(1) }, [search])
	useEffect(() => { fetch(page, search) }, [fetch, page, search])

	const refetch = useCallback(() => fetch(page, search), [fetch, page, search])

	return { eventTypes, meta, loading, error, page, setPage, search, setSearch, refetch, perPage: PER_PAGE }
}
