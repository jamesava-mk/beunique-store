import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  LoaderCircle,
  XCircle,
} from "lucide-react";
import { useCart } from "../context/CartContext";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();

  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState(
    "We're confirming your payment securely.",
  );
  const [transaction, setTransaction] = useState(null);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function verifyPayment() {
      const reference =
        searchParams.get("tx_ref") ||
        searchParams.get("transaction_id");

      if (!reference) {
        setStatus("failed");
        setMessage(
          "We couldn't find a payment reference to verify.",
        );
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/payments/verify/${encodeURIComponent(
            reference,
          )}`,
        );

        const data = await response.json();

        if (cancelled) return;

        if (!response.ok || !data.success) {
          setStatus("failed");
          setMessage(
            data.message ||
              "We couldn't verify your payment.",
          );
          return;
        }

        const paymentStatus = String(
          data.data?.status || "",
        ).toLowerCase();

        if (paymentStatus === "successful") {
          const orderReference =
            data.data?.orderReference;

          setTransaction(data.data);

          if (orderReference) {
            try {
              const orderResponse = await fetch(
                `${API_URL}/api/orders/${encodeURIComponent(
                  orderReference,
                )}`,
              );

              const orderData = await orderResponse.json();

              if (
                !cancelled &&
                orderResponse.ok &&
                orderData.success
              ) {
                setOrder(orderData.data);
              }
            } catch (orderError) {
              console.error(
                "Order retrieval error:",
                orderError,
              );
            }
          }

          if (cancelled) return;

          clearCart();
          setStatus("success");
          setMessage(
            "Your payment was successful and your order is confirmed.",
          );
          return;
        }

        if (paymentStatus === "pending") {
          setStatus("pending");
          setMessage(
            "Your payment is still being processed. Please check again shortly.",
          );
          return;
        }

        setStatus("failed");
        setMessage(
          "The payment was not completed successfully.",
        );
      } catch (error) {
        console.error("Payment verification error:", error);

        if (cancelled) return;

        setStatus("failed");
        setMessage(
          "We couldn't connect to the payment verification service.",
        );
      }
    }

    verifyPayment();

    return () => {
      cancelled = true;
    };
  }, [searchParams, clearCart]);

  return (
    <main className="min-h-[70vh] bg-[#f2eee6] px-6 py-20 text-[#211d1a]">
      <div className="mx-auto flex max-w-2xl justify-center">
        <section className="w-full rounded-[2rem] border border-[#d8d1c7] bg-white p-8 text-center shadow-sm md:p-12">
          {status === "verifying" && (
            <>
              <LoaderCircle
                className="mx-auto mb-6 animate-spin text-[#71383a]"
                size={52}
                strokeWidth={1.5}
              />

              <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-[#746d64]">
                Payment verification
              </p>

              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Confirming your payment
              </h1>

              <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#746d64]">
                {message}
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle2
                className="mx-auto mb-6 text-[#71383a]"
                size={58}
                strokeWidth={1.5}
              />

              <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-[#746d64]">
                Order confirmed
              </p>

              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Thank you for your order.
              </h1>

              <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#746d64]">
                {message}
              </p>

              {(order?.reference ||
                transaction?.orderReference) && (
                <div className="mx-auto mt-8 max-w-sm border-y border-[#d8d1c7] py-4">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-[#958d82]">
                    Order number
                  </p>

                  <p className="mt-2 break-all text-sm font-medium text-[#211d1a]">
                    {order?.reference ||
                      transaction?.orderReference}
                  </p>
                </div>
              )}

              {order?.customer?.email && (
                <p className="mt-5 text-xs leading-5 text-[#746d64]">
                  A confirmation has been recorded for{" "}
                  <span className="font-medium text-[#211d1a]">
                    {order.customer.email}
                  </span>
                  .
                </p>
              )}

              {order?.items?.length > 0 && (
                <div className="mx-auto mt-8 max-w-md border-t border-[#d8d1c7] pt-6 text-left">
                  <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-[#958d82]">
                    Your order
                  </p>

                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div
                        key={`${item.productId}-${item.size}-${index}`}
                        className="flex items-center justify-between gap-4 text-sm"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-[#211d1a]">
                            {item.name}
                          </p>

                          <p className="mt-1 text-xs text-[#746d64]">
                            Qty {item.quantity}
                            {item.size
                              ? ` · Size ${item.size}`
                              : ""}
                          </p>
                        </div>

                        <p className="shrink-0 text-sm text-[#211d1a]">
                          ₦
                          {(
                            item.price * item.quantity
                          ).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 space-y-2 border-t border-[#d8d1c7] pt-4 text-sm">
                    <div className="flex justify-between text-[#746d64]">
                      <span>Subtotal</span>
                      <span>
                        ₦
                        {order.subtotal?.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between text-[#746d64]">
                      <span>Delivery</span>
                      <span>
                        ₦
                        {order.deliveryFee?.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between pt-2 font-semibold text-[#211d1a]">
                      <span>Total</span>
                      <span>
                        ₦{order.total?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {transaction?.reference && (
                <div className="mx-auto mt-6 max-w-sm">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#958d82]">
                    Payment reference
                  </p>

                  <p className="mt-1 break-all text-xs text-[#746d64]">
                    {transaction.reference}
                  </p>
                </div>
              )}

              <Link
                to="/shop"
                className="mt-8 inline-flex rounded-full bg-[#211d1a] px-7 py-3 text-sm font-medium text-white transition hover:bg-[#71383a]"
              >
                Continue shopping
              </Link>
            </>
          )}

          {status === "pending" && (
            <>
              <LoaderCircle
                className="mx-auto mb-6 text-[#71383a]"
                size={58}
                strokeWidth={1.5}
              />

              <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-[#746d64]">
                Payment pending
              </p>

              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Payment is processing.
              </h1>

              <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#746d64]">
                {message}
              </p>

              <Link
                to="/"
                className="mt-8 inline-flex rounded-full bg-[#211d1a] px-7 py-3 text-sm font-medium text-white transition hover:bg-[#71383a]"
              >
                Return home
              </Link>
            </>
          )}

          {status === "failed" && (
            <>
              <XCircle
                className="mx-auto mb-6 text-[#71383a]"
                size={58}
                strokeWidth={1.5}
              />

              <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-[#746d64]">
                Payment unsuccessful
              </p>

              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                We couldn't confirm your payment.
              </h1>

              <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#746d64]">
                {message}
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  to="/checkout"
                  className="inline-flex rounded-full bg-[#211d1a] px-7 py-3 text-sm font-medium text-white transition hover:bg-[#71383a]"
                >
                  Return to checkout
                </Link>

                <Link
                  to="/"
                  className="inline-flex rounded-full border border-[#d8d1c7] px-7 py-3 text-sm font-medium text-[#211d1a] transition hover:border-[#211d1a]"
                >
                  Return home
                </Link>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

export default PaymentCallback;