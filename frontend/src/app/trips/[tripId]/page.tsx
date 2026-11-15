"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tripsApi, itineraryApi, expensesApi } from "@/lib/api";
import { ProtectedRoute } from "@/components/shared/protected-route";
import { StatusBadge } from "@/components/shared/status-badge";
import { CategoryBadge } from "@/components/shared/category-badge";
import { LoadingSpinner } from "@/components/shared/loading";
import { formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  Clock,
  AlertTriangle,
  MapPin,
  Utensils,
  Bed,
  Compass,
  Bus,
  CheckCircle,
  FileText,
  PieChart as ChartIcon,
} from "lucide-react";
import type { Destination, Activity, Expense } from "@/lib/types";

export default function TripDetailPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"itinerary" | "expenses" | "overview">("itinerary");

  // Activity form modal states
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [actTitle, setActTitle] = useState("");
  const [actType, setActType] = useState<"accommodation" | "sightseeing" | "food" | "transport">("sightseeing");
  const [actDate, setActDate] = useState("");
  const [actStartTime, setActStartTime] = useState("");
  const [actEndTime, setActEndTime] = useState("");
  const [actNotes, setActNotes] = useState("");
  const [actError, setActError] = useState<string | null>(null);

  // Expense form modal states
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expTitle, setExpTitle] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expCategory, setExpCategory] = useState<
    "accommodation" | "food" | "transport" | "activities" | "shopping" | "other"
  >("food");
  const [expDate, setExpDate] = useState("");
  const [expNotes, setExpNotes] = useState("");
  const [expError, setExpError] = useState<string | null>(null);

  // Queries
  const { data: tripData, isLoading: tripLoading } = useQuery({
    queryKey: ["trip", tripId],
    queryFn: () => tripsApi.get(tripId),
  });

  const { data: itineraryData, isLoading: itineraryLoading } = useQuery({
    queryKey: ["itinerary", tripId],
    queryFn: () => itineraryApi.list(tripId),
  });

  const { data: expensesData, isLoading: expensesLoading } = useQuery({
    queryKey: ["expenses", tripId],
    queryFn: () => expensesApi.list(tripId),
  });

  const trip = tripData?.trip;
  const activities = itineraryData?.items || [];
  const expenses = expensesData?.items || [];
  const expenseMeta = expensesData?.meta;

  // Mutations
  const deleteTripMutation = useMutation({
    mutationFn: () => tripsApi.delete(tripId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      router.push("/trips");
    },
  });

  const createActivityMutation = useMutation({
    mutationFn: async () => {
      setActError(null);
      if (!actTitle.trim()) throw new Error("Title is required");
      if (!actDate) throw new Error("Date is required");

      await itineraryApi.create(tripId, {
        title: actTitle.trim(),
        type: actType,
        date: new Date(actDate).toISOString(),
        startTime: actStartTime || undefined,
        endTime: actEndTime || undefined,
        notes: actNotes.trim() || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itinerary", tripId] });
      setShowActivityModal(false);
      setActTitle("");
      setActNotes("");
      setActStartTime("");
      setActEndTime("");
    },
    onError: (err: any) => setActError(err.message || "Failed to add activity"),
  });

  const deleteActivityMutation = useMutation({
    mutationFn: (actId: string) => itineraryApi.delete(tripId, actId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itinerary", tripId] });
    },
  });

  const createExpenseMutation = useMutation({
    mutationFn: async () => {
      setExpError(null);
      if (!expTitle.trim()) throw new Error("Title is required");
      if (!expAmount || parseFloat(expAmount) <= 0) throw new Error("Please enter a valid amount");
      if (!expDate) throw new Error("Date is required");

      const amountCents = Math.round(parseFloat(expAmount) * 100);

      await expensesApi.create(tripId, {
        title: expTitle.trim(),
        amountCents,
        currency: trip?.budgetCurrency || "USD",
        category: expCategory,
        date: new Date(expDate).toISOString(),
        notes: expNotes.trim() || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", tripId] });
      setShowExpenseModal(false);
      setExpTitle("");
      setExpAmount("");
      setExpNotes("");
    },
    onError: (err: any) => setExpError(err.message || "Failed to add expense"),
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (expId: string) => expensesApi.delete(tripId, expId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", tripId] });
    },
  });

  if (tripLoading) {
    return <LoadingSpinner text="Loading trip details..." className="py-32" />;
  }

  if (!trip) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold">Trip not found</h2>
        <Link href="/trips" className="mt-4 inline-block">
          <Button variant="outline">Back to My Trips</Button>
        </Link>
      </div>
    );
  }

  const destination = typeof trip.destination === "object" ? (trip.destination as Destination) : null;
  const totalSpentCents = expenseMeta?.totalSpentCents || 0;
  const remainingCents = trip.budgetCents - totalSpentCents;
  const spentPercent = Math.min(Math.round((totalSpentCents / (trip.budgetCents || 1)) * 100), 100);
  const isNearBudget = remainingCents < trip.budgetCents * 0.2;

  // Group activities by date
  const groupedActivities: Record<string, Activity[]> = {};
  activities.forEach((act) => {
    const dStr = new Date(act.date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    if (!groupedActivities[dStr]) groupedActivities[dStr] = [];
    groupedActivities[dStr].push(act);
  });

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 sm:px-8 py-8 max-w-6xl">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/trips"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Trips
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm("Are you sure you want to delete this trip and all its activities?")) {
                deleteTripMutation.mutate();
              }
            }}
            className="text-muted-foreground hover:text-destructive text-xs gap-1"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete Trip
          </Button>
        </div>

        {/* Hero Card */}
        <div className="rounded-2xl border bg-card overflow-hidden shadow-sm mb-8">
          <div className="relative h-48 sm:h-64 bg-muted overflow-hidden">
            {destination?.imageUrl ? (
              <img src={destination.imageUrl} alt={trip.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary/20" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute top-4 right-4">
              <StatusBadge status={trip.status} />
            </div>
            <div className="absolute bottom-6 left-6 right-6 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                {destination && (
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/80 flex items-center gap-1 mb-1">
                    <MapPin className="h-3.5 w-3.5" /> {destination.name}, {destination.country}
                  </span>
                )}
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">{trip.title}</h1>
                <p className="text-sm text-white/90 flex items-center gap-1.5 mt-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(trip.startDate).toLocaleDateString()} &ndash;{" "}
                  {new Date(trip.endDate).toLocaleDateString()}
                </p>
              </div>
              <div className="bg-background/90 backdrop-blur text-foreground px-4 py-2 rounded-xl text-right sm:text-left self-start sm:self-auto shadow">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Trip Budget</span>
                <span className="text-lg font-bold text-primary">
                  {formatMoney(trip.budgetCents, trip.budgetCurrency)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b mb-8 space-x-8">
          <button
            onClick={() => setActiveTab("itinerary")}
            className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === "itinerary"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Calendar className="h-4 w-4" /> Itinerary Planner ({activities.length})
          </button>
          <button
            onClick={() => setActiveTab("expenses")}
            className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === "expenses"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <DollarSign className="h-4 w-4" /> Budget & Expenses ({expenses.length})
          </button>
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === "overview"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="h-4 w-4" /> Destination & Notes
          </button>
        </div>

        {/* TAB 1: ITINERARY PLANNER */}
        {activeTab === "itinerary" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Daily Activities</h2>
                <p className="text-sm text-muted-foreground">Plan and organize your day-by-day travel schedule.</p>
              </div>
              <Button onClick={() => setShowActivityModal(true)} size="sm" className="gap-2 shadow">
                <Plus className="h-4 w-4" /> Add Activity
              </Button>
            </div>

            {itineraryLoading ? (
              <LoadingSpinner text="Loading activities..." className="py-12" />
            ) : Object.keys(groupedActivities).length === 0 ? (
              <Card className="p-10 text-center border-dashed">
                <Compass className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <h3 className="text-base font-semibold">No activities added yet</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  Add places to visit, reservations, food stops, or transportation steps to your schedule.
                </p>
                <Button onClick={() => setShowActivityModal(true)} size="sm" className="mt-4">
                  + Add First Activity
                </Button>
              </Card>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedActivities).map(([dateLabel, items]) => (
                  <div key={dateLabel} className="space-y-3">
                    <div className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground shadow-sm">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      {dateLabel}
                    </div>

                    <div className="grid gap-3">
                      {items.map((act) => (
                        <div
                          key={act._id}
                          className="flex items-start justify-between gap-4 rounded-xl border bg-card p-4 shadow-sm hover:shadow transition"
                        >
                          <div className="flex items-start gap-3.5">
                            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0 text-muted-foreground mt-0.5">
                              {act.type === "food" ? (
                                <Utensils className="h-5 w-5 text-orange-500" />
                              ) : act.type === "accommodation" ? (
                                <Bed className="h-5 w-5 text-indigo-500" />
                              ) : act.type === "transport" ? (
                                <Bus className="h-5 w-5 text-teal-500" />
                              ) : (
                                <Compass className="h-5 w-5 text-cyan-500" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-base leading-tight">{act.title}</h4>
                                <CategoryBadge category={act.type} />
                              </div>
                              {(act.startTime || act.endTime) && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 font-medium">
                                  <Clock className="h-3 w-3" />
                                  {act.startTime || "--:--"} &ndash; {act.endTime || "--:--"}
                                </p>
                              )}
                              {act.notes && (
                                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed bg-muted/40 p-2 rounded-md">
                                  {act.notes}
                                </p>
                              )}
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteActivityMutation.mutate(act._id)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                            title="Delete activity"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BUDGET & EXPENSES */}
        {activeTab === "expenses" && (
          <div className="space-y-8">
            {/* Budget Progress Summary */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">Budget Overview</CardTitle>
                    <CardDescription>Track spent money against your total allocated budget.</CardDescription>
                  </div>
                  {isNearBudget && remainingCents > 0 && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      <AlertTriangle className="h-3.5 w-3.5" /> Over 80% of budget used
                    </div>
                  )}
                  {remainingCents <= 0 && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-destructive/15 text-destructive">
                      <AlertTriangle className="h-3.5 w-3.5" /> Budget exceeded!
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="rounded-xl bg-muted/40 p-3">
                    <span className="text-xs text-muted-foreground uppercase font-bold block">Total Budget</span>
                    <span className="text-xl font-bold">{formatMoney(trip.budgetCents, trip.budgetCurrency)}</span>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3">
                    <span className="text-xs text-muted-foreground uppercase font-bold block">Spent</span>
                    <span className="text-xl font-bold text-primary">
                      {formatMoney(totalSpentCents, trip.budgetCurrency)}
                    </span>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3">
                    <span className="text-xs text-muted-foreground uppercase font-bold block">Remaining</span>
                    <span
                      className={`text-xl font-bold ${
                        remainingCents < 0 ? "text-destructive" : "text-emerald-600"
                      }`}
                    >
                      {formatMoney(remainingCents, trip.budgetCurrency)}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground font-medium">
                    <span>{spentPercent}% spent</span>
                    <span>100% target</span>
                  </div>
                  <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        remainingCents < 0
                          ? "bg-destructive"
                          : isNearBudget
                          ? "bg-amber-500"
                          : "bg-primary"
                      }`}
                      style={{ width: `${Math.min(spentPercent, 100)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expenses List & Add Action */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">Recorded Expenses</h3>
                  <p className="text-sm text-muted-foreground">Every purchase saved in minor units for exact math.</p>
                </div>
                <Button onClick={() => setShowExpenseModal(true)} size="sm" className="gap-2 shadow">
                  <Plus className="h-4 w-4" /> Add Expense
                </Button>
              </div>

              {expensesLoading ? (
                <LoadingSpinner text="Loading expenses..." className="py-12" />
              ) : expenses.length === 0 ? (
                <Card className="p-8 text-center border-dashed">
                  <DollarSign className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm font-semibold">No expenses logged yet</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Keep receipts organized and watch your trip balance update in real time.
                  </p>
                  <Button onClick={() => setShowExpenseModal(true)} size="sm" variant="outline" className="mt-4">
                    + Log Expense
                  </Button>
                </Card>
              ) : (
                <div className="divide-y rounded-xl border bg-card shadow-sm overflow-hidden">
                  {expenses.map((exp) => (
                    <div key={exp._id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition">
                      <div className="flex items-center gap-3">
                        <CategoryBadge category={exp.category} />
                        <div>
                          <h4 className="font-semibold text-sm">{exp.title}</h4>
                          <span className="text-xs text-muted-foreground">
                            {new Date(exp.date).toLocaleDateString()} {exp.notes ? `• ${exp.notes}` : ""}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-sm">{formatMoney(exp.amountCents, exp.currency)}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteExpenseMutation.mutate(exp._id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: DESTINATION & NOTES OVERVIEW */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Destination Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {destination ? (
                  <>
                    <p className="text-muted-foreground leading-relaxed">{destination.description}</p>
                    <div className="pt-2 border-t space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category:</span>
                        <CategoryBadge category={destination.category} />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Typical Daily Cost:</span>
                        <span className="font-semibold">${destination.dailyCostUsd} USD</span>
                      </div>
                    </div>
                    {destination.tips && destination.tips.length > 0 && (
                      <div className="pt-2 border-t space-y-2">
                        <span className="font-bold block">Local Tips:</span>
                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                          {destination.tips.map((t, idx) => (
                            <li key={idx}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground">Custom destination selected.</p>
                )}
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Trip Notes & Description</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                {trip.description ? (
                  <p>{trip.description}</p>
                ) : (
                  <p className="italic text-muted-foreground/60">No specific notes provided for this trip.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* MODAL: ADD ACTIVITY */}
        {showActivityModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <Card className="w-full max-w-lg shadow-xl border">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-lg">Add Activity to Itinerary</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowActivityModal(false)}>
                  ✕
                </Button>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    createActivityMutation.mutate();
                  }}
                  className="space-y-4"
                >
                  {actError && <p className="text-xs text-destructive font-medium">{actError}</p>}

                  <div className="space-y-1">
                    <Label htmlFor="actTitle">Activity Title *</Label>
                    <Input
                      id="actTitle"
                      placeholder="e.g. Scuba diving lesson at Coral Reef"
                      value={actTitle}
                      onChange={(e) => setActTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="actType">Category *</Label>
                      <select
                        id="actType"
                        value={actType}
                        onChange={(e) => setActType(e.target.value as any)}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                      >
                        <option value="sightseeing">Sightseeing</option>
                        <option value="accommodation">Accommodation</option>
                        <option value="food">Food & Drink</option>
                        <option value="transport">Transport</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="actDate">Date (within trip) *</Label>
                      <Input
                        id="actDate"
                        type="date"
                        value={actDate}
                        onChange={(e) => setActDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="actStartTime">Start Time (HH:mm)</Label>
                      <Input
                        id="actStartTime"
                        placeholder="09:00"
                        value={actStartTime}
                        onChange={(e) => setActStartTime(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="actEndTime">End Time (HH:mm)</Label>
                      <Input
                        id="actEndTime"
                        placeholder="11:30"
                        value={actEndTime}
                        onChange={(e) => setActEndTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="actNotes">Notes (optional)</Label>
                    <textarea
                      id="actNotes"
                      rows={2}
                      placeholder="Bring sunscreen, voucher code #12345..."
                      value={actNotes}
                      onChange={(e) => setActNotes(e.target.value)}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setShowActivityModal(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createActivityMutation.isPending}>
                      Save Activity
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* MODAL: ADD EXPENSE */}
        {showExpenseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <Card className="w-full max-w-lg shadow-xl border">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-lg">Log New Expense</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowExpenseModal(false)}>
                  ✕
                </Button>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    createExpenseMutation.mutate();
                  }}
                  className="space-y-4"
                >
                  {expError && <p className="text-xs text-destructive font-medium">{expError}</p>}

                  <div className="space-y-1">
                    <Label htmlFor="expTitle">Expense Description *</Label>
                    <Input
                      id="expTitle"
                      placeholder="e.g. Seafood dinner with ocean view"
                      value={expTitle}
                      onChange={(e) => setExpTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="expAmount">Amount ({trip.budgetCurrency}) *</Label>
                      <Input
                        id="expAmount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="45.50"
                        value={expAmount}
                        onChange={(e) => setExpAmount(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="expCategory">Category *</Label>
                      <select
                        id="expCategory"
                        value={expCategory}
                        onChange={(e) => setExpCategory(e.target.value as any)}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                      >
                        <option value="accommodation">Accommodation</option>
                        <option value="food">Food & Dining</option>
                        <option value="transport">Transportation</option>
                        <option value="activities">Activities & Tours</option>
                        <option value="shopping">Shopping</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="expDate">Date *</Label>
                    <Input
                      id="expDate"
                      type="date"
                      value={expDate}
                      onChange={(e) => setExpDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="expNotes">Notes (optional)</Label>
                    <Input
                      id="expNotes"
                      placeholder="Paid with Visa card"
                      value={expNotes}
                      onChange={(e) => setExpNotes(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setShowExpenseModal(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createExpenseMutation.isPending}>
                      Log Expense
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
