import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { InvitationSpec, SpecRevision, Component, Person, Venue, AssetRef, DesignRequest, CustomRequirement, Uncertainty, ExactFact } from "lib/contracts";

interface SpecEditorProps {}

export function SpecEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [spec, setSpec] = useState<InvitationSpec | null>(null);
  const [revision, setRevision] = useState<SpecRevision>(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const tabKeys = ["people", "events", "venues", "assets", "components", "design", "custom", "uncertainties", "facts"] as const;
type TabKey = typeof tabKeys[number];

  const [activeTab, setActiveTab] = useState<TabKey>("people");

  useEffect(() => {
    if (id) fetchSpec();
  }, [id]);

  async function fetchSpec() {
    try {
      setLoading(true);
      // Mock data for MVP
      const mockSpec = {
        schemaVersion: "1.0",
        jobId: `job_${id}`,
        revision: 1,
        template: { id: "rajmahal", version: "git:abc123", capabilityVersion: "2" },
        locale: "en-IN",
        timeZone: "Asia/Kolkata",
        people: [
          { id: "p1", displayName: "Fahad", role: "partner", evidence: ["msg:0042"] },
          { id: "p2", displayName: "Fathima", role: "partner", evidence: ["msg:0042"] }
        ],
        assets: [
          { id: "a1", kind: "image", originalName: "IMG-01.jpg", sourceKey: "jobs/job_xxx/media/IMG-01.jpg", sha256: "hash", purpose: "hero", crop: "face-safe", evidence: ["msg:0061"] }
        ],
        components: [
          { id: "hero-1", type: "hero", variant: "portrait", data: { personIds: ["p1", "p2"], imageAssetId: "a1", title: "Together with our families" }, evidence: ["msg:0042", "msg:0061"] },
          { id: "event-1", type: "event", variant: "ceremony", data: { title: "Wedding", startsAt: "2026-10-18T11:00:00+05:30", venueId: "venue-1" }, evidence: ["msg:0048"] },
          { id: "event-2", type: "event", variant: "reception", data: { title: "Reception", startsAt: "2026-10-18T19:30:00+05:30", venueId: "venue-1" }, evidence: ["msg:0050"] },
          { id: "gallery-1", type: "gallery", variant: "grid", data: { assetIds: ["a1"] }, evidence: ["msg:0061"] },
          { id: "rsvp-1", type: "rsvp", variant: "whatsapp", data: { url: "https://wa.me/911234567890" }, evidence: ["msg:0078"] },
          { id: "music-1", type: "music", variant: "toggle", data: { assetId: "a2", autoplay: false }, evidence: ["msg:0072"] }
        ],
        venues: [
          { id: "venue-1", name: "ABC Convention Centre", address: "Example address", mapUrl: "https://maps.example/venue", evidence: ["msg:0052"] }
        ],
        designRequests: [
          { id: "d1", kind: "color", target: "primary", value: "maroon", referenceAssetId: null, evidence: ["msg:0080"] }
        ],
        customRequirements: [
          { id: "c1", instruction: "Make a watercolor illustration from the hero photo", target: "hero-1", status: "requires-image-tool", evidence: ["msg:0081"] }
        ],
        uncertainties: [
          { id: "u1", field: "event-2.data.endsAt", reason: "Not stated", blocking: false, resolution: "omit" }
        ],
        exactFacts: [
          { path: "people.p1.displayName", expected: "Fahad", severity: "critical" },
          { path: "components.event-1.data.startsAt", expected: "2026-10-18T11:00:00+05:30", severity: "critical" }
        ],
        createdAt: "2026-09-25T10:00:00Z",
        updatedAt: "2026-09-25T10:15:00Z",
        createdBy: "ai-extractor"
      } as unknown as InvitationSpec;
      setSpec(mockSpec);
      setRevision(1);
    } catch (err) {
      setError("Failed to load spec");
    } finally {
      setLoading(false);
    }
  }

  function updateSpec(updater: (s: InvitationSpec) => InvitationSpec) {
    if (!spec) return;
    const newSpec = updater(spec);
    setSpec(newSpec);
  }

  async function handleSave() {
    if (!spec || !id) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/v1/jobs/${id}/spec`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spec, expectedRevision: revision, changeSummary: "Manual edit" })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }

      const data = await res.json();
      setRevision(data.revision);
      setSuccess(`Saved as revision ${data.revision}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleBuild() {
    if (!spec || !id) return;
    setSaving(true);
    try {
      const res = await fetch(`/v1/jobs/${id}/build`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specRevision: revision, idempotencyKey: `build_${Date.now()}` })
      });
      if (!res.ok) throw new Error("Build failed");
      navigate(`/jobs/${id}/review`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Build failed");
    } finally {
      setSaving(false);
    }
  }

  const blockingUncertainties = spec?.uncertainties.filter(u => u.blocking && !u.resolvedValue) || [];
  const canBuild = !loading && !saving && spec && blockingUncertainties.length === 0;

  if (loading) return <div style={styles.loading}>Loading spec...</div>;
  if (!spec) return <div style={styles.error}>Spec not found</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Requirements Review</h2>
        <div style={styles.headerActions}>
          {blockingUncertainties.length > 0 && (
            <div style={styles.blockingBanner}>
              ⚠️ {blockingUncertainties.length} blocking issue(s) must be resolved before building
            </div>
          )}
          <button onClick={handleSave} disabled={saving} style={styles.saveButton}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button onClick={handleBuild} disabled={!canBuild || saving} style={{ ...styles.buildButton, opacity: canBuild ? 1 : 0.5 }}>
            Build Invitation
          </button>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      const tabKeys = ["people", "events", "venues", "assets", "components", "design", "custom", "uncertainties", "facts"] as const;

      <div style={styles.tabs}>
        {tabKeys.map(key => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{ ...styles.tab, ...(activeTab === key ? styles.tabActive : {}) }}
          >
            {tabs[key].label} {tabs[key].count && <span style={styles.badge}>{tabs[key].count}</span>}
          </button>
        ))}
      </div>

      <div style={styles.tabContent}>
        {tabs[activeTab].render(spec, updateSpec)}
      </div>
    </div>
  );
}

interface SpecEditorTabs {
  people: { label: string; count: number; render: (spec: InvitationSpec, update: (u: (s: InvitationSpec) => InvitationSpec) => void) => React.ReactNode };
  events: { label: string; count: number; render: (spec: InvitationSpec, update: (u: (s: InvitationSpec) => InvitationSpec) => void) => React.ReactNode };
  venues: { label: string; count: number; render: (spec: InvitationSpec, update: (u: (s: InvitationSpec) => InvitationSpec) => void) => React.ReactNode };
  assets: { label: string; count: number; render: (spec: InvitationSpec, update: (u: (s: InvitationSpec) => InvitationSpec) => void) => React.ReactNode };
  components: { label: string; count: number; render: (spec: InvitationSpec, update: (u: (s: InvitationSpec) => InvitationSpec) => void) => React.ReactNode };
  design: { label: string; count: number; render: (spec: InvitationSpec, update: (u: (s: InvitationSpec) => InvitationSpec) => void) => React.ReactNode };
  custom: { label: string; count: number; render: (spec: InvitationSpec, update: (u: (s: InvitationSpec) => InvitationSpec) => void) => React.ReactNode };
  uncertainties: { label: string; count: number; render: (spec: InvitationSpec, update: (u: (s: InvitationSpec) => InvitationSpec) => void) => React.ReactNode };
  facts: { label: string; count: number; render: (spec: InvitationSpec, update: (u: (s: InvitationSpec) => InvitationSpec) => void) => React.ReactNode };
}

const tabs: SpecEditorTabs = {
  people: {
    label: "People",
    count: 0,
    render: (spec, update) => (
      <div style={styles.section}>
        {spec.people.map((person, i) => (
          <div key={person.id} style={styles.item}>
            <input
              value={person.displayName}
              onChange={e => update(s => ({ ...s, people: s.people.map((p, idx) => idx === i ? { ...p, displayName: e.target.value } : p) }))}
              style={styles.input}
              placeholder="Name"
            />
            <select
              value={person.role}
              onChange={e => update(s => ({ ...s, people: s.people.map((p, idx) => idx === i ? { ...p, role: e.target.value as any } : p) }))}
              style={styles.select}
            >
              <option value="partner">Partner</option>
              <option value="parent">Parent</option>
              <option value="sibling">Sibling</option>
              <option value="friend">Friend</option>
              <option value="other">Other</option>
            </select>
            <span style={styles.evidence}>Evidence: {person.evidence.join(", ") || "none"}</span>
          </div>
        ))}
        <button onClick={() => update(s => ({ ...s, people: [...s.people, { id: `p${s.people.length + 1}` as any, displayName: "", role: "other", evidence: [] }] }))} style={styles.addButton}>
          Add Person
        </button>
      </div>
    )
  },
  events: {
    label: "Events",
    count: 0,
    render: (spec, update) => {
      const events = spec.components.filter(c => c.type === "event");
      return (
        <div style={styles.section}>
          {events.map((event, i) => (
            <div key={event.id} style={styles.item}>
              <input
                value={event.data.title as string}
                onChange={e => update(s => ({ ...s, components: s.components.map((c, idx) => idx === i ? { ...c, data: { ...c.data, title: e.target.value } } : c) }))}
                style={styles.input}
                placeholder="Event title"
              />
              <input
                type="datetime-local"
                value={(event.data.startsAt as string)?.slice(0, 16) || ""}
                onChange={e => update(s => ({ ...s, components: s.components.map((c, idx) => idx === i ? { ...c, data: { ...c.data, startsAt: e.target.value + ":00" } } : c) }))}
                style={styles.input}
              />
              <select
                value={event.data.venueId as string || ""}
                onChange={e => update(s => ({ ...s, components: s.components.map((c, idx) => idx === i ? { ...c, data: { ...c.data, venueId: e.target.value } } : c) }))}
                style={styles.select}
              >
                <option value="">Select venue</option>
                {spec.venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
          ))}
          <button onClick={() => update(s => ({ ...s, components: [...s.components, { id: `event-${events.length + 1}` as any, type: "event", variant: "ceremony", data: { title: "", startsAt: "", venueId: "" }, evidence: [] }] }))} style={styles.addButton}>
            Add Event
          </button>
        </div>
      );
    }
  },
  venues: {
    label: "Venues",
    count: 0,
    render: (spec, update) => (
      <div style={styles.section}>
        {spec.venues.map((venue, i) => (
          <div key={venue.id} style={styles.item}>
            <input
              value={venue.name}
              onChange={e => update(s => ({ ...s, venues: s.venues.map((v, idx) => idx === i ? { ...v, name: e.target.value } : v) }))}
              style={styles.input}
              placeholder="Venue name"
            />
            <input
              value={venue.address}
              onChange={e => update(s => ({ ...s, venues: s.venues.map((v, idx) => idx === i ? { ...v, address: e.target.value } : v) }))}
              style={styles.input}
              placeholder="Address"
            />
            <input
              value={venue.mapUrl || ""}
              onChange={e => update(s => ({ ...s, venues: s.venues.map((v, idx) => idx === i ? { ...v, mapUrl: e.target.value || undefined } : v) }))}
              style={styles.input}
              placeholder="Map URL"
            />
          </div>
        ))}
        <button onClick={() => update(s => ({ ...s, venues: [...s.venues, { id: `venue-${s.venues.length + 1}` as any, name: "", address: "", evidence: [] }] }))} style={styles.addButton}>
          Add Venue
        </button>
      </div>
    )
  },
  assets: {
    label: "Assets",
    count: 0,
    render: (spec, update) => (
      <div style={styles.section}>
        {spec.assets.map((asset, i) => (
          <div key={asset.id} style={styles.item}>
            <span style={styles.assetInfo}>{asset.sourceKey} ({asset.kind}, {asset.purpose})</span>
            <select
              value={asset.purpose}
              onChange={e => update(s => ({ ...s, assets: s.assets.map((a, idx) => idx === i ? { ...a, purpose: e.target.value as any } : a) }))}
              style={styles.select}
            >
              <option value="hero">Hero</option>
              <option value="gallery">Gallery</option>
              <option value="profile">Profile</option>
              <option value="background">Background</option>
              <option value="music">Music</option>
              <option value="other">Other</option>
            </select>
          </div>
        ))}
      </div>
    )
  },
  components: {
    label: "Components",
    count: 0,
    render: (spec, update) => (
      <div style={styles.section}>
        {spec.components.map((comp, i) => (
          <div key={comp.id} style={styles.item}>
            <span style={styles.componentBadge}>{comp.type}:{comp.variant}</span>
            <input
              value={comp.id}
              onChange={e => update(s => ({ ...s, components: s.components.map((c, idx) => idx === i ? { ...c, id: e.target.value as any } : c) }))}
              style={{ ...styles.input, width: 150 }}
            />
          </div>
        ))}
      </div>
    )
  },
  design: {
    label: "Design",
    count: 0,
    render: (spec, update) => (
      <div style={styles.section}>
        {spec.designRequests.map((req, i) => (
          <div key={req.id} style={styles.item}>
            <select
              value={req.kind}
              onChange={e => update(s => ({ ...s, designRequests: s.designRequests.map((r, idx) => idx === i ? { ...r, kind: e.target.value as any } : r) }))}
              style={styles.select}
            >
              <option value="color">Color</option>
              <option value="font">Font</option>
              <option value="layout">Layout</option>
              <option value="animation">Animation</option>
              <option value="effect">Effect</option>
            </select>
            <input
              value={req.target}
              onChange={e => update(s => ({ ...s, designRequests: s.designRequests.map((r, idx) => idx === i ? { ...r, target: e.target.value } : r) }))}
              style={styles.input}
              placeholder="Target (component ID or 'global')"
            />
            <input
              value={String(req.value)}
              onChange={e => update(s => ({ ...s, designRequests: s.designRequests.map((r, idx) => idx === i ? { ...r, value: e.target.value } : r) }))}
              style={styles.input}
              placeholder="Value"
            />
          </div>
        ))}
        <button onClick={() => update(s => ({ ...s, designRequests: [...s.designRequests, { id: `d${s.designRequests.length + 1}` as any, kind: "color", target: "global", value: "", referenceAssetId: null, evidence: [] }] }))} style={styles.addButton}>
          Add Design Request
        </button>
      </div>
    )
  },
  custom: {
    label: "Custom",
    count: 0,
    render: (spec, update) => (
      <div style={styles.section}>
        {spec.customRequirements.map((req, i) => (
          <div key={req.id} style={styles.item}>
            <textarea
              value={req.instruction}
              onChange={e => update(s => ({ ...s, customRequirements: s.customRequirements.map((r, idx) => idx === i ? { ...r, instruction: e.target.value } : r) }))}
              style={{ ...styles.input, minHeight: 80 }}
              placeholder="Custom requirement instruction"
            />
            <select
              value={req.status}
              onChange={e => update(s => ({ ...s, customRequirements: s.customRequirements.map((r, idx) => idx === i ? { ...r, status: e.target.value as any } : r) }))}
              style={styles.select}
            >
              <option value="pending">Pending</option>
              <option value="requires-agent">Requires Agent</option>
              <option value="requires-image-tool">Requires Image Tool</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        ))}
      </div>
    )
  },
  uncertainties: {
    label: "Uncertainties",
    count: 0,
    render: (spec, update) => (
      <div style={styles.section}>
        {spec.uncertainties.map((unc, i) => (
          <div key={unc.id} style={styles.item}>
            <input
              value={unc.field}
              onChange={e => update(s => ({ ...s, uncertainties: s.uncertainties.map((u, idx) => idx === i ? { ...u, field: e.target.value } : u) }))}
              style={styles.input}
              placeholder="Field path (e.g., components.event-1.data.startsAt)"
            />
            <input
              value={unc.reason}
              onChange={e => update(s => ({ ...s, uncertainties: s.uncertainties.map((u, idx) => idx === i ? { ...u, reason: e.target.value } : u) }))}
              style={styles.input}
              placeholder="Reason"
            />
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={unc.blocking}
                onChange={e => update(s => ({ ...s, uncertainties: s.uncertainties.map((u, idx) => idx === i ? { ...u, blocking: e.target.checked } : u) }))}
              />
              Blocking
            </label>
            <select
              value={unc.resolution || ""}
              onChange={e => update(s => ({ ...s, uncertainties: s.uncertainties.map((u, idx) => idx === i ? { ...u, resolution: e.target.value as any } : u) }))}
              style={styles.select}
            >
              <option value="">Select resolution</option>
              <option value="omit">Omit</option>
              <option value="ask">Ask user</option>
              <option value="infer">Infer</option>
              <option value="use-default">Use default</option>
            </select>
          </div>
        ))}
      </div>
    )
  },
  facts: {
    label: "Exact Facts",
    count: 0,
    render: (spec, update) => (
      <div style={styles.section}>
        {spec.exactFacts.map((fact, i) => (
          <div key={i} style={styles.item}>
            <input
              value={fact.path}
              onChange={e => update(s => ({ ...s, exactFacts: s.exactFacts.map((f, idx) => idx === i ? { ...f, path: e.target.value } : f) }))}
              style={styles.input}
              placeholder="JSON path"
            />
            <input
              value={String(fact.expected)}
              onChange={e => update(s => ({ ...s, exactFacts: s.exactFacts.map((f, idx) => idx === i ? { ...f, expected: e.target.value } : f) }))}
              style={styles.input}
              placeholder="Expected value"
            />
            <select
              value={fact.severity}
              onChange={e => update(s => ({ ...s, exactFacts: s.exactFacts.map((f, idx) => idx === i ? { ...f, severity: e.target.value as any } : f) }))}
              style={styles.select}
            >
              <option value="critical">Critical</option>
              <option value="major">Major</option>
              <option value="minor">Minor</option>
            </select>
          </div>
        ))}
        <button onClick={() => update(s => ({ ...s, exactFacts: [...s.exactFacts, { path: "", expected: "", severity: "critical" }] }))} style={styles.addButton}>
          Add Fact Check
        </button>
      </div>
    )
  }
};

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: "900px", margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" },
  headerActions: { display: "flex", gap: "0.5rem", flexWrap: "wrap" },
  blockingBanner: { padding: "0.75rem 1rem", background: "#fef2f2", color: "#dc2626", borderRadius: 6, border: "1px solid #fecaca", fontSize: "0.9rem" },
  saveButton: { padding: "0.75rem 1.5rem", background: "#3b82f6", color: "white", border: "none", borderRadius: 6, cursor: "pointer" },
  buildButton: { padding: "0.75rem 1.5rem", background: "#10b981", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 },
  error: { padding: "1rem", background: "#fef2f2", color: "#dc2626", borderRadius: 6, marginBottom: "1rem" },
  success: { padding: "1rem", background: "#f0fdf4", color: "#16a34a", borderRadius: 6, marginBottom: "1rem" },
  tabs: { display: "flex", gap: "0.25rem", marginBottom: "1rem", borderBottom: "1px solid #eee", paddingBottom: "0.5rem", flexWrap: "wrap" },
  tab: { padding: "0.5rem 1rem", background: "none", border: "none", borderRadius: 6, cursor: "pointer", color: "#666", fontSize: "0.9rem" },
  tabActive: { background: "#1a1a2e", color: "white" },
  badge: { marginLeft: "0.5rem", padding: "0.125rem 0.375rem", background: "#1a1a2e", color: "white", borderRadius: 9999, fontSize: "0.7rem" },
  tabContent: { minHeight: "300px" },
  section: { display: "flex", flexDirection: "column", gap: "1rem" },
  item: { display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" },
  input: { flex: 1, minWidth: 200, padding: "0.5rem", border: "1px solid #ddd", borderRadius: 4 },
  select: { padding: "0.5rem", border: "1px solid #ddd", borderRadius: 4 },
  checkboxLabel: { display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.9rem" },
  assetInfo: { flex: 1, minWidth: 200, fontSize: "0.9rem", color: "#666" },
  componentBadge: { background: "#f3f4f6", padding: "0.25rem 0.5rem", borderRadius: 4, fontSize: "0.85rem" },
  addButton: { padding: "0.5rem 1rem", background: "#f3f4f6", color: "#1a1a2e", border: "none", borderRadius: 4, cursor: "pointer", alignSelf: "flex-start" },
  loading: { textAlign: "center", padding: "2rem" }
};