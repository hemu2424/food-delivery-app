import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-4">
      <h1 className="text-6xl font-bold text-orange-600 mb-2">404</h1>
      <p className="text-gray-500 mb-6">This page doesn't exist.</p>
      <Link
        href="/"
        className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700"
      >
        Go home
      </Link>
    </div>
  );
}