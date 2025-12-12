import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import WhatsAppButton from '../ui/WhatsAppButton';

interface LayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

const Layout = ({ children, showFooter = true }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background bg-grid-pattern">
      <Navbar />
      <main className="flex-1 pt-16 lg:pt-20">
        {children}
      </main>
      {showFooter && <Footer />}
      <WhatsAppButton />
    </div>
  );
};

export default Layout;
