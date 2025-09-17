import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Heart } from 'lucide-react';
import { useStore } from '../../store/useStore';

export function Footer() {
  const { language, colorTheme } = useStore();

  const translations = {
    en: {
      company: 'Company',
      aboutUs: 'About Us',
      careers: 'Careers',
      press: 'Press',
      blog: 'Blog',
      support: 'Support',
      helpCenter: 'Help Center',
      contactUs: 'Contact Us',
      shipping: 'Shipping Info',
      returns: 'Returns',
      legal: 'Legal',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      cookies: 'Cookie Policy',
      followUs: 'Follow Us',
      newsletter: 'Newsletter',
      newsletterText: 'Subscribe to get updates on new products and offers',
      subscribe: 'Subscribe',
      emailPlaceholder: 'Enter your email',
      address: '123 Commerce Street, Douala, Cameroon',
      phone: '+237 6XX XXX XXX',
      email: 'info@3decommerce.cm',
      copyright: '© 2024 3D E-Commerce Cameroon. Made with',
      allRightsReserved: 'All rights reserved.',
    },
    fr: {
      company: 'Entreprise',
      aboutUs: 'À Propos',
      careers: 'Carrières',
      press: 'Presse',
      blog: 'Blog',
      support: 'Support',
      helpCenter: 'Centre d\'Aide',
      contactUs: 'Nous Contacter',
      shipping: 'Info Livraison',
      returns: 'Retours',
      legal: 'Légal',
      privacy: 'Politique de Confidentialité',
      terms: 'Conditions d\'Utilisation',
      cookies: 'Politique des Cookies',
      followUs: 'Suivez-Nous',
      newsletter: 'Newsletter',
      newsletterText: 'Abonnez-vous pour recevoir les mises à jour sur les nouveaux produits et offres',
      subscribe: 'S\'abonner',
      emailPlaceholder: 'Entrez votre email',
      address: '123 Rue du Commerce, Douala, Cameroun',
      phone: '+237 6XX XXX XXX',
      email: 'info@3decommerce.cm',
      copyright: '© 2024 3D E-Commerce Cameroun. Fait avec',
      allRightsReserved: 'Tous droits réservés.',
    }
  };

  const t = translations[language];

  const getThemeColors = () => {
    const themes = {
      blue: { primary: 'bg-blue-600', secondary: 'bg-blue-50', text: 'text-blue-600', hover: 'hover:text-blue-600' },
      green: { primary: 'bg-green-600', secondary: 'bg-green-50', text: 'text-green-600', hover: 'hover:text-green-600' },
      purple: { primary: 'bg-purple-600', secondary: 'bg-purple-50', text: 'text-purple-600', hover: 'hover:text-purple-600' },
      orange: { primary: 'bg-orange-600', secondary: 'bg-orange-50', text: 'text-orange-600', hover: 'hover:text-orange-600' },
      red: { primary: 'bg-red-600', secondary: 'bg-red-50', text: 'text-red-600', hover: 'hover:text-red-600' },
    };
    return themes[colorTheme];
  };

  const themeColors = getThemeColors();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t.company}</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">{t.aboutUs}</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">{t.careers}</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">{t.press}</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">{t.blog}</a></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t.support}</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">{t.helpCenter}</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">{t.contactUs}</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">{t.shipping}</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">{t.returns}</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t.legal}</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">{t.privacy}</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">{t.terms}</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">{t.cookies}</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t.newsletter}</h3>
            <p className="text-gray-300 text-sm">{t.newsletterText}</p>
            <div className="flex">
              <input
                type="email"
                placeholder={t.emailPlaceholder}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              />
              <button className={`px-4 py-2 ${themeColors.primary} text-white rounded-r-md hover:opacity-90 transition-opacity`}>
                {t.subscribe}
              </button>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <span className="text-gray-300">{t.address}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <span className="text-gray-300">{t.phone}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <span className="text-gray-300">{t.email}</span>
            </div>
          </div>
        </div>

        {/* Social Media & Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <span className="text-gray-300">{t.copyright}</span>
            <Heart className="w-4 h-4 text-red-500" />
            <span className="text-gray-300">{t.allRightsReserved}</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-gray-300 mr-2">{t.followUs}:</span>
            <a href="#" className={`text-gray-400 ${themeColors.hover} transition-colors`}>
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className={`text-gray-400 ${themeColors.hover} transition-colors`}>
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className={`text-gray-400 ${themeColors.hover} transition-colors`}>
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}