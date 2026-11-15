"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { destinationsApi, favoritesApi } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";
import { CategoryBadge } from "@/components/shared/category-badge";
import { LoadingSpinner } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Heart, MapPin, DollarSign, Calendar, CheckCircle2, Sparkles } from "lucide-react";

export default function DestinationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["destination", id],
    queryFn: () => destinationsApi.get(id),
  });

  const { data: favoritesData } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => favoritesApi.list(),
    enabled: !!user,
  });

  const isFavorite = (favoritesData?.items || []).some((f) => f._id === id);

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
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

  const handleFavoriteClick = () => {
    if (!user) {
      alert("Please log in to save favorites.");
      return;
    }
    toggleFavoriteMutation.mutate();
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading destination details..." className="py-32" />;
  }

  if (error || !data?.destination) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold">Destination not found</h2>
        <p className="text-muted-foreground mt-2">The destination you are looking for does not exist.</p>
        <Link href="/destinations" className="mt-4 inline-block">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Destinations
          </Button>
        </Link>
      </div>
    );
  }

  const dest = data.destination;

  return (
    <div className="container mx-auto px-4 sm:px-8 py-8 max-w-5xl">
      {/* Back link */}
      <Link
        href="/destinations"
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to all destinations
      </Link>

      {/* Hero Image & Overlay */}
      <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden shadow-md mb-8">
        <img src={dest.imageUrl} alt={dest.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Favorite Button on Image */}
        <div className="absolute top-4 right-4">
          <Button
            onClick={handleFavoriteClick}
            variant="secondary"
            size="sm"
            className="gap-2 backdrop-blur-md bg-background/80 hover:bg-background"
          >
            <Heart className={`h-4 w-4 ${isFavorite ? "fill-rose-500 text-rose-500" : ""}`} />
            {isFavorite ? "Saved" : "Save Favorite"}
          </Button>
        </div>

        {/* Bottom Banner Content */}
        <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
          <div>
            <CategoryBadge category={dest.category} className="mb-2 bg-white/20 text-white border-white/30 backdrop-blur-sm" />
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight drop-shadow-sm">{dest.name}</h1>
            <p className="text-base sm:text-lg text-white/90 flex items-center gap-1.5 mt-1">
              <MapPin className="h-4 w-4" /> {dest.country}
            </p>
          </div>
          <div className="bg-background/95 backdrop-blur-md text-foreground rounded-xl p-3.5 px-5 shadow-lg border text-right sm:text-left self-start sm:self-auto">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Average Budget</span>
            <div className="text-2xl font-extrabold text-primary">${dest.dailyCostUsd} <span className="text-xs font-normal text-muted-foreground">/ person / day</span></div>
          </div>
        </div>
      </div>

      {/* Main Grid: Description & Tips + CTA Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* About Section */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold tracking-tight">About {dest.name}</h2>
            <p className="text-muted-foreground leading-relaxed text-base">{dest.description}</p>
          </section>

          {/* Travel Tips */}
          {dest.tips && dest.tips.length > 0 && (
            <section className="space-y-3 pt-4 border-t">
              <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" /> Insider Travel Tips
              </h3>
              <div className="grid gap-3 pt-1">
                {dest.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg border bg-card p-3.5 shadow-sm text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar Action Card */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Plan your trip to {dest.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                Ready to explore? Create an itinerary, track daily activities, and monitor your expenses.
              </p>
              <div className="space-y-2 py-2 border-y">
                <div className="flex justify-between">
                  <span>Destination:</span>
                  <span className="font-semibold text-foreground">{dest.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Country:</span>
                  <span className="font-semibold text-foreground">{dest.country}</span>
                </div>
                <div className="flex justify-between">
                  <span>Est. Daily Cost:</span>
                  <span className="font-semibold text-foreground">${dest.dailyCostUsd} USD</span>
                </div>
              </div>
              <Link href={user ? `/trips/new?destinationId=${dest._id}` : "/register"} className="block">
                <Button className="w-full gap-2 shadow">
                  <Calendar className="h-4 w-4" />
                  {user ? "Plan a Trip Here" : "Sign Up to Plan Trip"}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
