import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background bg-grid-pattern px-4">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-hero-gradient opacity-50" />
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" />
      <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-secondary/10 rounded-full blur-[128px]" />
      
      <div className="relative text-center">
        <h1 className="font-display text-8xl sm:text-9xl font-bold text-gradient mb-4">404</h1>
        <p className="font-gaming text-xl text-muted-foreground mb-8">
          Oops! This page doesn't exist in the arena.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/">
            <Button className="font-gaming bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Button variant="outline" onClick={() => window.history.back()} className="font-gaming">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;