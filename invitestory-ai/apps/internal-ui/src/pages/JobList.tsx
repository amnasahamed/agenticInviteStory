import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { JobSummary, JobState } from "@invitestory/contracts";

export function JobList() {
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    try {
      setLoading(true);
      // In real app, this would be a paginated list endpoint
      // For MVP, we'll simulate with localStorage or mock data
      const mockJobs: JobSummary[] = [
        {
          jobId: "job_01JTEST001" as any,
          state: "READY_FOR_STAFF",
          template: { id: "rajmahal" as any, version: "git:abc123" },
          approvedSpecRevision: 3,
          currentAttempt: 2,
          blockingIssues: 0,
          usage: { modelCostInr: 27.4, sandboxSeconds: 402, humanReviewSeconds: null },
          createdAt: "2026-09-25T10:00:00Z",
          updatedAt: "2026-09-25T10:30:00Z"
        }
      ];
      setJobs(mockJobs);
    } catch (err) {
      setError("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }

  const getStateColor = (state: JobState) => {
    const colors: Record<JobState, string> = {
      RECEIVED: "#6b7280",
      INGESTING: "#3b82f6",
      EXTRACTING: "#3b82f6",
      VALIDATING: "#f59e0b",
      NEEDS_INPUT: "#ef4444",
      READY_TO_BUILD: "#10b981",
      BUILDING: "#3b82f6",
      BUILD_FAILED: "#ef4444",
      BROWSER_QA: "#3b82f6",
      QA_FAILED: "#ef4444",
      REPAIRING: "#f59e0b",
      QA_PASSED: "#10b981",
      READY_FOR_STAFF: "#8b5cf6",
      APPROVED: "#10b981",
      PUSHING_GIT: "#3b82f6",
      DEPLOYING: "#3b82f6",
      COMPLETED: "#10b981",
      CANCELLED: "#6b7280",
      ESCALATED: "#f97316",
      FAILED: "#ef4444"
    };
    return colors[state] || "#6b7280";
  };

  if (loading) return <div style={styles.loading}>Loading jobs...</div>;
  if (error) return <div style={styles.error}>{error}</div>;

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h2>Jobs</h2>
        <Link to="/new" style={styles.newButton}>New Job</Link>
      </div>
      
      {jobs.length === 0 ? (
        <div style={styles.emptyState}>
          <p>No jobs yet. Create your first job to get started.</p>
          <Link to="/new" style={styles.newButton}>Create Job</Link>
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={styles.cell}>Job ID</th>
              <th style={styles.cell}>Template</th>
              <th style={styles.cell}>State</th>
              <th style={styles.cell}>Spec Rev</th>
              <th style={styles.cell}>Attempt</th>
              <th style={styles.cell}>Cost (₹)</th>
              <th style={styles.cell}>Created</th>
              <th style={styles.cell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map(job => (
              <tr key={job.jobId} style={styles.row}>
                <td style={styles.cell}>{job.jobId.slice(0, 20)}...</td>
                <td style={styles.cell}>{job.template.id}</td>
                <td style={styles.cell}>
                  <span style={{ 
                    ...styles.badge, 
                    backgroundColor: getStateColor(job.state) 
                  }}>
                    {job.state}
                  </span>
                </td>
                <td style={styles.cell}>{job.approvedSpecRevision || "-"}</td>
                <td style={styles.cell}>{job.currentAttempt}</td>
                <td style={styles.cell}>{job.usage.modelCostInr.toFixed(2)}</td>
                <td style={styles.cell}>{new Date(job.createdAt).toLocaleString()}</td>
                <td style={styles.cell}>
                  <div style={styles.actions}>
                    {job.state === "NEEDS_INPUT" || job.state === "VALIDATING" || job.state === "READY_TO_BUILD" ? (
                      <Link to={`/jobs/${job.jobId}/spec`} style={styles.actionLink}>Edit Spec</Link>
                    ) : job.state === "READY_FOR_STAFF" || job.state === "QA_PASSED" ? (
                      <Link to={`/jobs/${job.jobId}/review`} style={styles.actionLink}>Review</Link>
                    ) : (
                      <span style={styles.disabledAction}>—</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { width: "100%" },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
  newButton: { 
    background: "#1a1a2e", 
    color: "white", 
    padding: "0.75rem 1.5rem", 
    borderRadius: 6, 
    textDecoration: "none",
    fontWeight: 500
  },
  emptyState: { textAlign: "center", padding: "3rem", color: "#666" },
  table: { width: "100%", borderCollapse: "collapse" },
  cell: { padding: "0.75rem", textAlign: "left", borderBottom: "1px solid #eee" },
  row: { transition: "background 0.1s" },
  badge: { 
    display: "inline-block", 
    padding: "0.25rem 0.75rem", 
    borderRadius: 9999, 
    fontSize: "0.75rem", 
    fontWeight: 500,
    color: "white"
  },
  actions: { display: "flex", gap: "0.5rem" },
  actionLink: { color: "#1a1a2e", textDecoration: "none", fontWeight: 500 },
  disabledAction: { color: "#999" },
  loading: { textAlign: "center", padding: "2rem" },
  error: { textAlign: "center", padding: "2rem", color: "red" }
};