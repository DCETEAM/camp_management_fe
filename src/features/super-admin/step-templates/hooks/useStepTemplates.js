import { useState, useCallback } from 'react'
import stepTemplateService from '../services/step-template-service'

export function useStepTemplates() {
	const [steps, setSteps] = useState([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)

	const fetchSteps = useCallback(async (eventTypeId) => {
		try {
			setLoading(true)
			setError(null)
			const data = await stepTemplateService.getStepTemplates(eventTypeId)
			const list = Array.isArray(data) ? data : (data.data || [])
			setSteps([...list].sort((a, b) => a.step_order - b.step_order))
		} catch {
			setError('Failed to load steps.')
		} finally {
			setLoading(false)
		}
	}, [])

	return { steps, setSteps, loading, error, setError, fetchSteps }
}
