"use client";

import { useRouter, usePathname } from "next/navigation";
import { removeToken } from "@/lib/auth";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  function handleLogout() {
    removeToken();
    router.push("/login");
  }

  const navButtonStyle = (active: boolean): React.CSSProperties => ({
    padding: "0.75rem 1rem",
    border: active ? "1px solid black" : "1px solid #ccc",
    borderRadius: "8px",
    background: active ? "#f3f3f3" : "white",
    cursor: "pointer",
    fontWeight: active ? 600 : 400,
  });

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "2rem",
      }}
    >
      <div>
        <h1 style={{ marginBottom: "0.25rem" }}>ApplyTrack</h1>
        <p style={{ color: "#666", margin: 0 }}>
          Track and manage your job applications.
        </p>
      </div>

      <div style={{ display: "flex", gap: "0.75rem" }}>
        <button
          onClick={() => router.push("/dashboard")}
          style={navButtonStyle(pathname === "/dashboard")}
        >
          Dashboard
        </button>

        <button
          onClick={() => router.push("/applications")}
          style={navButtonStyle(pathname === "/applications")}
        >
          Applications
        </button>

        <button
          onClick={() => router.push("/documents")}
          style={navButtonStyle(pathname === "/documents")}
        >
          Documents
        </button>
        
        <button
          onClick={handleLogout}
          style={{
            padding: "0.75rem 1rem",
            border: "1px solid #ccc",
            borderRadius: "8px",
            background: "white",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}