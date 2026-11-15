"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { tripsApi, favoritesApi } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";
import { ProtectedRoute } from "@/components/shared/protected-route";
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingSpinner } from "@/components/shared/loading";
import { formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plane, Calendar, Heart, Compass, Plus, ArrowRight, Clock } from "lucide-react";
import type { Trip, Destination } from "@/lib/types";

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: tripsData, isLoading: tripsLoading } = useQuery({
    queryKey: ["trips"],
    queryFn: () => tripsApi.list(),
  });

  const { data: favoritesData, isLoading: favsLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => favoritesApi.list(),
  });

  const trips = tripsData?.items || [];
  const favorites = favoritesData?.items || [];

  const upcomingCount = trips.filter((t) => t.status === "upcoming").length;
  const ongoingCount = trips.filter((t) => t.status === "ongoing").length;
  const completedCount = trips.filter((t) => t.status === "completed").length;

  const activeTrips = trips.filter((t) => t.status === "upcoming" || t.status === "ongoing");

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 sm:px-8 py-10 max-w-7xl">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Here is an overview of your travel plans and bookmarked adventures.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/trips/new">
              <Button className="gap-2 shadow-sm">
                <Plus className="h-4 w-4" /> New Trip
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Total Trips</CardTitle>
              <Plane className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{trips.length}</div>
              <p className="text-xs text-muted-foreground mt-1">{completedCount} completed</p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Upcoming</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{upcomingCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Ready for departure</p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Ongoing Now</CardTitle>
              <Calendar className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{ongoingCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently traveling</p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Favorites</CardTitle>
              <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-600">{favorites.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Saved spots</p>
            </CardContent>
          </Card>
        </div>

        {/* Active & Upcoming Trips */}
        <div className="space-y-4 mb-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">Active & Upcoming Journeys</h2>
            <Link href="/trips" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
              View all trips ({trips.length}) <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {tripsLoading ? (
            <LoadingSpinner text="Loading trips..." className="py-12" />
          ) : activeTrips.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-3">
                <Plane className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-base">No upcoming trips planned</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                Ready for a vacation? Pick a destination and start building your custom itinerary.
              </p>
              <Link href="/trips/new" className="inline-block mt-4">
                <Button size="sm">+ Create Your First Trip</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeTrips.map((trip) => {
                const dest = typeof trip.destination === "object" ? (trip.destination as Destination) : null;
                return (
                  <Card key={trip._id} className="overflow-hidden border shadow-sm hover:shadow-md transition">
                    <div className="h-36 bg-muted relative overflow-hidden">
                      {dest?.imageUrl ? (
                        <img src={dest.imageUrl} alt={trip.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                          <Plane className="h-8 w-8 text-primary" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <StatusBadge status={trip.status} />
                      </div>
                    </div>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-lg line-clamp-1">{trip.title}</CardTitle>
                      <CardDescription className="text-xs flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        {new Date(trip.startDate).toLocaleDateString()} &ndash;{" "}
                        {new Date(trip.endDate).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-3">
                      <div className="flex justify-between text-xs py-2 border-t border-b">
                        <span className="text-muted-foreground">Budget:</span>
                        <span className="font-semibold">
                          {formatMoney(trip.budgetCents, trip.budgetCurrency)}
                        </span>
                      </div>
                      <Link href={`/trips/${trip._id}`} className="block">
                        <Button variant="outline" size="sm" className="w-full text-xs">
                          Manage Trip & Itinerary
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Links banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/destinations" className="group">
            <Card className="p-5 border bg-gradient-to-r from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/20 hover:border-primary/40 transition">
              <div className="flex items-center gap-4">
                <div className="h-11 w-11 rounded-lg bg-blue-500 text-white flex items-center justify-center shadow">
                  <Compass className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base group-hover:text-primary transition">Find New Destinations</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Explore budget-friendly travel inspiration</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/favorites" className="group">
            <Card className="p-5 border bg-gradient-to-r from-rose-50/50 to-pink-50/30 dark:from-rose-950/20 dark:to-pink-950/20 hover:border-rose-400/40 transition">
              <div className="flex items-center gap-4">
                <div className="h-11 w-11 rounded-lg bg-rose-500 text-white flex items-center justify-center shadow">
                  <Heart className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base group-hover:text-rose-600 transition">View Saved Favorites</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Review your {favorites.length} saved places</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </ProtectedRoute>
  );
}
