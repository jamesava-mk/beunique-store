import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  LockKeyhole,
  Pencil,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";
const TOKEN_KEY = "beunique-session";

const deliveryRates = {
  Lagos: 3000,
  Ogun: 4000,
  Oyo: 4500,
  Abuja: 5000,
  Rivers: 5500,
  Delta: 5500,
  Edo: 5000,
  Enugu: 5500,
  Anambra: 5500,
  Imo: 5500,
  "Akwa Ibom": 6000,
  "Cross River": 6000,
  Benue: 5500,
  Kaduna: 6000,
  Kano: 6500,
  Kwara: 5000,
  Osun: 4500,
  Ondo: 4500,
  Ekiti: 4500,
  Plateau: 6000,
  Nasarawa: 5500,
  Kogi: 5000,
  Bauchi: 6500,
  Gombe: 6500,
  Katsina: 7000,
  Kebbi: 7000,
  Sokoto: 7500,
  Zamfara: 7000,
  Jigawa: 7000,
  Yobe: 7500,
  Borno: 8000,
  Taraba: 7000,
  Adamawa: 7500,
  Bayelsa: 6000,
  Ebonyi: 6000,
  Abia: 5500,
  Niger: 6000,
};

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
};

function Field({
  error,
  label,
  name,
  onChange,
  value,
  hint,
  className = "",
  disabled = false,
  ...props
}) {
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor={name}
          className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#746d64]"
        >
          {label}
        </label>

        {hint && (
          <span className="text-[10px] text-[#958d82]">{hint}</span>
        )}
      </div>

      <input
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        {...props}
        className={`mt-2 h-12 w-full rounded-none border bg-transparent px-4 text-sm text-[#211d1a] outline-none transition placeholder:text-[#aaa196] ${
          error
            ? "border-red-500 focus:border-red-500"
            : "border-[#d8d1c7] focus:border-[#71383a]"
        } ${
          disabled
            ? "cursor-not-allowed bg-[#ebe5db] text-[#746d64]"
            : ""
        }`}
      />

      {error && (
        <p id={`${name}-error`} className="mt-2 text-[11px] text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

function StepIndicator({ currentStep = 2 }) {
  const steps = [
    { number: "01", label: "Cart" },
    { number: "02", label: "Details" },
    { number: "03", label: "Payment" },
  ];

  return (
    <div className="flex items-center">
      {steps.map((step, index) => {
        const isActive = currentStep === index + 1;
        const isComplete = currentStep > index + 1;

        return (
          <div
            key={step.number}
            className="flex flex-1 items-center last:flex-none"
          >
            <div
              className={`flex items-center gap-2 ${
                isActive || isComplete
                  ? "text-[#211d1a]"
                  : "text-[#958d82]"
              }`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full border text-[9px] font-semibold ${
                  isActive
                    ? "border-[#71383a] bg-[#71383a] text-[#f2eee6]"
                    : isComplete
                      ? "border-[#211d1a] bg-[#211d1a] text-[#f2eee6]"
                      : "border-[#d8d1c7]"
                }`}
              >
                {isComplete ? <Check size={12} /> : step.number}
              </span>

              <span className="hidden text-[9px] font-semibold uppercase tracking-[0.15em] sm:block">
                {step.label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div className="mx-3 h-px flex-1 bg-[#d8d1c7] sm:mx-5" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Checkout() {
  const navigate = useNavigate();
  const { cartItems, cartTotal } = useCart();

  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);

  const deliveryFee = formData.state
    ? deliveryRates[formData.state] || 7000
    : 0;

  const orderTotal = cartTotal + deliveryFee;

  const itemCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const formattedTotal = `₦${orderTotal.toLocaleString("en-NG")}`;

  /*
   * Checkout is an authenticated ecommerce action.
   *
   * Guests can browse and maintain a cart, but they cannot
   * proceed to payment without a BeUnique account.
   */
  useEffect(() => {
    let isMounted = true;

    const authenticateCheckout = async () => {
      const token = localStorage.getItem(TOKEN_KEY);

      if (!token) {
        navigate("/account?redirect=/checkout", {
          replace: true,
        });
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          localStorage.removeItem(TOKEN_KEY);

          navigate("/account?redirect=/checkout", {
            replace: true,
          });

          return;
        }

        const data = await response.json();

        if (!data.success || !data.data?.user) {
          localStorage.removeItem(TOKEN_KEY);

          navigate("/account?redirect=/checkout", {
            replace: true,
          });

          return;
        }

        if (!isMounted) {
          return;
        }

        const authenticatedUser = data.data.user;

        setUser(authenticatedUser);

        setFormData((currentData) => ({
          ...currentData,
          firstName:
            authenticatedUser.firstName || currentData.firstName,
          lastName:
            authenticatedUser.lastName || currentData.lastName,
          email: authenticatedUser.email || currentData.email,
          phone:
            authenticatedUser.phone || currentData.phone,
        }));
      } catch (error) {
        console.error("Checkout authentication failed:", error);

        localStorage.removeItem(TOKEN_KEY);

        navigate("/account?redirect=/checkout", {
          replace: true,
        });
      } finally {
        if (isMounted) {
          setAuthLoading(false);
        }
      }
    };

    authenticateCheckout();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: "",
    }));

    setPaymentError("");
  };

  const validateForm = () => {
    const requiredFields = [
      "firstName",
      "lastName",
      "phone",
      "address",
      "city",
      "state",
    ];

    const nextErrors = {};

    requiredFields.forEach((field) => {
      if (!formData[field].trim()) {
        nextErrors[field] = "This field is required.";
      }
    });

    if (!formData.email.trim()) {
      nextErrors.email = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    const phoneDigits = formData.phone.replace(/\D/g, "");

    if (formData.phone.trim() && phoneDigits.length < 10) {
      nextErrors.phone = "Enter a valid phone number.";
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const token = localStorage.getItem(TOKEN_KEY);

    if (!token || !user) {
      navigate("/account?redirect=/checkout", {
        replace: true,
      });

      return;
    }

    setPaymentError("");

    const nextErrors = validateForm();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);

      const firstInvalidField = document.getElementById(
        Object.keys(nextErrors)[0],
      );

      if (firstInvalidField) {
        firstInvalidField.focus();

        firstInvalidField.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }

      return;
    }

    if (!formData.state || !deliveryFee) {
      setPaymentError(
        "Please select a delivery state before continuing.",
      );

      return;
    }

    if (cartItems.length === 0) {
      setPaymentError("Your cart is empty.");

      return;
    }

    /*
     * Prevent a client-side email manipulation from changing
     * the authenticated checkout identity.
     */
    if (
      user.email &&
      formData.email.trim().toLowerCase() !== user.email.toLowerCase()
    ) {
      setPaymentError(
        "Your checkout email must match your BeUnique account email.",
      );

      return;
    }

    setIsSubmitting(true);

    try {
      const orderItems = cartItems.map((item) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size || null,
        image: item.image,
      }));

      const response = await fetch(
        `${API_BASE_URL}/api/payments/initialize`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: formData.email.trim().toLowerCase(),
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            phone: formData.phone.trim(),
            address: formData.address.trim(),
            city: formData.city.trim(),
            state: formData.state,
            items: orderItems,
            subtotal: cartTotal,
            deliveryFee,
            amount: orderTotal,
            callbackUrl: `${window.location.origin}/payment/callback`,
          }),
        },
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem(TOKEN_KEY);

        navigate("/account?redirect=/checkout", {
          replace: true,
        });

        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to start secure payment.",
        );
      }

      const authorizationUrl = data.data?.authorizationUrl;

      if (!authorizationUrl) {
        throw new Error(
          "Payment was not initialized correctly. Please try again.",
        );
      }

      window.location.href = authorizationUrl;
    } catch (error) {
      console.error(
        "Payment initialization failed:",
        error,
      );

      setPaymentError(
        error.message ||
          "Something went wrong while preparing payment. Please try again.",
      );

      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#f2eee6] text-[#211d1a]">
        <div className="flex items-center gap-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#746d64]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#71383a]" />
          Verifying your account
        </div>
      </main>
    );
  }

  if (cartItems.length === 0) {
    return (
      <main className="min-h-[70vh] bg-[#f2eee6] px-6 py-24 text-[#211d1a] sm:px-10 lg:px-12">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#71383a]">
            Checkout
          </p>

          <h1 className="mt-6 text-5xl font-medium leading-[0.9] tracking-[-0.06em] sm:text-7xl">
            Your cart is empty.
          </h1>

          <p className="mt-6 max-w-sm text-sm leading-6 text-[#746d64]">
            Add something from the collection before checking out.
          </p>

          <Link
            to="/shop"
            className="mt-9 inline-flex items-center gap-3 rounded-full bg-[#71383a] px-6 py-3.5 text-xs font-medium uppercase tracking-[0.12em] text-[#f2eee6] transition hover:bg-[#211d1a]"
          >
            Return to shop
            <ArrowRight size={15} strokeWidth={1.5} />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#f2eee6] text-[#211d1a]">
      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-10 sm:py-12 lg:px-12 lg:py-16">
        <div className="flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/cart"
            className="inline-flex w-fit items-center gap-3 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#746d64] transition hover:text-[#71383a]"
          >
            <ArrowLeft size={15} strokeWidth={1.4} />
            Back to cart
          </Link>

          <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#746d64]">
            <LockKeyhole size={14} strokeWidth={1.4} />
            Secure checkout
          </div>
        </div>

        <div className="mt-10 border-b border-[#d8d1c7] pb-9">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#71383a]">
                BeUnique Wears
              </p>

              <h1 className="mt-4 text-5xl font-medium tracking-[-0.06em] sm:text-6xl lg:text-7xl">
                Checkout
              </h1>

              <p className="mt-5 max-w-lg text-sm leading-6 text-[#746d64]">
                Complete your delivery details, review your order and
                continue to secure payment.
              </p>

              {user && (
                <div className="mt-5 inline-flex items-center gap-2 border border-[#d8d1c7] bg-[#ebe5db] px-4 py-2.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#746d64]">
                  <Check
                    size={12}
                    strokeWidth={1.5}
                    className="text-[#71383a]"
                  />
                  Signed in as {user.email}
                </div>
              )}
            </div>

            <div className="w-full max-w-md lg:w-[420px]">
              <StepIndicator currentStep={2} />
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_390px] lg:gap-20">
          <form
            onSubmit={handleSubmit}
            noValidate
            className="min-w-0 space-y-14"
          >
            <section>
              <div className="flex items-baseline gap-4">
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#71383a]">
                  01
                </p>

                <p className="text-[9px] uppercase tracking-[0.18em] text-[#958d82]">
                  Contact & delivery
                </p>
              </div>

              <h2 className="mt-4 text-3xl font-medium tracking-[-0.045em] sm:text-4xl">
                Where should we deliver?
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-[#746d64]">
                Your account details are already attached to this order.
                Add your delivery information below.
              </p>

              <div className="mt-8">
                <div className="mb-5 flex items-center gap-3">
                  <span className="h-px w-5 bg-[#71383a]" />

                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#746d64]">
                    Account information
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="First name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First name"
                    autoComplete="given-name"
                    error={errors.firstName}
                    disabled
                  />

                  <Field
                    label="Last name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last name"
                    autoComplete="family-name"
                    error={errors.lastName}
                    disabled
                  />
                </div>

                <div className="mt-5">
                  <Field
                    label="Email address"
                    name="email"
                    type="email"
                    inputMode="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    error={errors.email}
                    hint="Your account email"
                    disabled
                  />
                </div>

                <div className="mt-5">
                  <Field
                    label="Phone number"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="08012345678"
                    autoComplete="tel"
                    error={errors.phone}
                    hint="For delivery updates"
                  />
                </div>

                <div className="mt-5">
                  <Link
                    to="/account"
                    className="inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#71383a] transition hover:text-[#211d1a]"
                  >
                    <Pencil size={12} strokeWidth={1.4} />
                    Manage account details
                  </Link>
                </div>
              </div>

              <div className="mt-10">
                <div className="mb-5 flex items-center gap-3">
                  <span className="h-px w-5 bg-[#71383a]" />

                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#746d64]">
                    Delivery address
                  </p>
                </div>

                <Field
                  label="Street address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="House number and street"
                  autoComplete="street-address"
                  error={errors.address}
                />

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <Field
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                    autoComplete="address-level2"
                    error={errors.city}
                  />

                  <div>
                    <div className="flex items-baseline justify-between gap-3">
                      <label
                        htmlFor="state"
                        className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#746d64]"
                      >
                        State
                      </label>

                      <span className="text-[10px] text-[#958d82]">
                        Required
                      </span>
                    </div>

                    <div className="relative">
                      <select
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        aria-invalid={Boolean(errors.state)}
                        aria-describedby={
                          errors.state ? "state-error" : undefined
                        }
                        className={`mt-2 h-12 w-full appearance-none rounded-none border bg-[#f2eee6] px-4 pr-10 text-sm text-[#211d1a] outline-none transition ${
                          errors.state
                            ? "border-red-500 focus:border-red-500"
                            : "border-[#d8d1c7] focus:border-[#71383a]"
                        }`}
                      >
                        <option value="">Select state</option>

                        {Object.keys(deliveryRates)
                          .sort()
                          .map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                      </select>

                      <ChevronDown
                        size={15}
                        strokeWidth={1.4}
                        className="pointer-events-none absolute right-4 top-[26px] -translate-y-1/2 text-[#746d64]"
                      />
                    </div>

                    {errors.state && (
                      <p
                        id="state-error"
                        className="mt-2 text-[11px] text-red-500"
                      >
                        {errors.state}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 border border-[#d8d1c7] bg-[#ebe5db] p-5">
                  <div className="flex gap-4">
                    <ShieldCheck
                      size={18}
                      strokeWidth={1.4}
                      className="mt-0.5 shrink-0 text-[#71383a]"
                    />

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#211d1a]">
                        Delivery
                      </p>

                      {formData.state ? (
                        <>
                          <p className="mt-2 text-sm leading-6 text-[#746d64]">
                            Delivery to {formData.state} is{" "}
                            <span className="font-medium text-[#211d1a]">
                              ₦{deliveryFee.toLocaleString("en-NG")}
                            </span>
                            .
                          </p>

                          <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-[#958d82]">
                            Estimated delivery: 2–5 business days
                          </p>
                        </>
                      ) : (
                        <p className="mt-2 text-sm leading-6 text-[#746d64]">
                          Select your state to see the delivery fee before
                          you continue.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="border-t border-[#d8d1c7] pt-12">
              <div className="flex items-baseline gap-4">
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#71383a]">
                  02
                </p>

                <p className="text-[9px] uppercase tracking-[0.18em] text-[#958d82]">
                  Payment
                </p>
              </div>

              <h2 className="mt-4 text-3xl font-medium tracking-[-0.045em] sm:text-4xl">
                Pay securely
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-[#746d64]">
                Your payment will be handled securely by Flutterwave. You
                won't enter card details directly on BeUnique Wears.
              </p>

              <div className="mt-8 overflow-hidden border border-[#d8d1c7] bg-[#ebe5db]">
                <div className="flex items-start justify-between gap-5 p-6 sm:p-7">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 items-center rounded-md border border-[#d8d1c7] bg-[#f2eee6] px-3">
                        <span className="text-[10px] font-bold tracking-[-0.02em] text-[#211d1a]">
                          flutterwave
                        </span>
                      </div>

                      <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#71383a]">
                        Secure payment
                      </span>
                    </div>

                    <p className="mt-4 text-sm font-medium">
                      Pay online with Flutterwave
                    </p>

                    <p className="mt-2 max-w-md text-sm leading-6 text-[#746d64]">
                      You'll be redirected to Flutterwave to complete payment
                      securely after your order details are confirmed.
                    </p>
                  </div>

                  <ShieldCheck
                    size={22}
                    strokeWidth={1.4}
                    className="shrink-0 text-[#71383a]"
                  />
                </div>

                <div className="border-t border-[#d8d1c7] px-6 py-4 sm:px-7">
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[9px] uppercase tracking-[0.12em] text-[#958d82]">
                    <span>Card</span>
                    <span>Bank transfer</span>
                    <span>USSD</span>
                    <span>Mobile money</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 border border-[#71383a] bg-[#71383a] p-6 text-[#f2eee6] sm:p-7">
                <div className="flex items-end justify-between gap-5">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#f2eee6]/60">
                      Amount due today
                    </p>

                    <p className="mt-2 text-sm text-[#f2eee6]/70">
                      {itemCount} {itemCount === 1 ? "item" : "items"} ·{" "}
                      {formData.state
                        ? `${formData.state} delivery`
                        : "Delivery calculated at checkout"}
                    </p>
                  </div>

                  <p className="text-2xl font-medium tracking-[-0.04em]">
                    {formattedTotal}
                  </p>
                </div>
              </div>

              {paymentError && (
                <div
                  role="alert"
                  className="mt-5 border border-red-300 bg-red-50 px-5 py-4 text-sm leading-6 text-red-700"
                >
                  {paymentError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[#211d1a] px-6 text-xs font-medium uppercase tracking-[0.14em] text-[#f2eee6] transition hover:bg-[#71383a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? "Preparing secure payment..."
                  : "Continue to secure payment"}

                {!isSubmitting && (
                  <ArrowRight size={16} strokeWidth={1.4} />
                )}
              </button>

              <div className="mt-5 flex items-start justify-center gap-2 text-center">
                <LockKeyhole
                  size={13}
                  strokeWidth={1.4}
                  className="mt-0.5 shrink-0 text-[#71383a]"
                />

                <p className="max-w-md text-[9px] leading-5 uppercase tracking-[0.1em] text-[#958d82]">
                  Your payment details are handled securely by the payment
                  provider.
                </p>
              </div>
            </section>
          </form>

          <aside className="h-fit lg:sticky lg:top-28">
            <div className="border border-[#d8d1c7] bg-[#ebe5db] p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#71383a]">
                    Review order
                  </p>

                  <h2 className="mt-2 text-2xl font-medium tracking-[-0.04em]">
                    Your cart
                  </h2>
                </div>

                <Link
                  to="/cart"
                  className="inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#746d64] transition hover:text-[#71383a]"
                >
                  <Pencil size={12} strokeWidth={1.4} />
                  Edit
                </Link>
              </div>

              <div className="mt-7 space-y-6">
                {cartItems.map((item) => (
                  <div
                    key={`${item.id}-${item.size}`}
                    className="flex gap-4"
                  >
                    <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-[#d8d1c7]">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />

                      <span className="absolute bottom-1 right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#211d1a] px-1 text-[8px] font-medium text-[#f2eee6]">
                        {item.quantity}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-sm font-medium leading-5">
                          {item.name}
                        </h3>

                        <p className="shrink-0 text-sm">
                          ₦
                          {(item.price * item.quantity).toLocaleString(
                            "en-NG",
                          )}
                        </p>
                      </div>

                      <p className="mt-2 text-[9px] uppercase tracking-[0.12em] text-[#958d82]">
                        Size {item.size}
                      </p>

                      <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-[#958d82]">
                        Qty {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="my-7 h-px bg-[#d8d1c7]" />

              <div className="space-y-4 text-sm">
                <div className="flex justify-between gap-5">
                  <span className="text-[#746d64]">Subtotal</span>

                  <span>
                    ₦{cartTotal.toLocaleString("en-NG")}
                  </span>
                </div>

                <div className="flex justify-between gap-5">
                  <div>
                    <span className="text-[#746d64]">Delivery</span>

                    {formData.state && (
                      <span className="ml-2 text-[9px] uppercase tracking-[0.08em] text-[#958d82]">
                        {formData.state}
                      </span>
                    )}
                  </div>

                  <span>
                    {deliveryFee
                      ? `₦${deliveryFee.toLocaleString("en-NG")}`
                      : "Select state"}
                  </span>
                </div>

                <div className="border-t border-[#d8d1c7] pt-5">
                  <div className="flex items-end justify-between gap-5">
                    <div>
                      <span className="font-medium">Total</span>

                      <p className="mt-1 text-[9px] uppercase tracking-[0.1em] text-[#958d82]">
                        Amount due today
                      </p>
                    </div>

                    <span className="text-xl font-medium tracking-[-0.03em]">
                      ₦{orderTotal.toLocaleString("en-NG")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-4 px-2">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={16}
                  strokeWidth={1.4}
                  className="mt-0.5 shrink-0 text-[#71383a]"
                />

                <p className="text-[9px] leading-5 tracking-[0.04em] text-[#958d82]">
                  Your account, contact and delivery details are used to
                  process and deliver your order.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <LockKeyhole
                  size={16}
                  strokeWidth={1.4}
                  className="mt-0.5 shrink-0 text-[#71383a]"
                />

                <p className="text-[9px] leading-5 tracking-[0.04em] text-[#958d82]">
                  Payment details are handled securely by Flutterwave rather
                  than stored directly by BeUnique Wears.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default Checkout;