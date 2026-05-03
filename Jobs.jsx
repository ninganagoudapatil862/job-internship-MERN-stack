import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";

export default function Jobs() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    q: "",
    listingType: "",
    employmentType: "",
    location: "",
    company: "",
    page: 1,
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.listingType) params.set("listingType", filters.listingType);
    if (filters.employmentType) params.set("employmentType", filters.employmentType);
    if (filters.location) params.set("location", filters.location);
    if (filters.company) params.set("company", filters.company);
    params.set("page", String(filters.page));

    let cancelled = false;
    setError("");
    (async () => {
      try {
        const { data: res } = await api.get(`/jobs?${params.toString()}`);
        if (!cancelled) setData(res);
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || "Failed to load jobs");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [filters]);

  function handleFilterSubmit(e) {
    e.preventDefault();
    setFilters((f) => ({ ...f, page: 1 }));
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: "0.5rem" }}>Open positions</h1>
      <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
        Search and filter jobs and internships.
      </p>

      <form
        onSubmit={handleFilterSubmit}
        className="card"
        style={{ marginBottom: "1.5rem" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "1rem",
            alignItems: "end",
          }}
        >
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="label" htmlFor="q">
              Keywords
            </label>
            <input
              id="q"
              className="input"
              placeholder="Title, company, description"
              value={filters.q}
              onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="label" htmlFor="listingType">
              Listing type
            </label>
            <select
              id="listingType"
              className="select"
              value={filters.listingType}
              onChange={(e) =>
                setFilters((f) => ({ ...f, listingType: e.target.value, page: 1 }))
              }
            >
              <option value="">Any</option>
              <option value="job">Job</option>
              <option value="internship">Internship</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="label" htmlFor="employmentType">
              Employment
            </label>
            <select
              id="employmentType"
              className="select"
              value={filters.employmentType}
              onChange={(e) =>
                setFilters((f) => ({ ...f, employmentType: e.target.value, page: 1 }))
              }
            >
              <option value="">Any</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="label" htmlFor="location">
              Location
            </label>
            <input
              id="location"
              className="input"
              placeholder="City / remote"
              value={filters.location}
              onChange={(e) =>
                setFilters((f) => ({ ...f, location: e.target.value }))
              }
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="label" htmlFor="company">
              Company
            </label>
            <input
              id="company"
              className="input"
              value={filters.company}
              onChange={(e) =>
                setFilters((f) => ({ ...f, company: e.target.value }))
              }
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </div>
      </form>

      {error && <div className="alert alert-error">{error}</div>}

      {!data && !error && (
        <p style={{ color: "var(--muted)" }}>Loading listings…</p>
      )}

      {data?.jobs?.length === 0 && (
        <p style={{ color: "var(--muted)" }}>No listings match your filters.</p>
      )}

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {data?.jobs?.map((job) => (
          <li key={job._id} style={{ marginBottom: "1rem" }}>
            <Link
              to={`/jobs/${job._id}`}
              className="card"
              style={{
                display: "block",
                textDecoration: "none",
                color: "inherit",
                transition: "border-color 0.15s",
              }}
            >
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
                  <h2 style={{ margin: "0 0 0.35rem", fontSize: "1.15rem" }}>
                    {job.title}
                  </h2>
                  <p style={{ margin: 0, color: "var(--muted)" }}>
                    {job.company} · {job.location}
                  </p>
                </div>
                <span
                  className={`badge badge-${job.listingType === "internship" ? "internship" : "job"}`}
                >
                  {job.listingType}
                </span>
              </div>
              <p
                style={{
                  margin: "0.75rem 0 0",
                  color: "var(--muted)",
                  fontSize: "0.9rem",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {job.description}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      {data && data.pages > 1 && (
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            alignItems: "center",
            marginTop: "1.5rem",
          }}
        >
          <button
            type="button"
            className="btn btn-secondary"
            disabled={filters.page <= 1}
            onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
          >
            Previous
          </button>
          <span style={{ color: "var(--muted)" }}>
            Page {data.page} of {data.pages}
          </span>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={filters.page >= data.pages}
            onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
