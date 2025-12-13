import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import Tournaments from "./pages/Tournaments";
import TournamentDetails from "./pages/TournamentDetails";
import Games from "./pages/Games";
import Leaderboard from "./pages/Leaderboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Wallet from "./pages/Wallet";
import TournamentRegistration from "./pages/TournamentRegistration";
import MatchSubmission from "./pages/MatchSubmission";
import TeamManagement from "./pages/TeamManagement";
import TeamPage from "./pages/TeamPage";
import ImageTestPage from "./pages/ImageTestPage";
import NotFound from "./pages/NotFound";
import AdminLayout from "@/components/layout/AdminLayout";
import AdminIndex from "./pages/admin/Index";
import AdminTournaments from "./pages/admin/Tournaments";
import CreateTournament from "./pages/admin/CreateTournament";
import EditTournament from "./pages/admin/EditTournament";
import AdminUsers from "./pages/admin/Users";
import AdminWallet from "./pages/admin/Wallet";
import AdminSettings from "./pages/admin/Settings";
import GameImageManager from "./pages/admin/GameImageManager";

const queryClient = new QueryClient();

// Scroll to top on route change
const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    console.log('Scrolling to top for route:', location.pathname + location.search);
    
    // First, disable browser's automatic scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    
    // Use requestAnimationFrame to ensure DOM is fully rendered
    const scrollToTop = () => {
      // Try all possible scroll containers
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // Find and scroll the main content area (the real scroll container)
      const mainElement = document.querySelector('main');
      if (mainElement) {
        mainElement.scrollTop = 0;
      }
      
      // Also try the root element
      const rootElement = document.getElementById('root');
      if (rootElement) {
        rootElement.scrollTop = 0;
      }
      
      // Try any element that might be the scroll container
      const scrollContainer = document.querySelector('[data-scroll-container]');
      if (scrollContainer) {
        scrollContainer.scrollTop = 0;
      }
    };
    
    // Execute immediately and then in the next animation frame
    scrollToTop();
    requestAnimationFrame(scrollToTop);
    
    // Additional fallback after a short delay
    setTimeout(scrollToTop, 50);
    
  }, [location.pathname, location.search]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/tournaments/:id" element={<TournamentDetails />} />
            <Route path="/tournaments/:id/register" element={<TournamentRegistration />} />
            <Route path="/matches/:id/submit" element={<MatchSubmission />} />
          <Route path="/games" element={<Games />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/teams" element={<TeamManagement />} />
          <Route path="/teams/:id" element={<TeamPage />} />
          <Route path="/image-test" element={<ImageTestPage />} />
          
          {/* Admin Routes - Protected Access */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminIndex />} />
            <Route path="tournaments" element={<AdminTournaments />} />
            <Route path="tournaments/create" element={<CreateTournament />} />
            <Route path="tournaments/edit/:id" element={<EditTournament />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="wallet" element={<AdminWallet />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="game-images" element={<GameImageManager />} />
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
