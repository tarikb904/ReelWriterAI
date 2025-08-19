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
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="mx-auto max-w-md w-full glass-card elevated">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full p-2 logo-gradient shadow-xl">
              <Logo size={56} />
            </div>
          </div>
          <CardTitle className="text-2xl font-semibold">Welcome to ReelWriterAI</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            AI-powered short video content creator — get viral ideas & scripts fast.
          </CardDescription>
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
          </form>
        </CardContent>
      </Card>
    </div>
  );
}