import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useEffect, useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { products } from "../data/products";

function Home() {
  const heroProducts = products
    .filter((product) => {
      const text = [
        product.name,
        product.category,
        product.subcategory,
        product.type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        !text.includes("after dark") &&
        !text.includes("black dress")
      );
    })
    .slice(0, 5);

  const catalogue = products.slice(6);
  const rackProducts = catalogue.slice(0, 8);

  const editorialProduct = useMemo(() => {
    const preferredTerms = [
      "shirt",
      "top",
      "tee",
      "jacket",
      "blazer",
      "trouser",
      "pants",
      "jeans",
      "shorts",
      "shoe",
      "sneaker",
      "bag",
      "accessory",
    ];

    const excludedTerms = [
      "dress",
      "lingerie",
      "underwear",
      "bralette",
      "bikini",
      "swim",
    ];

    const getProductText = (product) =>
      [
        product.name,
        product.category,
        product.subcategory,
        product.type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

    const safePreferred = catalogue.find((product) => {
      const text = getProductText(product);

      return (
        !excludedTerms.some((term) => text.includes(term)) &&
        preferredTerms.some((term) => text.includes(term))
      );
    });

    if (safePreferred) return safePreferred;

    return (
      catalogue.find((product) => {
        const text = getProductText(product);

        return !excludedTerms.some((term) => text.includes(term));
      }) || catalogue[0]
    );
  }, [catalogue]);

  const [heroIndex, setHeroIndex] = useState(0);
  const [heroChanging, setHeroChanging] = useState(false);

  const shouldReduceMotion = useReducedMotion();

  const heroProduct = heroProducts[heroIndex];

  /*
    =========================================================
    RACK CURTAIN ANIMATION

    The animation is driven directly by the section's scroll
    position.

    - Starts opening as soon as the section enters the viewport.
    - Opens quickly so it is fully open while browsing.
    - Remains open through the useful part of the section.
    - Closes as soon as the user leaves the section.
    - Reverses naturally when scrolling back.
    =========================================================
  */

  const rackRef = useRef(null);

  const { scrollYProgress: rackScrollProgress } = useScroll({
    target: rackRef,
    offset: ["start end", "end start"],
  });

  const rackReveal = useTransform(
    rackScrollProgress,
    shouldReduceMotion
      ? [0, 0.5, 1]
      : [0, 0.035, 0.1, 0.22, 0.72, 0.86, 0.95, 1],
    shouldReduceMotion
      ? [0, 1, 0]
      : [0, 0.08, 0.45, 0.9, 1, 0.92, 0.35, 0],
  );

  const rackLeftX = useTransform(
    rackReveal,
    [0, 0.18, 0.55, 1],
    ["0%", "-20%", "-72%", "-100%"],
  );

  const rackRightX = useTransform(
    rackReveal,
    [0, 0.18, 0.55, 1],
    ["0%", "20%", "72%", "100%"],
  );

  /*
    Small rotational movement gives the curtain a slight
    fabric-like wriggle while opening and closing.
  */
  const rackLeftRotate = useTransform(
    rackReveal,
    [0, 0.22, 0.5, 0.78, 1],
    shouldReduceMotion
      ? [0, 0, 0, 0, 0]
      : [0, -1.8, -0.6, -1.4, 0],
  );

  const rackRightRotate = useTransform(
    rackReveal,
    [0, 0.22, 0.5, 0.78, 1],
    shouldReduceMotion
      ? [0, 0, 0, 0, 0]
      : [0, 1.8, 0.6, 1.4, 0],
  );

  const rackLeftSkew = useTransform(
    rackReveal,
    [0, 0.28, 0.65, 1],
    shouldReduceMotion
      ? [0, 0, 0, 0]
      : [0, -1, -0.35, 0],
  );

  const rackRightSkew = useTransform(
    rackReveal,
    [0, 0.28, 0.65, 1],
    shouldReduceMotion
      ? [0, 0, 0, 0]
      : [0, 1, 0.35, 0],
  );

  /*
    Keep the rack content visually stable instead of making
    the ivory section suddenly flash brighter.
  */
  const rackContentOpacity = useTransform(
    rackReveal,
    [0, 0.08, 0.3, 0.75, 1],
    [0.9, 0.94, 1, 1, 0.9],
  );

  const rackContentScale = useTransform(
    rackReveal,
    [0, 0.3, 0.75, 1],
    [0.985, 0.995, 1, 0.985],
  );

  const rackContentY = useTransform(
    rackReveal,
    [0, 0.3, 0.75, 1],
    ["1%", "0%", "0%", "1%"],
  );

  const rackShadow = useTransform(
    rackReveal,
    [0, 0.3, 0.75, 1],
    [
      "0 0 0 rgba(33,29,26,0)",
      "0 24px 60px rgba(33,29,26,0.18)",
      "0 24px 60px rgba(33,29,26,0.18)",
      "0 0 0 rgba(33,29,26,0)",
    ],
  );

  const changeHero = (direction) => {
    if (heroChanging || heroProducts.length === 0) return;

    setHeroChanging(true);

    window.setTimeout(() => {
      setHeroIndex((current) => {
        if (direction === "next") {
          return (current + 1) % heroProducts.length;
        }

        return (
          (current - 1 + heroProducts.length) % heroProducts.length
        );
      });

      window.setTimeout(() => {
        setHeroChanging(false);
      }, 80);
    }, 260);
  };

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    AOS.init({
      duration: prefersReducedMotion ? 0 : 800,
      easing: "ease-out-cubic",
      once: true,
      offset: 70,
      delay: 0,
      disable: prefersReducedMotion,
    });

    const refresh = () => AOS.refresh();

    window.addEventListener("load", refresh);

    return () => {
      window.removeEventListener("load", refresh);
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (heroChanging || heroProducts.length === 0) return;

      setHeroChanging(true);

      window.setTimeout(() => {
        setHeroIndex(
          (current) => (current + 1) % heroProducts.length,
        );

        window.setTimeout(() => {
          setHeroChanging(false);
        }, 80);
      }, 260);
    }, 4500);

    return () => window.clearInterval(interval);
  }, [heroChanging, heroProducts.length]);

  return (
    <main className="overflow-x-hidden bg-[#f2eee6] text-[#211d1a]">
      {/* =========================================================
          01 — HERO
      ========================================================== */}

      <section className="relative min-h-[calc(100svh-74px)] overflow-hidden bg-[#211d1a] text-[#f2eee6]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_40%,rgba(201,169,138,0.17),transparent_28%),radial-gradient(circle_at_85%_80%,rgba(113,56,58,0.25),transparent_30%)]" />

        <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(rgba(255,255,255,0.4)_0.7px,transparent_0.7px)] [background-size:5px_5px]" />

        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-74px)] max-w-[1600px] items-center px-5 pb-20 pt-20 sm:px-8 lg:px-12">
          <div className="grid w-full items-center gap-8 lg:grid-cols-[0.78fr_1.22fr]">
            <div className="relative z-20">
              <div className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c9a98a]" />

                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#c9a98a]">
                  New collection
                </p>
              </div>

              <div className="mt-8 overflow-hidden">
                <h1 className="text-[clamp(4.8rem,10vw,10rem)] font-medium leading-[0.78] tracking-[-0.075em]">
                  Wear
                  <br />
                  different.
                </h1>
              </div>

              <div
                className={`mt-9 max-w-sm transition-all delay-150 duration-700 ${
                  heroChanging
                    ? "translate-y-4 opacity-0"
                    : "translate-y-0 opacity-100"
                }`}
              >
                <p className="text-sm leading-7 text-white/55 sm:text-[15px]">
                  Pieces with presence. Clothes chosen for the way
                  you want to show up.
                </p>
              </div>

              <div
                className={`mt-9 flex flex-wrap items-center gap-4 transition-all delay-300 duration-700 ${
                  heroChanging
                    ? "translate-y-4 opacity-0"
                    : "translate-y-0 opacity-100"
                }`}
              >
                <Link
                  to="/shop"
                  className="group flex items-center gap-4 rounded-full bg-[#f2eee6] px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#211d1a] transition hover:bg-[#c9a98a]"
                >
                  Shop the collection

                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#211d1a] text-[#f2eee6] transition group-hover:translate-x-1">
                    <ArrowUpRight size={14} strokeWidth={1.2} />
                  </span>
                </Link>

                <span className="text-[9px] uppercase tracking-[0.16em] text-white/30">
                  0{heroIndex + 1} — 05
                </span>
              </div>
            </div>

            <div className="relative h-[560px] sm:h-[680px] lg:h-[720px]">
              <div className="absolute left-[50%] top-[8%] h-[74%] w-[62%] -translate-x-1/2 rounded-[50%] bg-[#211d1a]" />

              <div className="absolute left-[50%] top-[10%] h-[75%] w-[65%] -translate-x-1/2 rotate-[-3deg] rounded-[50%] border border-[#c9a98a]/10 bg-[#211d1a] shadow-[inset_0_0_80px_rgba(201,169,138,0.02)]" />

              <div className="absolute left-[51%] top-[53%] h-[45%] w-[34%] -translate-x-1/2 rounded-[50%] bg-black/40 blur-[60px]" />

              <div
                className={`absolute left-[52%] top-[2%] h-[94%] w-[82%] -translate-x-1/2 transition-all duration-700 ease-out ${
                  heroChanging
                    ? "scale-[0.965] opacity-0"
                    : "scale-100 opacity-100"
                }`}
              >
                {heroProduct && (
                  <div className="relative flex h-full w-full items-center justify-center">
                    <div className="relative h-[82%] w-[76%] overflow-hidden rounded-[50%] border border-[#c9a98a]/10 bg-[#211d1a]">
                      <img
                        src={heroProduct.image}
                        alt={heroProduct.name}
                        className="h-full w-full object-cover"
                      />

                      <div className="absolute inset-0 bg-[#211d1a]/[0.08]" />
                    </div>
                  </div>
                )}
              </div>

              <div className="absolute bottom-[7%] left-[52%] h-[7%] w-[48%] -translate-x-1/2 rounded-[50%] bg-black/45 blur-[35px]" />

              {heroProduct && (
                <div
                  className={`absolute bottom-[12%] right-[7%] hidden text-right transition-all delay-300 duration-700 lg:block ${
                    heroChanging
                      ? "translate-y-3 opacity-0"
                      : "translate-y-0 opacity-100"
                  }`}
                >
                  <p className="text-[8px] uppercase tracking-[0.2em] text-white/30">
                    Featured piece
                  </p>

                  <p className="mt-2 text-lg font-medium tracking-[-0.03em]">
                    {heroProduct.name}
                  </p>

                  <p className="mt-1 text-[9px] uppercase tracking-[0.15em] text-[#c9a98a]">
                    ₦{heroProduct.price.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="absolute bottom-7 left-5 right-5 z-30 flex items-center justify-between sm:left-8 sm:right-8 lg:left-12 lg:right-12">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => changeHero("previous")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/50 transition hover:border-white/30 hover:text-white"
              aria-label="Previous product"
            >
              <ArrowLeft size={15} strokeWidth={1.2} />
            </button>

            <button
              type="button"
              onClick={() => changeHero("next")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/50 transition hover:border-white/30 hover:text-white"
              aria-label="Next product"
            >
              <ArrowRight size={15} strokeWidth={1.2} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {heroProducts.map((product, index) => (
              <button
                key={product.id}
                type="button"
                onClick={() => {
                  if (index === heroIndex || heroChanging) return;

                  setHeroChanging(true);

                  window.setTimeout(() => {
                    setHeroIndex(index);

                    window.setTimeout(() => {
                      setHeroChanging(false);
                    }, 80);
                  }, 260);
                }}
                className={`h-px transition-all duration-500 ${
                  index === heroIndex
                    ? "w-10 bg-[#f2eee6]"
                    : "w-4 bg-white/20 hover:bg-white/50"
                }`}
                aria-label={`Show ${product.name}`}
              />
            ))}
          </div>
        </div>

        <div className="absolute bottom-7 left-1/2 z-30 hidden -translate-x-1/2 items-center gap-3 text-[8px] uppercase tracking-[0.22em] text-white/25 lg:flex">
          Scroll to explore
          <ArrowDown size={12} strokeWidth={1} />
        </div>
      </section>

      {/* =========================================================
          02 — WEAR IT YOUR WAY
      ========================================================== */}

      <section className="bg-[#c9a98a]">
        <div className="mx-auto max-w-[1600px] px-5 py-16 sm:px-8 sm:py-24 lg:px-12 lg:py-28">
          <div
            className="grid overflow-hidden bg-[#71383a] text-[#f2eee6] lg:grid-cols-[1.1fr_0.9fr]"
            data-aos="fade-up"
          >
            <div className="relative min-h-[520px] overflow-hidden sm:min-h-[680px]">
              {editorialProduct && (
                <Link
                  to={`/product/${editorialProduct.id}`}
                  className="group absolute inset-0 block"
                >
                  <img
                    src={editorialProduct.image}
                    alt={editorialProduct.name}
                    className="h-full w-full object-cover transition duration-[1400ms] ease-out group-hover:scale-[1.025]"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#211d1a]/70 via-transparent to-[#211d1a]/10" />

                  <div className="absolute left-6 top-6 sm:left-10 sm:top-10">
                    <span className="rounded-full border border-white/25 px-4 py-2 text-[8px] font-semibold uppercase tracking-[0.18em]">
                      The BeUnique edit
                    </span>
                  </div>

                  <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-5 sm:bottom-10 sm:left-10 sm:right-10">
                    <div>
                      <p className="text-[8px] uppercase tracking-[0.16em] text-white/55">
                        {editorialProduct.category}
                      </p>

                      <p className="mt-1 text-lg font-medium tracking-[-0.03em]">
                        {editorialProduct.name}
                      </p>
                    </div>

                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f2eee6] text-[#211d1a] transition duration-500 group-hover:rotate-45 group-hover:bg-[#c9a98a]">
                      <ArrowUpRight size={15} strokeWidth={1.2} />
                    </span>
                  </div>
                </Link>
              )}
            </div>

            <div className="flex flex-col justify-between p-8 sm:p-12 lg:p-16">
              <div data-aos="fade-up">
                <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#c9a98a]">
                  Wear it your way
                </p>

                <h2 className="mt-7 text-[clamp(3rem,5vw,5.8rem)] font-medium leading-[0.84] tracking-[-0.07em]">
                  Make
                  <br />
                  it yours.
                </h2>

                <p className="mt-7 max-w-md text-sm leading-7 text-white/60">
                  One piece can change the whole look. Find something
                  that feels like you, then wear it your way.
                </p>
              </div>

              <div
                className="mt-12"
                data-aos="fade-up"
                data-aos-delay="120"
              >
                <Link
                  to="/shop"
                  className="group inline-flex items-center gap-5 rounded-full bg-[#f2eee6] px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#211d1a] transition hover:bg-[#c9a98a]"
                >
                  Explore the collection

                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#211d1a] text-[#f2eee6] transition group-hover:translate-x-1">
                    <ArrowUpRight size={14} strokeWidth={1.2} />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          03 — ON THE RACK
      ========================================================== */}

      {rackProducts.length > 0 && (
        <section
          ref={rackRef}
          className="relative h-[145vh] bg-[#f2eee6]"
        >
          <div className="sticky top-[74px] h-[calc(100svh-74px)] overflow-hidden">
            <motion.div
              style={{
                opacity: rackContentOpacity,
                scale: rackContentScale,
                y: rackContentY,
              }}
              className="absolute inset-0 z-10 overflow-hidden bg-[#f2eee6]"
            >
              <div className="absolute inset-0 bg-[#f2eee6]" />

              <div className="absolute left-5 top-7 z-20 sm:left-8 sm:top-9 lg:left-12">
                <p
                  className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#71383a]"
                  data-aos="fade-up"
                >
                  The clothing rack
                </p>

                <p
                  className="mt-2 max-w-xs text-xs leading-5 text-[#211d1a]/45 sm:text-sm"
                  data-aos="fade-up"
                  data-aos-delay="80"
                >
                  Take your time. Find the piece that catches you.
                </p>
              </div>

              <div className="absolute inset-0 hidden sm:block">
                {rackProducts.map((product, index) => {
                  const positions = [
                    "left-[4%] top-[24%] rotate-[-7deg]",
                    "left-[24%] top-[13%] rotate-[3deg]",
                    "left-[45%] top-[19%] rotate-[-2deg]",
                    "right-[5%] top-[17%] rotate-[7deg]",
                    "left-[10%] bottom-[5%] rotate-[4deg]",
                    "left-[34%] bottom-[1%] rotate-[-4deg]",
                    "right-[25%] bottom-[7%] rotate-[5deg]",
                    "right-[5%] bottom-[1%] rotate-[-6deg]",
                  ];

                  const widths = [
                    "w-[190px]",
                    "w-[210px]",
                    "w-[225px]",
                    "w-[195px]",
                    "w-[185px]",
                    "w-[215px]",
                    "w-[190px]",
                    "w-[210px]",
                  ];

                  return (
                    <motion.div
                      key={product.id}
                      animate={
                        shouldReduceMotion
                          ? undefined
                          : {
                              y: [0, -7, 0, 5, 0],
                              rotate: [0, 0.7, 0, -0.5, 0],
                            }
                      }
                      transition={
                        shouldReduceMotion
                          ? undefined
                          : {
                              duration: 7 + (index % 3) * 1.2,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: index * 0.18,
                            }
                      }
                      className={`absolute ${positions[index]} ${widths[index]}`}
                    >
                      <Link
                        to={`/product/${product.id}`}
                        className="group block"
                      >
                        <div className="relative overflow-hidden bg-[#e4dcd1] shadow-[0_24px_45px_rgba(33,29,26,0.12)] transition-all duration-700 group-hover:-translate-y-3 group-hover:rotate-0 group-hover:shadow-[0_35px_65px_rgba(33,29,26,0.18)]">
                          <div className="aspect-[0.76]">
                            <img
                              src={product.image}
                              alt={product.name}
                              loading="lazy"
                              className="h-full w-full object-cover transition duration-[1200ms] ease-out group-hover:scale-[1.045]"
                            />
                          </div>

                          <div className="absolute inset-0 bg-gradient-to-t from-[#211d1a]/65 via-transparent to-transparent opacity-60 transition duration-500 group-hover:opacity-90" />

                          <span className="absolute left-4 top-4 text-[8px] font-semibold uppercase tracking-[0.2em] text-white/65">
                            {String(index + 1).padStart(2, "0")}
                          </span>

                          <span className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 opacity-0 transition duration-500 group-hover:opacity-100">
                            <span className="min-w-0">
                              <span className="block text-[8px] uppercase tracking-[0.16em] text-white/55">
                                {product.category}
                              </span>

                              <span className="mt-1 block truncate text-sm font-medium text-white">
                                {product.name}
                              </span>
                            </span>

                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f2eee6] text-[#211d1a]">
                              <ArrowUpRight
                                size={13}
                                strokeWidth={1.2}
                              />
                            </span>
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              <div className="absolute inset-x-5 bottom-16 top-32 grid grid-cols-2 gap-3 sm:hidden">
                {rackProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    animate={
                      shouldReduceMotion
                        ? undefined
                        : {
                            y: [0, -5, 0, 4, 0],
                          }
                    }
                    transition={
                      shouldReduceMotion
                        ? undefined
                        : {
                            duration: 6 + (index % 3),
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: index * 0.16,
                          }
                    }
                    className="relative overflow-hidden"
                  >
                    <Link
                      to={`/product/${product.id}`}
                      className="group relative block h-full overflow-hidden bg-[#e4dcd1]"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-[#211d1a]/65 via-transparent to-transparent" />

                      <span className="absolute left-3 top-3 text-[7px] font-semibold uppercase tracking-[0.18em] text-white/65">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span className="absolute bottom-3 left-3 right-3 truncate text-xs font-medium text-white">
                        {product.name}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* LEFT CURTAIN */}
            <motion.div
              style={{
                x: rackLeftX,
                rotate: rackLeftRotate,
                skewY: rackLeftSkew,
                boxShadow: rackShadow,
              }}
              className="absolute inset-y-0 left-0 z-30 w-1/2 origin-left overflow-hidden bg-[#211d1a]"
            >
              <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.025)_0px,rgba(255,255,255,0.025)_3px,transparent_3px,transparent_20px,rgba(0,0,0,0.045)_20px,rgba(0,0,0,0.045)_29px)]" />

              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(201,169,138,0.16),transparent_30%)]" />

              <div className="absolute bottom-8 left-5 sm:left-8 lg:left-12">
                <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/25">
                  BeUnique
                </p>
              </div>
            </motion.div>

            {/* RIGHT CURTAIN */}
            <motion.div
              style={{
                x: rackRightX,
                rotate: rackRightRotate,
                skewY: rackRightSkew,
                boxShadow: rackShadow,
              }}
              className="absolute inset-y-0 right-0 z-30 w-1/2 origin-right overflow-hidden bg-[#211d1a]"
            >
              <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.025)_0px,rgba(255,255,255,0.025)_3px,transparent_3px,transparent_20px,rgba(0,0,0,0.045)_20px,rgba(0,0,0,0.045)_29px)]" />

              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(113,56,58,0.2),transparent_32%)]" />

              <div className="absolute bottom-8 right-5 sm:right-8 lg:right-12">
                <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/25">
                  03
                </p>
              </div>
            </motion.div>

            {/* SHOP CTA — ABOVE CURTAINS */}
            <div className="absolute bottom-6 left-5 right-5 z-[60] flex items-center justify-between sm:left-8 sm:right-8 lg:left-12 lg:right-12">
              <span className="text-[8px] font-semibold uppercase tracking-[0.2em] text-[#211d1a]/30">
                Keep looking
              </span>

              <Link
                to="/shop"
                className="group flex items-center gap-3 text-[8px] font-extrabold uppercase tracking-[0.2em] text-[#211d1a]"
              >
                Shop all

                <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#211d1a]/25 font-bold transition group-hover:bg-[#211d1a] group-hover:text-[#f2eee6]">
                  <ArrowRight size={13} strokeWidth={1.5} />
                </span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================
          FOOTER
      ========================================================== */}

      <footer className="relative overflow-hidden bg-[#211d1a] text-[#f2eee6]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(113,56,58,0.25),transparent_30%),radial-gradient(circle_at_20%_80%,rgba(201,169,138,0.08),transparent_32%)]" />

        <div className="relative mx-auto max-w-[1600px] px-5 pb-8 pt-20 sm:px-8 sm:pt-28 lg:px-12">
          <div className="grid gap-16 lg:grid-cols-[1.5fr_0.5fr_0.5fr_0.5fr]">
            <div data-aos="fade-up">
              <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#c9a98a]">
                BeUnique Wears
              </p>

              <h2 className="mt-7 max-w-3xl text-[clamp(4rem,9vw,9rem)] font-medium leading-[0.76] tracking-[-0.08em]">
                Wear
                <br />
                different.
              </h2>

              <p className="mt-8 max-w-sm text-sm leading-7 text-white/40">
                Clothes for people who would rather define their
                own look than follow somebody else's.
              </p>
            </div>

            <div data-aos="fade-up" data-aos-delay="80">
              <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/30">
                Shop
              </p>

              <div className="mt-6 flex flex-col gap-4 text-sm text-white/65">
                <Link
                  to="/shop"
                  className="transition hover:text-[#c9a98a]"
                >
                  Shop
                </Link>
              </div>
            </div>

            <div data-aos="fade-up" data-aos-delay="140">
              <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/30">
                Help
              </p>

              <div className="mt-6 flex flex-col gap-4 text-sm text-white/65">
                <Link
                  to="/account"
                  className="transition hover:text-[#c9a98a]"
                >
                  Account
                </Link>

                <Link
                  to="/account#orders"
                  className="transition hover:text-[#c9a98a]"
                >
                  Orders
                </Link>

                <a
                  href="mailto:beuniqueglobal@gmail.com"
                  className="transition hover:text-[#c9a98a]"
                >
                  Contact
                </a>
              </div>
            </div>

            <div data-aos="fade-up" data-aos-delay="200">
              <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/30">
                Follow
              </p>

              <div className="mt-6 flex flex-col gap-4 text-sm text-white/65">
                <a
                  href="https://www.instagram.com/beunique_wears/"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-[#c9a98a]"
                >
                  Instagram
                </a>

                <a
                  href="https://www.tiktok.com/@beunique_wears"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-[#c9a98a]"
                >
                  TikTok
                </a>

                <a
                  href="https://wa.me/2347039485211"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-[#c9a98a]"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>

          <div className="mt-20 flex flex-col gap-4 border-t border-white/10 pt-6 text-[8px] uppercase tracking-[0.18em] text-white/25 sm:flex-row sm:items-center sm:justify-between">
            <span>
              © {new Date().getFullYear()} BeUnique Wears
            </span>

            <span>Lagos · Worldwide delivery</span>

            <span>Wear different.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default Home;