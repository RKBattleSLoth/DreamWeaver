import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import Navigation from "@/components/navigation";
import Home from "@/pages/home";
import StoryCreator from "@/pages/story-creator";
import StoryReader from "@/pages/story-reader";
import Library from "@/pages/library";
import Profiles from "@/pages/profiles";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/create" component={StoryCreator} />
        <Route path="/story/:id" component={StoryReader} />
        <Route path="/library" component={Library} />
        <Route path="/profiles" component={Profiles} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
