import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";

import About from "./pages/About";
import Account from "./pages/Account";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Home from "./pages/Home";
import PaymentCallback from "./pages/PaymentCallback";
import Product from "./pages/Product";
import Shop from "./pages/Shop";
import StoreLayout from "./layouts/StoreLayout";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route element={<StoreLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/about" element={<About />} />

              <Route
                path="/account"
                element={<Account initialMode="signin" />}
              />

              <Route
                path="/signup"
                element={<Account initialMode="signup" />}
              />

              <Route path="/product/:id" element={<Product />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />

              <Route
                path="/payment/callback"
                element={<PaymentCallback />}
              />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;