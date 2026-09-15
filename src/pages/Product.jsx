import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  X,
} from "lucide-react";
import { products } from "../data/products";
import { useCart } from "../context/CartContext";

function getCategory(product) {
  return typeof product?.category === "string" ? product.category : "";
}

function getSubcategory(product) {
  return typeof product?.subcategory === "string"
    ? product.subcategory
    : "";
}

function getProductName(product) {
  return typeof product?.name === "string" ? product.name : "Product";
}

function getProductImages(product) {
  const images = Array.isArray(product?.images)
    ? product.images.filter(Boolean)
    : [];

  const uniqueImages = [...new Set(images)];

  if (uniqueImages.length > 0) {
    return uniqueImages;
  }

  return product?.image ? [product.image] : [];
}

function getProductSizes(product) {
  if (!Array.isArray(product?.sizes)) {
    return ["XS", "S", "M", "L", "XL"];
  }

  return product.sizes.filter(Boolean);
}

function formatPrice(price) {
  return `₦${Number(price || 0).toLocaleString("en-NG")}`;
}

export default function Product() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const product = products.find(
    (item) => String(item?.id) === String(id),
  );

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const thumbnailRefs = useRef([]);
  const thumbnailContainerRef = useRef(null);

  const productImages = useMemo(
    () => getProductImages(product),
    [product],
  );

  const sizes = useMemo(() => getProductSizes(product), [product]);

  const relatedProducts = useMemo(() => {
    if (!product) {
      return [];
    }

    const category = getCategory(product).toLowerCase();
    const subcategory = getSubcategory(product).toLowerCase();

    return products
      .filter((item) => {
        if (!item || item.id === product.id) {
          return false;
        }

        const itemCategory = getCategory(item).toLowerCase();
        const itemSubcategory = getSubcategory(item).toLowerCase();

        if (category && itemCategory === category) {
          return true;
        }

        return Boolean(
          subcategory &&
            itemSubcategory &&
            itemSubcategory === subcategory,
        );
      })
      .slice(0, 4);
  }, [product]);

  const isSoldOut =
    Number(product?.stock) <= 0 ||
    product?.soldOut === true ||
    String(product?.status || "").toLowerCase() === "sold out";

  const hasMultipleImages = productImages.length > 1;
  const currentImage = productImages[activeImage] || product?.image;

  useEffect(() => {
    AOS.refresh();
  }, [activeImage, selectedSize, quantity]);

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      once: true,
      offset: 80,
    });

    return () => {
      AOS.refreshHard();
    };
  }, []);

  useEffect(() => {
    setActiveImage(0);
    setSelectedSize("");
    setQuantity(1);
    setAdded(false);
  }, [product?.id]);

  useEffect(() => {
    if (activeImage >= productImages.length) {
      setActiveImage(Math.max(productImages.length - 1, 0));
    }
  }, [activeImage, productImages.length]);

  useEffect(() => {
    const activeThumbnail = thumbnailRefs.current[activeImage];

    if (!activeThumbnail) {
      return;
    }

    activeThumbnail.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeImage]);

  useEffect(() => {
    if (!hasMultipleImages) {
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToPreviousImage();
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        goToNextImage();
      }

      if (event.key === "Escape" && sizeGuideOpen) {
        setSizeGuideOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeImage, hasMultipleImages, sizeGuideOpen]);

  useEffect(() => {
    if (!sizeGuideOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [sizeGuideOpen]);

  if (!product) {
    return (
      <main className="min-h-screen bg-[#f2eee6] px-6 py-24 text-[#211d1a]">
        <div className="mx-auto max-w-5xl">
          <Link
            to="/shop"
            className="mb-8 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#746d64] transition hover:text-[#211d1a]"
          >
            <ArrowLeft size={15} strokeWidth={1.5} />
            Back to shop
          </Link>

          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#958d82]">
            BeUnique Wears
          </p>

          <h1 className="text-5xl font-semibold tracking-[-0.05em] sm:text-6xl">
            Product not found.
          </h1>

          <p className="mt-5 max-w-md text-sm leading-7 text-[#746d64]">
            The piece you are looking for may have moved or is no longer
            available.
          </p>
        </div>
      </main>
    );
  }

  function goToPreviousImage() {
    if (!hasMultipleImages) {
      return;
    }

    setActiveImage((current) =>
      current === 0 ? productImages.length - 1 : current - 1,
    );
  }

  function goToNextImage() {
    if (!hasMultipleImages) {
      return;
    }

    setActiveImage((current) =>
      current === productImages.length - 1 ? 0 : current + 1,
    );
  }

  function decreaseQuantity() {
    setQuantity((current) => Math.max(1, current - 1));
  }

  function increaseQuantity() {
    const stock = Number(product.stock);

    if (stock > 0 && quantity >= stock) {
      return;
    }

    setQuantity((current) => current + 1);
  }

  function handleAddToCart() {
    if (isSoldOut || added) {
      return;
    }

    if (sizes.length > 0 && !selectedSize) {
      return;
    }

    const wasAdded = addToCart(product, selectedSize, quantity);

    if (!wasAdded) {
      return;
    }

    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 1800);
  }

  const needsSize = !isSoldOut && sizes.length > 0 && !selectedSize;

  return (
    <>
      <main className="min-h-screen bg-[#f2eee6] pb-24 text-[#211d1a] lg:pb-0">
        <div
          className="mx-auto max-w-[1440px] px-5 pb-6 pt-7 sm:px-8 lg:px-12"
          data-aos="fade-down"
          data-aos-duration="650"
        >
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-medium uppercase tracking-[0.15em] text-[#958d82]">
            <Link
              to="/"
              className="transition hover:text-[#211d1a]"
            >
              Home
            </Link>

            <span>/</span>

            <Link
              to="/shop"
              className="transition hover:text-[#211d1a]"
            >
              Shop
            </Link>

            <span>/</span>

            <span className="max-w-[220px] truncate text-[#211d1a]">
              {getProductName(product)}
            </span>
          </div>
        </div>

        <section className="mx-auto max-w-[1440px] px-5 pb-20 sm:px-8 lg:px-12 lg:pb-28">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] lg:items-start lg:gap-14 xl:gap-24">
            {/* PRODUCT GALLERY */}
            <div
              className="min-w-0"
              data-aos="fade-up"
              data-aos-duration="850"
            >
              <div className="group relative overflow-hidden bg-[#e7e0d6]">
                <div className="relative aspect-[4/5] w-full">
                  {currentImage ? (
                    <img
                      src={currentImage}
                      alt={getProductName(product)}
                      className={`h-full w-full object-cover transition duration-700 ${
                        isSoldOut ? "opacity-65 grayscale-[0.1]" : ""
                      }`}
                      draggable="false"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] font-semibold uppercase tracking-[0.16em] text-[#958d82]">
                      No image available
                    </div>
                  )}

                  <div className="absolute left-5 top-5 flex flex-col gap-2">
                    {isSoldOut && (
                      <span className="bg-[#211d1a] px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#f2eee6]">
                        Sold out
                      </span>
                    )}

                    {!isSoldOut &&
                      (product.new ||
                        product.isNew ||
                        String(product.badge || "").toLowerCase() ===
                          "new") && (
                        <span className="bg-[#f2eee6]/95 px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#211d1a] backdrop-blur-sm">
                          New
                        </span>
                      )}
                  </div>

                  {hasMultipleImages && (
                    <>
                      <button
                        type="button"
                        onClick={goToPreviousImage}
                        aria-label="Previous product image"
                        className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#f2eee6]/70 bg-[#f2eee6]/90 text-[#211d1a] opacity-100 shadow-sm transition hover:bg-[#211d1a] hover:text-[#f2eee6] sm:left-5 sm:h-12 sm:w-12 lg:opacity-0 lg:group-hover:opacity-100"
                      >
                        <ChevronLeft size={20} strokeWidth={1.5} />
                      </button>

                      <button
                        type="button"
                        onClick={goToNextImage}
                        aria-label="Next product image"
                        className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#f2eee6]/70 bg-[#f2eee6]/90 text-[#211d1a] opacity-100 shadow-sm transition hover:bg-[#211d1a] hover:text-[#f2eee6] sm:right-5 sm:h-12 sm:w-12 lg:opacity-0 lg:group-hover:opacity-100"
                      >
                        <ChevronRight size={20} strokeWidth={1.5} />
                      </button>

                      <div className="absolute bottom-4 right-4 bg-[#211d1a]/90 px-3 py-2 text-[9px] font-medium tracking-[0.14em] text-[#f2eee6]">
                        {String(activeImage + 1).padStart(2, "0")} /{" "}
                        {String(productImages.length).padStart(2, "0")}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {hasMultipleImages && (
                <div className="relative mt-3">
                  <button
                    type="button"
                    aria-label="Scroll thumbnails left"
                    onClick={() => {
                      thumbnailContainerRef.current?.scrollBy({
                        left: -260,
                        behavior: "smooth",
                      });
                    }}
                    className="absolute left-0 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#d8d1c7] bg-[#f2eee6] text-[#211d1a] shadow-sm transition hover:bg-[#211d1a] hover:text-[#f2eee6] sm:flex"
                  >
                    <ChevronLeft size={17} strokeWidth={1.5} />
                  </button>

                  <div
                    ref={thumbnailContainerRef}
                    className="flex gap-2 overflow-x-auto scroll-smooth px-0 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-11"
                  >
                    {productImages.map((image, index) => {
                      const isActive = activeImage === index;

                      return (
                        <button
                          key={`${image}-${index}`}
                          ref={(element) => {
                            thumbnailRefs.current[index] = element;
                          }}
                          type="button"
                          onClick={() => setActiveImage(index)}
                          aria-label={`View product image ${index + 1}`}
                          aria-current={isActive ? "true" : undefined}
                          className={`relative h-24 w-20 flex-shrink-0 overflow-hidden bg-[#e7e0d6] transition sm:h-28 sm:w-24 ${
                            isActive
                              ? "ring-1 ring-[#211d1a] ring-offset-2 ring-offset-[#f2eee6]"
                              : "opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${getProductName(product)} view ${index + 1}`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            draggable="false"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />

                          {isActive && (
                            <span className="absolute inset-x-0 bottom-0 h-[2px] bg-[#211d1a]" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    aria-label="Scroll thumbnails right"
                    onClick={() => {
                      thumbnailContainerRef.current?.scrollBy({
                        left: 260,
                        behavior: "smooth",
                      });
                    }}
                    className="absolute right-0 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#d8d1c7] bg-[#f2eee6] text-[#211d1a] shadow-sm transition hover:bg-[#211d1a] hover:text-[#f2eee6] sm:flex"
                  >
                    <ChevronRight size={17} strokeWidth={1.5} />
                  </button>
                </div>
              )}

              {hasMultipleImages && (
                <div className="mt-3 flex items-center justify-between text-[9px] font-medium uppercase tracking-[0.15em] text-[#958d82] sm:hidden">
                  <span>Swipe to view</span>

                  <span>
                    {String(activeImage + 1).padStart(2, "0")} /{" "}
                    {String(productImages.length).padStart(2, "0")}
                  </span>
                </div>
              )}
            </div>

            {/* PURCHASE PANEL */}
            <div
              className="min-w-0 lg:sticky lg:top-28"
              data-aos="fade-up"
              data-aos-delay="120"
              data-aos-duration="850"
            >
              <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#958d82]">
                {getCategory(product) || "Collection"}

                {getSubcategory(product) && (
                  <>
                    <span className="mx-2">/</span>
                    {getSubcategory(product)}
                  </>
                )}
              </div>

              <div className="mt-4 flex items-start justify-between gap-6">
                <h1 className="max-w-xl text-4xl font-semibold leading-[0.94] tracking-[-0.05em] sm:text-5xl lg:text-[4.25rem]">
                  {getProductName(product)}
                </h1>

                {product.badge &&
                  String(product.badge).toLowerCase() !== "new" && (
                    <span className="mt-2 shrink-0 border border-[#d8d1c7] px-3 py-2 text-[8px] font-semibold uppercase tracking-[0.14em] text-[#746d64]">
                      {product.badge}
                    </span>
                  )}
              </div>

              <div className="mt-6 text-xl font-medium tracking-[-0.025em]">
                {formatPrice(product.price)}
              </div>

              <div className="my-8 h-px w-full bg-[#d8d1c7]" />

              {product.description && (
                <p className="max-w-xl text-sm leading-7 text-[#746d64]">
                  {product.description}
                </p>
              )}

              {!isSoldOut && sizes.length > 0 && (
                <div className="mt-9">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">
                      Select size
                    </span>

                    <button
                      type="button"
                      onClick={() => setSizeGuideOpen(true)}
                      className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#746d64] underline underline-offset-4 transition hover:text-[#211d1a]"
                    >
                      Size guide
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => {
                      const isSelected = selectedSize === size;

                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          aria-pressed={isSelected}
                          className={`flex h-11 min-w-14 items-center justify-center border px-4 text-xs font-medium uppercase tracking-[0.1em] transition ${
                            isSelected
                              ? "border-[#211d1a] bg-[#211d1a] text-[#f2eee6]"
                              : "border-[#d8d1c7] bg-transparent text-[#211d1a] hover:border-[#211d1a]"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>

                  {needsSize && (
                    <p className="mt-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#71383a]">
                      Select a size to continue
                    </p>
                  )}
                </div>
              )}

              {!isSoldOut && (
                <div className="mt-8">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">
                      Quantity
                    </span>

                    {Number(product.stock) > 0 &&
                      Number(product.stock) <= 3 && (
                        <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#71383a]">
                          Only {product.stock} left
                        </span>
                      )}
                  </div>

                  <div className="flex h-12 w-fit items-center border border-[#d8d1c7]">
                    <button
                      type="button"
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                      className="flex h-full w-12 items-center justify-center text-[#211d1a] transition hover:bg-[#e8e1d7] disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Minus size={15} strokeWidth={1.5} />
                    </button>

                    <span className="flex h-full w-12 items-center justify-center border-x border-[#d8d1c7] text-sm">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={increaseQuantity}
                      disabled={
                        Number(product.stock) > 0 &&
                        quantity >= Number(product.stock)
                      }
                      aria-label="Increase quantity"
                      className="flex h-full w-12 items-center justify-center text-[#211d1a] transition hover:bg-[#e8e1d7] disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Plus size={15} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-9">
                <button
                  type="button"
                  disabled={isSoldOut || added || needsSize}
                  onClick={handleAddToCart}
                  className={`flex h-14 w-full items-center justify-center text-[10px] font-semibold uppercase tracking-[0.19em] transition ${
                    isSoldOut || needsSize
                      ? "cursor-not-allowed bg-[#d8d1c7] text-[#958d82]"
                      : added
                        ? "bg-[#71383a] text-[#f2eee6]"
                        : "bg-[#211d1a] text-[#f2eee6] hover:bg-[#71383a]"
                  }`}
                >
                  {isSoldOut
                    ? "Sold out"
                    : added
                      ? "Added to cart"
                      : needsSize
                        ? "Select a size"
                        : "Add to cart"}
                </button>
              </div>

              <div className="mt-9 border-t border-[#d8d1c7]">
                <div className="grid grid-cols-2 border-b border-[#d8d1c7] py-5">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#958d82]">
                    Category
                  </span>

                  <span className="text-right text-sm">
                    {getCategory(product) || "—"}
                  </span>
                </div>

                {getSubcategory(product) && (
                  <div className="grid grid-cols-2 border-b border-[#d8d1c7] py-5">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#958d82]">
                      Style
                    </span>

                    <span className="text-right text-sm">
                      {getSubcategory(product)}
                    </span>
                  </div>
                )}

                {typeof product.stock === "number" && (
                  <div className="grid grid-cols-2 border-b border-[#d8d1c7] py-5">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#958d82]">
                      Availability
                    </span>

                    <span className="text-right text-sm">
                      {isSoldOut
                        ? "Sold out"
                        : `${product.stock} available`}
                    </span>
                  </div>
                )}

                {product.material && (
                  <div className="grid grid-cols-2 border-b border-[#d8d1c7] py-5">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#958d82]">
                      Material
                    </span>

                    <span className="text-right text-sm">
                      {product.material}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-8 flex gap-4 bg-[#e8e1d7] p-5">
                <div className="pt-1">
                  <ArrowRight size={17} strokeWidth={1.5} />
                </div>

                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em]">
                    Delivery
                  </p>

                  <p className="mt-2 text-xs leading-6 text-[#746d64]">
                    Lagos delivery and nationwide shipping available.
                    Delivery details will be confirmed with your order.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <section className="border-t border-[#d8d1c7]">
            <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
              <div
                className="mb-10 flex items-end justify-between gap-6"
                data-aos="fade-up"
              >
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#958d82]">
                    Continue exploring
                  </p>

                  <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
                    You may also like.
                  </h2>
                </div>

                <Link
                  to="/shop"
                  className="hidden items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#746d64] transition hover:text-[#211d1a] sm:inline-flex"
                >
                  Shop all
                  <ArrowRight size={14} strokeWidth={1.5} />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-5">
                {relatedProducts.map((item, index) => {
                  const itemImages = getProductImages(item);
                  const itemImage = itemImages[0] || item.image;
                  const itemSoldOut =
                    Number(item.stock) <= 0 ||
                    item.soldOut === true ||
                    String(item.status || "").toLowerCase() ===
                      "sold out";

                  return (
                    <Link
                      key={`related-${item.id ?? `${item.name}-${index}`}`}
                      to={`/product/${item.id}`}
                      className="group"
                      data-aos="fade-up"
                      data-aos-delay={index * 70}
                    >
                      <div className="relative aspect-[4/5] overflow-hidden bg-[#e7e0d6]">
                        {itemImage ? (
                          <img
                            src={itemImage}
                            alt={getProductName(item)}
                            loading="lazy"
                            className={`h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.035] ${
                              itemSoldOut
                                ? "opacity-55 grayscale-[0.1]"
                                : ""
                            }`}
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[9px] uppercase tracking-[0.15em] text-[#958d82]">
                            No image
                          </div>
                        )}

                        {itemSoldOut && (
                          <span className="absolute left-3 top-3 bg-[#f2eee6]/95 px-3 py-2 text-[8px] font-semibold uppercase tracking-[0.14em]">
                            Sold out
                          </span>
                        )}

                        {!itemSoldOut &&
                          (item.new ||
                            item.isNew ||
                            String(item.badge || "").toLowerCase() ===
                              "new") && (
                            <span className="absolute left-3 top-3 bg-[#f2eee6]/95 px-3 py-2 text-[8px] font-semibold uppercase tracking-[0.14em]">
                              New
                            </span>
                          )}

                        <span className="absolute bottom-3 right-3 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-[#211d1a] text-[#f2eee6] opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                          <ArrowRight
                            size={14}
                            strokeWidth={1.4}
                          />
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-3 pt-4">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-medium tracking-[-0.015em] transition-colors group-hover:text-[#71383a]">
                            {getProductName(item)}
                          </h3>

                          <p className="mt-1 text-[8px] uppercase tracking-[0.13em] text-[#958d82]">
                            {getSubcategory(item) ||
                              getCategory(item) ||
                              "Collection"}
                          </p>
                        </div>

                        <span className="shrink-0 text-sm font-medium">
                          {formatPrice(item.price)}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <Link
                to="/shop"
                className="mt-10 inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#746d64] transition hover:text-[#211d1a] sm:hidden"
              >
                Shop all
                <ArrowRight size={14} strokeWidth={1.5} />
              </Link>
            </div>
          </section>
        )}
      </main>

      {/* MOBILE PURCHASE BAR */}
      {!isSoldOut && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#d8d1c7] bg-[#f2eee6]/95 px-4 py-3 backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex max-w-xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[9px] font-semibold uppercase tracking-[0.12em] text-[#958d82]">
                {getProductName(product)}
              </p>

              <p className="mt-1 text-sm font-medium">
                {formatPrice(product.price)}
              </p>
            </div>

            <button
              type="button"
              disabled={added || needsSize}
              onClick={handleAddToCart}
              className={`flex h-12 min-w-[150px] items-center justify-center px-5 text-[9px] font-semibold uppercase tracking-[0.16em] transition ${
                added
                  ? "bg-[#71383a] text-[#f2eee6]"
                  : needsSize
                    ? "bg-[#d8d1c7] text-[#958d82]"
                    : "bg-[#211d1a] text-[#f2eee6]"
              }`}
            >
              {added
                ? "Added"
                : needsSize
                  ? "Select size"
                  : "Add to cart"}
            </button>
          </div>
        </div>
      )}

      {/* SIZE GUIDE */}
      {sizeGuideOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#211d1a]/60 px-5 py-8"
          onClick={() => setSizeGuideOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="size-guide-title"
        >
          <div
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-[#f2eee6] p-6 text-[#211d1a] sm:p-9"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSizeGuideOpen(false)}
              aria-label="Close size guide"
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center border border-[#d8d1c7] transition hover:bg-[#211d1a] hover:text-[#f2eee6]"
            >
              <X size={17} strokeWidth={1.5} />
            </button>

            <div className="pr-12">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#958d82]">
                BeUnique Wears
              </p>

              <h2
                id="size-guide-title"
                className="mt-3 text-3xl font-semibold tracking-[-0.04em]"
              >
                Size guide
              </h2>

              <p className="mt-4 max-w-lg text-xs leading-6 text-[#746d64]">
                Use these measurements as a general reference. If you are
                between sizes, compare them with a similar garment you
                already own.
              </p>
            </div>

            <div className="mt-8 overflow-x-auto border border-[#d8d1c7]">
              <table className="w-full min-w-[520px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#d8d1c7] bg-[#e8e1d7]">
                    <th className="px-4 py-4 text-[9px] font-semibold uppercase tracking-[0.14em]">
                      Size
                    </th>

                    <th className="px-4 py-4 text-[9px] font-semibold uppercase tracking-[0.14em]">
                      Bust
                    </th>

                    <th className="px-4 py-4 text-[9px] font-semibold uppercase tracking-[0.14em]">
                      Waist
                    </th>

                    <th className="px-4 py-4 text-[9px] font-semibold uppercase tracking-[0.14em]">
                      Hips
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {[
                    ["XS", '31–32"', '24–25"', '34–35"'],
                    ["S", '33–34"', '26–27"', '36–37"'],
                    ["M", '35–36"', '28–29"', '38–39"'],
                    ["L", '37–39"', '30–32"', '40–42"'],
                    ["XL", '40–42"', '33–35"', '43–45"'],
                  ].map(([size, bust, waist, hips]) => (
                    <tr
                      key={size}
                      className="border-b border-[#d8d1c7] last:border-b-0"
                    >
                      <td className="px-4 py-4 text-sm font-medium">
                        {size}
                      </td>

                      <td className="px-4 py-4 text-sm text-[#746d64]">
                        {bust}
                      </td>

                      <td className="px-4 py-4 text-sm text-[#746d64]">
                        {waist}
                      </td>

                      <td className="px-4 py-4 text-sm text-[#746d64]">
                        {hips}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex items-start gap-3 border-t border-[#d8d1c7] pt-5">
              <ArrowRight
                size={16}
                strokeWidth={1.5}
                className="mt-1 shrink-0"
              />

              <p className="text-xs leading-6 text-[#746d64]">
                For the most accurate fit, measure a garment that already
                fits you well and compare its dimensions with this guide.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}