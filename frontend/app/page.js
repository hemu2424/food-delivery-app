import Link from "next/link";

const FEATURE_LIST = [
  {
    title: "Curated local favorites",
    copy: "Browse handpicked restaurants, trending dishes, and fresh picks near your home or work.",
  },
  {
    title: "Live tracking",
    copy: "Follow each order from kitchen to doorstep with clear status updates and real-time notifications.",
  },
  {
    title: "Fast checkout",
    copy: "Secure payment, saved addresses, and a quick ordering flow designed for busy schedules.",
  },
];

export default function Home() {
  return (
    <main className="app-shell">
      <section className="grid items-center gap-8 py-8 sm:py-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10 lg:py-12">
        <div>
          <span className="eyebrow">Fresh delivery</span>
          <h1 className="mt-6 max-w-xl text-4xl font-black tracking-[-0.04em] text-slate-900 sm:text-5xl lg:text-6xl">
            Order delicious meals from the best local spots.
          </h1>
          <p className="mt-5 max-w-xl text-base text-slate-600 sm:text-lg">
            Explore nearby restaurants, discover chef-crafted favorites, and enjoy hot food delivered to your door in minutes.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/login" className="btn-primary px-6 py-3 text-base">
              Login
            </Link>
            <Link href="/register" className="btn-secondary px-6 py-3 text-base">
              Create account
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-slate-600">
            <div>
              <span className="block text-2xl font-black text-slate-900">15k+</span>
              <span>happy orders</span>
            </div>
            <div>
              <span className="block text-2xl font-black text-slate-900">4.8/5</span>
              <span>avg. rating</span>
            </div>
            <div>
              <span className="block text-2xl font-black text-slate-900">25 min</span>
              <span>delivery time</span>
            </div>
          </div>
        </div>

        <div className="surface-card p-4 sm:p-5">
          <div className="rounded-3xl bg-linear-to-br from-orange-500 via-orange-400 to-amber-300 p-5 text-white shadow-lg shadow-orange-200/60">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-100">Tonight&apos;s pick</p>
                <h2 className="mt-3 text-2xl font-bold">Crispy Chicken Bowl</h2>
              </div>
              <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold backdrop-blur-sm">4.9★</span>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
              <div className="flex items-center justify-between rounded-xl bg-white/15 px-3 py-2 text-sm">
                <span>Delivery</span>
                <span className="font-semibold">12-18 min</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs text-orange-50">
                <div className="rounded-xl bg-white/10 px-2 py-3">
                  <div className="text-lg font-bold text-white">320</div>
                  <div>kcal</div>
                </div>
                <div className="rounded-xl bg-white/10 px-2 py-3">
                  <div className="text-lg font-bold text-white">₹299</div>
                  <div>price</div>
                </div>
                <div className="rounded-xl bg-white/10 px-2 py-3">
                  <div className="text-lg font-bold text-white">30</div>
                  <div>mins</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {FEATURE_LIST.map((feature) => (
              <div key={feature.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm font-semibold text-slate-800">{feature.title}</p>
                <p className="mt-2 text-xs leading-5 text-slate-600">{feature.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
