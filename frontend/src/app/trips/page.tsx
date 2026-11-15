"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { tripsApi } from "@/lib/api";
import { ProtectedRoute } from "@/components/shared/protected-route";
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingSpinner } from "@/components/shared/loading";
import { formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane, Calendar, Plus, MapPin, ArrowRight } from "lucide-react";
import type { Destination } from "@/lib/types";

export default function TripsListPage() {
  const [filter, setFilter] = useState<"all" | "upcoming" | "ongoing" | "completed">("all");

  const { data, isLoading } = useQuery({
    queryKey: ["trips"],
    queryFn: () => tripsApi.list(),
  });

  const allTrips = data?.items || [];
  const filteredTrips = allTrips.filter((t) => {
    if (filter === "all") return true;
    return t.status === filter;
  });

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 sm:px-8 py-10 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
              <Plane className="h-7 w-7 text-primary" />
              My Trips
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Manage your upcoming, active, and past adventures in one place.
            </p>
          </div>
          <Link href="/trips/new">
            <Button className="gap-2 shadow-sm">
              <Plus className="h-4 w-4" /> Plan a New Trip
            </Button>
          </Link>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 border-b pb-4 mb-8">
          {(["all", "upcoming", "ongoing", "completed"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition ${
                filter === status
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {status} ({status === "all" ? allTrips.length : allTrips.filter((t) => t.status === status).length})
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <LoadingSpinner text="Loading your trips..." className="py-24" />
        ) : filteredTrips.length === 0 ? (
          <div className="text-center py-20 border rounded-2xl bg-card shadow-sm max-w-md mx-auto p-8">
            <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Plane className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold">No trips found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {filter === "all"
                ? "You haven't created any trips yet. Ready to embark on your next journey?"
                : `You don't have any ${filter} trips at the moment.`}
            </p>
            <Link href="/trips/new" className="inline-block mt-6">
              <Button>Create a Trip Now</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map((trip) => {
              const dest = typeof trip.destination === "object" ? (trip.destination as Destination) : null;
              return (
                <Card
                  key={trip._id}
                  className="group overflow-hidden rounded-xl border bg-card shadow-sm hover:shadow-md transition flex flex-col"
                >
                  <div className="relative h-44 bg-muted overflow-hidden">
                    {dest?.imageUrl ? (
                      <img
                        src={dest.imageUrl}
                        alt={trip.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                        <Plane className="h-10 w-10 text-primary" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <StatusBadge status={trip.status} />
                    </div>
                    {dest && (
                      <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {dest.name}, {dest.country}
                      </div>
                    )}
                  </div>

                  <CardHeader className="p-5 pb-2">
                    <CardTitle className="text-xl font-bold line-clamp-1">{trip.title}</CardTitle>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(trip.startDate).toLocaleDateString()} &ndash;{" "}
                      {new Date(trip.endDate).toLocaleDateString()}
                    </p>
                  </CardHeader>

                  <CardContent className="p-5 pt-2 flex-1">
                    {trip.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                        {trip.description}
                      </p>
                    )}
                    <div className="rounded-lg bg-muted/40 p-3 flex justify-between items-center text-xs">
                      <span className="text-muted-foreground font-medium">Budget:</span>
                      <span className="font-bold text-foreground">
                        {formatMoney(trip.budgetCents, trip.budgetCurrency)}
                      </span>
                    </div>
                  </CardContent>

                  <CardFooter className="p-5 pt-0 border-t flex justify-end bg-muted/20">
                    <Link href={`/trips/${trip._id}`} className="w-full">
                      <Button variant="default" size="sm" className="w-full gap-2">
                        View Trip & Planner <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
