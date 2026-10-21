"use client";
import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function Navbar() {
  const { logout, user } = useAuth();
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const homeLink = !user
    ? "/"
    : user.role === "admin"
      ? "/admin/dashboard"
      : user.role === "delivery"
        ? "/delivery/dashboard"
        : "/user/dashboard";

  const guestLinks = [
    { href: "/login", label: "Login" },
    { href: "/register", label: "Register" },
  ];

  const userLinks = [
    { href: "/user/cart", label: `Cart${itemCount > 0 ? ` (${itemCount})` : ""}` },
    { href: "/user/dashboard", label: "Restaurants" },
    { href: "/user/orders", label: "Orders" },
  ];

  const adminLinks = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/restaurants", label: "Restaurants" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/orders", label: "Orders" },
  ];

  const deliveryLinks = [{ href: "/delivery/dashboard", label: "Delivery" }];

  const navLinks = !user
    ? guestLinks
    : user.role === "user"
      ? userLinks
      : user.role === "delivery"
        ? deliveryLinks
        : adminLinks;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
      <div className="app-shell">
        <div className="flex h-20 items-center justify-between gap-3">
          <Link href={homeLink} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-lg font-black text-white shadow-sm shadow-orange-200">
              F
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg font-black tracking-tight text-slate-900">FoodDelivery</span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">Fresh & Fast</span>
            </div>
          </Link>

          {user?.role && (
            <div className="hidden items-center rounded-full border border-orange-200 bg-orange-50 px-3 py-1 md:flex">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-700">
                {user.role} Portal
              </span>
            </div>
          )}

          <div className="hidden items-center gap-2 md:flex">
            {!user && (
              <>
                <Link href="/login" className="btn-secondary">Login</Link>
                <Link href="/register" className="btn-primary">Register</Link>
              </>
            )}

            {user && (
              <>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-orange-600"
                  >
                    {link.label}
                  </Link>
                ))}

                <Link href="/profile" className="ml-2 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1.5 transition hover:border-orange-200 hover:text-orange-600">
                  {user.avatar ? (
                    <Image src={user.avatar} alt={user.name || "User avatar"} width={28} height={28} className="h-7 w-7 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                      {user.name?.[0]?.toUpperCase()}
                    </span>
                  )}
                  <span className="text-sm font-medium text-slate-700">{user.name}</span>
                </Link>

                <button onClick={logout} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50">
                  Logout
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm md:hidden"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation"
          >
            <span className="flex flex-col gap-1.5">
              <span className="h-0.5 w-5 rounded-full bg-current" />
              <span className="h-0.5 w-5 rounded-full bg-current" />
              <span className="h-0.5 w-5 rounded-full bg-current" />
            </span>
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-slate-200 bg-white pb-4 pt-3 md:hidden">
            <div className="flex flex-col gap-2">
              {!user && (
                <>
                  <Link href="/login" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">Login</Link>
                  <Link href="/register" onClick={() => setMenuOpen(false)} className="rounded-xl bg-orange-500 px-3 py-2 text-sm font-semibold text-white">Register</Link>
                </>
              )}

              {user && (
                <>
                  {navLinks.map((link) => (
                    <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                      {link.label}
                    </Link>
                  ))}
                  <Link href="/profile" onClick={() => setMenuOpen(false)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    Profile
                  </Link>
                  <button onClick={() => { setMenuOpen(false); logout(); }} className="rounded-xl border border-red-200 px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50">
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
