import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WhatsAppFloat } from "@/components/ui/whatsapp-float";

import Home from "@/pages/home";
import Properties from "@/pages/properties";
import PropertyDetail from "@/pages/property-detail";
import Team from "@/pages/team";
import Blog from "@/pages/blog";
import BlogPost from "@/pages/blog-post";
import Contact from "@/pages/contact";
import Login from "@/pages/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProperties from "@/pages/admin/properties";
import AdminHeroSlides from "@/pages/admin/hero-slides";
import AdminTeam from "@/pages/admin/team";
import AdminBlog from "@/pages/admin/blog";
import AdminLeads from "@/pages/admin/leads";
import AdminSettings from "@/pages/admin/settings";
import NotFound from "@/pages/not-found";
import ProtectedRoute from "@/components/auth/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/properties" component={Properties} />
      <Route path="/property/:slug" component={PropertyDetail} />
      <Route path="/team" component={Team} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/contact" component={Contact} />
      <Route path="/login" component={Login} />
      <Route path="/admin" component={() => <ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/properties" component={() => <ProtectedRoute><AdminProperties /></ProtectedRoute>} />
      <Route path="/admin/hero-slides" component={() => <ProtectedRoute><AdminHeroSlides /></ProtectedRoute>} />
      <Route path="/admin/team" component={() => <ProtectedRoute><AdminTeam /></ProtectedRoute>} />
      <Route path="/admin/blog" component={() => <ProtectedRoute><AdminBlog /></ProtectedRoute>} />
      <Route path="/admin/leads" component={() => <ProtectedRoute><AdminLeads /></ProtectedRoute>} />
      <Route path="/admin/settings" component={() => <ProtectedRoute><AdminSettings /></ProtectedRoute>} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <WhatsAppFloat />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;