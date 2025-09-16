import { MessageCircle } from "lucide-react";
import { generateWhatsAppUrl } from "@/lib/utils";

export function WhatsAppFloat() {
  const phoneNumber = "251974408281"; // Ethiopia country code + number
  const message = "Hello! I'm interested in your properties.";

  const handleWhatsAppClick = () => {
    window.open(generateWhatsAppUrl(phoneNumber, message), '_blank');
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-4 right-4 z-50 bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
      aria-label="Contact us on WhatsApp"
      data-testid="button-whatsapp"
    >
      <MessageCircle className="h-6 w-6" />
    </button>
  );
}