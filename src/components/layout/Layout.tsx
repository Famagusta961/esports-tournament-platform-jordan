import { ReactNode, useEffect, useRef } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

const Layout = ({ children, showFooter = true }: LayoutProps) => {
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Ensure we're at top when Layout first mounts (for Home page and initial load)
    const scrollToTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // Also scroll the main element if it's the scroll container
      if (mainRef.current) {
        mainRef.current.scrollTop = 0;
      }
    };

    scrollToTop();
    
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(scrollToTop);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background bg-grid-pattern">
      <Navbar />
      <main 
        ref={mainRef}
        className="flex-1 pt-16 lg:pt-20"
        data-scroll-container
      >
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;
