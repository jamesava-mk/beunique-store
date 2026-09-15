import { ArrowUpRight, MapPin, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

const values = [
  {
    number: "01",
    title: "Made to be noticed",
    text: "Pieces with presence — designed to make an entrance without trying too hard.",
  },
  {
    number: "02",
    title: "Style your way",
    text: "There is no single BeUnique woman. Wear each piece your way and make it yours.",
  },
  {
    number: "03",
    title: "Rooted in Lagos",
    text: "A Lagos perspective with a wardrobe made to travel far beyond it.",
  },
];

export default function About() {
  return (
    <main className="bg-[#f2eee6] text-[#211d1a]">
      {/* INTRO */}
      <section className="relative overflow-hidden border-b border-[#d8d1c7]">
        <div className="absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-[#71383a]/[0.07] blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[420px] w-[420px] rounded-full bg-[#c9a98a]/[0.12] blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-14 px-6 py-24 sm:px-10 lg:grid-cols-[1fr_0.8fr] lg:items-center lg:px-12 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
          >
            <div className="mb-7 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#71383a]">
              <Sparkles size={13} />
              BeUnique Wears
            </div>

            <h1 className="max-w-3xl text-6xl font-medium leading-[0.88] tracking-[-0.065em] sm:text-7xl lg:text-[7.5rem]">
              Clothes with
              <br />
              <span className="text-[#71383a]">a point of view.</span>
            </h1>

            <div className="mt-9 flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
              <p className="max-w-md text-base leading-7 text-[#746d64]">
                BeUnique Wears is a Lagos-born fashion label for women who
                would rather be remembered than blend in.
              </p>

              <Link
                to="/shop"
                className="inline-flex w-fit shrink-0 items-center gap-3 rounded-full bg-[#71383a] px-5 py-3 text-xs font-medium text-[#f2eee6] transition hover:bg-[#211d1a]"
              >
                Shop collection
                <ArrowUpRight size={15} />
              </Link>
            </div>
          </motion.div>

          {/* BRAND VISUAL */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="relative mx-auto w-full max-w-md"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-[#c9a98a]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_25%,rgba(242,238,230,0.42),transparent_28%),linear-gradient(145deg,#c9a98a,#958d82_55%,#71383a)]" />

              <div className="absolute inset-[8%] border border-[#f2eee6]/25" />

              <div className="absolute bottom-[9%] left-[9%]">
                <p className="text-[9px] font-medium uppercase tracking-[0.32em] text-[#f2eee6]/75">
                  Lagos
                </p>

                <p className="mt-3 text-5xl font-medium leading-[0.86] tracking-[-0.055em] text-[#f2eee6]">
                  Be
                  <br />
                  Unique.
                </p>
              </div>

              <div className="absolute right-[12%] top-[13%] h-24 w-24 rounded-full border border-[#f2eee6]/25" />
              <div className="absolute right-[16%] top-[17%] h-16 w-16 rounded-full border border-[#f2eee6]/15" />
            </div>

            <div className="absolute -bottom-4 -left-4 flex items-center gap-3 bg-[#211d1a] px-4 py-3 text-[#f2eee6]">
              <MapPin size={14} className="text-[#c9a98a]" />
              <span className="text-[9px] font-medium uppercase tracking-[0.17em]">
                Lagos, Nigeria
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STORY + VALUES */}
      <section className="mx-auto max-w-7xl px-6 py-24 sm:px-10 lg:px-12 lg:py-32">
        <div className="grid gap-16 lg:grid-cols-[0.55fr_1.45fr]">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#71383a]">
              The idea
            </p>
          </div>

          <div>
            <h2 className="max-w-4xl text-4xl font-medium leading-[0.98] tracking-[-0.05em] sm:text-5xl lg:text-6xl">
              Fashion should feel like
              <span className="text-[#71383a]"> you.</span>
            </h2>

            <div className="mt-9 grid gap-7 text-sm leading-6 text-[#746d64] sm:grid-cols-2">
              <p>
                BeUnique Wears started with a simple idea: getting dressed
                should not mean disappearing into whatever everyone else is
                wearing.
              </p>

              <p>
                We create expressive silhouettes, confident colour and
                everyday pieces that can carry a whole look on their own.
              </p>
            </div>

            <div className="mt-16 grid gap-px overflow-hidden border border-[#d0c8bd] bg-[#d0c8bd] md:grid-cols-3">
              {values.map((value) => (
                <motion.article
                  key={value.number}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2 }}
                  className="bg-[#f2eee6] p-7 sm:p-8"
                >
                  <span className="text-[9px] font-medium tracking-[0.18em] text-[#958d82]">
                    {value.number}
                  </span>

                  <h3 className="mt-14 text-xl font-medium tracking-[-0.03em]">
                    {value.title}
                  </h3>

                  <p className="mt-4 text-sm leading-6 text-[#746d64]">
                    {value.text}
                  </p>
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* LAGOS */}
      <section className="bg-[#211d1a] text-[#f2eee6]">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:px-10 lg:px-12 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-[1fr_280px] lg:items-end">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#c9a98a]">
                From Lagos
              </p>

              <h2 className="mt-6 max-w-4xl text-5xl font-medium leading-[0.9] tracking-[-0.06em] sm:text-6xl lg:text-8xl">
                Different looks.
                <br />
                Same confidence.
              </h2>
            </div>

            <div className="border-l border-[#f2eee6]/15 pl-6">
              <p className="text-sm leading-6 text-[#d8d1c7]/65">
                Designed with Lagos in mind. Made for wherever you decide to
                take it.
              </p>

              <p className="mt-6 text-[9px] font-medium uppercase tracking-[0.2em] text-[#c9a98a]">
                BeUnique Wears
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}