import { MessageCircle } from 'lucide-react';

const WhatsAppButton = () => {
  return (
    <a 
      href="https://api.whatsapp.com/send?phone=962792626262&text=Hi%20ArenaJo" 
      target="_blank" 
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl group"
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
      <span className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        Chat with us on WhatsApp
      </span>
    </a>
  );
};

export default WhatsAppButton;