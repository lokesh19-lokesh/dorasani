import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { RootLayout } from './layouts/RootLayout';

// Page Components
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { SareesPage } from './pages/SareesPage';
import { EthnicWearPage } from './pages/EthnicWearPage';
import { KurtisPage } from './pages/KurtisPage';
import { LehengasPage } from './pages/LehengasPage';
import { KidsWearPage } from './pages/KidsWearPage';
import { FestivePage } from './pages/FestivePage';
import { NewArrivalsPage } from './pages/NewArrivalsPage';
import { BestsellersPage } from './pages/BestsellersPage';
import { HeritagePage } from './pages/HeritagePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { WishlistPage } from './pages/WishlistPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AccountPage } from './pages/AccountPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { FAQPage } from './pages/FAQPage';
import { ShippingPolicyPage } from './pages/ShippingPolicyPage';
import { ReturnsPolicyPage } from './pages/ReturnsPolicyPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <StoreProvider>
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
            <Route path="returns-policy" element={<ReturnsPolicyPage />} />
            <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="terms" element={<TermsPage />} />

            {/* Catch-all 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </StoreProvider>
    </BrowserRouter>
  );
};

export default App;
