"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { DEMO_EMAIL } from "@/config/env";
import { useDemoStore } from "@/lib/store/demoStore";

export default function LoginPage() {
  const router = useRouter();
  const busy = useDemoStore((s) => s.busy);
  const errorMessage = useDemoStore((s) => s.errorMessage);
  const loginWithPassword = useDemoStore((s) => s.loginWithPassword);
  const registerAccount = useDemoStore((s) => s.registerAccount);

  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState("secret12");
  const [name, setName] = useState("Demo User");
  const [mode, setMode] = useState<"login" | "register">("login");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      if (mode === "login") {
        await loginWithPassword(email, password);
      } else {
        await registerAccount(email, password, name);
      }
      router.push("/checkout");
    } catch {
      // errorMessage already set in store
    }
  }

  return (
    <main className="page-main">
      <p className="page-kicker">Auth</p>
      <h1 className="page-title">{mode === "login" ? "Sign in" : "Register"}</h1>

      <form className="login-card" onSubmit={(e) => void onSubmit(e)}>
        {mode === "register" ? (
          <label>
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </label>
        ) : null}
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={6}
            required
          />
        </label>

        {errorMessage ? <p className="msg msg-error">{errorMessage}</p> : null}

        <div className="login-actions">
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {mode === "login" ? "Sign in" : "Create account"}
          </button>
          <button
            className="btn btn-secondary"
            type="button"
            disabled={busy}
            onClick={() =>
              setMode((m) => (m === "login" ? "register" : "login"))
            }
          >
            {mode === "login" ? "Need an account?" : "Have an account?"}
          </button>
        </div>
      </form>
    </main>
  );
}
