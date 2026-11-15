"use client";

import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { favoritesApi } from "@/lib/api";
import { ProtectedRoute } from "@/components/shared/protected-route";
import { CategoryBadge } from "@/components/shared/category-badge";
import { LoadingSpinner } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Heart, Trash2, MapPin, Compass, ArrowRight } from "lucide-react";

export default function FavoritesPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => favoritesApi.list(),
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: (id: string) => favoritesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  const favorites = data?.items || [];

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 sm:px-8 py-10 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
              <Heart className="h-7 w-7 text-rose-500 fill-rose-500" />
              Saved Favorites
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Destinations you&apos;ve bookmarked for future travel inspiration.
            </p>
          </div>
          <Link href="/destinations">
            <Button variant="outline" size="sm" className="gap-2">
              <Compass className="h-4 w-4" /> Browse More
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <LoadingSpinner text="Loading your favorites..." className="py-24" />
        ) : favorites.length === 0 ? (
          <div className="text-center py-20 border rounded-2xl bg-card shadow-sm max-w-xl mx-auto p-6">
            <div className="h-16 w-16 bg-rose-50 text-rose-500 dark:bg-rose-950/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold">No favorites yet</h2>
            <p className="text-muted-foreground text-sm mt-1 max-w-sm mx-auto">
              When exploring destinations, tap the heart icon on any card to save it here for easy planning.
            </p>
            <Link href="/destinations" className="inline-block mt-6">
              <Button className="gap-2">Explore Destinations</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((dest) => (
              <Card
                key={dest._id}
                className="group overflow-hidden rounded-xl border bg-card shadow-sm hover:shadow-md transition flex flex-col"
              >
                <div className="relative h-48 w-full bg-muted overflow-hidden">
                  <img
                    src={dest.imageUrl}
                    alt={dest.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => removeFavoriteMutation.mutate(dest._id)}
                      className="h-8 w-8 rounded-full bg-background/80 hover:bg-destructive hover:text-white text-muted-foreground flex items-center justify-center shadow backdrop-blur transition"
                      title="Remove from favorites"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <CategoryBadge category={dest.category} />
                  </div>
                </div>

                <CardHeader className="p-5 pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold">{dest.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {dest.country}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-bold text-primary">${dest.dailyCostUsd}</span>
                      <span className="text-xs text-muted-foreground block">/ day</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-5 pt-2 flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-2">{dest.description}</p>
                </CardContent>

                <CardFooter className="p-5 pt-0 border-t flex items-center justify-between bg-muted/20">
                  <Link
                    href={`/destinations/${dest._id}`}
                    className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline"
                  >
                    Details <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link href={`/trips/new?destinationId=${dest._id}`}>
                    <Button size="sm" className="h-8 text-xs">
                      Plan Trip
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
