import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Categories from './pages/Categories'
import CategoryDetail from './pages/CategoryDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import NotFound from './pages/NotFound'
import AdminLogin from './pages/Admin/Login'
import AdminDashboard from './pages/Admin/Dashboard'
import OrderDetailAdmin from './pages/Admin/OrderDetailAdmin'
import ProductEditAdmin from './pages/Admin/ProductEditAdmin'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:slug" element={<ProductDetail />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/categories/:slug" element={<CategoryDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products/edit/:id" element={<ProductEditAdmin />} />
          <Route path="/admin/orders/:id" element={<OrderDetailAdmin />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
