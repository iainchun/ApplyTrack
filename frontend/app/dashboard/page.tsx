"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DashboardSummary,
  RecentApplication,
  StatusDistributionItem,
  getDashboardSummary,
  getRecentApplications,
  getStatusDistribution,
} from "@/lib/api";
import { getToken } from "@/lib/auth";
import Navbar from "@/components/navbar";

export default function DashboardPage() {
  const router = useRouter();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [statusData, setStatusData] = useState<StatusDistributionItem[]>([]);
  const [recentApps, setRecentApps] = useState<RecentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    async function loadDashboard() {
      try {
        setError("");
        const [summaryData, statusDistribution, recent] = await Promise.all([
          getDashboardSummary(),
          getStatusDistribution(),
          getRecentApplications(),
        ]);

        setSummary(summaryData);
        setStatusData(statusDistribution);
        setRecentApps(recent);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load dashboard";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  return (
    <main style={{ padding: "2rem", background: "#f7f7f7", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <Navbar />

        {error && (
          <div
            style={{
              marginBottom: "1rem",
              padding: "0.9rem 1rem",
              background: "#fff0f0",
              color: "crimson",
              borderRadius: "10px",
              border: "1px solid #ffd6d6",
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <p>Loading dashboard...</p>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              <DashboardCard title="Total Applications" value={summary?.total_applications ?? 0} />
              <DashboardCard title="Interviews" value={summary?.interviews ?? 0} />
              <DashboardCard title="Offers" value={summary?.offers ?? 0} />
              <DashboardCard title="Rejected" value={summary?.rejected ?? 0} />
              <DashboardCard title="Response Rate" value={`${summary?.response_rate ?? 0}%`} />
              <DashboardCard title="Offer Rate" value={`${summary?.offer_rate ?? 0}%`} />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1.5rem",
              }}
            >
              <section
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "1.25rem",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                }}
              >
                <h2 style={{ marginBottom: "1rem" }}>Status Distribution</h2>

                {statusData.length === 0 ? (
                  <p>No status data yet.</p>
                ) : (
                  <div style={{ display: "grid", gap: "0.75rem" }}>
                    {statusData.map((item) => (
                      <div
                        key={item.status}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "0.85rem 1rem",
                          border: "1px solid #eee",
                          borderRadius: "10px",
                        }}
                      >
                        <span>{item.status}</span>
                        <strong>{item.count}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "1.25rem",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                }}
              >
                <h2 style={{ marginBottom: "1rem" }}>Recent Applications</h2>

                {recentApps.length === 0 ? (
                  <p>No applications yet.</p>
                ) : (
                  <div style={{ display: "grid", gap: "0.75rem" }}>
                    {recentApps.map((app) => (
                      <div
                        key={app.id}
                        style={{
                          border: "1px solid #eee",
                          borderRadius: "10px",
                          padding: "1rem",
                        }}
                      >
                        <h3 style={{ margin: 0 }}>{app.company_name}</h3>
                        <p style={{ margin: "0.35rem 0", color: "#444" }}>
                          {app.role_title}
                        </p>
                        <p style={{ margin: 0, color: "#777" }}>
                          {app.location || "No location"}
                        </p>
                        <div style={{ marginTop: "0.75rem" }}>
                          <span
                            style={{
                              padding: "0.3rem 0.6rem",
                              borderRadius: "999px",
                              background: "#f0f0f0",
                              fontSize: "0.85rem",
                            }}
                          >
                            {app.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function DashboardCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "12px",
        padding: "1.25rem",
        boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
      }}
    >
      <p style={{ margin: 0, color: "#666", marginBottom: "0.5rem" }}>{title}</p>
      <h2 style={{ margin: 0 }}>{value}</h2>
    </div>
  );
}