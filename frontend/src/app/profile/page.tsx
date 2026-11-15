"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { ProtectedRoute } from "@/components/shared/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User as UserIcon, Mail, LogOut, ShieldCheck, Heart, Plane } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { tripsApi, favoritesApi } from "@/lib/api";
import Link from "next/link";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  const { data: tripsData } = useQuery({
    queryKey: ["trips"],
    queryFn: () => tripsApi.list(),
  });

  const { data: favoritesData } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => favoritesApi.list(),
  });

  const tripCount = tripsData?.items?.length || 0;
  const favoriteCount = favoritesData?.items?.length || 0;

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 sm:px-8 py-10 max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight mb-8">My Account</h1>

        <div className="space-y-6">
          {/* User Profile Card */}
          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center gap-4 pb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-2xl shadow-inner">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <CardTitle className="text-xl font-bold">{user?.name}</CardTitle>
                <CardDescription className="flex items-center gap-1.5 mt-0.5">
                  <Mail className="h-3.5 w-3.5" />
                  {user?.email}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <Link href="/trips" className="block">
                  <div className="rounded-xl bg-muted/40 p-4 hover:bg-muted/70 transition flex items-center justify-between">
                    <div>
                      <span className="text-xs text-muted-foreground uppercase font-bold block">My Trips</span>
                      <span className="text-2xl font-bold text-primary">{tripCount}</span>
                    </div>
                    <Plane className="h-6 w-6 text-primary/40" />
                  </div>
                </Link>

                <Link href="/favorites" className="block">
                  <div className="rounded-xl bg-muted/40 p-4 hover:bg-muted/70 transition flex items-center justify-between">
                    <div>
                      <span className="text-xs text-muted-foreground uppercase font-bold block">Favorites</span>
                      <span className="text-2xl font-bold text-rose-500">{favoriteCount}</span>
                    </div>
                    <Heart className="h-6 w-6 text-rose-500/40" />
                  </div>
                </Link>
              </div>

              <div className="rounded-lg bg-muted/30 p-4 border text-xs text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Session is securely authenticated with HTTP-only JWT cookies.</span>
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="outline" onClick={() => logout()} className="text-destructive gap-2 text-xs">
                  <LogOut className="h-4 w-4" />
                  Sign Out of Tripora
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
