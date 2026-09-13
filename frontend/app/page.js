import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-orange-50 to-white">
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center rounded-full border border-orange-200 bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-orange-700">
              Fresh delivery
            </span>
            <h1 className="mt-6 text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">
              Order delicious meals from restaurants near you.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-gray-600">
              Explore local favorites, track your order live, and get hot food delivered right to your door.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/login"
                className="rounded-lg bg-orange-500 px-6 py-3 text-sm font-medium text-white shadow hover:bg-orange-600"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm hover:border-orange-300 hover:text-orange-600"
              >
                Create account
              </Link>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-orange-100">
            <div className="space-y-4">
              <div className="rounded-2xl bg-orange-50 p-4">
                <p className="text-sm font-medium text-orange-700">Popular today</p>
                <div className="mt-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">Firehouse Pizza</p>
                    <p className="text-sm text-gray-500">Italian • 25-35 min</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-orange-600 shadow-sm">
                    4.8 ★
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 p-4">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Order status</span>
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                    On the way
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <div className="h-full w-3/4 rounded-full bg-orange-500" />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Restaurant accepted</span>
                    <span>Delivery in 12 min</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl bg-gray-50 p-3">
                  <p className="text-2xl font-bold text-gray-900">120+</p>
                  <p className="text-xs text-gray-500">Restaurants</p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-3">
                  <p className="text-2xl font-bold text-gray-900">15k</p>
                  <p className="text-xs text-gray-500">Orders</p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-3">
                  <p className="text-2xl font-bold text-gray-900">4.9</p>
                  <p className="text-xs text-gray-500">Rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
