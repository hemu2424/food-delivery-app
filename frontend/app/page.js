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

          
        </div>
      </section>
    </main>
  );
}
