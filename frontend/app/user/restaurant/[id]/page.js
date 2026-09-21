import { notFound } from "next/navigation";
import RestaurantDetailClient from "@/components/user/RestaurantDetailClient";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");

async function getRestaurantData(id) {
  const res = await fetch(`${API_URL}/restaurants/${id}`, {
    next: { revalidate: 30 }, // cache for 30s, then refresh in background
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to load restaurant");

  return res.json();
}

export default async function RestaurantDetailPage({ params }) {
  const { id } = await params;
  const data = await getRestaurantData(id);

  if (!data) notFound();

  return (
    <RestaurantDetailClient
      restaurantId={id}
      restaurant={data.restaurant}
      initialMenuItems={data.menuItems}
    />
  );
}