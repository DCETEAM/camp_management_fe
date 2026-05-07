import { createContext, useContext } from 'react'

const OrganizationContext = createContext(null)

export function OrganizationProvider({ children }) {
	return <OrganizationContext.Provider value={{}}>{children}</OrganizationContext.Provider>
}

export function useOrganizationContext() {
	return useContext(OrganizationContext)
}
