"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { destinationsApi, favoritesApi } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";
import { CategoryBadge } from "@/components/shared/category-badge";
import { LoadingSpinner } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Search, Heart, MapPin, DollarSign, ArrowRight, SlidersHorizontal } from "lucide-react";
import type { Destination } from "@/lib/types";

const CATEGORIES = ["all", "beach", "city", "mountain", "culture", "adventure"] as const;

export default function DestinationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<"name" | "cost_asc" | "cost_desc">("name");
  const [maxCost, setMaxCost] = useState<number | "">("");
  const [page, setPage] = useState(1);

  // Fetch destinations with query params
  const { data, isLoading } = useQuery({
    queryKey: ["destinations", { search, category, sort, maxCost, page }],
    queryFn: () => {
      const params: Record<string, string> = {
        page: String(page),
        limit: "6",
        sort,
      };
      if (search.trim()) params.search = search.trim();
      if (category !== "all") params.category = category;
      if (typeof maxCost === "number" && maxCost > 0) params.maxCost = String(maxCost);
      return destinationsApi.list(params);
    },
  });

  // Fetch user favorites to highlight hearts
  const { data: favoritesData } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => favoritesApi.list(),
    enabled: !!user,
  });

  const favoriteIds = new Set((favoritesData?.items || []).map((d) => d._id));

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ id, isFavorite }: { id: string; isFavorite: boolean }) => {
      if (isFavorite) {
        await favoritesApi.remove(id);
      } else {
        await favoritesApi.add(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  const handleFavoriteClick = (e: React.MouseEvent, destId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert("Please log in to save favorites.");
      return;
    }
    const isFav = favoriteIds.has(destId);
    toggleFavoriteMutation.mutate({ id: destId, isFavorite: isFav });
  };

  const destinations = data?.items || [];
  const meta = data?.meta;

  return (
    <div className="container mx-auto px-4 sm:px-8 py-10 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Explore Destinations</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Discover curated places, compare daily budgets, and save your favorites.
          </p>
        </div>
        {user && (
          <Link href="/trips/new">
            <Button className="gap-2 shadow-sm">+ Plan a New Trip</Button>
          </Link>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card border rounded-xl p-4 sm:p-5 mb-8 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search input */}
          <div className="relative sm:col-span-6">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by city or country (e.g., Bali, France)..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>

          {/* Sort selector */}
          <div className="sm:col-span-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="name">Sort by Name</option>
              <option value="cost_asc">Daily Cost: Low to High</option>
              <option value="cost_desc">Daily Cost: High to Low</option>
            </select>
          </div>

          {/* Max Cost input */}
          <div className="sm:col-span-3">
            <Input
              type="number"
              placeholder="Max $/day (optional)"
              value={maxCost}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : "";
                setMaxCost(val);
                setPage(1);
              }}
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t">
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mr-2">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Category:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                setPage(1);
              }}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-all ${
                category === cat
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Destinations */}
      {isLoading ? (
        <LoadingSpinner text="Finding amazing destinations..." className="py-20" />
      ) : destinations.length === 0 ? (
        <div className="text-center py-16 border rounded-xl bg-card">
          <MapPin className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
          <h3 className="text-lg font-semibold">No destinations matched your filters</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            Try adjusting your search terms, changing the category, or clearing the max budget limit.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSearch("");
              setCategory("all");
              setMaxCost("");
              setSort("name");
            }}
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest) => {
            const isFav = favoriteIds.has(dest._id);
            return (
              <Card
                key={dest._id}
                className="group overflow-hidden rounded-xl border bg-card shadow-sm hover:shadow-md transition flex flex-col"
              >
                {/* Image Container with Heart Button */}
                <div className="relative h-48 w-full bg-muted overflow-hidden">
                  <img
                    src={dest.imageUrl}
                    alt={dest.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={(e) => handleFavoriteClick(e, dest._id)}
                      className={`h-9 w-9 rounded-full flex items-center justify-center shadow-md backdrop-blur-sm transition ${
                        isFav
                          ? "bg-rose-500 text-white hover:bg-rose-600"
                          : "bg-background/80 text-foreground hover:bg-background"
                      }`}
                      title={isFav ? "Remove from favorites" : "Save to favorites"}
                    >
                      <Heart className={`h-4 w-4 ${isFav ? "fill-current" : ""}`} />
                    </button>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <CategoryBadge category={dest.category} />
                  </div>
                </div>

                {/* Content */}
                <CardHeader className="p-5 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-xl font-bold tracking-tight">{dest.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {dest.country}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-primary">${dest.dailyCostUsd}</div>
                      <div className="text-[11px] text-muted-foreground uppercase font-medium">avg / day</div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-5 pt-2 flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {dest.description}
                  </p>
                </CardContent>

                <CardFooter className="p-5 pt-0 border-t flex items-center justify-between bg-muted/20">
                  <Link
                    href={`/destinations/${dest._id}`}
                    className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline"
                  >
                    View Details
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  {user && (
                    <Link href={`/trips/new?destinationId=${dest._id}`}>
                      <Button size="sm" variant="outline" className="h-8 text-xs">
                        Plan Trip
                      </Button>
                    </Link>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {meta && meta.totalPages && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <span className="text-sm font-medium text-muted-foreground">
            Page {meta.page} of {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(p + 1, meta.totalPages || 1))}
            disabled={page >= (meta.totalPages || 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
