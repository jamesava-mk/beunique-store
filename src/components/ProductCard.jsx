import { ArrowUpRight, Check, Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const isSoldOut = product.stock <= 0;

  const alternateImage = product.images?.find(
    (image) => image && image !== product.image,
  );

  const handleQuickAdd = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (isSoldOut) {
      return;
    }

    const selectedSize = product.sizes?.[0] || "S";
    const wasAdded = addToCart(product, selectedSize, 1);

    if (!wasAdded) {
      return;
    }

    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 1400);
  };

  return (
    <article className="group">
      <Link
        to={`/product/${product.id}`}
        className="block"
        aria-label={`View ${product.name}`}
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-[#e5ddd2]">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
            className={`h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.035] ${
              isSoldOut ? "opacity-50 grayscale-[0.15]" : ""
            }`}
          />

          {alternateImage && !isSoldOut && (
            <img
              src={alternateImage}
              alt=""
              aria-hidden="true"
              loading="lazy"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-700 ease-out group-hover:scale-[1.035] group-hover:opacity-100"
            />
          )}

          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
            <div className="min-h-[24px]">
              {product.badge && (
                <span className="inline-flex border border-[#211d1a]/15 bg-[#f2eee6]/90 px-2.5 py-1.5 text-[8px] font-semibold uppercase tracking-[0.14em] text-[#211d1a] backdrop-blur-sm">
                  {product.badge}
                </span>
              )}
            </div>

            <span className="translate-y-1 text-[8px] font-semibold uppercase tracking-[0.15em] text-[#211d1a]/0 transition duration-300 group-hover:translate-y-0 group-hover:text-[#211d1a]/60">
              View piece
            </span>
          </div>

          <div className="absolute bottom-4 right-4 flex h-10 w-10 translate-y-3 items-center justify-center rounded-full bg-[#211d1a] text-[#f2eee6] opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight size={16} strokeWidth={1.3} />
          </div>

          {isSoldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#211d1a]/10">
              <span className="border border-[#211d1a]/20 bg-[#f2eee6]/90 px-4 py-2 text-[8px] font-semibold uppercase tracking-[0.16em] text-[#211d1a] backdrop-blur-sm">
                Sold out
              </span>
            </div>
          )}
        </div>

        <div className="flex items-start justify-between gap-4 pt-4">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-medium tracking-[-0.015em] text-[#211d1a] transition-colors duration-300 group-hover:text-[#71383a]">
              {product.name}
            </h3>

            <p className="mt-1 text-[9px] uppercase tracking-[0.13em] text-[#958d82]">
              {product.subcategory || product.category}
            </p>
          </div>

          <p className="shrink-0 text-sm font-medium tracking-[-0.02em] text-[#211d1a]">
            ₦{product.price.toLocaleString()}
          </p>
        </div>
      </Link>

      <div className="mt-3 flex min-h-[18px] items-center justify-between gap-3">
        {!isSoldOut && product.stock <= 3 ? (
          <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-[#71383a]">
            Only {product.stock} left
          </p>
        ) : (
          <span />
        )}

        <button
          type="button"
          onClick={handleQuickAdd}
          disabled={isSoldOut || added}
          className="group/add inline-flex items-center gap-2 text-[8px] font-semibold uppercase tracking-[0.14em] text-[#746d64] transition hover:text-[#71383a] disabled:cursor-not-allowed disabled:opacity-30"
          aria-label={
            isSoldOut
              ? `${product.name} is sold out`
              : added
                ? `${product.name} added to cart`
                : `Quick add ${product.name}`
          }
        >
          {added ? (
            <>
              <Check size={13} strokeWidth={1.5} />
              Added
            </>
          ) : (
            <>
              <Plus
                size={13}
                strokeWidth={1.5}
                className="transition-transform duration-300 group-hover/add:rotate-90"
              />
              Quick add
            </>
          )}
        </button>
      </div>
    </article>
  );
}

export default ProductCard;