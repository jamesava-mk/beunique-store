import AOS from "aos";
import "aos/dist/aos.css";
import {
  ArrowDownUp,
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleX,
  Grid2X2,
  Search,
  Shirt,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { categories, products } from "../data/products";

const PAGE_SIZE = 12;

const categoryIcons = {
  Dresses: Shirt,
  "Two Piece": Grid2X2,
  Tops: Tag,
  Bottoms: ArrowDownUp,
  Bags: ShoppingBag,
  Accessories: Sparkles,
};

const availabilityOptions = [
  {
    value: "all",
    label: "All pieces",
  },
  {
    value: "in-stock",
    label: "In stock",
  },
  {
    value: "sold-out",
    label: "Sold out",
  },
];

const priceOptions = [
  {
    value: "all",
    label: "Any price",
  },
  {
    value: "under-40",
    label: "Under ₦40,000",
  },
  {
    value: "40-55",
    label: "₦40,000 — ₦55,000",
  },
  {
    value: "over-55",
    label: "Over ₦55,000",
  },
];

const sortOptions = [
  {
    value: "featured",
    label: "Featured",
  },
  {
    value: "newest",
    label: "Newest",
  },
  {
    value: "price-low",
    label: "Price: low to high",
  },
  {
    value: "price-high",
    label: "Price: high to low",
  },
  {
    value: "alphabetical",
    label: "Alphabetical",
  },
];

function getSafeCategoryList() {
  if (!Array.isArray(categories)) {
    return [];
  }

  return categories
    .map((category) => {
      if (typeof category === "string") {
        return category.trim();
      }

      if (category && typeof category.name === "string") {
        return category.name.trim();
      }

      if (category && typeof category.category === "string") {
        return category.category.trim();
      }

      return "";
    })
    .filter(Boolean);
}

function getProductCategory(product) {
  if (!product || typeof product !== "object") {
    return "";
  }

  if (typeof product.category === "string") {
    return product.category.trim();
  }

  return "";
}

function getProductSubcategory(product) {
  if (!product || typeof product !== "object") {
    return "";
  }

  if (typeof product.subcategory === "string") {
    return product.subcategory.trim();
  }

  return "";
}

function getProductName(product) {
  if (!product || typeof product !== "object") {
    return "";
  }

  return typeof product.name === "string" ? product.name.trim() : "";
}

function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCategory = searchParams.get("category") || "All";
  const initialSubcategory = searchParams.get("type") || "All";
  const initialSearch = searchParams.get("search") || "";

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeSubcategory, setActiveSubcategory] =
    useState(initialSubcategory);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [sort, setSort] = useState("featured");
  const [availability, setAvailability] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const safeCategories = useMemo(() => getSafeCategoryList(), []);

  const availableProducts = useMemo(() => {
    return Array.isArray(products) ? products.filter(Boolean) : [];
  }, []);

  const categoryList = useMemo(() => {
    const fromProducts = availableProducts
      .map(getProductCategory)
      .filter(Boolean);

    return [...new Set([...safeCategories, ...fromProducts])];
  }, [availableProducts, safeCategories]);

  const categoryCounts = useMemo(() => {
    return categoryList.reduce((result, category) => {
      const normalizedCategory = category.toLowerCase();

      result[category] = availableProducts.filter((product) => {
        const productCategory = getProductCategory(product).toLowerCase();

        return productCategory === normalizedCategory;
      }).length;

      return result;
    }, {});
  }, [availableProducts, categoryList]);

  const totalInStock = useMemo(() => {
    return availableProducts.filter((product) => Number(product.stock) > 0)
      .length;
  }, [availableProducts]);

  const totalSoldOut = useMemo(() => {
    return availableProducts.filter((product) => Number(product.stock) <= 0)
      .length;
  }, [availableProducts]);

  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (availability !== "all") {
      count += 1;
    }

    if (priceRange !== "all") {
      count += 1;
    }

    if (sort !== "featured") {
      count += 1;
    }

    return count;
  }, [availability, priceRange, sort]);

  const subcategories = useMemo(() => {
    if (activeCategory === "All") {
      return [];
    }

    const values = availableProducts
      .filter((product) => {
        const productCategory = getProductCategory(product);

        return (
          productCategory.toLowerCase() === activeCategory.toLowerCase()
        );
      })
      .map(getProductSubcategory)
      .filter(Boolean);

    return [...new Set(values)];
  }, [activeCategory, availableProducts]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const result = availableProducts.filter((product) => {
      const productCategory = getProductCategory(product);
      const productSubcategory = getProductSubcategory(product);
      const productName = getProductName(product);

      const matchesCategory =
        activeCategory === "All" ||
        productCategory.toLowerCase() === activeCategory.toLowerCase();

      const matchesSubcategory =
        activeSubcategory === "All" ||
        productSubcategory.toLowerCase() ===
          activeSubcategory.toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        productName.toLowerCase().includes(normalizedSearch) ||
        productCategory.toLowerCase().includes(normalizedSearch) ||
        productSubcategory.toLowerCase().includes(normalizedSearch);

      const stock = Number(product.stock) || 0;

      const matchesAvailability =
        availability === "all" ||
        (availability === "in-stock" && stock > 0) ||
        (availability === "sold-out" && stock <= 0);

      const price = Number(product.price) || 0;

      const matchesPrice =
        priceRange === "all" ||
        (priceRange === "under-40" && price < 40000) ||
        (priceRange === "40-55" && price >= 40000 && price <= 55000) ||
        (priceRange === "over-55" && price > 55000);

      return (
        matchesCategory &&
        matchesSubcategory &&
        matchesSearch &&
        matchesAvailability &&
        matchesPrice
      );
    });

    return [...result].sort((a, b) => {
      if (sort === "price-low") {
        return (Number(a.price) || 0) - (Number(b.price) || 0);
      }

      if (sort === "price-high") {
        return (Number(b.price) || 0) - (Number(a.price) || 0);
      }

      if (sort === "alphabetical") {
        return getProductName(a).localeCompare(getProductName(b));
      }

      if (sort === "newest") {
        const aIsNew = a.badge?.toLowerCase() === "new";
        const bIsNew = b.badge?.toLowerCase() === "new";

        return Number(bIsNew) - Number(aIsNew);
      }

      return 0;
    });
  }, [
    activeCategory,
    activeSubcategory,
    availability,
    availableProducts,
    priceRange,
    searchTerm,
    sort,
  ]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const resetFilters = () => {
    setAvailability("all");
    setPriceRange("all");
    setSort("featured");
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setActiveSubcategory("All");
    setVisibleCount(PAGE_SIZE);

    const nextParams = new URLSearchParams(searchParams);

    if (category === "All") {
      nextParams.delete("category");
    } else {
      nextParams.set("category", category);
    }

    nextParams.delete("type");

    setSearchParams(nextParams);
  };

  const handleSubcategoryChange = (subcategory) => {
    setActiveSubcategory(subcategory);
    setVisibleCount(PAGE_SIZE);

    const nextParams = new URLSearchParams(searchParams);

    if (subcategory === "All") {
      nextParams.delete("type");
    } else {
      nextParams.set("type", subcategory);
    }

    setSearchParams(nextParams);
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;

    setSearchTerm(value);
    setVisibleCount(PAGE_SIZE);

    const nextParams = new URLSearchParams(searchParams);

    if (value.trim()) {
      nextParams.set("search", value);
    } else {
      nextParams.delete("search");
    }

    setSearchParams(nextParams);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setVisibleCount(PAGE_SIZE);

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("search");

    setSearchParams(nextParams);
  };

  useEffect(() => {
    const categoryFromUrl = searchParams.get("category") || "All";
    const typeFromUrl = searchParams.get("type") || "All";
    const searchFromUrl = searchParams.get("search") || "";

    setActiveCategory(categoryFromUrl);
    setActiveSubcategory(typeFromUrl);
    setSearchTerm(searchFromUrl);
    setVisibleCount(PAGE_SIZE);
  }, [searchParams]);

  useEffect(() => {
    AOS.init({
      duration: 750,
      easing: "ease-out-cubic",
      once: true,
      offset: 70,
    });

    AOS.refresh();
  }, []);

  useEffect(() => {
    AOS.refreshHard();
  }, [
    activeCategory,
    activeSubcategory,
    availability,
    priceRange,
    sort,
    searchTerm,
    visibleCount,
  ]);

  useEffect(() => {
    if (
      activeCategory !== "All" &&
      !categoryList.some(
        (category) =>
          category.toLowerCase() === activeCategory.toLowerCase(),
      )
    ) {
      setActiveCategory("All");
      setActiveSubcategory("All");
    }
  }, [activeCategory, categoryList]);

  useEffect(() => {
    if (
      activeSubcategory !== "All" &&
      !subcategories.some(
        (subcategory) =>
          subcategory.toLowerCase() === activeSubcategory.toLowerCase(),
      )
    ) {
      setActiveSubcategory("All");
    }
  }, [activeSubcategory, subcategories]);

  return (
    <main className="min-h-screen bg-[#f2eee6] text-[#211d1a]">
      {/* =========================================================
          SHOP INTRO
      ========================================================= */}
      <section className="px-5 pb-12 pt-28 sm:px-8 sm:pb-16 lg:px-12 lg:pt-36">
        <div className="mx-auto max-w-[1440px]">
          <div
            data-aos="fade-up"
            className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end"
          >
            <div>
              <p className="mb-5 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#71383a]">
                The collection
              </p>

              <h1 className="max-w-4xl text-6xl font-medium leading-[0.86] tracking-[-0.07em] sm:text-7xl lg:text-[8rem]">
                Shop
                <br />
                <span className="text-[#71383a]">different.</span>
              </h1>
            </div>

            <div className="max-w-sm lg:pb-2">
              <p className="text-sm leading-7 text-[#746d64]">
                A considered edit of pieces made for the way you actually
                want to dress.
              </p>

              <p className="mt-5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#958d82]">
                {availableProducts.length} pieces · Lagos · Worldwide
                delivery
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          CATEGORY NAVIGATION
      ========================================================= */}
      <section className="sticky top-0 z-30 border-y border-[#d8d1c7] bg-[#f2eee6]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center gap-2 overflow-x-auto px-5 py-3 scrollbar-hide sm:px-8 lg:px-12">
          <button
            type="button"
            onClick={() => handleCategoryChange("All")}
            className={`shrink-0 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.14em] transition ${
              activeCategory === "All"
                ? "bg-[#211d1a] text-[#f2eee6]"
                : "text-[#746d64] hover:text-[#211d1a]"
            }`}
          >
            All pieces
          </button>

          {categoryList.map((category) => {
            const count = categoryCounts[category] || 0;

            return (
              <button
                key={`category-${category}`}
                type="button"
                onClick={() => handleCategoryChange(category)}
                className={`shrink-0 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.14em] transition ${
                  activeCategory.toLowerCase() === category.toLowerCase()
                    ? "bg-[#211d1a] text-[#f2eee6]"
                    : "text-[#746d64] hover:text-[#211d1a]"
                }`}
              >
                {category}
                <span className="ml-1.5 opacity-50">({count})</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* =========================================================
          SEARCH + FILTER BAR
      ========================================================= */}
      <section className="border-b border-[#d8d1c7]">
        <div className="mx-auto max-w-[1440px] px-5 py-5 sm:px-8 lg:px-12">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search
                size={15}
                strokeWidth={1.4}
                className="absolute left-0 top-1/2 -translate-y-1/2 text-[#958d82]"
              />

              <input
                type="search"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search the collection"
                className="w-full border-b border-[#d8d1c7] bg-transparent py-3 pl-7 pr-8 text-sm text-[#211d1a] outline-none placeholder:text-[#958d82] focus:border-[#211d1a]"
                aria-label="Search the collection"
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[#958d82] transition hover:text-[#211d1a]"
                  aria-label="Clear search"
                >
                  <CircleX size={15} strokeWidth={1.4} />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowFilters((current) => !current)}
                className={`inline-flex items-center gap-2 border px-4 py-2.5 text-[9px] font-semibold uppercase tracking-[0.14em] transition ${
                  showFilters || activeFilterCount > 0
                    ? "border-[#211d1a] bg-[#211d1a] text-[#f2eee6]"
                    : "border-[#d8d1c7] text-[#746d64] hover:border-[#211d1a] hover:text-[#211d1a]"
                }`}
              >
                <SlidersHorizontal size={13} strokeWidth={1.4} />
                Filters

                {activeFilterCount > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#71383a] px-1 text-[7px] text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <div className="relative">
                <select
                  value={sort}
                  onChange={(event) => {
                    setSort(event.target.value);
                    setVisibleCount(PAGE_SIZE);
                  }}
                  className="appearance-none border border-[#d8d1c7] bg-transparent py-2.5 pl-4 pr-9 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#746d64] outline-none transition hover:border-[#211d1a] hover:text-[#211d1a]"
                  aria-label="Sort products"
                >
                  {sortOptions.map((option) => (
                    <option
                      key={`sort-${option.value}`}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={13}
                  strokeWidth={1.4}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#746d64]"
                />
              </div>
            </div>
          </div>

          {/* FILTER PANEL */}
          {showFilters && (
            <div
              data-aos="fade-down"
              className="mt-5 border-t border-[#d8d1c7] pt-6"
            >
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <p className="mb-3 text-[8px] font-semibold uppercase tracking-[0.18em] text-[#958d82]">
                    Availability
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {availabilityOptions.map((option) => (
                      <button
                        key={`availability-${option.value}`}
                        type="button"
                        onClick={() => {
                          setAvailability(option.value);
                          setVisibleCount(PAGE_SIZE);
                        }}
                        className={`inline-flex items-center gap-2 border px-3 py-2 text-[8px] font-semibold uppercase tracking-[0.12em] transition ${
                          availability === option.value
                            ? "border-[#211d1a] bg-[#211d1a] text-[#f2eee6]"
                            : "border-[#d8d1c7] text-[#746d64] hover:border-[#211d1a]"
                        }`}
                      >
                        {availability === option.value && (
                          <Check size={11} strokeWidth={1.6} />
                        )}
                        {option.label}
                      </button>
                    ))}
                  </div>

                  <p className="mt-3 text-[8px] uppercase tracking-[0.1em] text-[#958d82]">
                    {totalInStock} available · {totalSoldOut} sold out
                  </p>
                </div>

                <div>
                  <p className="mb-3 text-[8px] font-semibold uppercase tracking-[0.18em] text-[#958d82]">
                    Price
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {priceOptions.map((option) => (
                      <button
                        key={`price-${option.value}`}
                        type="button"
                        onClick={() => {
                          setPriceRange(option.value);
                          setVisibleCount(PAGE_SIZE);
                        }}
                        className={`inline-flex items-center gap-2 border px-3 py-2 text-[8px] font-semibold uppercase tracking-[0.12em] transition ${
                          priceRange === option.value
                            ? "border-[#211d1a] bg-[#211d1a] text-[#f2eee6]"
                            : "border-[#d8d1c7] text-[#746d64] hover:border-[#211d1a]"
                        }`}
                      >
                        {priceRange === option.value && (
                          <Check size={11} strokeWidth={1.6} />
                        )}
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center gap-2 text-[8px] font-semibold uppercase tracking-[0.14em] text-[#746d64] transition hover:text-[#71383a]"
                  >
                    <X size={12} strokeWidth={1.4} />
                    Clear filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================
          SUBCATEGORY NAV
      ========================================================= */}
      {activeCategory !== "All" && subcategories.length > 0 && (
        <section className="border-b border-[#d8d1c7] bg-[#ebe5dc]">
          <div className="mx-auto flex max-w-[1440px] items-center gap-2 overflow-x-auto px-5 py-3 scrollbar-hide sm:px-8 lg:px-12">
            <button
              type="button"
              onClick={() => handleSubcategoryChange("All")}
              className={`shrink-0 px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.14em] transition ${
                activeSubcategory === "All"
                  ? "text-[#71383a]"
                  : "text-[#958d82] hover:text-[#211d1a]"
              }`}
            >
              Everything
            </button>

            {subcategories.map((subcategory) => (
              <button
                key={`subcategory-${activeCategory}-${subcategory}`}
                type="button"
                onClick={() => handleSubcategoryChange(subcategory)}
                className={`shrink-0 px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.14em] transition ${
                  activeSubcategory.toLowerCase() ===
                  subcategory.toLowerCase()
                    ? "text-[#71383a]"
                    : "text-[#958d82] hover:text-[#211d1a]"
                }`}
              >
                {subcategory}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* =========================================================
          CATEGORY DISCOVERY
      ========================================================= */}
      {activeCategory === "All" && !searchTerm && (
        <section className="px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <div className="mx-auto max-w-[1440px]">
            <div
              data-aos="fade-up"
              className="mb-10 flex items-end justify-between gap-6"
            >
              <div>
                <p className="mb-3 text-[8px] font-semibold uppercase tracking-[0.2em] text-[#71383a]">
                  Start somewhere
                </p>

                <h2 className="text-3xl font-medium tracking-[-0.04em] sm:text-4xl">
                  Shop by category
                </h2>
              </div>

              <span className="hidden text-[8px] uppercase tracking-[0.16em] text-[#958d82] sm:block">
                {categoryList.length} categories
              </span>
            </div>

            <div className="grid grid-cols-2 gap-px bg-[#d8d1c7] md:grid-cols-3">
              {categoryList.map((category, index) => {
                const Icon = categoryIcons[category] || Tag;
                const categoryProducts = availableProducts.filter(
                  (product) =>
                    getProductCategory(product).toLowerCase() ===
                    category.toLowerCase(),
                );

                const representativeProduct = categoryProducts.find(
                  (product) => product.image,
                );

                return (
                  <Link
                    key={`discovery-${category}`}
                    to={`/shop?category=${encodeURIComponent(category)}`}
                    onClick={() => {
                      setActiveCategory(category);
                      setActiveSubcategory("All");
                    }}
                    data-aos="fade-up"
                    data-aos-delay={Math.min(index * 60, 300)}
                    className="group relative aspect-[4/3] overflow-hidden bg-[#ded5ca]"
                  >
                    {representativeProduct?.image ? (
                      <img
                        src={representativeProduct.image}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.035]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#ded5ca] text-[#746d64]">
                        <Icon size={32} strokeWidth={1} />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-[#211d1a]/70 via-[#211d1a]/5 to-transparent" />

                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-[#f2eee6] sm:p-6">
                      <div>
                        <p className="text-lg font-medium tracking-[-0.025em]">
                          {category}
                        </p>

                        <p className="mt-1 text-[8px] uppercase tracking-[0.14em] text-white/60">
                          {categoryCounts[category] || 0} pieces
                        </p>
                      </div>

                      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 transition duration-300 group-hover:bg-[#f2eee6] group-hover:text-[#211d1a]">
                        <ArrowUpRight size={15} strokeWidth={1.3} />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================
          PRODUCT GRID
      ========================================================= */}
      <section className="px-5 pb-20 sm:px-8 lg:px-12 lg:pb-28">
        <div className="mx-auto max-w-[1440px]">
          <div
            data-aos="fade-up"
            className="mb-8 flex items-end justify-between gap-6 border-t border-[#d8d1c7] pt-8"
          >
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#958d82]">
                {activeCategory === "All"
                  ? "The full edit"
                  : activeCategory}
              </p>

              <h2 className="mt-2 text-2xl font-medium tracking-[-0.04em]">
                {activeSubcategory !== "All"
                  ? activeSubcategory
                  : searchTerm
                    ? `Results for "${searchTerm}"`
                    : "All pieces"}
              </h2>
            </div>

            <p className="text-[8px] uppercase tracking-[0.14em] text-[#958d82]">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "piece" : "pieces"}
            </p>
          </div>

          {visibleProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-x-3 gap-y-12 sm:gap-x-5 sm:gap-y-16 lg:grid-cols-3 lg:gap-x-6 xl:grid-cols-4">
                {visibleProducts.map((product, index) => (
                  <div
                    key={`product-${product.id ?? `${getProductName(product)}-${index}`}`}
                    data-aos="fade-up"
                    data-aos-delay={Math.min((index % 4) * 70, 210)}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center pt-16">
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleCount((current) => current + PAGE_SIZE)
                    }
                    className="inline-flex items-center gap-3 border border-[#211d1a] px-7 py-3.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#211d1a] transition hover:bg-[#211d1a] hover:text-[#f2eee6]"
                  >
                    Load more
                    <span className="text-[#958d82]">
                      {Math.min(
                        visibleCount + PAGE_SIZE,
                        filteredProducts.length,
                      )}{" "}
                      / {filteredProducts.length}
                    </span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div
              data-aos="fade-up"
              className="border-y border-[#d8d1c7] py-24 text-center"
            >
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#71383a]">
                Nothing here yet
              </p>

              <h3 className="mt-4 text-3xl font-medium tracking-[-0.04em]">
                Try another edit.
              </h3>

              <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-[#746d64]">
                We couldn't find pieces matching those filters. Clear them
                and explore the full collection.
              </p>

              <button
                type="button"
                onClick={() => {
                  handleCategoryChange("All");
                  setAvailability("all");
                  setPriceRange("all");
                  setSort("featured");
                  clearSearch();
                }}
                className="mt-8 inline-flex items-center gap-2 border border-[#211d1a] px-6 py-3 text-[9px] font-semibold uppercase tracking-[0.15em] transition hover:bg-[#211d1a] hover:text-[#f2eee6]"
              >
                View all pieces
                <ArrowUpRight size={14} strokeWidth={1.4} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================
          SHOP CLOSE
      ========================================================= */}
      {filteredProducts.length > 0 && !hasMore && (
        <section className="border-t border-[#d8d1c7] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="mx-auto max-w-[1440px]">
            <div
              data-aos="fade-up"
              className="flex flex-col justify-between gap-8 md:flex-row md:items-end"
            >
              <div>
                <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-[#71383a]">
                  You've reached the end
                </p>

                <h2 className="mt-4 max-w-2xl text-4xl font-medium leading-[0.95] tracking-[-0.055em] sm:text-5xl">
                  Keep exploring.
                </h2>
              </div>

              <Link
                to="/"
                className="inline-flex items-center gap-3 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#211d1a] transition hover:text-[#71383a]"
              >
                Back to home
                <ArrowUpRight size={14} strokeWidth={1.4} />
              </Link>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

export default Shop;