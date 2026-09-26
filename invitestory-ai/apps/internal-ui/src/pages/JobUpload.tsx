import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TemplateId } from "@invitestory/contracts";
import { templateRegistry } from "@invitestory/templates";

export function JobUpload() {
  const navigate = useNavigate();
  const [templateId, setTemplateId] = useState<TemplateId>("rajmahal" as TemplateId);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [extraFiles, setExtraFiles] = useState<File[]>([]);
  const [historicalOrderId, setHistoricalOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const templates = templateRegistry.getSupportedTemplates();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!zipFile) {
      setError("Please select a WhatsApp ZIP file");
      return;
    }

    setLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Create job
      const idempotencyKey = `job_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      const createRes = await fetch("/v1/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey
        },
        body: JSON.stringify({ templateId, historicalOrderId: historicalOrderId || undefined })
      });

      if (!createRes.ok) throw new Error("Failed to create job");
      const { jobId } = await createRes.json();

      // Upload ZIP (simplified - in reality would use signed URL)
      const formData = new FormData();
      formData.append("zipBase64", await fileToBase64(zipFile));
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(p => Math.min(p + 10, 90));
      }, 100);

      const uploadRes = await fetch(`/v1/jobs/${jobId}/uploads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zipBase64: await fileToBase64(zipFile) })
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!uploadRes.ok) throw new Error("Failed to upload ZIP");

      // Start analysis
      await fetch(`/v1/jobs/${jobId}/analyze`, { method: "POST" });

      navigate(`/jobs/${jobId}/spec`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>New Draft</h2>
      {error && <div style={styles.error}>{error}</div>}
      
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.field}>
          <label style={styles.label}>Template *</label>
          <select 
            value={templateId} 
            onChange={e => setTemplateId(e.target.value as TemplateId)}
            style={styles.select}
            disabled={templates.length <= 1}
          >
            {templates.map(t => (
              <option key={t.id} value={t.id}>{t.name} ({t.id})</option>
            ))}
          </select>
          {templates.length <= 1 && <p style={styles.hint}>Only one template available in MVP</p>}
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Customer WhatsApp ZIP *</label>
          <input
            type="file"
            accept=".zip"
            onChange={e => setZipFile(e.target.files?.[0] || null)}
            style={styles.fileInput}
            required
          />
          {zipFile && <p style={styles.fileName}>{zipFile.name} ({formatBytes(zipFile.size)})</p>}
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Optional extra files</label>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.heic,.pdf,.mp3,.wav,.ogg,.mp4"
            multiple
            onChange={e => setExtraFiles(Array.from(e.target.files || []))}
            style={styles.fileInput}
          />
          {extraFiles.length > 0 && (
            <p style={styles.fileName}>{extraFiles.length} file(s) selected</p>
          )}
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Historical order ID (optional)</label>
          <input
            type="text"
            value={historicalOrderId}
            onChange={e => setHistoricalOrderId(e.target.value)}
            placeholder="e.g., ORD-2026-001"
            style={styles.input}
          />
        </div>

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div style={styles.progress}>
            <div style={{ ...styles.progressBar, width: `${uploadProgress}%` }} />
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading || !zipFile}
          style={{ ...styles.submitButton, opacity: loading || !zipFile ? 0.6 : 1 }}
        >
          {loading ? "Analyzing..." : "Analyze chat"}
        </button>
      </form>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: "600px", margin: "0 auto" },
  title: { marginBottom: "1.5rem" },
  form: { display: "flex", flexDirection: "column", gap: "1.5rem" },
  field: { display: "flex", flexDirection: "column", gap: "0.5rem" },
  label: { fontWeight: 500, fontSize: "0.9rem" },
  select: { padding: "0.75rem", border: "1px solid #ddd", borderRadius: 6, fontSize: "1rem" },
  input: { padding: "0.75rem", border: "1px solid #ddd", borderRadius: 6, fontSize: "1rem" },
  fileInput: { padding: "0.5rem" },
  fileName: { fontSize: "0.85rem", color: "#666" },
  hint: { fontSize: "0.85rem", color: "#666" },
  progress: { height: 6, background: "#eee", borderRadius: 3, overflow: "hidden" },
  progressBar: { height: "100%", background: "#1a1a2e", transition: "width 0.3s" },
  submitButton: { 
    padding: "1rem", 
    background: "#1a1a2e", 
    color: "white", 
    border: "none", 
    borderRadius: 6, 
    fontSize: "1rem", 
    fontWeight: 600,
    cursor: "pointer"
  },
  error: { 
    padding: "1rem", 
    background: "#fef2f2", 
    color: "#dc2626", 
    borderRadius: 6, 
    border: "1px solid #fecaca" 
  }
};