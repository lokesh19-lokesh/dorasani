import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Layers,
  Tag,
  Image as ImageIcon,
  FileDown,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Truck,
  RotateCcw,
  Sparkles,
  TrendingUp,
  DollarSign,
  Users,
  Eye,
  Trash2,
  Edit,
  X,
  ExternalLink
} from 'lucide-react';
import { adminService, type AdminProductInput } from '../../services/adminService';
import { authService } from '../../services/authService';
import { useStore } from '../../context/StoreContext';

type AdminTab = 'overview' | 'products' | 'orders' | 'inventory' | 'categories' | 'coupons' | 'cms' | 'reports';

export const AdminDashboardPage: React.FC = () => {
  const { showToast } = useStore();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState<boolean>(true);

  // Metrics
  const [metrics, setMetrics] = useState<any>({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    activeProducts: 0,
    outOfStockProducts: 0,
    pendingOrders: 0,
    processingOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    recentOrders: []
  });

  // Products
  const [products, setProducts] = useState<any[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<AdminProductInput>({
    title: '',
    slug: '',
    price_inr: 2999,
    mrp_inr: 4999,
    description: '',
    fabric: 'Pure Mulberry Silk',
    occasion: 'Wedding & Festive',
    product_type: 'saree',
    stock_quantity: 25,
    images: ['/assets/products/kanjivaram_silk_saree.jpg']
  });

  // Orders
  const [orders, setOrders] = useState<any[]>([]);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Categories & Coupons
  const [categories, setCategories] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);

  // Load Admin Data
  const loadData = async () => {
    setLoading(true);
    try {
      const [m, pRes, oRes, cList, coupList, bList] = await Promise.all([
        adminService.getDashboardMetrics(),
        adminService.getProducts(1, 100),
        adminService.getOrders(1, 100),
        adminService.getCategories(),
        adminService.getCoupons(),
        adminService.getBanners()
      ]);

      setMetrics(m);
      setProducts(pRes.products);
      setOrders(oRes.orders);
      setCategories(cList);
      setCoupons(coupList);
      setBanners(bList);
    } catch (err: any) {
      console.error('Error loading admin data:', err);
      showToast('Error loading live admin data: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Add Product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.title || !newProduct.slug || !newProduct.price_inr) {
      showToast('Please fill all required fields.', 'error');
      return;
    }

    try {
      await adminService.createProduct(newProduct);
      showToast(`Product "${newProduct.title}" created successfully!`);
      setIsProductModalOpen(false);
      setNewProduct({
        title: '',
        slug: '',
        price_inr: 2999,
        mrp_inr: 4999,
        description: '',
        fabric: 'Pure Mulberry Silk',
        occasion: 'Wedding & Festive',
        product_type: 'saree',
        stock_quantity: 25,
        images: ['/assets/products/kanjivaram_silk_saree.jpg']
      });
      loadData();
    } catch (err: any) {
      showToast('Failed to create product: ' + err.message, 'error');
    }
  };

  // Handle Order Status Update
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await adminService.updateOrderStatus(orderId, status);
      showToast(`Order status updated to ${status}.`);
      loadData();
    } catch (err: any) {
      showToast('Failed to update status: ' + err.message, 'error');
    }
  };

  // Handle Stock Adjustment
  const handleAdjustStock = async (productId: string, delta: number) => {
    try {
      await adminService.adjustStock(productId, delta, delta > 0 ? 'restock' : 'manual_adjustment');
      showToast(`Stock updated by ${delta > 0 ? '+' : ''}${delta}.`);
      loadData();
    } catch (err: any) {
      showToast('Failed to adjust stock: ' + err.message, 'error');
    }
  };

  // Export CSV Helper
  const exportToCSV = (filename: string, rows: object[]) => {
    if (!rows || !rows.length) {
      showToast('No records to export.', 'info');
      return;
    }
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) +
      '\n' +
      rows
        .map((row: any) =>
          keys
            .map((k) => {
              let cell = row[k] === null || row[k] === undefined ? '' : row[k];
              cell = typeof cell === 'object' ? JSON.stringify(cell).replace(/"/g, '""') : String(cell).replace(/"/g, '""');
              return `"${cell}"`;
            })
            .join(separator)
        )
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filename}.csv successfully!`);
  };

  return (
    <div className="min-h-screen bg-[#FAF5EE] text-[#1A3B2B] font-poppins pb-20">
      {/* 1. Header Bar */}
      <header className="bg-white border-b border-[#D8C7B5] px-4 sm:px-8 py-4 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#D0E9C0] text-[#285A3C] flex items-center justify-center font-bold text-lg border border-[#BCD8AA]">
              D
            </div>
            <div>
              <h1 className="font-golden text-xl sm:text-2xl font-bold leading-tight">
                DORASANI Admin Suite
              </h1>
              <p className="text-xs text-[#647268]">
                Production Supabase Management & Operations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#BCD8AA] bg-[#D0E9C0]/40 text-xs font-semibold text-[#1A3B2B] hover:bg-[#D0E9C0] transition-colors"
            >
              <span>View Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={loadData}
              className="px-3.5 py-1.5 rounded-lg bg-[#285A3C] text-white text-xs font-semibold hover:bg-[#1E432D] transition-colors shadow-xs"
            >
              Refresh Data
            </button>
          </div>
        </div>
      </header>

      {/* 2. Navigation Tabs */}
      <div className="bg-[#FAF5EE] border-b border-[#D8C7B5] px-4 sm:px-8 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center gap-2 py-2">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'products', label: 'Products', icon: Package },
            { id: 'orders', label: 'Orders', icon: ShoppingBag },
            { id: 'inventory', label: 'Inventory', icon: Layers },
            { id: 'categories', label: 'Categories', icon: Layers },
            { id: 'coupons', label: 'Coupons', icon: Tag },
            { id: 'cms', label: 'Banners & CMS', icon: ImageIcon },
            { id: 'reports', label: 'Reports & Export', icon: FileDown }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#285A3C] text-white shadow-xs'
                    : 'text-[#4F6355] hover:bg-[#D0E9C0]/30 hover:text-[#1A3B2B]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Dashboard Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-[#285A3C] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-[#4F6355]">Connecting to Supabase PostgreSQL database...</p>
          </div>
        ) : (
          <>
            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div className="bg-white p-5 rounded-2xl border border-[#D8C7B5] shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-[#647268]">
                      <span className="text-xs uppercase tracking-wider font-semibold">Total Revenue</span>
                      <DollarSign className="w-5 h-5 text-[#C29336]" />
                    </div>
                    <div className="font-golden text-2xl sm:text-3xl font-bold text-[#1A3B2B]">
                      ₹{metrics.totalSales.toLocaleString()}
                    </div>
                    <p className="text-[11px] text-[#285A3C] font-semibold flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>{metrics.totalOrders} total confirmed orders</span>
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-[#D8C7B5] shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-[#647268]">
                      <span className="text-xs uppercase tracking-wider font-semibold">Active Products</span>
                      <Package className="w-5 h-5 text-[#285A3C]" />
                    </div>
                    <div className="font-golden text-2xl sm:text-3xl font-bold text-[#1A3B2B]">
                      {metrics.activeProducts} / {metrics.totalProducts}
                    </div>
                    <p className="text-[11px] text-[#647268]">
                      {metrics.outOfStockProducts > 0 ? `${metrics.outOfStockProducts} out of stock` : 'All items in stock'}
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-[#D8C7B5] shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-[#647268]">
                      <span className="text-xs uppercase tracking-wider font-semibold">Pending / In-Transit</span>
                      <Truck className="w-5 h-5 text-[#C29336]" />
                    </div>
                    <div className="font-golden text-2xl sm:text-3xl font-bold text-[#1A3B2B]">
                      {metrics.pendingOrders + metrics.processingOrders}
                    </div>
                    <p className="text-[11px] text-[#4F6355]">
                      {metrics.deliveredOrders} delivered successfully
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-[#D8C7B5] shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-[#647268]">
                      <span className="text-xs uppercase tracking-wider font-semibold">Customer Base</span>
                      <Users className="w-5 h-5 text-[#285A3C]" />
                    </div>
                    <div className="font-golden text-2xl sm:text-3xl font-bold text-[#1A3B2B]">
                      {metrics.totalCustomers}
                    </div>
                    <p className="text-[11px] text-[#285A3C] font-semibold">
                      Registered customer profiles
                    </p>
                  </div>
                </div>

                {/* Recent Orders Overview */}
                <div className="bg-white rounded-2xl border border-[#D8C7B5] p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-golden text-lg font-bold text-[#1A3B2B]">Recent Orders</h3>
                      <p className="text-xs text-[#647268]">Real-time transactional orders from Supabase</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs text-[#285A3C] font-semibold hover:underline"
                    >
                      View All Orders →
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#D8C7B5] text-[#647268]">
                          <th className="py-2.5 font-semibold">Order #</th>
                          <th className="py-2.5 font-semibold">Customer</th>
                          <th className="py-2.5 font-semibold">Amount</th>
                          <th className="py-2.5 font-semibold">Status</th>
                          <th className="py-2.5 font-semibold">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E8DCCF]">
                        {orders.slice(0, 5).map((o: any) => (
                          <tr key={o.id} className="hover:bg-[#FAF5EE]/60">
                            <td className="py-3 font-semibold text-[#1A3B2B]">{o.order_number}</td>
                            <td className="py-3">{o.customer_name}</td>
                            <td className="py-3 font-bold text-[#285A3C]">₹{o.total_inr.toLocaleString()}</td>
                            <td className="py-3">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase ${
                                o.order_status === 'delivered'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : o.order_status === 'cancelled'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {o.order_status}
                              </span>
                            </td>
                            <td className="py-3 text-[#647268]">
                              {new Date(o.created_at).toLocaleDateString('en-GB')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PRODUCTS */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="relative flex-1 min-w-[260px] max-w-md">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E9B92]" />
                    <input
                      type="text"
                      placeholder="Search products by title, SKU, or fabric..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#D8C7B5] bg-white text-xs focus:outline-none focus:border-[#285A3C]"
                    />
                  </div>

                  <button
                    onClick={() => setIsProductModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#285A3C] text-white text-xs font-semibold hover:bg-[#1E432D] transition-colors shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Product</span>
                  </button>
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-2xl border border-[#D8C7B5] overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAF5EE] border-b border-[#D8C7B5] text-[#647268]">
                        <tr>
                          <th className="p-3 font-semibold">Image</th>
                          <th className="p-3 font-semibold">Product Title</th>
                          <th className="p-3 font-semibold">Category</th>
                          <th className="p-3 font-semibold">Price / MRP</th>
                          <th className="p-3 font-semibold">Stock</th>
                          <th className="p-3 font-semibold">Status</th>
                          <th className="p-3 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E8DCCF]">
                        {products
                          .filter((p) =>
                            !productSearch ||
                            p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
                            (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase())) ||
                            (p.fabric && p.fabric.toLowerCase().includes(productSearch.toLowerCase()))
                          )
                          .map((p) => (
                            <tr key={p.id} className="hover:bg-[#FAF5EE]/50">
                              <td className="p-3">
                                <img
                                  src={p.product_media?.[0]?.url || '/assets/products/kanjivaram_silk_saree.jpg'}
                                  alt={p.title}
                                  className="w-10 h-12 object-cover rounded-md border border-[#D8C7B5]"
                                />
                              </td>
                              <td className="p-3">
                                <p className="font-semibold text-[#1A3B2B]">{p.title}</p>
                                <p className="text-[10px] text-[#647268]">{p.sku || p.slug}</p>
                              </td>
                              <td className="p-3">{p.categories?.name || p.product_type}</td>
                              <td className="p-3 font-semibold">
                                ₹{p.price_inr.toLocaleString()}
                                <span className="text-[10px] text-[#8E9B92] line-through ml-1.5">
                                  ₹{p.mrp_inr.toLocaleString()}
                                </span>
                              </td>
                              <td className="p-3">
                                <span className={`font-semibold ${p.stock_quantity < 5 ? 'text-rose-600' : 'text-[#1A3B2B]'}`}>
                                  {p.stock_quantity} units
                                </span>
                              </td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 uppercase">
                                  {p.status}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <div className="inline-flex items-center gap-1.5">
                                  <Link
                                    to={`/product/${p.slug}`}
                                    target="_blank"
                                    className="p-1.5 rounded-md hover:bg-[#D0E9C0]/40 text-[#285A3C]"
                                    title="View on store"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </Link>
                                  <button
                                    onClick={() => handleAdjustStock(p.id, 5)}
                                    className="px-2 py-1 rounded bg-[#D0E9C0] text-[10px] font-semibold text-[#1A3B2B] hover:bg-[#BCD8AA]"
                                    title="Add 5 units of stock"
                                  >
                                    +5 Stock
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

            {/* TAB: ORDERS */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="relative flex-1 min-w-[260px] max-w-md">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E9B92]" />
                    <input
                      type="text"
                      placeholder="Search orders by number, customer, email..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#D8C7B5] bg-white text-xs focus:outline-none focus:border-[#285A3C]"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    {['all', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setOrderStatusFilter(status)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize ${
                          orderStatusFilter === status
                            ? 'bg-[#285A3C] text-white'
                            : 'bg-white border border-[#D8C7B5] text-[#4F6355] hover:bg-[#FAF5EE]'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Orders List */}
                <div className="bg-white rounded-2xl border border-[#D8C7B5] overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAF5EE] border-b border-[#D8C7B5] text-[#647268]">
                        <tr>
                          <th className="p-3 font-semibold">Order Number</th>
                          <th className="p-3 font-semibold">Customer</th>
                          <th className="p-3 font-semibold">Items</th>
                          <th className="p-3 font-semibold">Total Amount</th>
                          <th className="p-3 font-semibold">Payment</th>
                          <th className="p-3 font-semibold">Order Status</th>
                          <th className="p-3 font-semibold text-right">Update Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E8DCCF]">
                        {orders
                          .filter((o) =>
                            (!orderSearch ||
                              o.order_number.toLowerCase().includes(orderSearch.toLowerCase()) ||
                              o.customer_name.toLowerCase().includes(orderSearch.toLowerCase()) ||
                              o.customer_email.toLowerCase().includes(orderSearch.toLowerCase())) &&
                            (orderStatusFilter === 'all' || o.order_status === orderStatusFilter)
                          )
                          .map((o) => (
                            <tr key={o.id} className="hover:bg-[#FAF5EE]/50">
                              <td className="p-3 font-bold text-[#1A3B2B]">{o.order_number}</td>
                              <td className="p-3">
                                <p className="font-semibold text-[#1A3B2B]">{o.customer_name}</p>
                                <p className="text-[10px] text-[#647268]">{o.customer_phone}</p>
                              </td>
                              <td className="p-3">
                                {o.order_items?.length || 1} item(s)
                              </td>
                              <td className="p-3 font-bold text-[#285A3C]">
                                ₹{o.total_inr.toLocaleString()}
                              </td>
                              <td className="p-3 capitalize">
                                <span className="font-semibold">{o.payment_method}</span>
                                <span className="block text-[10px] text-[#285A3C]">
                                  {o.payment_status}
                                </span>
                              </td>
                              <td className="p-3">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase ${
                                  o.order_status === 'delivered'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : o.order_status === 'cancelled'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {o.order_status}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <select
                                  value={o.order_status}
                                  onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                                  className="text-[11px] font-semibold border border-[#BCD8AA] bg-[#D0E9C0]/40 rounded-lg px-2 py-1 text-[#1A3B2B] focus:outline-none"
                                >
                                  <option value="confirmed">Confirmed</option>
                                  <option value="processing">Processing</option>
                                  <option value="packed">Packed</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: INVENTORY */}
            {activeTab === 'inventory' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-[#D8C7B5] p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-golden text-lg font-bold text-[#1A3B2B]">Live Stock Ledger</h3>
                      <p className="text-xs text-[#647268]">Real-time inventory levels with automatic reduction on purchase</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAF5EE] border-b border-[#D8C7B5] text-[#647268]">
                        <tr>
                          <th className="p-3 font-semibold">Product Title</th>
                          <th className="p-3 font-semibold">SKU</th>
                          <th className="p-3 font-semibold">Category</th>
                          <th className="p-3 font-semibold">Current Stock</th>
                          <th className="p-3 font-semibold">Status</th>
                          <th className="p-3 font-semibold text-right">Quick Stock Adjustment</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E8DCCF]">
                        {products.map((p) => (
                          <tr key={p.id} className="hover:bg-[#FAF5EE]/50">
                            <td className="p-3 font-semibold text-[#1A3B2B]">{p.title}</td>
                            <td className="p-3 text-[#647268]">{p.sku || p.slug}</td>
                            <td className="p-3">{p.categories?.name || p.product_type}</td>
                            <td className="p-3 font-bold text-base text-[#1A3B2B]">{p.stock_quantity}</td>
                            <td className="p-3">
                              {p.stock_quantity <= 0 ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800">
                                  Out of Stock
                                </span>
                              ) : p.stock_quantity < 5 ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                                  Low Stock
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                                  Healthy
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => handleAdjustStock(p.id, -1)}
                                  className="w-7 h-7 rounded border border-[#D8C7B5] bg-white font-bold text-xs hover:bg-[#FAF5EE]"
                                >
                                  -1
                                </button>
                                <button
                                  onClick={() => handleAdjustStock(p.id, 5)}
                                  className="px-2.5 py-1 rounded bg-[#D0E9C0] text-xs font-semibold text-[#1A3B2B] hover:bg-[#BCD8AA]"
                                >
                                  +5 Units
                                </button>
                                <button
                                  onClick={() => handleAdjustStock(p.id, 20)}
                                  className="px-2.5 py-1 rounded bg-[#285A3C] text-xs font-semibold text-white hover:bg-[#1E432D]"
                                >
                                  +20 Units
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

            {/* TAB: CATEGORIES */}
            {activeTab === 'categories' && (
              <div className="bg-white rounded-2xl border border-[#D8C7B5] p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-golden text-lg font-bold text-[#1A3B2B]">Database Categories</h3>
                    <p className="text-xs text-[#647268]">Manage taxonomy, slugs, and navigation hierarchy</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((c) => (
                    <div key={c.id} className="p-4 rounded-xl border border-[#D8C7B5] bg-[#FAF5EE] space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-golden font-bold text-sm text-[#1A3B2B]">{c.name}</h4>
                        <span className="text-[10px] font-semibold text-[#C29336] uppercase bg-white px-2 py-0.5 rounded-full border border-[#D8C7B5]">
                          Order: {c.display_order}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#647268]">{c.description || 'Curated category'}</p>
                      <p className="text-[10px] text-[#8E9B92] font-mono">Slug: {c.slug}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: COUPONS */}
            {activeTab === 'coupons' && (
              <div className="bg-white rounded-2xl border border-[#D8C7B5] p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-golden text-lg font-bold text-[#1A3B2B]">Active Promotion Coupons</h3>
                    <p className="text-xs text-[#647268]">Discount rules validated automatically on checkout</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {coupons.map((c) => (
                    <div key={c.id} className="p-5 rounded-2xl border border-[#BCD8AA] bg-[#D0E9C0]/25 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-base text-[#1A3B2B]">{c.code}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                          {c.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                      <div className="space-y-1 text-xs text-[#3A443D]">
                        <p className="font-semibold">
                          Discount: {c.discount_type === 'percentage' ? `${c.discount_value}%` : `₹${c.discount_value}`}
                        </p>
                        <p className="text-[11px] text-[#647268]">
                          Min order: ₹{c.min_order_amount_inr?.toLocaleString() || 0}
                        </p>
                        <p className="text-[11px] text-[#647268]">
                          Redemptions: {c.used_count || 0} times
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: CMS & BANNERS */}
            {activeTab === 'cms' && (
              <div className="bg-white rounded-2xl border border-[#D8C7B5] p-6 shadow-xs space-y-6">
                <div>
                  <h3 className="font-golden text-lg font-bold text-[#1A3B2B]">Dynamic Homepage Banners</h3>
                  <p className="text-xs text-[#647268]">Manage hero banners, mobile images, titles, and CTA links without code edits</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {banners.map((b) => (
                    <div key={b.id} className="rounded-2xl border border-[#D8C7B5] overflow-hidden bg-[#FAF5EE] space-y-3 p-4">
                      <div className="aspect-video w-full rounded-xl overflow-hidden bg-black/10">
                        <img src={b.desktop_image_url} alt={b.title_line_1} className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-1 text-xs">
                        <span className="text-[10px] font-bold text-[#C29336] uppercase tracking-wider">{b.tagline}</span>
                        <h4 className="font-golden text-base font-bold text-[#1A3B2B]">{b.title_line_1} {b.title_line_2}</h4>
                        <p className="text-[11px] text-[#647268]">{b.description}</p>
                        <div className="pt-2 flex items-center justify-between text-[11px] font-semibold text-[#285A3C]">
                          <span>CTA: {b.primary_cta_label} ({b.primary_cta_link})</span>
                          <span>Order: #{b.display_order}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: REPORTS & EXPORT */}
            {activeTab === 'reports' && (
              <div className="bg-white rounded-2xl border border-[#D8C7B5] p-6 shadow-xs space-y-6">
                <div>
                  <h3 className="font-golden text-lg font-bold text-[#1A3B2B]">Export Production Reports</h3>
                  <p className="text-xs text-[#647268]">Download official CSV exports of database records for accounting and inventory audits</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="p-6 rounded-2xl border border-[#D8C7B5] bg-[#FAF5EE] space-y-3 text-center">
                    <ShoppingBag className="w-8 h-8 text-[#285A3C] mx-auto" />
                    <h4 className="font-bold text-sm text-[#1A3B2B]">Orders Report</h4>
                    <p className="text-xs text-[#647268]">Export all order records, payments, addresses, and status history.</p>
                    <button
                      onClick={() => exportToCSV('dorasani_orders', orders)}
                      className="w-full py-2.5 rounded-xl bg-[#285A3C] text-white text-xs font-semibold hover:bg-[#1E432D] shadow-xs"
                    >
                      Export Orders (CSV)
                    </button>
                  </div>

                  <div className="p-6 rounded-2xl border border-[#D8C7B5] bg-[#FAF5EE] space-y-3 text-center">
                    <Package className="w-8 h-8 text-[#285A3C] mx-auto" />
                    <h4 className="font-bold text-sm text-[#1A3B2B]">Product Catalogue</h4>
                    <p className="text-xs text-[#647268]">Export complete product database including SKUs, prices, fabrics, and descriptions.</p>
                    <button
                      onClick={() => exportToCSV('dorasani_products', products)}
                      className="w-full py-2.5 rounded-xl bg-[#285A3C] text-white text-xs font-semibold hover:bg-[#1E432D] shadow-xs"
                    >
                      Export Products (CSV)
                    </button>
                  </div>

                  <div className="p-6 rounded-2xl border border-[#D8C7B5] bg-[#FAF5EE] space-y-3 text-center">
                    <Layers className="w-8 h-8 text-[#285A3C] mx-auto" />
                    <h4 className="font-bold text-sm text-[#1A3B2B]">Inventory Ledger</h4>
                    <p className="text-xs text-[#647268]">Export current stock counts, reservations, and movement ledger.</p>
                    <button
                      onClick={() => exportToCSV('dorasani_inventory', products.map(p => ({ title: p.title, sku: p.sku, stock: p.stock_quantity, in_stock: p.in_stock })))}
                      className="w-full py-2.5 rounded-xl bg-[#285A3C] text-white text-xs font-semibold hover:bg-[#1E432D] shadow-xs"
                    >
                      Export Inventory (CSV)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* MODAL: ADD PRODUCT */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-[#D8C7B5] shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#D8C7B5] pb-3">
              <h3 className="font-golden text-xl font-bold text-[#1A3B2B]">Add New Product to Database</h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 rounded-full hover:bg-[#FAF5EE]"
              >
                <X className="w-5 h-5 text-[#647268]" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-[#1A3B2B]">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={newProduct.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setNewProduct({
                        ...newProduct,
                        title,
                        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                      });
                    }}
                    placeholder="e.g. Royal Kanchipuram Gold Zari Silk Saree"
                    className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#1A3B2B]">Product Slug *</label>
                  <input
                    type="text"
                    required
                    value={newProduct.slug}
                    onChange={(e) => setNewProduct({ ...newProduct, slug: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-[#1A3B2B]">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newProduct.price_inr}
                    onChange={(e) => setNewProduct({ ...newProduct, price_inr: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#1A3B2B]">MRP (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newProduct.mrp_inr}
                    onChange={(e) => setNewProduct({ ...newProduct, mrp_inr: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#1A3B2B]">Opening Stock *</label>
                  <input
                    type="number"
                    required
                    value={newProduct.stock_quantity}
                    onChange={(e) => setNewProduct({ ...newProduct, stock_quantity: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-[#1A3B2B]">Fabric</label>
                  <input
                    type="text"
                    value={newProduct.fabric}
                    onChange={(e) => setNewProduct({ ...newProduct, fabric: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#1A3B2B]">Occasion</label>
                  <input
                    type="text"
                    value={newProduct.occasion}
                    onChange={(e) => setNewProduct({ ...newProduct, occasion: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1A3B2B]">Full Description (TEXT, up to 50,000 characters)</label>
                <textarea
                  rows={4}
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Detailed traditional description, motifs, pallu details, origin..."
                  className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#D8C7B5]">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#D8C7B5] font-semibold hover:bg-[#FAF5EE]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#285A3C] text-white font-semibold hover:bg-[#1E432D] shadow-xs"
                >
                  Save Product to Supabase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

