import { useState } from 'react';
import { ShoppingCart, Eye } from 'lucide-react';
import { Button } from './Button';
import { useStore } from '../../store/useStore';
import type { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
}

export function ProductCard({ product, onViewDetails }: ProductCardProps) {
  const { language, addToCart } = useStore();
  const [isLoading, setIsLoading] = useState(false);

  const name = language === 'en' ? product.name : product.name_fr;
  const description = language === 'en' ? product.description : product.description_fr;

  const handleAddToCart = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate loading
    addToCart(product);
    setIsLoading(false);
  };

  const translations = {
    en: {
      addToCart: 'Add to Cart',
      viewDetails: 'View Details',
      outOfStock: 'Out of Stock',
      stock: 'In Stock',
    },
    fr: {
      addToCart: 'Ajouter au Panier',
      viewDetails: 'Voir Détails',
      outOfStock: 'Rupture de Stock',
      stock: 'En Stock',
    }
  };

  const t = translations[language];

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group transform hover:-translate-y-2 relative">
      {(typeof product.discount_percentage === 'number' && product.discount_percentage > 0) && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
            -{product.discount_percentage}%
          </div>
        </div>
      )}
      {/* Product Image */}
      <div className="relative h-48 bg-gradient-to-b from-gray-50 to-gray-100 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent z-0" />
        <img
          src={product.image_url}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 relative z-10"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.src = 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?w=400&h=400&fit=crop';
          }}
        />
        
        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
          <div className="transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onViewDetails(product)}
              className="mr-2 bg-white text-gray-900 hover:bg-gray-100 shadow-lg"
            >
              <Eye className="w-4 h-4 mr-1" />
              {t.viewDetails}
            </Button>
          </div>
        </div>

        {/* Stock Badge */}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            product.stock > 0 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {product.stock > 0 ? t.stock : t.outOfStock}
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-6">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {description}
        </p>

        <div className="flex items-center justify-between mt-4">
          <div>
            <span className="text-lg font-bold text-blue-600">
              {product.price.toLocaleString()} FCFA
            </span>
            {product.category && (
              <p className="text-xs text-gray-500">
                {language === 'en' ? product.category.name : product.category.name_fr}
              </p>
            )}
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            loading={isLoading}
            className="flex items-center space-x-1 shadow-md hover:shadow-lg"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">{t.addToCart}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}