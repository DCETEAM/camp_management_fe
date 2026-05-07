import { createContext, useContext } from 'react'

const EventTypeContext = createContext(null)

export function EventTypeProvider({ children }) {
	return <EventTypeContext.Provider value={{}}>{children}</EventTypeContext.Provider>
}

export function useEventTypeContext() {
	return useContext(EventTypeContext)
}
