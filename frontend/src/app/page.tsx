import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Compass, Calendar, DollarSign, ArrowRight, ShieldCheck, Sparkles, MapPin } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-16 md:py-28 px-4 sm:px-8 bg-gradient-to-b from-primary/5 via-background to-background text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 rounded-full border bg-muted/60 px-3.5 py-1 text-xs font-semibold text-primary mb-6 shadow-sm">
          <Sparkles className="h-3.5 w-3.5" />
          Modern Travel Planning & Budgeting
        </div>

        <h1 className="max-w-4xl text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
          Plan Trips. Track Budgets. <br />
          <span className="text-primary bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Explore Without Stress.
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
          From finding dream destinations to mapping day-by-day itineraries and tracking every dollar against your budget — Tripora keeps your wanderlust organized.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <Link href="/destinations">
            <Button size="lg" className="gap-2 h-12 px-6 shadow-md">
              <Compass className="h-5 w-5" />
              Explore Destinations
            </Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="outline" className="gap-2 h-12 px-6">
              Start Planning Free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="container mx-auto px-4 sm:px-8 py-16 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Everything you need for a stress-free trip</h2>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">Designed for travelers who want clarity without complexity.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border shadow-sm hover:shadow-md transition">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 mb-2">
                <MapPin className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">Discover Destinations</CardTitle>
              <CardDescription>
                Filter by beach, culture, mountain, or adventure. Review expected daily costs and insider tips before booking.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Save favorites to your account with a single tap so you never lose travel inspiration.
            </CardContent>
          </Card>

          <Card className="border shadow-sm hover:shadow-md transition">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400 mb-2">
                <Calendar className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">Day-by-Day Itineraries</CardTitle>
              <CardDescription>
                Organize sightseeing, stays, transport, and dining. Validate activities against your trip calendar.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Automated timeline calculation marks your trips as upcoming, ongoing, or completed.
            </CardContent>
          </Card>

          <Card className="border shadow-sm hover:shadow-md transition">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400 mb-2">
                <DollarSign className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">Precise Expense Tracking</CardTitle>
              <CardDescription>
                Record expenses in integer cents with multi-currency safety. Check remaining budget in real-time.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Visual category breakdowns and near-budget threshold alerts keep you in control of your spending.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="w-full bg-muted/50 border-t py-16 px-4 text-center">
        <div className="container mx-auto max-w-2xl flex flex-col items-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="text-2xl font-bold">Ready to map out your next adventure?</h3>
          <p className="text-muted-foreground mt-2 mb-6 text-sm sm:text-base">
            Create an account in 10 seconds and start planning your itinerary right away.
          </p>
          <Link href="/register">
            <Button size="lg" className="h-11 px-8">
              Get Started with Tripora
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
