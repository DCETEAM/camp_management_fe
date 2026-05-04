import { AuthProvider } from './features/auth/contexts/auth-context'
import AppRoutes from './routes/app-routes'

function App() {
	return (
		<AuthProvider>
			<AppRoutes />
		</AuthProvider>
	)
}

export default App
