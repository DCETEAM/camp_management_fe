import { createContext, useContext } from 'react'

const UserContext = createContext(null)

export function UserProvider({ children }) {
	return <UserContext.Provider value={{}}>{children}</UserContext.Provider>
}

export function useUserContext() {
	return useContext(UserContext)
}
