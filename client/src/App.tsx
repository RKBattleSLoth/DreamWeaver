import { Router, Route, Switch } from 'wouter'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ChildProfilesPage from './pages/ChildProfilesPage'
import { Stories } from './pages/Stories'
import { SupabaseAuthProvider } from './lib/supabase-auth'

function App() {
  return (
    <SupabaseAuthProvider>
      <Router>
        <div className="min-h-screen bg-background">
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
  )
}

export default App