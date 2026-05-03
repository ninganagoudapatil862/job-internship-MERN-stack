import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/client.js";

const statuses = ["pending", "reviewed", "shortlisted", "rejected"];

const statusClass = {
  pending: "badge-pending",
  reviewed: "badge-reviewed",
  shortlisted: "badge-shortlisted",
  rejected: "badge-rejected",
};

export default function ApplicationsForJob() {
  const { jobId } = useParams();
  const [applications, setApplications] = useState(null);
  const [jobTitle, setJobTitle] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setError("");
    try {
      const { data } = await api.get(`/applications/job/${jobId}`);
      setApplications(data.applications);
      if (data.applications?.[0]?.job?.title) {
        setJobTitle(data.applications[0].job.title);
      }
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load applications");
    }
  }

  useEffect(() => {
    load();
  }, [jobId]);

  async function setStatus(applicationId, status) {
    try {
      const { data } = await api.patch(`/applications/${applicationId}/status`, {
        status,
      });
      setApplications((list) =>
        list.map((a) => (a._id === applicationId ? data.application : a))
      );
    } catch (e) {
      alert(e.response?.data?.message || "Update failed");
    }
  }

  return (
    <div className="container">
      <Link to="/recruiter/jobs" style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
        ← My listings
      </Link>
      <h1 style={{ marginTop: "1rem", marginBottom: "0.35rem" }}>Applications</h1>
      {jobTitle && (
        <p style={{ color: "var(--muted)", marginTop: 0 }}>{jobTitle}</p>
      )}

      {error && <div className="alert alert-error">{error}</div>}
      {!applications && !error && (
        <p style={{ color: "var(--muted)" }}>Loading…</p>
      )}
      {applications?.length === 0 && (
        <p style={{ color: "var(--muted)" }}>No applications yet.</p>
      )}

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {applications?.map((app) => (
          <li key={app._id} className="card" style={{ marginBottom: "1rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2 style={{ margin: "0 0 0.35rem", fontSize: "1.05rem" }}>
                  {app.applicant?.name}
                </h2>
                <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.9rem" }}>
                  {app.applicant?.email}
                </p>
                <p style={{ margin: "0.35rem 0 0", fontSize: "0.85rem", color: "var(--muted)" }}>
                  Applied {new Date(app.createdAt).toLocaleString()}
                </p>
              </div>
              <span className={`badge ${statusClass[app.status] || "badge-pending"}`}>
                {app.status}
              </span>
            </div>
            {app.coverLetter ? (
              <p
                style={{
                  margin: "1rem 0 0",
                  whiteSpace: "pre-wrap",
                  fontSize: "0.95rem",
                  color: "var(--text)",
                }}
              >
                {app.coverLetter}
              </p>
            ) : (
              <p style={{ margin: "0.75rem 0 0", color: "var(--muted)", fontSize: "0.9rem" }}>
                No cover letter.
              </p>
            )}
            <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <span style={{ color: "var(--muted)", fontSize: "0.85rem", alignSelf: "center" }}>
                Set status:
              </span>
              {statuses.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="btn btn-secondary"
                  style={{
                    fontSize: "0.8rem",
                    padding: "0.35rem 0.65rem",
                    opacity: app.status === s ? 1 : 0.75,
                  }}
                  onClick={() => setStatus(app._id, s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
