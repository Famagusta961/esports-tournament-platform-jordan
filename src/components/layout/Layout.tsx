import { ReactNode, useEffect, useRef } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { scrollToTop } from '@/lib/scroll-utils';

interface LayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

const Layout = ({ children, showFooter = true }: LayoutProps) => {
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Ensure we're at top when Layout first mounts (for Home page and initial load)
    console.log('Layout mounted - scrolling to top');
    scrollToTop();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background bg-grid-pattern relative" style={{ isolation: 'isolate' }}>
      <Navbar />
      <main 
        ref={mainRef}
        className="flex-1 pt-16 lg:pt-20 relative z-10 bg-background overflow-x-hidden"
        data-scroll-container="true"
      >
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;
