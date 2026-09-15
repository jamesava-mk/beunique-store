// StoreLayout.jsx

import {
  LogOut,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function StoreLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const { user, isAuthenticated, logout } = useAuth();

  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const accountRef = useRef(null);

  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        accountRef.current &&
        !accountRef.current.contains(event.target)
      ) {
        setAccountOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
    };
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();

    const value = search.trim();

    if (!value) {
      navigate("/shop");
      return;
    }

    navigate(
      `/shop?search=${encodeURIComponent(value)}`,
    );

    setSearch("");
  };

  const handleAccountClick = () => {
    if (!isAuthenticated) {
      navigate("/account");
      return;
    }

    setAccountOpen((current) => !current);
  };

  const handleLogout = async () => {
    setAccountOpen(false);
    setMobileOpen(false);

    await logout();

    navigate("/account");
  };

  const getInitial = () => {
    const firstName = user?.firstName?.trim();

    if (firstName) {
      return firstName.charAt(0).toUpperCase();
    }

    const email = user?.email?.trim();

    if (email) {
      return email.charAt(0).toUpperCase();
    }

    return "U";
  };

  return (
    <div className="min-h-screen bg-[#f2eee6] text-[#211d1a]">
      <header className="fixed inset-x-0 top-0 z-[100]">
        <div className="border-b border-[#211d1a]/10 bg-[#f2eee6]/95 text-[#211d1a] shadow-[0_8px_35px_rgba(33,29,26,0.08)] backdrop-blur-xl">
          <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10">
            <div className="relative flex h-[74px] items-center justify-between gap-5">
              {/* LOGO */}
              <Link
                to="/"
                className="group relative shrink-0"
              >
                <div className="flex items-end leading-none">
                  <span className="text-[22px] font-black tracking-[-0.12em]">
                    BE
                  </span>

                  <span className="ml-[3px] text-[22px] font-black tracking-[-0.105em]">
                    UNIQUE
                  </span>
                </div>

                <span className="absolute -bottom-[7px] left-0 h-[2px] w-7 bg-[#71383a] transition-all duration-300 group-hover:w-full" />
              </Link>

              {/* DESKTOP CENTER */}
              <div className="hidden flex-1 items-center justify-center gap-7 lg:flex">
                <Link
                  to="/"
                  className="text-[11px] font-extrabold uppercase tracking-[0.1em] transition-colors hover:text-[#71383a]"
                >
                  Home
                </Link>

                <Link
                  to="/shop"
                  className="text-[11px] font-extrabold uppercase tracking-[0.1em] transition-colors hover:text-[#71383a]"
                >
                  Shop
                </Link>

                <form
                  onSubmit={handleSearch}
                  className="flex h-11 w-full max-w-[560px] items-center rounded-full border border-[#211d1a]/15 bg-white/65 px-4 transition-all duration-300 focus-within:border-[#71383a]/40 focus-within:bg-white"
                >
                  <Search
                    size={16}
                    strokeWidth={2}
                    className="shrink-0 text-[#211d1a]/50"
                  />

                  <input
                    type="search"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search pieces, dresses, sets..."
                    className="w-full bg-transparent px-3 text-[11px] font-semibold tracking-[0.02em] text-[#211d1a] outline-none placeholder:text-[#211d1a]/35"
                  />
                </form>

                <Link
                  to="/cart"
                  className="flex shrink-0 items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.1em] transition-colors hover:text-[#71383a]"
                >
                  <ShoppingBag
                    size={16}
                    strokeWidth={2}
                  />
                  Cart
                </Link>
              </div>

              {/* DESKTOP ACCOUNT */}
              <div
                ref={accountRef}
                className="relative hidden shrink-0 items-center gap-2 sm:flex"
              >
                {!isAuthenticated ? (
                  <Link
                    to="/signup"
                    className="rounded-full bg-[#211d1a] px-5 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#f2eee6] transition-all duration-300 hover:bg-[#71383a]"
                  >
                    Sign up
                  </Link>
                ) : (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={handleAccountClick}
                      aria-label="Open account menu"
                      aria-expanded={accountOpen}
                      className={`flex h-10 w-10 items-center justify-center rounded-full border text-[11px] font-extrabold uppercase transition-all duration-300 ${
                        accountOpen
                          ? "border-[#71383a] bg-[#71383a] text-[#f2eee6]"
                          : "border-[#211d1a]/15 bg-transparent text-[#211d1a] hover:border-[#71383a] hover:text-[#71383a]"
                      }`}
                    >
                      {getInitial()}
                    </button>

                    {accountOpen && (
                      <div className="absolute right-0 top-[calc(100%+12px)] w-56 overflow-hidden border border-[#d8d1c7] bg-[#f2eee6] shadow-[0_18px_50px_rgba(33,29,26,0.14)]">
                        <div className="border-b border-[#d8d1c7] px-5 py-4">
                          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#71383a]">
                            Account
                          </p>

                          <p className="mt-2 truncate text-sm font-medium">
                            {user?.firstName}{" "}
                            {user?.lastName}
                          </p>

                          <p className="mt-1 truncate text-[10px] text-[#958d82]">
                            {user?.email}
                          </p>
                        </div>

                        <div className="p-2">
                          <Link
                            to="/account"
                            className="flex items-center justify-between px-3 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] transition hover:bg-[#ebe5db] hover:text-[#71383a]"
                          >
                            My account
                            <UserRound
                              size={14}
                              strokeWidth={1.5}
                            />
                          </Link>

                          <Link
                            to="/cart"
                            className="flex items-center justify-between px-3 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] transition hover:bg-[#ebe5db] hover:text-[#71383a]"
                          >
                            Cart
                            <ShoppingBag
                              size={14}
                              strokeWidth={1.5}
                            />
                          </Link>

                          <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center justify-between px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[#746d64] transition hover:bg-[#ebe5db] hover:text-[#71383a]"
                          >
                            Sign out
                            <LogOut
                              size={14}
                              strokeWidth={1.5}
                            />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!isAuthenticated && (
                  <button
                    type="button"
                    onClick={handleAccountClick}
                    aria-label="Account"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#211d1a]/15 transition-all duration-300 hover:border-[#71383a] hover:text-[#71383a]"
                  >
                    <UserRound
                      size={16}
                      strokeWidth={2}
                    />
                  </button>
                )}
              </div>

              {/* MOBILE */}
              <div className="flex items-center gap-2 sm:hidden">
                {!isAuthenticated && (
                  <Link
                    to="/signup"
                    className="rounded-full bg-[#211d1a] px-4 py-2.5 text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#f2eee6]"
                  >
                    Sign up
                  </Link>
                )}

                {isAuthenticated && (
                  <button
                    type="button"
                    onClick={handleAccountClick}
                    aria-label="Account"
                    className={`flex h-10 w-10 items-center justify-center rounded-full border text-[11px] font-extrabold uppercase transition ${
                      accountOpen
                        ? "border-[#71383a] bg-[#71383a] text-[#f2eee6]"
                        : "border-[#211d1a]/15"
                    }`}
                  >
                    {getInitial()}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    setMobileOpen(
                      (current) => !current,
                    )
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#211d1a]/15"
                  aria-label={
                    mobileOpen
                      ? "Close menu"
                      : "Open menu"
                  }
                >
                  {mobileOpen ? (
                    <X
                      size={19}
                      strokeWidth={2}
                    />
                  ) : (
                    <Menu
                      size={19}
                      strokeWidth={2}
                    />
                  )}
                </button>
              </div>
            </div>

            {/* MOBILE ACCOUNT MENU */}
            {accountOpen && isAuthenticated && (
              <div className="border-t border-[#211d1a]/10 py-4 sm:hidden">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#71383a]">
                      Signed in as
                    </p>

                    <p className="mt-1 truncate text-sm font-medium">
                      {user?.firstName} {user?.lastName}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex shrink-0 items-center gap-2 rounded-full border border-[#d8d1c7] px-4 py-2.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#746d64]"
                  >
                    <LogOut size={13} />
                    Sign out
                  </button>
                </div>
              </div>
            )}

            {/* MOBILE MENU */}
            {mobileOpen && (
              <div className="border-t border-[#211d1a]/10 pb-5 pt-4 sm:hidden">
                <form
                  onSubmit={handleSearch}
                  className="flex h-11 items-center rounded-full border border-[#211d1a]/15 bg-white px-4"
                >
                  <Search
                    size={16}
                    className="text-[#211d1a]/50"
                  />

                  <input
                    type="search"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search pieces..."
                    className="w-full bg-transparent px-3 text-[11px] font-semibold outline-none placeholder:text-[#211d1a]/35"
                  />
                </form>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <Link
                    to="/"
                    className="rounded-full border border-[#211d1a]/10 px-3 py-3 text-center text-[9px] font-extrabold uppercase tracking-[0.1em]"
                  >
                    Home
                  </Link>

                  <Link
                    to="/shop"
                    className="rounded-full border border-[#211d1a]/10 px-3 py-3 text-center text-[9px] font-extrabold uppercase tracking-[0.1em]"
                  >
                    Shop
                  </Link>

                  <Link
                    to="/cart"
                    className="flex items-center justify-center gap-2 rounded-full border border-[#211d1a]/10 px-3 py-3 text-[9px] font-extrabold uppercase tracking-[0.1em]"
                  >
                    <ShoppingBag size={14} />
                    Cart
                  </Link>
                </div>

                {isAuthenticated && (
                  <Link
                    to="/account"
                    className="mt-2 flex items-center justify-between rounded-full border border-[#211d1a]/10 px-4 py-3 text-[9px] font-extrabold uppercase tracking-[0.1em]"
                  >
                    My account
                    <UserRound size={14} />
                  </Link>
                )}

                {!isAuthenticated && (
                  <Link
                    to="/account"
                    className="mt-2 flex items-center justify-center rounded-full border border-[#211d1a]/10 px-4 py-3 text-[9px] font-extrabold uppercase tracking-[0.1em]"
                  >
                    Sign in
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="pt-[74px]">
        <Outlet />
      </main>
    </div>
  );
}

export default StoreLayout;