"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "./logo";
import ThemeToggle from "./theme-toggle";

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (username === "tahmid" && password === "t112233") {
      localStorage.setItem("reelwriter-auth", "true");
      onLoginSuccess();
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white to-indigo-50 dark:from-gray-950 dark:to-indigo-950/30">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-10 -left-10 h-64 w-64 rounded-full bg-gradient-to-br from-purple-500/20 via-indigo-500/20 to-cyan-400/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-gradient-to-tl from-cyan-400/20 via-fuchsia-500/20 to-indigo-500/20 blur-3xl" />
      </div>

      <div className="relative mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl p-2 bg-white/70 shadow-sm dark:bg-white/10">
            <Logo size={40} />
          </div>
          <div>
            <p className="text-lg font-semibold leading-tight">ReelWriterAI</p>
            <p className="text-xs text-muted-foreground -mt-0.5">Create viral short-form content fast</p>
          </div>
        </div>
        <ThemeToggle />
      </div>

      <div className="relative flex min-h-[70vh] items-center justify-center p-6">
        <Card className="mx-auto w-full max-w-md glass-card elevated">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold">Welcome back</CardTitle>
            <CardDescription>Sign in to craft viral ideas, scripts, and captions.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="tahmid"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full primary-gradient">
                Login
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Tip: username: tahmid — password: t112233
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}