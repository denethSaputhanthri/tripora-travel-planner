"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "@tanstack/react-query";
import { tripsApi, destinationsApi } from "@/lib/api";
import { ProtectedRoute } from "@/components/shared/protected-route";
import { LoadingSpinner } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, DollarSign, Loader2, Plane } from "lucide-react";

const CURRENCIES = ["USD", "EUR", "GBP", "LKR", "JPY", "AUD"] as const;

function CreateTripForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialDestId = searchParams.get("destinationId") || "";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [destinationId, setDestinationId] = useState(initialDestId);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budgetAmount, setBudgetAmount] = useState<string>("1000");
  const [budgetCurrency, setBudgetCurrency] = useState("USD");
  const [error, setError] = useState<string | null>(null);

  // Fetch destinations for dropdown
  const { data: destinationsData, isLoading: destsLoading } = useQuery({
    queryKey: ["destinations-all"],
    queryFn: () => destinationsApi.list({ limit: "50" }),
  });

  const destinations = destinationsData?.items || [];

  useEffect(() => {
    if (initialDestId) {
      setDestinationId(initialDestId);
      const matched = destinations.find((d) => d._id === initialDestId);
      if (matched && !title) {
        setTitle(`Trip to ${matched.name}`);
      }
    }
  }, [initialDestId, destinations, title]);

  const createTripMutation = useMutation({
    mutationFn: async () => {
      setError(null);
      if (!destinationId) throw new Error("Please select a destination");
      if (!startDate || !endDate) throw new Error("Please select both start and end dates");
      if (new Date(endDate) < new Date(startDate)) {
        throw new Error("End date must be on or after start date");
      }
      const parsedBudget = parseFloat(budgetAmount);
      if (isNaN(parsedBudget) || parsedBudget < 0) {
        throw new Error("Please enter a valid budget amount");
      }

      // Convert major currency units to integer cents (e.g. 15.50 -> 1550)
      const budgetCents = Math.round(parsedBudget * 100);

      const res = await tripsApi.create({
        title: title.trim(),
        description: description.trim() || undefined,
        destination: destinationId,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        budgetCents,
        budgetCurrency,
      });
      return res.trip;
    },
    onSuccess: (newTrip) => {
      router.push(`/trips/${newTrip._id}`);
    },
    onError: (err: any) => {
      setError(err.message || "Failed to create trip");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTripMutation.mutate();
  };

  return (
    <div className="container mx-auto px-4 sm:px-8 py-8 max-w-2xl">
      <Link
        href="/trips"
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Trips
      </Link>

      <Card className="border shadow-md">
        <CardHeader>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground mb-2 shadow">
            <Plane className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold">Plan a New Adventure</CardTitle>
          <CardDescription>
            Set your destination, dates, and budget. You can add daily activities and track expenses later.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-destructive/15 p-3 text-sm text-destructive font-medium">
                {error}
              </div>
            )}

            {/* Destination Selection */}
            <div className="space-y-1.5">
              <Label htmlFor="destination">Select Destination *</Label>
              {destsLoading ? (
                <div className="h-9 w-full rounded-md border bg-muted animate-pulse" />
              ) : (
                <select
                  id="destination"
                  value={destinationId}
                  onChange={(e) => {
                    setDestinationId(e.target.value);
                    const matched = destinations.find((d) => d._id === e.target.value);
                    if (matched && !title) setTitle(`Trip to ${matched.name}`);
                  }}
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">-- Choose a destination --</option>
                  {destinations.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}, {d.country} (${d.dailyCostUsd}/day)
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Trip Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title">Trip Title *</Label>
              <Input
                id="title"
                placeholder="e.g. Summer Vacation in Bali"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                minLength={2}
                maxLength={100}
              />
            </div>

            {/* Trip Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description">Description (optional)</Label>
              <textarea
                id="description"
                rows={3}
                placeholder="A relaxing getaway focusing on beaches, temples, and local cuisine..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Budget & Currency */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="budgetAmount">Total Trip Budget *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="budgetAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="1500.00"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    required
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="currency">Currency *</Label>
                <select
                  id="currency"
                  value={budgetCurrency}
                  onChange={(e) => setBudgetCurrency(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {CURRENCIES.map((cur) => (
                    <option key={cur} value={cur}>
                      {cur}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button type="submit" className="w-full mt-4" disabled={createTripMutation.isPending}>
              {createTripMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Trip...
                </>
              ) : (
                "Create Trip & Start Planning"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewTripPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<LoadingSpinner text="Preparing trip form..." className="py-24" />}>
        <CreateTripForm />
      </Suspense>
    </ProtectedRoute>
  );
}
