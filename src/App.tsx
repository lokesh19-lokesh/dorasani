import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { StoreProvider, useStore } from './context/StoreContext';
import { RootLayout } from './layouts/RootLayout';
import { ToastContainer } from './components/common/ToastContainer';

// Eager Landing Route + Route-Split Secondary Pages
import { HomePage } from './pages/HomePage';

const ShopPage = lazy(() => import('./pages/ShopPage').then((m) => ({ default: m.ShopPage })));
const SareesPage = lazy(() => import('./pages/SareesPage').then((m) => ({ default: m.SareesPage })));
const EthnicWearPage = lazy(() =>
  import('./pages/EthnicWearPage').then((m) => ({ default: m.EthnicWearPage }))
);
const KurtisPage = lazy(() => import('./pages/KurtisPage').then((m) => ({ default: m.KurtisPage })));
const LehengasPage = lazy(() =>
  import('./pages/LehengasPage').then((m) => ({ default: m.LehengasPage }))
);
const KidsWearPage = lazy(() =>
  import('./pages/KidsWearPage').then((m) => ({ default: m.KidsWearPage }))
);
const FestivePage = lazy(() =>
  import('./pages/FestivePage').then((m) => ({ default: m.FestivePage }))
);
const NewArrivalsPage = lazy(() =>
  import('./pages/NewArrivalsPage').then((m) => ({ default: m.NewArrivalsPage }))
);
const BestsellersPage = lazy(() =>
  import('./pages/BestsellersPage').then((m) => ({ default: m.BestsellersPage }))
);
const DynamicCollectionPage = lazy(() =>
  import('./pages/DynamicCollectionPage').then((m) => ({ default: m.DynamicCollectionPage }))
);
const HeritagePage = lazy(() =>
  import('./pages/HeritagePage').then((m) => ({ default: m.HeritagePage }))
);
const ProductDetailPage = lazy(() =>
  import('./pages/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage }))
);
const SearchResultsPage = lazy(() =>
  import('./pages/SearchResultsPage').then((m) => ({ default: m.SearchResultsPage }))
);
const WishlistPage = lazy(() =>
  import('./pages/WishlistPage').then((m) => ({ default: m.WishlistPage }))
);
const CartPage = lazy(() => import('./pages/CartPage').then((m) => ({ default: m.CartPage })));
const CheckoutPage = lazy(() =>
  import('./pages/CheckoutPage').then((m) => ({ default: m.CheckoutPage }))
);
const OrderConfirmationPage = lazy(() =>
  import('./pages/OrderConfirmationPage').then((m) => ({ default: m.OrderConfirmationPage }))
);
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() =>
  import('./pages/RegisterPage').then((m) => ({ default: m.RegisterPage }))
);
const AccountPage = lazy(() =>
  import('./pages/AccountPage').then((m) => ({ default: m.AccountPage }))
);
const TrackOrderPage = lazy(() =>
  import('./pages/TrackOrderPage').then((m) => ({ default: m.TrackOrderPage }))
);
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const ContactPage = lazy(() =>
  import('./pages/ContactPage').then((m) => ({ default: m.ContactPage }))
);
const FAQPage = lazy(() => import('./pages/FAQPage').then((m) => ({ default: m.FAQPage })));
const ShippingPolicyPage = lazy(() =>
  import('./pages/ShippingPolicyPage').then((m) => ({ default: m.ShippingPolicyPage }))
);
const ReturnsPolicyPage = lazy(() =>
  import('./pages/ReturnsPolicyPage').then((m) => ({ default: m.ReturnsPolicyPage }))
);
const PrivacyPolicyPage = lazy(() =>
  import('./pages/PrivacyPolicyPage').then((m) => ({ default: m.PrivacyPolicyPage }))
);
const TermsPage = lazy(() => import('./pages/TermsPage').then((m) => ({ default: m.TermsPage })));
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);
const AdminDashboardPage = lazy(() =>
  import('./pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
);

const RouteFallback: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center bg-[#FAF5EE] px-4">
    <div className="w-8 h-8 rounded-full border-2 border-[#285A3C] border-t-transparent animate-spin" aria-label="Loading page" />
  </div>
);

const AuthCallbackHandler: React.FC = () => {
  const { passwordRecoveryPending, user, authLoading, showToast } = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Route password recovery / invite completions directly to the Change Password screen
  useEffect(() => {
    if (!authLoading && user && passwordRecoveryPending) {
      if (location.pathname !== '/account' || !location.search.includes('reset-password')) {
        navigate('/account?action=reset-password', { replace: true });
      }
    }
  }, [authLoading, user, passwordRecoveryPending, location.pathname, location.search, navigate]);

  // Surface Supabase email callback errors (e.g. expired confirmation / magic / reset links)
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const queryParams = new URLSearchParams(window.location.search);
    const errDesc = hashParams.get('error_description') || queryParams.get('error_description');
    const messageDesc = hashParams.get('message') || queryParams.get('message');

    if (errDesc) {
      if (location.pathname !== '/login') {
        navigate(`/login?auth_error=${encodeURIComponent(errDesc)}`, { replace: true });
      }
      return;
    }

    if (messageDesc) {
      showToast(messageDesc, 'info');
      window.history.replaceState(null, '', `${location.pathname}${location.search}`);
    }
  }, [location.pathname, location.search, navigate, showToast]);

  return null;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <StoreProvider>
        <AuthCallbackHandler />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<RootLayout />}>
            {/* Primary Landing & Catalog Pages */}
            <Route index element={<HomePage />} />
            <Route path="shop" element={<ShopPage />} />
            <Route path="collections/all" element={<ShopPage />} />

            {/* Category Collections (Both /collections/ and /category/ for maximum compatibility) */}
            <Route path="collections/sarees" element={<SareesPage />} />
            <Route path="category/sarees" element={<SareesPage />} />
            <Route path="collections/silk-sarees" element={<SareesPage />} />
            <Route path="category/silk-sarees" element={<SareesPage />} />

            <Route path="collections/ethnic-wear" element={<EthnicWearPage />} />
            <Route path="category/ethnic-wear" element={<EthnicWearPage />} />

            <Route path="collections/kurtis" element={<KurtisPage />} />
            <Route path="category/kurtis" element={<KurtisPage />} />
            <Route path="collections/kurthis" element={<KurtisPage />} />
            <Route path="category/kurthis" element={<KurtisPage />} />

            <Route path="collections/lehengas" element={<LehengasPage />} />
            <Route path="category/lehengas" element={<LehengasPage />} />

            <Route path="collections/kids-wear" element={<KidsWearPage />} />
            <Route path="category/kids-wear" element={<KidsWearPage />} />

            <Route path="collections/festive" element={<FestivePage />} />
            <Route path="category/festive" element={<FestivePage />} />

            <Route path="collections/new-arrivals" element={<NewArrivalsPage />} />
            <Route path="category/new-arrivals" element={<NewArrivalsPage />} />

            <Route path="collections/bestsellers" element={<BestsellersPage />} />
            <Route path="category/bestsellers" element={<BestsellersPage />} />

            {/* Dynamic Route for Any Admin-Created Collection / Category */}
            <Route path="collections/:slug" element={<DynamicCollectionPage />} />
            <Route path="category/:slug" element={<DynamicCollectionPage />} />

            {/* Mythology, Temple Heritage & Brand Story */}
            <Route path="heritage" element={<HeritagePage />} />

            {/* Product Details (Both /product/:slug and /products/:slug) */}
            <Route path="product/:slug" element={<ProductDetailPage />} />
            <Route path="products/:slug" element={<ProductDetailPage />} />

            {/* Search, Discovery & Wishlist */}
            <Route path="search" element={<SearchResultsPage />} />
            <Route path="wishlist" element={<WishlistPage />} />

            {/* Checkout, Cart & Fulfillment */}
            <Route path="cart" element={<CartPage />} />
            <Route path="bag" element={<Navigate to="/cart" replace />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="order-confirmation" element={<OrderConfirmationPage />} />
            <Route path="order-confirmation/:orderId" element={<OrderConfirmationPage />} />
            <Route path="track-order" element={<TrackOrderPage />} />
            <Route path="track-order/:orderId" element={<TrackOrderPage />} />

            {/* Authentication & Profile */}
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="account" element={<AccountPage />} />

            {/* Information, Customer Care & Legal */}
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="faq" element={<FAQPage />} />
            <Route path="shipping-policy" element={<ShippingPolicyPage />} />
            <Route path="shipping" element={<ShippingPolicyPage />} />
            <Route path="returns-policy" element={<ReturnsPolicyPage />} />
            <Route path="returns" element={<ReturnsPolicyPage />} />
            <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="privacy" element={<PrivacyPolicyPage />} />
            <Route path="terms" element={<TermsPage />} />

            {/* Catch-all 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Dedicated Administrator Dashboard (Full Suite without Duplicate Storefront Sticky Header) */}
          <Route
            path="/admin"
            element={
              <>
                <AdminDashboardPage />
                <ToastContainer />
              </>
            }
          />
          </Routes>
        </Suspense>
      </StoreProvider>
    </BrowserRouter>
  );
};

export default App;
