import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="text-8xl font-bold text-primary mb-4">404</div>
        <h1 className="text-2xl font-bold text-foreground mb-4">Page Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => window.history.back()} variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Button asChild className="flex items-center gap-2">
            <a href="/">
              <Home className="h-4 w-4" />
              Return Home
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
