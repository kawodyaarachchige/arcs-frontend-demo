"use client";

import Link from "next/link";
import { useDemoStore } from "@/lib/store/demoStore";

export function AuthStatus({ variant = "bar" }: { variant?: "bar" | "nav" }) {
  const user = useDemoStore((s) => s.user);
  const logout = useDemoStore((s) => s.logout);
  const busy = useDemoStore((s) => s.busy);
  const hydrated = useDemoStore((s) => s.hydrated);

  if (variant === "nav") {
    if (!hydrated) {
      return (
        <div className="nav-auth">
          <span className="auth-muted">Auth…</span>
        </div>
      );
    }
    if (!user) {
      return (
        <div className="nav-auth">
          <Link className="btn btn-primary btn-sm nav-auth-btn" href="/login">
            Sign in
          </Link>
        </div>
      );
    }
    return (
      <div className="nav-auth">
        <span className="nav-auth-user" title={user.email}>
          {user.name || user.email}
        </span>
        <button
          type="button"
          className="btn btn-secondary btn-sm btn-on-light"
          disabled={busy}
          onClick={() => logout()}
        >
          Log out
        </button>
      </div>
    );
  }

  if (!hydrated) {
    return (
      <div className="demo-control-group auth-status">
        <span className="demo-control-label">Auth</span>
        <span className="auth-muted">Loading…</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="demo-control-group auth-status">
        <span className="demo-control-label">Auth</span>
        <Link className="btn btn-primary btn-sm" href="/login">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="demo-control-group auth-status">
      <span className="demo-control-label">Auth</span>
      <div className="auth-signed-in">
        <span className="auth-user" title={user.email}>
          {user.name || user.email}
        </span>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          disabled={busy}
          onClick={() => logout()}
        >
          Log out
        </button>
      </div>
    </div>
  );
}
