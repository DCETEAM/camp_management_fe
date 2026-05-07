import { useState, useEffect, useCallback } from 'react'
import userService from '../services/user-service'

const PER_PAGE = 15

export function useUsers() {
	const [users, setUsers] = useState([])
	const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [page, setPage] = useState(1)
	const [search, setSearch] = useState('')
	const [roleFilter, setRoleFilter] = useState('all')
	const [orgFilter, setOrgFilter] = useState('all')

	const fetch = useCallback(async (currentPage, currentSearch, currentRole, currentOrg) => {
		try {
			setLoading(true)
			const params = { page: currentPage, per_page: PER_PAGE }
			if (currentSearch) params.search = currentSearch
			if (currentRole !== 'all') params.role = currentRole
			if (currentOrg !== 'all') params.org_id = currentOrg
			const data = await userService.getUsers(params)
			const list = data.data ?? data
			setUsers(list)
			if (data.total !== undefined) {
				setMeta({ current_page: data.current_page, last_page: data.last_page, total: data.total })
			}
			setError(null)
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to load users')
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => { setPage(1) }, [search, roleFilter, orgFilter])
	useEffect(() => { fetch(page, search, roleFilter, orgFilter) }, [fetch, page, search, roleFilter, orgFilter])

	const refetch = useCallback(() => fetch(page, search, roleFilter, orgFilter), [fetch, page, search, roleFilter, orgFilter])

	return { users, meta, loading, error, page, setPage, search, setSearch, roleFilter, setRoleFilter, orgFilter, setOrgFilter, refetch, perPage: PER_PAGE }
}
