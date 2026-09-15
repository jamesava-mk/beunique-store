import AOS from "aos";
import "aos/dist/aos.css";

import {
  ArrowRight,
  Check,
  ChevronRight,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  Package,
  UserRound,
} from "lucide-react";

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
  error,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#746d64]"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        className={`mt-2 h-12 w-full rounded-none border bg-transparent px-4 text-sm text-[#211d1a] outline-none transition placeholder:text-[#aaa196] ${
          error
            ? "border-red-500"
            : "border-[#d8d1c7] focus:border-[#71383a]"
        }`}
      />

      {error && (
        <p className="mt-2 text-[11px] text-red-500">{error}</p>
      )}
    </div>
  );
}

function Account({ initialMode = "signin" }) {
  const navigate = useNavigate();

  const {
    user,
    loading,
    isAuthenticated,
    signup,
    login,
    logout,
    getOrders,
  } = useAuth();

  const [mode, setMode] = useState(initialMode);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    AOS.init({
      duration: 750,
      easing: "ease-out-cubic",
      once: true,
      offset: 70,
    });
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let cancelled = false;

    const loadOrders = async () => {
      setOrdersLoading(true);

      try {
        const accountOrders = await getOrders();

        if (!cancelled) {
          setOrders(
            Array.isArray(accountOrders)
              ? accountOrders
              : [],
          );
        }
      } catch (requestError) {
        console.error(
          "Order history loading failed:",
          requestError,
        );

        if (!cancelled) {
          setOrders([]);
        }
      } finally {
        if (!cancelled) {
          setOrdersLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, getOrders]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const sections = [
      document.getElementById("account-overview"),
      document.getElementById("account-orders"),
      document.getElementById("account-addresses"),
    ].filter(Boolean);

    if (!sections.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              b.intersectionRatio - a.intersectionRatio,
          );

        if (visibleEntries[0]) {
          setActiveSection(
            visibleEntries[0].target.dataset.section,
          );
        }
      },
      {
        root: null,
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0.1, 0.25, 0.5],
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [isAuthenticated, ordersLoading]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const hash = window.location.hash;

    if (!hash) {
      return;
    }

    const target = document.querySelector(hash);

    if (target) {
      window.setTimeout(() => {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 150);
    }
  }, [isAuthenticated]);

  const scrollToSection = (sectionId) => {
    const target = document.getElementById(sectionId);

    if (!target) {
      return;
    }

    target.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    window.history.replaceState(
      null,
      "",
      `#${sectionId.replace("account-", "")}`,
    );

    setActiveSection(
      sectionId.replace("account-", ""),
    );
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setFormErrors((current) => ({
      ...current,
      [name]: "",
    }));

    setError("");
  };

  const validate = () => {
    const nextErrors = {};

    if (mode === "signup") {
      if (!formData.firstName.trim()) {
        nextErrors.firstName = "First name is required.";
      }

      if (!formData.lastName.trim()) {
        nextErrors.lastName = "Last name is required.";
      }
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Email address is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email,
      )
    ) {
      nextErrors.email =
        "Enter a valid email address.";
    }

    if (!formData.password) {
      nextErrors.password = "Password is required.";
    } else if (
      mode === "signup" &&
      formData.password.length < 6
    ) {
      nextErrors.password =
        "Password must be at least 6 characters.";
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      if (mode === "signup") {
        await signup({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        });
      } else {
        await login({
          email: formData.email,
          password: formData.password,
        });
      }

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
      });

      setFormErrors({});

      navigate("/account");
    } catch (requestError) {
      console.error(
        "Account request failed:",
        requestError,
      );

      setError(
        requestError.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();

    setOrders([]);

    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    });

    setMode("signin");
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError("");
    setFormErrors({});

    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    });

    if (nextMode === "signin") {
      navigate("/account");
    } else {
      navigate("/signup");
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#f2eee6] text-[#211d1a]">
        <div className="flex items-center gap-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#746d64]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#71383a]" />
          Loading account
        </div>
      </main>
    );
  }

  if (user && isAuthenticated) {
    const navItems = [
      {
        id: "overview",
        label: "Overview",
        icon: UserRound,
        target: "account-overview",
      },
      {
        id: "orders",
        label: "Orders",
        icon: Package,
        target: "account-orders",
      },
      {
        id: "addresses",
        label: "Addresses",
        icon: MapPin,
        target: "account-addresses",
      },
    ];

    return (
      <main className="bg-[#f2eee6] text-[#211d1a]">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10 sm:py-20 lg:px-12">
          <div
            className="border-b border-[#d8d1c7] pb-10"
            data-aos="fade-up"
          >
            <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#71383a]">
              Your BeUnique account
            </p>

            <div className="mt-5 flex flex-col justify-between gap-7 sm:flex-row sm:items-end">
              <div>
                <h1 className="text-5xl font-medium tracking-[-0.06em] sm:text-7xl">
                  Hi, {user.firstName}.
                </h1>

                <p className="mt-4 text-sm text-[#746d64]">
                  Manage your orders and account details.
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex w-fit items-center gap-2 rounded-full border border-[#d8d1c7] px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#746d64] transition hover:border-[#71383a] hover:text-[#71383a]"
              >
                <LogOut size={14} strokeWidth={1.3} />
                Sign out
              </button>
            </div>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-[250px_1fr]">
            <aside
              className="h-fit border border-[#d8d1c7] bg-[#ebe5db] p-5 lg:sticky lg:top-24"
              data-aos="fade-up"
              data-aos-delay="80"
            >
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#71383a]">
                Account
              </p>

              <div className="mt-5 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    activeSection === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        scrollToSection(item.target)
                      }
                      className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-xs transition-all duration-300 ${
                        isActive
                          ? "bg-[#211d1a] text-[#f2eee6] shadow-sm"
                          : "text-[#746d64] hover:bg-[#ded6ca] hover:text-[#211d1a]"
                      }`}
                    >
                      <span>{item.label}</span>

                      <Icon
                        size={14}
                        strokeWidth={1.2}
                      />
                    </button>
                  );
                })}
              </div>
            </aside>

            <div className="space-y-8">
              <section
                id="account-overview"
                data-section="overview"
                className="scroll-mt-28 border border-[#d8d1c7] bg-[#ebe5db] p-6 sm:p-8"
                data-aos="fade-up"
                data-aos-delay="130"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#71383a] text-[#f2eee6]">
                    <UserRound
                      size={16}
                      strokeWidth={1.2}
                    />
                  </div>

                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#71383a]">
                      Profile
                    </p>

                    <p className="mt-1 text-sm">
                      {user.firstName} {user.lastName}
                    </p>
                  </div>
                </div>

                <div className="mt-7 grid gap-5 sm:grid-cols-2">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.16em] text-[#958d82]">
                      Email
                    </p>

                    <p className="mt-2 text-sm">
                      {user.email}
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] uppercase tracking-[0.16em] text-[#958d82]">
                      Phone
                    </p>

                    <p className="mt-2 text-sm">
                      {user.phone || "Not added"}
                    </p>
                  </div>
                </div>
              </section>

              <section
                id="account-orders"
                data-section="orders"
                className="scroll-mt-28 border border-[#d8d1c7] bg-[#ebe5db] p-6 sm:p-8"
                data-aos="fade-up"
                data-aos-delay="180"
              >
                <div className="flex items-end justify-between gap-5">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#71383a]">
                      Orders
                    </p>

                    <h2 className="mt-2 text-3xl font-medium tracking-[-0.045em]">
                      Order history
                    </h2>
                  </div>

                  <span className="text-[9px] uppercase tracking-[0.15em] text-[#958d82]">
                    {orders.length} order
                    {orders.length === 1 ? "" : "s"}
                  </span>
                </div>

                {ordersLoading ? (
                  <div className="mt-7 border-t border-[#d8d1c7] pt-7">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#958d82]">
                      Loading orders...
                    </p>
                  </div>
                ) : orders.length > 0 ? (
                  <div className="mt-7 space-y-3">
                    {orders.map((order) => (
                      <div
                        key={
                          order.reference ||
                          order._id ||
                          order.id
                        }
                        className="flex flex-col justify-between gap-4 border border-[#d8d1c7] bg-[#f2eee6] p-5 sm:flex-row sm:items-center"
                      >
                        <div>
                          <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#71383a]">
                            {order.status}
                          </p>

                          <p className="mt-2 text-sm font-medium">
                            {order.reference ||
                              order._id ||
                              "Order"}
                          </p>

                          {order.createdAt && (
                            <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-[#958d82]">
                              {new Date(
                                order.createdAt,
                              ).toLocaleDateString(
                                "en-NG",
                              )}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-8 sm:justify-end">
                          <span className="text-sm font-medium">
                            ₦
                            {Number(
                              order.total || 0,
                            ).toLocaleString("en-NG")}
                          </span>

                          {order.reference && (
                            <Link
                              to={`/payment/callback?orderReference=${encodeURIComponent(
                                order.reference,
                              )}`}
                              className="text-[#71383a]"
                            >
                              <ChevronRight
                                size={18}
                                strokeWidth={1.2}
                              />
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-7 border-t border-[#d8d1c7] pt-7">
                    <p className="text-sm leading-6 text-[#746d64]">
                      Your completed orders will appear here.
                    </p>

                    <Link
                      to="/shop"
                      className="mt-6 inline-flex items-center gap-3 rounded-full bg-[#211d1a] px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#f2eee6]"
                    >
                      Start shopping

                      <ArrowRight
                        size={14}
                        strokeWidth={1.2}
                      />
                    </Link>
                  </div>
                )}
              </section>

              <section
                id="account-addresses"
                data-section="addresses"
                className="scroll-mt-28 border border-[#d8d1c7] bg-[#ebe5db] p-6 sm:p-8"
                data-aos="fade-up"
                data-aos-delay="220"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#71383a] text-[#f2eee6]">
                    <MapPin
                      size={16}
                      strokeWidth={1.2}
                    />
                  </div>

                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#71383a]">
                      Addresses
                    </p>

                    <h2 className="mt-1 text-2xl font-medium tracking-[-0.04em]">
                      Saved addresses
                    </h2>
                  </div>
                </div>

                {Array.isArray(user.addresses) &&
                user.addresses.length > 0 ? (
                  <div className="mt-7 grid gap-4 sm:grid-cols-2">
                    {user.addresses.map(
                      (address, index) => (
                        <div
                          key={
                            address.id ||
                            address._id ||
                            index
                          }
                          className="border border-[#d8d1c7] bg-[#f2eee6] p-5"
                        >
                          <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#71383a]">
                            Address {index + 1}
                          </p>

                          <p className="mt-3 text-sm leading-6">
                            {address.address ||
                              address.street ||
                              address.line1 ||
                              "Saved address"}
                          </p>

                          {(address.city ||
                            address.state) && (
                            <p className="mt-1 text-xs text-[#746d64]">
                              {[
                                address.city,
                                address.state,
                              ]
                                .filter(Boolean)
                                .join(", ")}
                            </p>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <div className="mt-7 border-t border-[#d8d1c7] pt-7">
                    <p className="text-sm leading-6 text-[#746d64]">
                      You haven't saved a delivery
                      address yet.
                    </p>

                    <Link
                      to="/checkout"
                      className="mt-6 inline-flex items-center gap-3 rounded-full bg-[#211d1a] px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#f2eee6]"
                    >
                      Add during checkout
                      <ArrowRight
                        size={14}
                        strokeWidth={1.2}
                      />
                    </Link>
                  </div>
                )}
              </section>

              <div className="grid gap-4 sm:grid-cols-2">
                <div
                  className="border border-[#d8d1c7] p-6"
                  data-aos="fade-up"
                  data-aos-delay="250"
                >
                  <Mail
                    size={18}
                    strokeWidth={1.2}
                    className="text-[#71383a]"
                  />

                  <p className="mt-6 text-sm font-medium">
                    Account email
                  </p>

                  <p className="mt-2 text-xs leading-5 text-[#746d64]">
                    Used for order confirmations and
                    account access.
                  </p>
                </div>

                <div
                  className="border border-[#d8d1c7] p-6"
                  data-aos="fade-up"
                  data-aos-delay="300"
                >
                  <LockKeyhole
                    size={18}
                    strokeWidth={1.2}
                    className="text-[#71383a]"
                  />

                  <p className="mt-6 text-sm font-medium">
                    Secure account
                  </p>

                  <p className="mt-2 text-xs leading-5 text-[#746d64]">
                    Your password is securely hashed before
                    storage.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[75vh] bg-[#f2eee6] text-[#211d1a]">
      <div className="mx-auto grid max-w-7xl gap-14 px-6 py-16 sm:px-10 sm:py-20 lg:grid-cols-[1fr_460px] lg:px-12 lg:py-24">
        <div
          className="flex flex-col justify-center"
          data-aos="fade-up"
        >
          <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#71383a]">
            BeUnique account
          </p>

          <h1 className="mt-6 max-w-3xl text-6xl font-medium leading-[0.88] tracking-[-0.065em] sm:text-8xl">
            Your pieces.
            <br />
            Your orders.
            <br />
            Your account.
          </h1>

          <p className="mt-7 max-w-md text-sm leading-7 text-[#746d64]">
            Create an account to checkout, keep track of
            your orders, and make your next BeUnique
            purchase easier.
          </p>

          <div className="mt-10 flex flex-wrap gap-3 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#958d82]">
            <span className="flex items-center gap-2">
              <Check
                size={13}
                className="text-[#71383a]"
              />
              Secure checkout
            </span>

            <span className="flex items-center gap-2">
              <Check
                size={13}
                className="text-[#71383a]"
              />
              Order history
            </span>

            <span className="flex items-center gap-2">
              <Check
                size={13}
                className="text-[#71383a]"
              />
              Faster checkout
            </span>
          </div>
        </div>

        <div
          className="border border-[#d8d1c7] bg-[#ebe5db] p-6 sm:p-9"
          data-aos="fade-up"
          data-aos-delay="120"
        >
          <div className="flex border-b border-[#d8d1c7]">
            <button
              type="button"
              onClick={() => switchMode("signin")}
              className={`flex-1 border-b-2 pb-4 text-[9px] font-semibold uppercase tracking-[0.16em] transition ${
                mode === "signin"
                  ? "border-[#71383a] text-[#211d1a]"
                  : "border-transparent text-[#958d82]"
              }`}
            >
              Sign in
            </button>

            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={`flex-1 border-b-2 pb-4 text-[9px] font-semibold uppercase tracking-[0.16em] transition ${
                mode === "signup"
                  ? "border-[#71383a] text-[#211d1a]"
                  : "border-transparent text-[#958d82]"
              }`}
            >
              Create account
            </button>
          </div>

          <div className="mt-8">
            <h2 className="text-3xl font-medium tracking-[-0.05em]">
              {mode === "signin"
                ? "Welcome back."
                : "Join BeUnique."}
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#746d64]">
              {mode === "signin"
                ? "Sign in to continue to your account and checkout."
                : "Create your account before placing your first order."}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >
            {mode === "signup" && (
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="First name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First name"
                  autoComplete="given-name"
                  error={formErrors.firstName}
                />

                <Field
                  label="Last name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last name"
                  autoComplete="family-name"
                  error={formErrors.lastName}
                />
              </div>
            )}

            <Field
              label="Email address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              error={formErrors.email}
            />

            <Field
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              autoComplete={
                mode === "signup"
                  ? "new-password"
                  : "current-password"
              }
              error={formErrors.password}
            />

            {error && (
              <div
                role="alert"
                className="border border-red-300 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[#211d1a] px-6 text-xs font-medium uppercase tracking-[0.14em] text-[#f2eee6] transition hover:bg-[#71383a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Please wait..."
                : mode === "signin"
                  ? "Sign in"
                  : "Create account"}

              {!submitting && (
                <ArrowRight
                  size={15}
                  strokeWidth={1.3}
                />
              )}
            </button>
          </form>

          <div className="mt-7 border-t border-[#d8d1c7] pt-6 text-center">
            <p className="text-xs text-[#746d64]">
              {mode === "signin"
                ? "New to BeUnique?"
                : "Already have an account?"}
            </p>

            <button
              type="button"
              onClick={() =>
                switchMode(
                  mode === "signin"
                    ? "signup"
                    : "signin",
                )
              }
              className="mt-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#71383a]"
            >
              {mode === "signin"
                ? "Create your account"
                : "Sign in instead"}
            </button>
          </div>

          <div className="mt-7 flex items-start gap-3">
            <LockKeyhole
              size={14}
              strokeWidth={1.3}
              className="mt-0.5 shrink-0 text-[#71383a]"
            />

            <p className="text-[9px] leading-5 uppercase tracking-[0.09em] text-[#958d82]">
              Your password is securely hashed and your
              account session is protected.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Account;