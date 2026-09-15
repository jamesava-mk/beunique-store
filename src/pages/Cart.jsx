import { ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Cart() {
  const {
    cartItems,
    cartTotal,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[65vh] bg-[#f2eee6] px-5 py-24 text-center text-[#211d1a] sm:px-8 lg:px-12">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#71383a]">
          Your cart
        </p>

        <h1 className="mt-6 text-5xl font-medium tracking-[-0.045em] sm:text-7xl lg:text-8xl">
          Your cart is empty.
        </h1>

        <p className="mx-auto mt-7 max-w-sm text-sm leading-7 text-[#746d64]">
          The pieces you like will live here while you decide.
        </p>

        <Link
          to="/shop"
          className="mt-10 inline-flex items-center gap-4 border border-[#71383a] px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#71383a] transition hover:bg-[#71383a] hover:text-[#f2eee6]"
        >
          Continue shopping
          <ArrowRight size={15} strokeWidth={1.4} />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#f2eee6] text-[#211d1a]">
      <div className="mx-auto max-w-[1600px] px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
        <div className="flex items-end justify-between border-b border-[#d8d1c7] pb-10">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#71383a]">
              Your cart
            </p>

            <h1 className="mt-5 text-6xl font-medium tracking-[-0.05em] sm:text-8xl lg:text-9xl">
              Your cart.
            </h1>
          </div>

          <p className="hidden text-[10px] uppercase tracking-[0.16em] text-[#958d82] sm:block">
            {cartItems.length}{" "}
            {cartItems.length === 1 ? "item" : "items"}
          </p>
        </div>

        <div className="mt-10 grid gap-14 lg:grid-cols-[1fr_360px] lg:gap-20">
          <div>
            {cartItems.map((item) => {
              const reachedStockLimit = item.quantity >= item.stock;

              return (
                <div
                  key={`${item.id}-${item.size}`}
                  className="flex gap-4 border-b border-[#d8d1c7] py-6 first:pt-0 sm:gap-6"
                >
                  <Link
                    to={`/product/${item.id}`}
                    className="h-36 w-28 shrink-0 overflow-hidden bg-[#e8e1d7] sm:h-48 sm:w-36"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover transition duration-500 hover:scale-105"
                    />
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link
                          to={`/product/${item.id}`}
                          className="text-sm font-medium transition hover:text-[#71383a]"
                        >
                          {item.name}
                        </Link>

                        <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-[#746d64]">
                          {item.category} / Size {item.size}
                        </p>
                      </div>

                      <p className="text-sm font-medium">
                        ₦{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>

                    <div className="mt-5 flex items-end justify-between">
                      <div>
                        <div className="flex items-center border border-[#d8d1c7] bg-[#f7f4ee]">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.size,
                                item.quantity - 1,
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center text-[#746d64] transition hover:text-[#71383a]"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} strokeWidth={1.4} />
                          </button>

                          <span className="flex h-9 w-9 items-center justify-center border-x border-[#d8d1c7] text-xs">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.size,
                                item.quantity + 1,
                              )
                            }
                            disabled={reachedStockLimit}
                            className="flex h-9 w-9 items-center justify-center text-[#746d64] transition hover:text-[#71383a] disabled:opacity-30"
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} strokeWidth={1.4} />
                          </button>
                        </div>

                        {reachedStockLimit && (
                          <p className="mt-2 text-[9px] uppercase tracking-[0.1em] text-[#71383a]">
                            Maximum available
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeFromCart(item.id, item.size)
                        }
                        className="text-[#958d82] transition hover:text-[#71383a]"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 size={17} strokeWidth={1.4} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="mt-8 flex items-center justify-between">
              <Link
                to="/shop"
                className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.16em] text-[#746d64] transition hover:text-[#71383a]"
              >
                <ArrowRight size={14} strokeWidth={1.4} />
                Continue shopping
              </Link>

              <button
                type="button"
                onClick={clearCart}
                className="text-[10px] uppercase tracking-[0.16em] text-[#958d82] transition hover:text-[#71383a]"
              >
                Clear cart
              </button>
            </div>
          </div>

          <aside className="h-fit border border-[#d8d1c7] bg-[#211d1a] p-6 text-[#f2eee6] sm:p-8 lg:sticky lg:top-28">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c9a98a]">
              Order summary
            </p>

            <h2 className="mt-4 text-4xl font-medium tracking-[-0.04em]">
              Your total.
            </h2>

            <div className="mt-8 space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-[#958d82]">Subtotal</span>
                <span>₦{cartTotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#958d82]">Delivery</span>
                <span className="text-right text-xs text-[#958d82]">
                  Calculated at checkout
                </span>
              </div>

              <div className="border-t border-[#3a3530] pt-5">
                <div className="flex justify-between text-base font-medium">
                  <span>Total</span>
                  <span>₦{cartTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <Link
              to="/checkout"
              className="mt-8 flex h-14 w-full items-center justify-center gap-3 bg-[#71383a] text-[10px] font-semibold uppercase tracking-[0.16em] text-[#f2eee6] transition hover:bg-[#8a484a]"
            >
              Proceed to checkout
              <ArrowRight size={16} strokeWidth={1.4} />
            </Link>

            <p className="mt-5 text-center text-[9px] uppercase leading-5 tracking-[0.12em] text-[#746d64]">
              Secure checkout / Ships from Lagos
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default Cart;