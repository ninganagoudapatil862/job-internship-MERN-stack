import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/client.js";

const empty = {
  title: "",
  company: "",
  location: "",
  description: "",
  listingType: "job",
  employmentType: "full-time",
  salaryRange: "",
  isActive: true,
};

export default function JobForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get(`/jobs/${id}`);
        const j = data.job;
        if (!cancelled) {
          setForm({
            title: j.title,
            company: j.company,
            location: j.location,
            description: j.description,
            listingType: j.listingType,
            employmentType: j.employmentType,
            salaryRange: j.salaryRange || "",
            isActive: j.isActive,
          });
        }
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isEdit]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/jobs/${id}`, form);
      } else {
        await api.post("/jobs", form);
      }
      navigate("/recruiter/jobs");
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="container">
        <p style={{ color: "var(--muted)" }}>Loading…</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: "640px" }}>
      <Link to="/recruiter/jobs" style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
        ← My listings
      </Link>
      <h1 style={{ marginTop: "1rem" }}>{isEdit ? "Edit listing" : "Post a role"}</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="card" style={{ marginTop: "1rem" }}>
        <div className="form-group">
          <label className="label" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            className="input"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="label" htmlFor="company">
            Company
          </label>
          <input
            id="company"
            className="input"
            value={form.company}
            onChange={(e) => update("company", e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="label" htmlFor="location">
            Location
          </label>
          <input
            id="location"
            className="input"
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
            required
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div className="form-group">
            <label className="label" htmlFor="listingType">
              Listing type
            </label>
            <select
              id="listingType"
              className="select"
              value={form.listingType}
              onChange={(e) => update("listingType", e.target.value)}
            >
              <option value="job">Job</option>
              <option value="internship">Internship</option>
            </select>
          </div>
          <div className="form-group">
            <label className="label" htmlFor="employmentType">
              Employment type
            </label>
            <select
              id="employmentType"
              className="select"
              value={form.employmentType}
              onChange={(e) => update("employmentType", e.target.value)}
            >
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="label" htmlFor="salary">
            Salary range (optional)
          </label>
          <input
            id="salary"
            className="input"
            value={form.salaryRange}
            onChange={(e) => update("salaryRange", e.target.value)}
            placeholder="e.g. $80k–$100k"
          />
        </div>
        <div className="form-group">
          <label className="label" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            className="textarea"
            style={{ minHeight: "200px" }}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            required
          />
        </div>
        {isEdit && (
          <div className="form-group">
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => update("isActive", e.target.checked)}
              />
              <span>Listing is visible to job seekers</span>
            </label>
          </div>
        )}
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving…" : isEdit ? "Update listing" : "Publish listing"}
        </button>
      </form>
    </div>
  );
}
