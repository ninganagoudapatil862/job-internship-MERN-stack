import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function JobDetail() {
  const { id } = useParams();
  const { user, isSeeker } = useAuth();
  const [job, setJob] = useState(null);
  const [error, setError] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [applyMsg, setApplyMsg] = useState("");
  const [applyErr, setApplyErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setError("");
    (async () => {
      try {
        const { data } = await api.get(`/jobs/${id}`);
        if (!cancelled) setJob(data.job);
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || "Not found");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleApply(e) {
    e.preventDefault();
    setApplyErr("");
    setApplyMsg("");
    setSubmitting(true);
    try {
      await api.post("/applications", { jobId: id, coverLetter });
      setApplyMsg("Application submitted.");
      setCoverLetter("");
    } catch (e) {
      setApplyErr(e.response?.data?.message || "Could not apply");
    } finally {
      setSubmitting(false);
    }
  }

  if (error || (!job && !error)) {
    return (
      <div className="container">
        {error ? (
          <div className="alert alert-error">{error}</div>
        ) : (
          <p style={{ color: "var(--muted)" }}>Loading…</p>
        )}
        <Link to="/jobs">← Back to listings</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: "720px" }}>
      <Link to="/jobs" style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
        ← All listings
      </Link>
      <header style={{ marginTop: "1rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <h1 style={{ margin: 0, fontSize: "1.75rem" }}>{job.title}</h1>
          <span
            className={`badge badge-${job.listingType === "internship" ? "internship" : "job"}`}
          >
            {job.listingType}
          </span>
        </div>
        <p style={{ color: "var(--muted)", margin: "0.5rem 0 0" }}>
          {job.company} · {job.location} · {job.employmentType}
          {job.salaryRange ? ` · ${job.salaryRange}` : ""}
        </p>
        {job.recruiter && (
          <p style={{ color: "var(--muted)", fontSize: "0.9rem", margin: "0.35rem 0 0" }}>
            Posted by {job.recruiter.name}
          </p>
        )}
      </header>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ marginTop: 0, fontSize: "1rem", color: "var(--muted)" }}>
          Description
        </h2>
        <div style={{ whiteSpace: "pre-wrap" }}>{job.description}</div>
      </div>

      {isSeeker && user && (
        <div className="card">
          <h2 style={{ marginTop: 0, fontSize: "1.1rem" }}>Apply</h2>
          {applyMsg && <div className="alert alert-success">{applyMsg}</div>}
          {applyErr && <div className="alert alert-error">{applyErr}</div>}
          <form onSubmit={handleApply}>
            <div className="form-group">
              <label className="label" htmlFor="cover">
                Cover letter (optional)
              </label>
              <textarea
                id="cover"
                className="textarea"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Brief message to the recruiter…"
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit application"}
            </button>
          </form>
        </div>
      )}

      {!user && (
        <p style={{ color: "var(--muted)" }}>
          <Link to="/login">Log in</Link> as a job seeker to apply.
        </p>
      )}

      {user && !isSeeker && (
        <p style={{ color: "var(--muted)" }}>
          Recruiter accounts cannot apply. Use a job seeker account to submit applications.
        </p>
      )}
    </div>
  );
}
