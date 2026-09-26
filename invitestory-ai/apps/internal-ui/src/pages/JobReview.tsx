import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QAReport, JobState, QAIssue, QASeverity } from "lib/contracts";

interface JobReviewProps {}

export function JobReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<{
    jobId: string;
    attempt: number;
    specRevision: number;
    qaReport: QAReport | null;
    previewUrl: string;
    status: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "screenshots" | "issues" | "details">("overview");

  useEffect(() => {
    if (id) fetchAttempt();
  }, [id]);

  async function fetchAttempt() {
    try {
      setLoading(true);
      // Mock data for MVP
      const mockAttempt = {
        jobId: `job_${id}`,
        attempt: 2,
        specRevision: 3,
        previewUrl: "https://preview.example.com/job_xxx",
        status: "completed",
        qaReport: {
          jobId: `job_${id}`,
          attempt: 2,
          specRevision: 3,
          build: { status: "pass", logs: ["npm ci", "npm run build"], durationMs: 45000 },
          browser: {
            status: "pass",
            consoleErrors: [],
            pageErrors: [],
            failedRequests: [],
            screenshots: { mobile: "screenshots/mobile.png", desktop: "screenshots/desktop.png" },
            viewportSizes: { mobile: { width: 390, height: 844 }, desktop: { width: 1440, height: 900 } },
            durationMs: 15000
          },
          facts: {
            status: "pass",
            issues: [],
            checkedCount: 12,
            passedCount: 12
          },
          visual: {
            status: "review",
            issues: [
              {
                id: "visual_1",
                severity: "minor",
                category: "visual",
                message: "Hero image slightly off-center on mobile",
                screenshotRegion: { x: 10, y: 10, width: 100, height: 100 }
              }
            ],
            baselineComparison: { mobileDiff: 2.3, desktopDiff: 1.1 }
          },
overallStatus: "review",
            blockingIssues: 0,
            createdAt: "2026-09-25T10:30:00Z",
            modelUsage: { transcription: 0.5, ocr: 0.3, extraction: 1.2, coding: 0, visualQA: 0.8 }
          } as unknown as QAReport
      };
      setAttempt(mockAttempt);
    } catch (err) {
      setError("Failed to load attempt");
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(action: "approve" | "repair" | "escalate" | "cancel") {
    if (!attempt) return;
    setActionLoading(true);
    setError(null);

    try {
      const res = await fetch(`/v1/jobs/${id}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: action === "approve" ? "approveDraft" : action === "repair" ? "requestRepair" : action === "escalate" ? "escalate" : "cancel", reason: "Manual action" })
      });
      if (!res.ok) throw new Error("Action failed");
      setAttempt(prev => prev ? { ...prev, status: action === "approve" ? "approved" : action } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pass: "#10b981",
      fail: "#ef4444",
      review: "#f59e0b",
      building: "#3b82f6",
      completed: "#10b981"
    };
    return colors[status] || "#6b7280";
  };

  const getSeverityColor = (severity: QASeverity) => {
    const colors: Record<QASeverity, string> = {
      critical: "#ef4444",
      major: "#f97316",
      minor: "#f59e0b",
      info: "#3b82f6"
    };
    return colors[severity];
  };

  if (loading) return <div style={styles.loading}>Loading review...</div>;
  if (error) return <div style={styles.error}>{error}</div>;
  if (!attempt) return <div style={styles.error}>Attempt not found</div>;

  const allIssues = [
    ...(attempt.qaReport?.browser.consoleErrors.map(e => ({ severity: "major" as QASeverity, category: "browser", message: e })) || []),
    ...(attempt.qaReport?.facts.issues || []),
    ...(attempt.qaReport?.visual.issues || [])
  ];

  const criticalIssues = allIssues.filter(i => i.severity === "critical").length;
  const majorIssues = allIssues.filter(i => i.severity === "major").length;
  const minorIssues = allIssues.filter(i => i.severity === "minor").length;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Draft Review</h2>
          <div style={styles.meta}>
            <span>Job: {attempt.jobId}</span>
            <span>Attempt: #{attempt.attempt}</span>
            <span>Spec Rev: {attempt.specRevision}</span>
            <span style={{ background: getStatusColor(attempt.qaReport?.overallStatus || "review"), ...styles.statusBadge }}>
              {attempt.qaReport?.overallStatus?.toUpperCase()}
            </span>
          </div>
        </div>
        <div style={styles.actions}>
          {criticalIssues === 0 && (
            <button onClick={() => handleAction("approve")} disabled={actionLoading} style={styles.approveButton}>
              {actionLoading ? "Approving..." : "Approve Draft"}
            </button>
          )}
          <button onClick={() => handleAction("repair")} disabled={actionLoading} style={styles.repairButton}>
            {actionLoading ? "Repairing..." : "Request Repair"}
          </button>
          <button onClick={() => handleAction("escalate")} disabled={actionLoading} style={styles.escalateButton}>
            Escalate to Designer
          </button>
        </div>
      </div>

      <div style={styles.tabs}>
        <button onClick={() => setActiveTab("overview")} style={{ ...styles.tab, ...(activeTab === "overview" ? styles.tabActive : {}) }}>Overview</button>
        <button onClick={() => setActiveTab("screenshots")} style={{ ...styles.tab, ...(activeTab === "screenshots" ? styles.tabActive : {}) }}>Screenshots</button>
        <button onClick={() => setActiveTab("issues")} style={{ ...styles.tab, ...(activeTab === "issues" ? styles.tabActive : {}) }}>
          Issues ({allIssues.length})
        </button>
        <button onClick={() => setActiveTab("details")} style={{ ...styles.tab, ...(activeTab === "details" ? styles.tabActive : {}) }}>Details</button>
      </div>

      <div style={styles.tabContent}>
        {activeTab === "overview" && <OverviewTab attempt={attempt} allIssues={allIssues} />}
        {activeTab === "screenshots" && <ScreenshotsTab attempt={attempt} />}
        {activeTab === "issues" && <IssuesTab issues={allIssues} />}
        {activeTab === "details" && <DetailsTab attempt={attempt} />}
      </div>
    </div>
  );
}

function OverviewTab({ attempt, allIssues }: { attempt: any; allIssues: any[] }) {
  const qa = attempt.qaReport;
  if (!qa) return <div>No QA report available</div>;

  return (
    <div style={styles.section}>
      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <h4>Build</h4>
          <div style={{ color: qa.build.status === "pass" ? "#10b981" : "#ef4444" }}>
            {qa.build.status.toUpperCase()}
          </div>
          <small>{qa.build.durationMs}ms</small>
        </div>
        <div style={styles.summaryCard}>
          <h4>Browser</h4>
          <div style={{ color: getStatusColor(qa.browser.status) }}>
            {qa.browser.status.toUpperCase()}
          </div>
          <small>{qa.browser.consoleErrors.length} console errors</small>
        </div>
        <div style={styles.summaryCard}>
          <h4>Facts</h4>
          <div style={{ color: qa.facts.status === "pass" ? "#10b981" : "#ef4444" }}>
            {qa.facts.status.toUpperCase()}
          </div>
          <small>{qa.facts.passedCount}/{qa.facts.checkedCount} passed</small>
        </div>
        <div style={styles.summaryCard}>
          <h4>Visual</h4>
          <div style={{ color: getStatusColor(qa.visual.status) }}>
            {qa.visual.status.toUpperCase()}
          </div>
          <small>Mobile diff: {qa.visual.baselineComparison?.mobileDiff?.toFixed(1)}%</small>
        </div>
      </div>

      <div style={styles.issueSummary}>
        <h4>Issue Summary</h4>
        <div style={styles.issueCounts}>
          <span style={{ ...styles.issueCount, borderColor: "#ef4444" }}>
            <strong style={{ color: "#ef4444" }}>{allIssues.filter(i => i.severity === "critical").length}</strong> Critical
          </span>
          <span style={{ ...styles.issueCount, borderColor: "#f97316" }}>
            <strong style={{ color: "#f97316" }}>{allIssues.filter(i => i.severity === "major").length}</strong> Major
          </span>
          <span style={{ ...styles.issueCount, borderColor: "#f59e0b" }}>
            <strong style={{ color: "#f59e0b" }}>{allIssues.filter(i => i.severity === "minor").length}</strong> Minor
          </span>
        </div>
      </div>

      <div style={styles.previewSection}>
        <h4>Preview</h4>
        <iframe src={attempt.previewUrl} style={styles.previewFrame} title="Invitation preview" />
        <a href={attempt.previewUrl} target="_blank" rel="noopener noreferrer" style={styles.previewLink}>
          Open in new tab →
        </a>
      </div>
    </div>
  );
}

function ScreenshotsTab({ attempt }: { attempt: any }) {
  const qa = attempt.qaReport;
  return (
    <div style={styles.section}>
      {qa?.browser.screenshots && (
        <div style={styles.screenshotGrid}>
          <div style={styles.screenshotCard}>
            <h4>Mobile (390×844)</h4>
            <img src={qa.browser.screenshots.mobile} alt="Mobile screenshot" style={styles.screenshot} />
          </div>
          <div style={styles.screenshotCard}>
            <h4>Desktop (1440×900)</h4>
            <img src={qa.browser.screenshots.desktop} alt="Desktop screenshot" style={styles.screenshot} />
          </div>
        </div>
      )}
    </div>
  );
}

function IssuesTab({ issues }: { issues: any[] }) {
  if (issues.length === 0) {
    return <div style={styles.emptyState}>No issues found ✓</div>;
  }

  return (
    <div style={styles.section}>
      {issues.map((issue, i) => (
        <div key={i} style={styles.issueCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <span style={{ ...styles.severityBadge, background: getSeverityColor(issue.severity) }}>
                {issue.severity.toUpperCase()}
              </span>
              <span style={styles.categoryBadge}>{issue.category}</span>
              <p style={styles.issueMessage}>{issue.message}</p>
            </div>
            {issue.suggestedFix && (
              <div style={styles.suggestedFix}>
                <strong>Suggested fix:</strong> {issue.suggestedFix}
              </div>
            )}
          </div>
          {issue.specPath && <small style={styles.specPath}>Path: {issue.specPath}</small>}
          {issue.screenshotRegion && (
            <small style={styles.specPath}>
              Region: ({issue.screenshotRegion.x}, {issue.screenshotRegion.y}) {issue.screenshotRegion.width}×{issue.screenshotRegion.height}
            </small>
          )}
        </div>
      ))}
    </div>
  );
}

function DetailsTab({ attempt }: { attempt: any }) {
  const qa = attempt.qaReport;
  return (
    <div style={styles.section}>
      <h4>Build Logs</h4>
      <pre style={styles.codeBlock}>{qa?.build.logs.join("\n") || "No logs"}</pre>

      <h4 style={{ marginTop: "1.5rem" }}>Model Usage</h4>
      {qa?.modelUsage && (
        <table style={styles.usageTable}>
          <thead>
            <tr><th>Role</th><th>Cost (₹)</th></tr>
          </thead>
          <tbody>
            {Object.entries(qa.modelUsage).map(([role, cost]) => (
              <tr key={role}><td>{role}</td><td>{(cost as number).toFixed(4)}</td></tr>
            ))}
            <tr style={{ fontWeight: "bold" }}>
              <td>Total</td>
              <td>{Object.values(qa.modelUsage as Record<string, number>).reduce((a, b) => a + b, 0).toFixed(4)}</td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = { pass: "#10b981", fail: "#ef4444", review: "#f59e0b", building: "#3b82f6" };
  return colors[status] || "#6b7280";
}

function getSeverityColor(severity: QASeverity) {
  const colors: Record<QASeverity, string> = { critical: "#ef4444", major: "#f97316", minor: "#f59e0b", info: "#3b82f6" };
  return colors[severity];
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: "1000px", margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" },
  title: { marginBottom: "0.5rem" },
  meta: { display: "flex", gap: "1.5rem", fontSize: "0.9rem", color: "#666", flexWrap: "wrap" },
  statusBadge: { padding: "0.25rem 0.75rem", borderRadius: 9999, fontSize: "0.75rem", fontWeight: 500, color: "white" },
  actions: { display: "flex", gap: "0.5rem" },
  approveButton: { padding: "0.75rem 1.5rem", background: "#10b981", color: "white", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer" },
  repairButton: { padding: "0.75rem 1.5rem", background: "#3b82f6", color: "white", border: "none", borderRadius: 6, cursor: "pointer" },
  escalateButton: { padding: "0.75rem 1.5rem", background: "#f97316", color: "white", border: "none", borderRadius: 6, cursor: "pointer" },
  tabs: { display: "flex", gap: "0.25rem", marginBottom: "1rem", borderBottom: "1px solid #eee", paddingBottom: "0.5rem" },
  tab: { padding: "0.5rem 1rem", background: "none", border: "none", borderRadius: 6, cursor: "pointer", color: "#666" },
  tabActive: { background: "#1a1a2e", color: "white" },
  tabContent: { minHeight: "400px" },
  section: { display: "flex", flexDirection: "column", gap: "1.5rem" },
  summaryGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" },
  summaryCard: { padding: "1rem", background: "#f9fafb", borderRadius: 8, border: "1px solid #eee" },
  issueSummary: { padding: "1rem", background: "#f9fafb", borderRadius: 8 },
  issueCounts: { display: "flex", gap: "1rem", flexWrap: "wrap" },
  issueCount: { padding: "0.5rem 1rem", borderRadius: 6, borderWidth: 2, borderStyle: "solid" },
  previewSection: { padding: "1rem", background: "#f9fafb", borderRadius: 8 },
  previewFrame: { width: "100%", height: "500px", border: "1px solid #ddd", borderRadius: 4, background: "white" },
  previewLink: { display: "inline-block", marginTop: "0.5rem", color: "#3b82f6", textDecoration: "none" },
  screenshotGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "1rem" },
  screenshotCard: { background: "#f9fafb", borderRadius: 8, padding: "1rem", border: "1px solid #eee" },
  screenshot: { width: "100%", maxWidth: "100%", border: "1px solid #ddd", borderRadius: 4 },
  emptyState: { textAlign: "center", padding: "3rem", color: "#666", fontSize: "1.1rem" },
  issueCard: { padding: "1rem", background: "#f9fafb", borderRadius: 8, border: "1px solid #eee", marginBottom: "0.5rem" },
  severityBadge: { padding: "0.125rem 0.5rem", borderRadius: 9999, fontSize: "0.7rem", fontWeight: 500, color: "white", marginRight: "0.5rem" },
  categoryBadge: { padding: "0.125rem 0.5rem", background: "#e5e7eb", borderRadius: 9999, fontSize: "0.7rem", marginRight: "0.5rem" },
  issueMessage: { margin: "0.5rem 0", color: "#333" },
  suggestedFix: { marginTop: "0.5rem", padding: "0.5rem", background: "#fef3c7", borderRadius: 4, fontSize: "0.85rem" },
  specPath: { display: "block", marginTop: "0.25rem", color: "#666", fontSize: "0.8rem" },
  codeBlock: { padding: "1rem", background: "#1e1e1e", color: "#d4d4d4", borderRadius: 4, overflow: "auto", fontSize: "0.8rem", maxHeight: "300px" },
  usageTable: { width: "100%", borderCollapse: "collapse" },
  loading: { textAlign: "center", padding: "2rem" },
  error: { textAlign: "center", padding: "2rem", color: "red" }
};