import { Router, Route, Switch } from 'wouter'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ChildProfilesPage from './pages/ChildProfilesPage'
import { Stories } from './pages/Stories'
import { SupabaseAuthProvider } from './lib/supabase-auth'
import Navigation from './components/ui/Navigation'
import { ThemeProvider } from './lib/theme'

function App() {
  return (
    <ThemeProvider>
      <SupabaseAuthProvider>
        <Router>
          <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
            <Navigation />
            <Switch>
            <Route path="/login" component={LoginPage} />
            <Route path="/register" component={RegisterPage} />
            <Route path="/profiles" component={ChildProfilesPage} />
            <Route path="/stories" component={Stories} />
            <Route path="/" component={DashboardPage} />
            
            {/* 404 */}
            <Route>
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-muted-foreground mb-4">404</h1>
                  <p className="text-muted-foreground">Page not found</p>
                </div>
              </div>
            </Route>
          </Switch>
          </div>
        </Router>
      </SupabaseAuthProvider>
    </ThemeProvider>
  )
}

export default App