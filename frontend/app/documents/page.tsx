"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import {
  Document,
  createDocument,
  deleteDocument,
  getDocuments,
  updateDocument,
} from "@/lib/api";
import { getToken } from "@/lib/auth";

export default function DocumentsPage() {
  const router = useRouter();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [documentType, setDocumentType] = useState("resume");
  const [versionName, setVersionName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [tags, setTags] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [editDocumentType, setEditDocumentType] = useState("resume");
  const [editVersionName, setEditVersionName] = useState("");
  const [editFileUrl, setEditFileUrl] = useState("");
  const [editTags, setEditTags] = useState("");
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function loadDocuments() {
    try {
      setError("");
      const data = await getDocuments();
      setDocuments(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load documents";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    loadDocuments();
  }, [router]);

  function selectDocument(doc: Document) {
    setSelectedDocument(doc);
    setEditMode(false);
    setEditDocumentType(doc.document_type);
    setEditVersionName(doc.version_name);
    setEditFileUrl(doc.file_url || "");
    setEditTags(doc.tags || "");
  }

  async function handleCreateDocument(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const created = await createDocument({
        document_type: documentType,
        version_name: versionName,
        file_url: fileUrl || undefined,
        tags: tags || undefined,
      });

      setDocumentType("resume");
      setVersionName("");
      setFileUrl("");
      setTags("");

      await loadDocuments();
      setSelectedDocument(created);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create document";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdateDocument(e: FormEvent) {
    e.preventDefault();
    if (!selectedDocument) return;

    setUpdating(true);
    setError("");

    try {
      const updated = await updateDocument(selectedDocument.id, {
        document_type: editDocumentType,
        version_name: editVersionName,
        file_url: editFileUrl || undefined,
        tags: editTags || undefined,
      });

      setSelectedDocument(updated);
      setEditMode(false);
      await loadDocuments();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update document";
      setError(message);
    } finally {
      setUpdating(false);
    }
  }

  async function handleDeleteDocument() {
    if (!selectedDocument) return;

    const confirmed = window.confirm(
      `Delete document version "${selectedDocument.version_name}"?`
    );
    if (!confirmed) return;

    setDeleting(true);
    setError("");

    try {
      await deleteDocument(selectedDocument.id);
      setSelectedDocument(null);
      await loadDocuments();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete document";
      setError(message);
    } finally {
      setDeleting(false);
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
            <h2 style={{ marginBottom: "1rem" }}>Add Document</h2>

            <form onSubmit={handleCreateDocument}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>
                  Document Type
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                  }}
                >
                  <option value="resume">resume</option>
                  <option value="cover_letter">cover_letter</option>
                </select>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>
                  Version Name
                </label>
                <input
                  value={versionName}
                  onChange={(e) => setVersionName(e.target.value)}
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
                  File URL
                </label>
                <input
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://example.com/resume.pdf"
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
                  Tags
                </label>
                <input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="backend, python, api"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
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
                {submitting ? "Saving..." : "Add Document"}
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
            <h2 style={{ marginBottom: "1rem" }}>Your Documents</h2>

            {loading ? (
              <p>Loading documents...</p>
            ) : documents.length === 0 ? (
              <p>No document versions yet.</p>
            ) : (
              <div style={{ display: "grid", gap: "0.9rem" }}>
                {documents.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => selectDocument(doc)}
                    style={{
                      textAlign: "left",
                      border:
                        selectedDocument?.id === doc.id
                          ? "2px solid black"
                          : "1px solid #e5e5e5",
                      borderRadius: "10px",
                      padding: "1rem",
                      background: "white",
                      cursor: "pointer",
                    }}
                  >
                    <h3 style={{ margin: 0 }}>{doc.version_name}</h3>
                    <p style={{ margin: "0.35rem 0", color: "#444" }}>
                      {doc.document_type}
                    </p>
                    <p style={{ margin: 0, color: "#777" }}>
                      {doc.tags || "No tags"}
                    </p>
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
            <h2 style={{ marginBottom: "1rem" }}>Document Detail</h2>

            {!selectedDocument ? (
              <p>Select a document version to view details.</p>
            ) : editMode ? (
              <form onSubmit={handleUpdateDocument}>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem" }}>
                    Document Type
                  </label>
                  <select
                    value={editDocumentType}
                    onChange={(e) => setEditDocumentType(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                    }}
                  >
                    <option value="resume">resume</option>
                    <option value="cover_letter">cover_letter</option>
                  </select>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem" }}>
                    Version Name
                  </label>
                  <input
                    value={editVersionName}
                    onChange={(e) => setEditVersionName(e.target.value)}
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
                    File URL
                  </label>
                  <input
                    value={editFileUrl}
                    onChange={(e) => setEditFileUrl(e.target.value)}
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
                    Tags
                  </label>
                  <input
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
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
                <h3 style={{ marginTop: 0 }}>{selectedDocument.version_name}</h3>

                <div style={{ display: "grid", gap: "0.75rem", marginTop: "1rem" }}>
                  <p><strong>Type:</strong> {selectedDocument.document_type}</p>
                  <p><strong>Tags:</strong> {selectedDocument.tags || "—"}</p>
                  <p>
                    <strong>File URL:</strong>{" "}
                    {selectedDocument.file_url ? (
                      <a
                        href={selectedDocument.file_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "black" }}
                      >
                        Open document
                      </a>
                    ) : (
                      "—"
                    )}
                  </p>
                  <p>
                    <strong>Created At:</strong>{" "}
                    {selectedDocument.created_at || "—"}
                  </p>
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
                    onClick={handleDeleteDocument}
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