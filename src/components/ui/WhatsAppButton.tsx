import { MessageCircle } from 'lucide-react';

// URL defined as const to prevent any manipulation
const WHATSAPP_URL = "https://api.whatsapp.com/send?phone=962792626262";

const WhatsAppButton = () => {
  // Debug function - will run when button is clicked
  const debugUrl = () => {
    console.log('=== WHATSAPP URL INVESTIGATION ===');
    console.log('Expected URL:', 'https://api.whatsapp.com/send?phone=962792626262');
    console.log('Actual URL being used:', WHATSAPP_URL);
    console.log('URLs match:', WHATSAPP_URL === 'https://api.whatsapp.com/send?phone=962792626262');
    
    // Check each character for hidden issues
    console.log('Character analysis:');
    for (let i = 0; i < WHATSAPP_URL.length; i++) {
      const char = WHATSAPP_URL[i];
      const code = WHATSAPP_URL.charCodeAt(i);
      console.log(`Index ${i}: "${char}" (ASCII: ${code})`);
      
      // Alert on suspicious characters
      if (code === 160) console.log(`WARNING: Non-breaking space at index ${i}`);
      if (code === 8237 || code === 8238) console.log(`WARNING: RTL marker at index ${i}`);
    }
    
    console.log('URL length:', WHATSAPP_URL.length);
    console.log('=== END INVESTIGATION ===');
  };
  
  return (
    <a 
      href={WHATSAPP_URL}
      target="_blank" 
      rel="noopener noreferrer"
      onClick={debugUrl}
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