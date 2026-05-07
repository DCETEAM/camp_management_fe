import { useState, useEffect, useCallback } from 'react'
import organizationService from '../services/organization-service'

const PER_PAGE = 10

export function useOrganizations() {
	const [organizations, setOrganizations] = useState([])
	const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [page, setPage] = useState(1)
	const [search, setSearch] = useState('')

	const fetch = useCallback(async (currentPage, currentSearch) => {
		try {
			setLoading(true)
			const data = await organizationService.getOrganizations({
				page: currentPage,
				per_page: PER_PAGE,
				search: currentSearch || undefined,
			})
			const list = data.data ?? data
			setOrganizations(list)
			if (data.total !== undefined) {
				setMeta({ current_page: data.current_page, last_page: data.last_page, total: data.total })
			}
			setError(null)
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to load organizations')
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => { setPage(1) }, [search])
	useEffect(() => { fetch(page, search) }, [fetch, page, search])

	const refetch = useCallback(() => fetch(page, search), [fetch, page, search])

	return { organizations, meta, loading, error, page, setPage, search, setSearch, refetch, perPage: PER_PAGE }
}
