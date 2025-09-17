import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  BarChart3,
  Settings,
  Gift,
  LogOut,
  X,
  Shield
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { db, auth } from '../lib/supabase';
import { Product, User, Order, Category } from '../types';
import { Button } from '../components/ui/Button';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import { ImageUpload } from '../components/ui/ImageUpload';

const AdminPage: React.FC = () => {
  const { user, language, isAdmin } = useStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  
  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Form states
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Form data
  const [productForm, setProductForm] = useState({
    name: '',
    name_fr: '',
    description: '',
    description_fr: '',
    price: '',
    category_id: '',
    image_url: '',
    stock: '',
    active: true
  });
  
  const [categoryForm, setCategoryForm] = useState({
    id: '',
    name: '',
    name_fr: '',
    description: '',
    description_fr: ''
  });
  
  const [userForm, setUserForm] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    is_admin: false
  });

  // App settings
  const [appSettings, setAppSettings] = useState({
    siteName: 'CameroonMart',
    currency: 'FCFA',
    taxRate: 0,
    shippingFee: 0,
    freeShippingThreshold: 50000,
    maintenanceMode: false,
    allowGuestCheckout: true,
    maxCartItems: 50,
    sessionTimeout: 30,
    enableReviews: true,
    enableWishlist: true,
    enableNotifications: true,
    enableEmailMarketing: false,
    maxFileSize: 5,
    allowedImageTypes: 'jpg,jpeg,png,webp',
    autoApproveReviews: false,
    requireEmailVerification: false,
    enableTwoFactor: false,
    backupFrequency: 'daily',
    logLevel: 'info',
    enableAnalytics: true,
    enableSearchSuggestions: true,
    enableProductRecommendations: true,
    enableInventoryTracking: true,
    enableLowStockAlerts: true,
    lowStockThreshold: 10,
    enableOrderTracking: true,
    enableCustomerSupport: true,
    supportEmail: 'support@cameroonmart.com',
    enableBulkOperations: true,
    enableDataExport: true,
    enableAuditLog: true,
    enableSSL: true,
    enableCDN: false,
    enableCaching: true,
    cacheExpiry: 3600,
    enableRateLimiting: true,
    maxRequestsPerMinute: 100,
    enableIPBlocking: false,
    blockedIPs: '',
    enableGeoBlocking: false,
    blockedCountries: '',
    enableFraudDetection: false,
    enableCompressionEngine: true,
    enableLazyLoading: true
  });

  // Stats
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeProducts: 0,
    pendingOrders: 0,
  });

  const translations = {
    en: {
      adminDashboard: 'Admin Dashboard',
      dashboard: 'Dashboard',
      products: 'Products',
      users: 'Users',
      orders: 'Orders',
      categories: 'Categories',
      settings: 'Settings',
      totalProducts: 'Total Products',
      totalUsers: 'Total Users',
      totalOrders: 'Total Orders',
      totalRevenue: 'Total Revenue',
      activeProducts: 'Active Products',
      pendingOrders: 'Pending Orders',
      addProduct: 'Add Product',
      addCategory: 'Add Category',
      editProduct: 'Edit Product',
      editCategory: 'Edit Category',
      deleteProduct: 'Delete Product',
      name: 'Name',
      nameFr: 'Name (French)',
      description: 'Description',
      descriptionFr: 'Description (French)',
      email: 'Email',
      price: 'Price',
      stock: 'Stock',
      status: 'Status',
      actions: 'Actions',
      active: 'Active',
      inactive: 'Inactive',
      edit: 'Edit',
      delete: 'Delete',
      view: 'View',
      save: 'Save',
      cancel: 'Cancel',
      category: 'Category',
      imageUrl: 'Image URL',
      accessDenied: 'Access Denied',
      adminOnly: 'This page is only accessible to administrators.',
      loading: 'Loading...',
      noData: 'No data available',
      logout: 'Logout',
      themeSettings: 'Theme Settings',
      chooseTheme: 'Choose App Theme',
      confirmDelete: 'Are you sure you want to delete this item?',
      itemAdded: 'Item added successfully!',
      itemUpdated: 'Item updated successfully!',
      itemDeleted: 'Item deleted successfully!',
      addUser: 'Add User',
      editUser: 'Edit User',
      deleteUser: 'Delete User',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      isAdmin: 'Is Admin',
      fullName: 'Full Name',
      phone: 'Phone',
      appSettings: 'App Settings',
      siteName: 'Site Name',
      currency: 'Currency',
      taxRate: 'Tax Rate (%)',
      shippingFee: 'Shipping Fee',
      freeShippingThreshold: 'Free Shipping Threshold',
      maintenanceMode: 'Maintenance Mode',
      allowGuestCheckout: 'Allow Guest Checkout',
      maxCartItems: 'Max Cart Items',
      sessionTimeout: 'Session Timeout (minutes)',
      saveSettings: 'Save Settings',
      userManagement: 'User Management',
      systemSettings: 'System Settings',
    },
    fr: {
      adminDashboard: 'Tableau de Bord Admin',
      dashboard: 'Tableau de Bord',
      products: 'Produits',
      users: 'Utilisateurs',
      orders: 'Commandes',
      categories: 'Catégories',
      settings: 'Paramètres',
      totalProducts: 'Total Produits',
      totalUsers: 'Total Utilisateurs',
      totalOrders: 'Total Commandes',
      totalRevenue: 'Chiffre d\'Affaires Total',
      activeProducts: 'Produits Actifs',
      pendingOrders: 'Commandes en Attente',
      addProduct: 'Ajouter Produit',
      addCategory: 'Ajouter Catégorie',
      editProduct: 'Modifier Produit',
      editCategory: 'Modifier Catégorie',
      deleteProduct: 'Supprimer Produit',
      name: 'Nom',
      nameFr: 'Nom (Français)',
      description: 'Description',
      descriptionFr: 'Description (Français)',
      email: 'E-mail',
      price: 'Prix',
      stock: 'Stock',
      status: 'Statut',
      actions: 'Actions',
      active: 'Actif',
      inactive: 'Inactif',
      edit: 'Modifier',
      delete: 'Supprimer',
      view: 'Voir',
      save: 'Enregistrer',
      cancel: 'Annuler',
      category: 'Catégorie',
      imageUrl: 'URL de l\'image',
      accessDenied: 'Accès Refusé',
      adminOnly: 'Cette page n\'est accessible qu\'aux administrateurs.',
      loading: 'Chargement...',
      noData: 'Aucune donnée disponible',
      logout: 'Déconnexion',
      themeSettings: 'Paramètres du Thème',
      chooseTheme: 'Choisir le Thème de l\'App',
      confirmDelete: 'Êtes-vous sûr de vouloir supprimer cet élément?',
      itemAdded: 'Élément ajouté avec succès!',
      itemUpdated: 'Élément mis à jour avec succès!',
      itemDeleted: 'Élément supprimé avec succès!',
      addUser: 'Ajouter Utilisateur',
      editUser: 'Modifier Utilisateur',
      deleteUser: 'Supprimer Utilisateur',
      password: 'Mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
      isAdmin: 'Est Admin',
      fullName: 'Nom complet',
      phone: 'Téléphone',
      appSettings: 'Paramètres de l\'application',
      siteName: 'Nom du site',
      currency: 'Devise',
      taxRate: 'Taux de taxe (%)',
      shippingFee: 'Frais de livraison',
      freeShippingThreshold: 'Seuil de livraison gratuite',
      maintenanceMode: 'Mode maintenance',
      allowGuestCheckout: 'Autoriser la commande invité',
      maxCartItems: 'Articles max. dans le panier',
      sessionTimeout: 'Expiration de session (minutes)',
      saveSettings: 'Enregistrer les paramètres',
      userManagement: 'Gestion des utilisateurs',
      systemSettings: 'Paramètres système',
    }
  };

  const t = translations[language];


  useEffect(() => {
    if (!isAdmin()) {
      navigate('/');
      return;
    }
    loadAdminData();
  }, [isAdmin, navigate]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      const [productsRes, usersRes, ordersRes, categoriesRes] = await Promise.all([
        db.getAllProducts(),
        db.getAllUsers(),
        db.getAllOrders(),
        db.getCategories(),
      ]);

      if (productsRes.data) setProducts(productsRes.data);
      if (usersRes.data) setUsers(usersRes.data);
      if (ordersRes.data) setOrders(ordersRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data);

      // Calculate stats
      const totalProducts = productsRes.data?.length || 0;
      const totalUsers = usersRes.data?.length || 0;
      const totalOrders = ordersRes.data?.length || 0;
      const totalRevenue = ordersRes.data?.reduce((sum, order) => sum + order.total, 0) || 0;
      const activeProducts = productsRes.data?.filter(p => p.active).length || 0;
      const pendingOrders = ordersRes.data?.filter(o => o.status === 'processing').length || 0;

      setStats({
        totalProducts,
        totalUsers,
        totalOrders,
        totalRevenue,
        activeProducts,
        pendingOrders,
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!productForm.name.trim()) {
      alert('Product name is required');
      return;
    }
    
    if (!productForm.price || parseInt(productForm.price) <= 0) {
      alert('Valid price is required');
      return;
    }
    
    if (!productForm.stock || parseInt(productForm.stock) < 0) {
      alert('Valid stock quantity is required');
      return;
    }
    
    if (!productForm.category_id) {
      alert('Product category is required');
      return;
    }
    
    try {
      const productData = {
        ...productForm,
        name_fr: productForm.name_fr || productForm.name,
        description_fr: productForm.description_fr || productForm.description,
        price: parseInt(productForm.price),
        stock: parseInt(productForm.stock),
        id: editingProduct ? editingProduct.id : `prod_${Date.now()}`
      };
      
      let result;
      if (editingProduct) {
        result = await db.updateProduct(editingProduct.id, productData);
        alert(t.itemUpdated);
      } else {
        result = await db.createProduct(productData);
        alert(t.itemAdded);
      }
      
      if (result.error) {
        throw new Error(result.error.message || 'Failed to save product');
      }
      
      setShowAddProduct(false);
      setEditingProduct(null);
      setProductForm({
        name: '',
        name_fr: '',
        description: '',
        description_fr: '',
        price: '',
        category_id: '',
        image_url: '',
        stock: '',
        active: true
      });
      loadAdminData();
    } catch (error) {
      console.error('Error saving product:', error);
      alert(error instanceof Error ? error.message : 'Error saving product');
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const categoryData = {
        ...categoryForm,
        id: categoryForm.id || `cat_${Date.now()}`,
        name_fr: categoryForm.name_fr || categoryForm.name,
        description_fr: categoryForm.description_fr || categoryForm.description
      };
      
      if (editingCategory) {
        await db.updateCategory(editingCategory.id, categoryData);
        alert(t.itemUpdated);
      } else {
        await db.createCategory(categoryData);
        alert(t.itemAdded);
      }
      
      setShowAddCategory(false);
      setEditingCategory(null);
      setCategoryForm({
        id: '',
        name: '',
        name_fr: '',
        description: '',
        description_fr: ''
      });
      loadAdminData();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Error saving category');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm(t.confirmDelete)) {
      try {
        await db.deleteProduct(productId);
        alert(t.itemDeleted);
        loadAdminData();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm(t.confirmDelete)) {
      try {
        await db.deleteCategory(categoryId);
        alert(t.itemDeleted);
        loadAdminData();
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const handleToggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      await db.updateProduct(productId, { active: !currentStatus });
      loadAdminData();
    } catch (error) {
      console.error('Error updating product status:', error);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await db.updateOrderStatus(orderId, newStatus);
      loadAdminData();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Update existing user
        await db.updateUser(editingUser.id, {
          email: userForm.email,
          full_name: userForm.full_name,
          phone: userForm.phone,
          is_admin: userForm.is_admin
        });
        alert(t.itemUpdated);
      } else {
        // Create new user
        await db.createUser({
          email: userForm.email,
          password: userForm.password,
          full_name: userForm.full_name,
          phone: userForm.phone,
          is_admin: userForm.is_admin
        });
        alert(t.itemAdded);
      }
      
      setShowAddUser(false);
      setEditingUser(null);
      setUserForm({
        email: '',
        password: '',
        full_name: '',
        phone: '',
        is_admin: false
      });
      loadAdminData();
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Error saving user');
    }
  };

  // Edit functions
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      name_fr: product.name_fr || product.name,
      description: product.description,
      description_fr: product.description_fr || product.description,
      price: product.price.toString(),
      category_id: product.category_id || '',
      image_url: product.image_url || '',
      stock: product.stock.toString(),
      active: product.active
    });
    setShowAddProduct(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      id: category.id,
      name: category.name,
      name_fr: category.name_fr || category.name,
      description: category.description || '',
      description_fr: category.description_fr || category.description || ''
    });
    setShowAddCategory(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({
      email: user.email,
      password: '',
      full_name: user.full_name || '',
      phone: user.phone || '',
      is_admin: user.is_admin || false
    });
    setShowAddUser(true);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // In a real app, you'd save these to database
      localStorage.setItem('appSettings', JSON.stringify(appSettings));
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    }
  };

  if (!isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">{t.accessDenied}</h1>
          <p className="text-gray-600 mb-4">{t.adminOnly}</p>
          <Button onClick={() => navigate('/')}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingScreen />;
  }

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-2 rounded ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Admin Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">{t.adminDashboard}</h1>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">View:</span>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded text-sm ${
                  viewMode === 'table' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded text-sm ${
                  viewMode === 'grid' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                Grid
              </button>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t.logout}
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6 sm:mb-8">
          <nav className="flex flex-wrap gap-2 sm:gap-4">
            {[
              { id: 'dashboard', label: t.dashboard, icon: BarChart3 },
              { id: 'products', label: t.products, icon: Package },
              { id: 'categories', label: t.categories, icon: Gift },
              { id: 'users', label: t.users, icon: Users },
              { id: 'orders', label: t.orders, icon: ShoppingCart },
              { id: 'settings', label: t.themeSettings, icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                  activeTab === tab.id
                    ? 'bg-green-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard
                title={t.totalProducts}
                value={stats.totalProducts}
                icon={Package}
                color="bg-blue-500"
              />
              <StatCard
                title={t.totalUsers}
                value={stats.totalUsers}
                icon={Users}
                color="bg-green-500"
              />
              <StatCard
                title={t.totalOrders}
                value={stats.totalOrders}
                icon={ShoppingCart}
                color="bg-purple-500"
              />
              <StatCard
                title={t.totalRevenue}
                value={`${stats.totalRevenue.toLocaleString()} FCFA`}
                icon={TrendingUp}
                color="bg-yellow-500"
              />
              <StatCard
                title={t.activeProducts}
                value={stats.activeProducts}
                icon={Eye}
                color="bg-indigo-500"
              />
              <StatCard
                title={t.pendingOrders}
                value={stats.pendingOrders}
                icon={Package}
                color="bg-red-500"
              />
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order.id.slice(-8).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.user_email || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.total.toLocaleString()} FCFA
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'dispatched' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">{t.products}</h2>
              <Button 
                onClick={() => setShowAddProduct(true)}
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addProduct}</span>
              </Button>
            </div>

            {/* Add Product Modal */}
            {showAddProduct && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                  <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowAddProduct(false)} />
                  <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold">{editingProduct ? t.editProduct : t.addProduct}</h3>
                      <button onClick={() => {
                        setShowAddProduct(false);
                        setEditingProduct(null);
                      }}>
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <form onSubmit={handleAddProduct} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t.name}</label>
                          <input
                            type="text"
                            value={productForm.name}
                            onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t.nameFr}</label>
                          <input
                            type="text"
                            value={productForm.name_fr}
                            onChange={(e) => setProductForm({...productForm, name_fr: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t.description}</label>
                          <textarea
                            value={productForm.description}
                            onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            rows={3}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t.descriptionFr}</label>
                          <textarea
                            value={productForm.description_fr}
                            onChange={(e) => setProductForm({...productForm, description_fr: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            rows={3}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t.price}</label>
                          <input
                            type="number"
                            value={productForm.price}
                            onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t.stock}</label>
                          <input
                            type="number"
                            value={productForm.stock}
                            onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t.category}</label>
                          <select
                            value={productForm.category_id}
                            onChange={(e) => setProductForm({...productForm, category_id: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            required
                          >
                            <option value="">Select Category</option>
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>
                                {language === 'en' ? cat.name : cat.name_fr}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                        <ImageUpload
                          value={productForm.image_url}
                          onChange={(url) => setProductForm({...productForm, image_url: url})}
                          onRemove={() => setProductForm({...productForm, image_url: ''})}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Upload an image or paste a URL. Recommended size: 400x400px
                        </p>
                      </div>
                      
                      <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setShowAddProduct(false)}>
                          {t.cancel}
                        </Button>
                        <Button type="submit">
                          {t.save}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Products Display */}
            {viewMode === 'table' ? (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.name}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.price}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.stock}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.status}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              className="h-12 w-12 rounded-lg object-cover"
                              src={product.image_url}
                              alt={product.name}
                            />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500">{product.category?.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.price.toLocaleString()} FCFA
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.stock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleProductStatus(product.id, product.active)}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              product.active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {product.active ? (
                              <>
                                <Eye className="w-3 h-3 mr-1" />
                                {t.active}
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3 h-3 mr-1" />
                                {t.inactive}
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleEditProduct(product)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Edit Product"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <div key={product.id} className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <img
                        className="h-12 w-12 rounded object-cover"
                        src={product.image_url}
                        alt={product.name}
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-500">{product.category?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-green-600">
                        {product.price.toLocaleString()} FCFA
                      </span>
                      <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleToggleProductStatus(product.id, product.active)}
                        className={`px-2 py-1 rounded text-xs ${
                          product.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.active ? 'Active' : 'Inactive'}
                      </button>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditProduct(product)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">{t.categories}</h2>
              <Button 
                onClick={() => setShowAddCategory(true)}
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addCategory}</span>
              </Button>
            </div>

            {/* Add Category Modal */}
            {showAddCategory && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                  <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowAddCategory(false)} />
                  <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold">{editingCategory ? t.editCategory : t.addCategory}</h3>
                      <button onClick={() => {
                        setShowAddCategory(false);
                        setEditingCategory(null);
                      }}>
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <form onSubmit={handleAddCategory} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category ID</label>
                        <input
                          type="text"
                          value={categoryForm.id}
                          onChange={(e) => setCategoryForm({...categoryForm, id: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          placeholder="electronics"
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t.name}</label>
                          <input
                            type="text"
                            value={categoryForm.name}
                            onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t.nameFr}</label>
                          <input
                            type="text"
                            value={categoryForm.name_fr}
                            onChange={(e) => setCategoryForm({...categoryForm, name_fr: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t.description}</label>
                          <textarea
                            value={categoryForm.description}
                            onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            rows={3}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t.descriptionFr}</label>
                          <textarea
                            value={categoryForm.description_fr}
                            onChange={(e) => setCategoryForm({...categoryForm, description_fr: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            rows={3}
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setShowAddCategory(false)}>
                          {t.cancel}
                        </Button>
                        <Button type="submit">
                          {t.save}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <div key={category.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {language === 'en' ? category.name : category.name_fr}
                    </h3>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditCategory(category)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit Category"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {language === 'en' ? category.description : category.description_fr}
                  </p>
                  <div className="mt-4 text-xs text-gray-500">
                    ID: {category.id}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">{t.userManagement}</h2>
              <Button 
                onClick={() => setShowAddUser(true)}
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addUser}</span>
              </Button>
            </div>

            {/* Add User Modal */}
            {showAddUser && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                  <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowAddUser(false)} />
                  <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold">{editingUser ? t.editUser : t.addUser}</h3>
                      <button onClick={() => {
                        setShowAddUser(false);
                        setEditingUser(null);
                      }}>
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <form onSubmit={handleAddUser} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.email}</label>
                        <input
                          type="email"
                          value={userForm.email}
                          onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.password}</label>
                        <input
                          type="password"
                          value={userForm.password}
                          onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          required
                          minLength={6}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.fullName}</label>
                        <input
                          type="text"
                          value={userForm.full_name}
                          onChange={(e) => setUserForm({...userForm, full_name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.phone}</label>
                        <input
                          type="tel"
                          value={userForm.phone}
                          onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isAdmin"
                          checked={userForm.is_admin}
                          onChange={(e) => setUserForm({...userForm, is_admin: e.target.checked})}
                          className="mr-2"
                        />
                        <label htmlFor="isAdmin" className="text-sm font-medium text-gray-700">{t.isAdmin}</label>
                      </div>
                      
                      <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setShowAddUser(false)}>
                          {t.cancel}
                        </Button>
                        <Button type="submit">
                          {t.save}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.email}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            user.is_admin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.is_admin ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.total_orders || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleEditUser(user)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Edit User"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900" title="View User">
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">{t.orders}</h2>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order.id.slice(-8).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.user_email || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.total.toLocaleString()} FCFA
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            className="text-xs font-medium rounded-full px-2 py-1 border-0 bg-gray-100"
                          >
                            <option value="processing">Processing</option>
                            <option value="dispatched">Dispatched</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-indigo-600 hover:text-indigo-900">
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">{t.systemSettings}</h2>
            
            {/* Basic Settings */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Settings className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-semibold text-gray-900">Basic Settings</h3>
              </div>
              
              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.siteName}</label>
                    <input
                      type="text"
                      value={appSettings.siteName}
                      onChange={(e) => setAppSettings({...appSettings, siteName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.currency}</label>
                    <input
                      type="text"
                      value={appSettings.currency}
                      onChange={(e) => setAppSettings({...appSettings, currency: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.taxRate}</label>
                    <input
                      type="number"
                      step="0.01"
                      value={appSettings.taxRate}
                      onChange={(e) => setAppSettings({...appSettings, taxRate: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.shippingFee}</label>
                    <input
                      type="number"
                      value={appSettings.shippingFee}
                      onChange={(e) => setAppSettings({...appSettings, shippingFee: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.freeShippingThreshold}</label>
                    <input
                      type="number"
                      value={appSettings.freeShippingThreshold}
                      onChange={(e) => setAppSettings({...appSettings, freeShippingThreshold: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.maxCartItems}</label>
                    <input
                      type="number"
                      value={appSettings.maxCartItems}
                      onChange={(e) => setAppSettings({...appSettings, maxCartItems: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="maintenanceMode"
                      checked={appSettings.maintenanceMode}
                      onChange={(e) => setAppSettings({...appSettings, maintenanceMode: e.target.checked})}
                      className="mr-3"
                    />
                    <label htmlFor="maintenanceMode" className="text-sm font-medium text-gray-700">{t.maintenanceMode}</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="allowGuestCheckout"
                      checked={appSettings.allowGuestCheckout}
                      onChange={(e) => setAppSettings({...appSettings, allowGuestCheckout: e.target.checked})}
                      className="mr-3"
                    />
                    <label htmlFor="allowGuestCheckout" className="text-sm font-medium text-gray-700">{t.allowGuestCheckout}</label>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button type="submit" className="w-full md:w-auto">
                    {t.saveSettings}
                  </Button>
                </div>
              </form>
            </div>

            {/* Feature Settings */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center space-x-3 mb-4">
                <Settings className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Feature Settings</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableAnalytics"
                      checked={appSettings.enableAnalytics}
                      onChange={(e) => setAppSettings({...appSettings, enableAnalytics: e.target.checked})}
                      className="mr-3"
                    />
                    <label htmlFor="enableAnalytics" className="text-sm text-gray-700">Enable Analytics</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableSearchSuggestions"
                      checked={appSettings.enableSearchSuggestions}
                      onChange={(e) => setAppSettings({...appSettings, enableSearchSuggestions: e.target.checked})}
                      className="mr-3"
                    />
                    <label htmlFor="enableSearchSuggestions" className="text-sm text-gray-700">Search Suggestions</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableProductRecommendations"
                      checked={appSettings.enableProductRecommendations}
                      onChange={(e) => setAppSettings({...appSettings, enableProductRecommendations: e.target.checked})}
                      className="mr-3"
                    />
                    <label htmlFor="enableProductRecommendations" className="text-sm text-gray-700">Product Recommendations</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableInventoryTracking"
                      checked={appSettings.enableInventoryTracking}
                      onChange={(e) => setAppSettings({...appSettings, enableInventoryTracking: e.target.checked})}
                      className="mr-3"
                    />
                    <label htmlFor="enableInventoryTracking" className="text-sm text-gray-700">Inventory Tracking</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableLowStockAlerts"
                      checked={appSettings.enableLowStockAlerts}
                      onChange={(e) => setAppSettings({...appSettings, enableLowStockAlerts: e.target.checked})}
                      className="mr-3"
                    />
                    <label htmlFor="enableLowStockAlerts" className="text-sm text-gray-700">Low Stock Alerts</label>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableOrderTracking"
                      checked={appSettings.enableOrderTracking}
                      onChange={(e) => setAppSettings({...appSettings, enableOrderTracking: e.target.checked})}
                      className="mr-3"
                    />
                    <label htmlFor="enableOrderTracking" className="text-sm text-gray-700">Order Tracking</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableCustomerSupport"
                      checked={appSettings.enableCustomerSupport}
                      onChange={(e) => setAppSettings({...appSettings, enableCustomerSupport: e.target.checked})}
                      className="mr-3"
                    />
                    <label htmlFor="enableCustomerSupport" className="text-sm text-gray-700">Customer Support</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableBulkOperations"
                      checked={appSettings.enableBulkOperations}
                      onChange={(e) => setAppSettings({...appSettings, enableBulkOperations: e.target.checked})}
                      className="mr-3"
                    />
                    <label htmlFor="enableBulkOperations" className="text-sm text-gray-700">Bulk Operations</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableDataExport"
                      checked={appSettings.enableDataExport}
                      onChange={(e) => setAppSettings({...appSettings, enableDataExport: e.target.checked})}
                      className="mr-3"
                    />
                    <label htmlFor="enableDataExport" className="text-sm text-gray-700">Data Export</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableAuditLog"
                      checked={appSettings.enableAuditLog}
                      onChange={(e) => setAppSettings({...appSettings, enableAuditLog: e.target.checked})}
                      className="mr-3"
                    />
                    <label htmlFor="enableAuditLog" className="text-sm text-gray-700">Audit Log</label>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableSSL"
                      checked={appSettings.enableSSL}
                      onChange={(e) => setAppSettings({...appSettings, enableSSL: e.target.checked})}
                      className="mr-3"
                    />
                    <label htmlFor="enableSSL" className="text-sm text-gray-700">Enable SSL</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableRateLimiting"
                      checked={appSettings.enableRateLimiting}
                      onChange={(e) => setAppSettings({...appSettings, enableRateLimiting: e.target.checked})}
                      className="mr-3"
                    />
                    <label htmlFor="enableRateLimiting" className="text-sm text-gray-700">Rate Limiting</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableIPBlocking"
                      checked={appSettings.enableIPBlocking}
                      onChange={(e) => setAppSettings({...appSettings, enableIPBlocking: e.target.checked})}
                      className="mr-3"
                    />
                    <label htmlFor="enableIPBlocking" className="text-sm text-gray-700">IP Blocking</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableGeoBlocking"
                      checked={appSettings.enableGeoBlocking}
                      onChange={(e) => setAppSettings({...appSettings, enableGeoBlocking: e.target.checked})}
                      className="mr-3"
                    />
                    <label htmlFor="enableGeoBlocking" className="text-sm text-gray-700">Geo Blocking</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableFraudDetection"
                      checked={appSettings.enableFraudDetection}
                      onChange={(e) => setAppSettings({...appSettings, enableFraudDetection: e.target.checked})}
                      className="mr-3"
                    />
                    <label htmlFor="enableFraudDetection" className="text-sm text-gray-700">Fraud Detection</label>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Requests/Minute</label>
                    <input
                      type="number"
                      value={appSettings.maxRequestsPerMinute}
                      onChange={(e) => setAppSettings({...appSettings, maxRequestsPerMinute: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Blocked IPs</label>
                    <textarea
                      value={appSettings.blockedIPs}
                      onChange={(e) => setAppSettings({...appSettings, blockedIPs: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      rows={2}
                      placeholder="192.168.1.1, 10.0.0.1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Blocked Countries</label>
                    <input
                      type="text"
                      value={appSettings.blockedCountries}
                      onChange={(e) => setAppSettings({...appSettings, blockedCountries: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      placeholder="US, CN, RU"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Settings */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center space-x-3 mb-4">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Performance Settings</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableCaching"
                      checked={appSettings.enableCaching}
                      onChange={(e) => setAppSettings({...appSettings, enableCaching: e.target.checked})}
                      className="mr-3"
                    />
                    <label htmlFor="enableCaching" className="text-sm text-gray-700">Enable Caching</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableCDN"
                      checked={appSettings.enableCDN}
                      onChange={(e) => setAppSettings({...appSettings, enableCDN: e.target.checked})}
                      className="mr-3"
                    />
                    <label htmlFor="enableCDN" className="text-sm text-gray-700">Enable CDN</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableCompression"
                      checked={appSettings.enableCompressionEngine}
                      onChange={(e) => setAppSettings({...appSettings, enableCompressionEngine: e.target.checked})}
                      className="mr-3"
                    />
                    <label htmlFor="enableCompression" className="text-sm text-gray-700">Enable Compression</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableLazyLoading"
                      checked={appSettings.enableLazyLoading}
                      onChange={(e) => setAppSettings({...appSettings, enableLazyLoading: e.target.checked})}
                      className="mr-3"
                    />
                    <label htmlFor="enableLazyLoading" className="text-sm text-gray-700">Lazy Loading</label>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cache Expiry (seconds)</label>
                    <input
                      type="number"
                      value={appSettings.cacheExpiry}
                      onChange={(e) => setAppSettings({...appSettings, cacheExpiry: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Threshold</label>
                    <input
                      type="number"
                      value={appSettings.lowStockThreshold}
                      onChange={(e) => setAppSettings({...appSettings, lowStockThreshold: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
                    <input
                      type="email"
                      value={appSettings.supportEmail}
                      onChange={(e) => setAppSettings({...appSettings, supportEmail: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center space-x-3 mb-4">
                <Settings className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Advanced Settings</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max File Size (MB)</label>
                  <input
                    type="number"
                    value={appSettings.maxFileSize}
                    onChange={(e) => setAppSettings({...appSettings, maxFileSize: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Allowed Image Types</label>
                  <input
                    type="text"
                    value={appSettings.allowedImageTypes}
                    onChange={(e) => setAppSettings({...appSettings, allowedImageTypes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="jpg,jpeg,png,webp"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
                  <select
                    value={appSettings.backupFrequency}
                    onChange={(e) => setAppSettings({...appSettings, backupFrequency: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Log Level</label>
                  <select
                    value={appSettings.logLevel}
                    onChange={(e) => setAppSettings({...appSettings, logLevel: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="error">Error</option>
                    <option value="warn">Warning</option>
                    <option value="info">Info</option>
                    <option value="debug">Debug</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableReviews"
                    checked={appSettings.enableReviews}
                    onChange={(e) => setAppSettings({...appSettings, enableReviews: e.target.checked})}
                    className="mr-3"
                  />
                  <label htmlFor="enableReviews" className="text-sm font-medium text-gray-700">Enable Product Reviews</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableWishlist"
                    checked={appSettings.enableWishlist}
                    onChange={(e) => setAppSettings({...appSettings, enableWishlist: e.target.checked})}
                    className="mr-3"
                  />
                  <label htmlFor="enableWishlist" className="text-sm font-medium text-gray-700">Enable Wishlist</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableNotifications"
                    checked={appSettings.enableNotifications}
                    onChange={(e) => setAppSettings({...appSettings, enableNotifications: e.target.checked})}
                    className="mr-3"
                  />
                  <label htmlFor="enableNotifications" className="text-sm font-medium text-gray-700">Enable Notifications</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableEmailMarketing"
                    checked={appSettings.enableEmailMarketing}
                    onChange={(e) => setAppSettings({...appSettings, enableEmailMarketing: e.target.checked})}
                    className="mr-3"
                  />
                  <label htmlFor="enableEmailMarketing" className="text-sm font-medium text-gray-700">Enable Email Marketing</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="autoApproveReviews"
                    checked={appSettings.autoApproveReviews}
                    onChange={(e) => setAppSettings({...appSettings, autoApproveReviews: e.target.checked})}
                    className="mr-3"
                  />
                  <label htmlFor="autoApproveReviews" className="text-sm font-medium text-gray-700">Auto-approve Reviews</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requireEmailVerification"
                    checked={appSettings.requireEmailVerification}
                    onChange={(e) => setAppSettings({...appSettings, requireEmailVerification: e.target.checked})}
                    className="mr-3"
                  />
                  <label htmlFor="requireEmailVerification" className="text-sm font-medium text-gray-700">Require Email Verification</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableTwoFactor"
                    checked={appSettings.enableTwoFactor}
                    onChange={(e) => setAppSettings({...appSettings, enableTwoFactor: e.target.checked})}
                    className="mr-3"
                  />
                  <label htmlFor="enableTwoFactor" className="text-sm font-medium text-gray-700">Enable Two-Factor Authentication</label>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;