import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AppLayout } from "@/components/layout/app-layout";

import Dashboard from "@/pages/dashboard";
import Chat from "@/pages/chat";
import Coding from "@/pages/coding";
import Research from "@/pages/research";
import Memory from "@/pages/memory";
import Agents from "@/pages/agents";
import Files from "@/pages/files";
import Analytics from "@/pages/analytics";
import Models from "@/pages/models";
import Settings from "@/pages/settings";
import AppBuilder from "@/pages/app-builder";
import Automation from "@/pages/automation";
import Computer from "@/pages/computer";

const queryClient = new QueryClient();

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/chat" component={Chat} />
        <Route path="/chat/:id" component={Chat} />
        <Route path="/coding" component={Coding} />
        <Route path="/research" component={Research} />
        <Route path="/memory" component={Memory} />
        <Route path="/agents" component={Agents} />
        <Route path="/automation" component={Automation} />
        <Route path="/files" component={Files} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/models" component={Models} />
        <Route path="/settings" component={Settings} />
        <Route path="/app-builder" component={AppBuilder} />
        <Route path="/computer" component={Computer} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={0}>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
