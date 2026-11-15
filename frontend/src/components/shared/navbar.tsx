"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Compass, Heart, MapPin, Plane, LogOut, User as UserIcon } from "lucide-react";

export function Navbar() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary tracking-tight">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow">
            <Compass className="h-5 w-5" />
          </div>
          <span>Tripora</span>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            href="/destinations"
            className="text-muted-foreground transition hover:text-foreground flex items-center gap-1.5"
          >
            <MapPin className="h-4 w-4" />
            Destinations
          </Link>
          {user && (
            <>
              <Link
                href="/trips"
                className="text-muted-foreground transition hover:text-foreground flex items-center gap-1.5"
              >
                <Plane className="h-4 w-4" />
                My Trips
              </Link>
              <Link
                href="/favorites"
                className="text-muted-foreground transition hover:text-foreground flex items-center gap-1.5"
              >
                <Heart className="h-4 w-4" />
                Favorites
              </Link>
              <Link
                href="/dashboard"
                className="text-muted-foreground transition hover:text-foreground"
              >
                Dashboard
              </Link>
            </>
          )}
        </nav>

        {/* Auth controls */}
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <Link href="/trips/new">
                <Button size="sm" className="hidden sm:inline-flex">
                  + Plan Trip
                </Button>
              </Link>
              <div className="flex items-center gap-2 pl-2 border-l">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 hover:opacity-80 transition"
                  title="View Profile"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground font-semibold text-xs border">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline text-sm font-medium">{user.name}</span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  title="Log out"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive ml-1"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
