"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import {
  Application,
  Document,
  createApplication,
  deleteApplication,
  getApplication,
  getApplicationDocuments,
  getApplications,
  getDocuments,
  linkDocumentsToApplication,
  updateApplication,
} from "@/lib/api";
import { getToken } from "@/lib/auth";

export default function ApplicationsPage() {
  const router = useRouter();

  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [status, setStatus] = useState("applied");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [editCompanyName, setEditCompanyName] = useState("");
  const [editRoleTitle, setEditRoleTitle] = useState("");
  const [editStatus, setEditStatus] = useState("applied");
  const [editLocation, setEditLocation] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);

  const [linkedDocuments, setLinkedDocuments] = useState<Document[]>([]);
  const [linking, setLinking] = useState(false);

  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [selectedCoverLetterId, setSelectedCoverLetterId] = useState("");

  async function loadApplications() {
    try {
      setError("");
      const data = await getApplications();
      setApplications(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load applications";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function loadApplicationDetail(id: string) {
    try {
      setDetailLoading(true);
      setError("");

      const [applicationData, linkedDocs] = await Promise.all([
        getApplication(id),
        getApplicationDocuments(id),
      ]);

      setSelectedApplication(applicationData);
      setLinkedDocuments(linkedDocs);

      const linkedResume = linkedDocs.find((doc) => doc.document_type === "resume");
      const linkedCoverLetter = linkedDocs.find(
        (doc) => doc.document_type === "cover_letter"
      );

      setSelectedResumeId(linkedResume?.id || "");
      setSelectedCoverLetterId(linkedCoverLetter?.id || "");

      setEditCompanyName(applicationData.company_name);
      setEditRoleTitle(applicationData.role_title);
      setEditStatus(applicationData.status);
      setEditLocation(applicationData.location || "");
      setEditNotes(applicationData.notes || "");
      setEditMode(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load application detail";
      setError(message);
    } finally {
      setDetailLoading(false);
    }
  }

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    loadApplications();
    loadDocuments();
  }, [router]);

  async function handleCreateApplication(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await createApplication({
        company_name: companyName,
        role_title: roleTitle,
        status,
        location,
        notes,
      });

      setCompanyName("");
      setRoleTitle("");
      setStatus("applied");
      setLocation("");
      setNotes("");

      await loadApplications();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create application";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdateApplication(e: FormEvent) {
    e.preventDefault();

    if (!selectedApplication) return;

    setUpdating(true);
    setError("");

    try {
      const updated = await updateApplication(selectedApplication.id, {
        company_name: editCompanyName,
        role_title: editRoleTitle,
        status: editStatus,
        location: editLocation,
        notes: editNotes,
      });

      setSelectedApplication(updated);
      setEditMode(false);
      await loadApplications();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update application";
      setError(message);
    } finally {
      setUpdating(false);
    }
  }

  async function handleDeleteApplication() {
    if (!selectedApplication) return;

    const confirmed = window.confirm(
      `Delete application for ${selectedApplication.company_name}?`
    );

    if (!confirmed) return;

    setDeleting(true);
    setError("");

    try {
      await deleteApplication(selectedApplication.id);
      setSelectedApplication(null);
      await loadApplications();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete application";
      setError(message);
    } finally {
      setDeleting(false);
    }
  }
  async function loadDocuments() {
    try {
      const data = await getDocuments();
      setDocuments(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load documents";
      setError(message);
    }
  }

  async function handleLinkDocuments() {
    if (!selectedApplication) return;

    const ids = [selectedResumeId, selectedCoverLetterId].filter(Boolean);

    setLinking(true);
    setError("");

    try {
      await linkDocumentsToApplication(selectedApplication.id, ids);
      const updatedLinkedDocs = await getApplicationDocuments(selectedApplication.id);
      setLinkedDocuments(updatedLinkedDocs);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to link documents";
      setError(message);
    } finally {
      setLinking(false);
    }
  }

  return (
    <main style={{ padding: "2rem", background: "#f7f7f7", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
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

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "320px 1fr 1fr",
            gap: "1.5rem",
          }}
        >
          <section
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "1.25rem",
              boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
              height: "fit-content",
            }}
          >
            <h2 style={{ marginBottom: "1rem" }}>Add Application</h2>

            <form onSubmit={handleCreateApplication}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>
                  Company
                </label>
                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                  }}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>
                  Role Title
                </label>
                <input
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                  }}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                  }}
                >
                  <option value="planned">planned</option>
                  <option value="applied">applied</option>
                  <option value="oa">oa</option>
                  <option value="interview">interview</option>
                  <option value="final_interview">final_interview</option>
                  <option value="offer">offer</option>
                  <option value="rejected">rejected</option>
                </select>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>
                  Location
                </label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                  }}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    resize: "vertical",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: "100%",
                  padding: "0.9rem",
                  border: "none",
                  borderRadius: "8px",
                  background: "black",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                {submitting ? "Saving..." : "Add Application"}
              </button>
            </form>
          </section>

          <section
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "1.25rem",
              boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
            }}
          >
            <h2 style={{ marginBottom: "1rem" }}>Your Applications</h2>

            {loading ? (
              <p>Loading applications...</p>
            ) : applications.length === 0 ? (
              <p>No applications yet.</p>
            ) : (
              <div style={{ display: "grid", gap: "0.9rem" }}>
                {applications.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => loadApplicationDetail(app.id)}
                    style={{
                      textAlign: "left",
                      border: selectedApplication?.id === app.id
                        ? "2px solid black"
                        : "1px solid #e5e5e5",
                      borderRadius: "10px",
                      padding: "1rem",
                      background: "white",
                      cursor: "pointer",
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
                  </button>
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
            <h2 style={{ marginBottom: "1rem" }}>Application Detail</h2>

            {detailLoading ? (
              <p>Loading detail...</p>
            ) : !selectedApplication ? (
              <p>Select an application to view details.</p>
            ) : editMode ? (
              <form onSubmit={handleUpdateApplication}>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem" }}>
                    Company
                  </label>
                  <input
                    value={editCompanyName}
                    onChange={(e) => setEditCompanyName(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                    }}
                  />
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem" }}>
                    Role Title
                  </label>
                  <input
                    value={editRoleTitle}
                    onChange={(e) => setEditRoleTitle(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                    }}
                  />
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem" }}>
                    Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                    }}
                  >
                    <option value="planned">planned</option>
                    <option value="applied">applied</option>
                    <option value="oa">oa</option>
                    <option value="interview">interview</option>
                    <option value="final_interview">final_interview</option>
                    <option value="offer">offer</option>
                    <option value="rejected">rejected</option>
                  </select>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem" }}>
                    Location
                  </label>
                  <input
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                    }}
                  />
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem" }}>
                    Notes
                  </label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    rows={5}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    type="submit"
                    disabled={updating}
                    style={{
                      flex: 1,
                      padding: "0.9rem",
                      border: "none",
                      borderRadius: "8px",
                      background: "black",
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    {updating ? "Saving..." : "Save Changes"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    style={{
                      flex: 1,
                      padding: "0.9rem",
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                      background: "white",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <h3 style={{ marginTop: 0 }}>{selectedApplication.company_name}</h3>
                <p style={{ color: "#444", marginTop: "0.25rem" }}>
                  {selectedApplication.role_title}
                </p>

                <div style={{ display: "grid", gap: "0.75rem", marginTop: "1rem" }}>
                  <p><strong>Status:</strong> {selectedApplication.status}</p>
                  <p><strong>Location:</strong> {selectedApplication.location || "—"}</p>
                  <p><strong>Work Mode:</strong> {selectedApplication.work_mode || "—"}</p>
                  <p><strong>Source:</strong> {selectedApplication.source || "—"}</p>
                  <p>
                    <strong>Applied Date:</strong>{" "}
                    {selectedApplication.application_date || "—"}
                  </p>
                  <p>
                    <strong>Deadline:</strong> {selectedApplication.deadline_date || "—"}
                  </p>
                  <p><strong>Notes:</strong> {selectedApplication.notes || "—"}</p>
                </div>
                
                <div
                  style={{
                    marginTop: "1.5rem",
                    paddingTop: "1.25rem",
                    borderTop: "1px solid #eee",
                  }}
                >
                  <h4 style={{ marginTop: 0, marginBottom: "1rem" }}>Linked Documents</h4>

                  {linkedDocuments.length === 0 ? (
                    <p style={{ color: "#666" }}>No documents linked yet.</p>
                  ) : (
                    <div style={{ display: "grid", gap: "0.75rem", marginBottom: "1rem" }}>
                      {linkedDocuments.map((doc) => (
                        <div
                          key={doc.id}
                          style={{
                            border: "1px solid #e5e5e5",
                            borderRadius: "10px",
                            padding: "0.85rem",
                          }}
                        >
                          <strong>{doc.version_name}</strong>
                          <p style={{ margin: "0.35rem 0", color: "#555" }}>
                            {doc.document_type}
                          </p>
                          <p style={{ margin: 0, color: "#777" }}>{doc.tags || "No tags"}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ display: "grid", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "0.5rem" }}>
                        Resume Version
                      </label>
                      <select
                        value={selectedResumeId}
                        onChange={(e) => setSelectedResumeId(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          border: "1px solid #ddd",
                          borderRadius: "8px",
                        }}
                      >
                        <option value="">No resume selected</option>
                        {documents
                          .filter((doc) => doc.document_type === "resume")
                          .map((doc) => (
                            <option key={doc.id} value={doc.id}>
                              {doc.version_name}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: "block", marginBottom: "0.5rem" }}>
                        Cover Letter Version
                      </label>
                      <select
                        value={selectedCoverLetterId}
                        onChange={(e) => setSelectedCoverLetterId(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          border: "1px solid #ddd",
                          borderRadius: "8px",
                        }}
                      >
                        <option value="">No cover letter selected</option>
                        {documents
                          .filter((doc) => doc.document_type === "cover_letter")
                          .map((doc) => (
                            <option key={doc.id} value={doc.id}>
                              {doc.version_name}
                            </option>
                          ))}
                      </select>
                    </div>

                    <button
                      onClick={handleLinkDocuments}
                      disabled={linking}
                      style={{
                        padding: "0.9rem",
                        border: "none",
                        borderRadius: "8px",
                        background: "black",
                        color: "white",
                        cursor: "pointer",
                      }}
                    >
                      {linking ? "Saving links..." : "Save Document Links"}
                    </button>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
                  <button
                    onClick={() => setEditMode(true)}
                    style={{
                      flex: 1,
                      padding: "0.9rem",
                      border: "none",
                      borderRadius: "8px",
                      background: "black",
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    Edit
                  </button>

                  <button
                    onClick={handleDeleteApplication}
                    disabled={deleting}
                    style={{
                      flex: 1,
                      padding: "0.9rem",
                      border: "1px solid #e0b4b4",
                      borderRadius: "8px",
                      background: "#fff5f5",
                      color: "#b42318",
                      cursor: "pointer",
                    }}
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}