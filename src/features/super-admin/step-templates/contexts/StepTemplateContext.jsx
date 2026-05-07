import { createContext, useContext } from 'react'

const StepTemplateContext = createContext(null)

export function StepTemplateProvider({ children }) {
	return <StepTemplateContext.Provider value={{}}>{children}</StepTemplateContext.Provider>
}

export function useStepTemplateContext() {
	return useContext(StepTemplateContext)
}
