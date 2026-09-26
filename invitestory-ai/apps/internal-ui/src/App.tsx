import { Routes, Route, Link, useLocation } from "react-router-dom";
import { JobUpload } from "./pages/JobUpload";
import { SpecEditor } from "./pages/SpecEditor";
import { JobReview } from "./pages/JobReview";
import { JobList } from "./pages/JobList";

function Navigation() {
  const location = useLocation();
  return (
    <nav style={styles.nav}>
      <Link to="/" style={location.pathname === "/" ? styles.navLinkActive : styles.navLink}>Jobs</Link>
      <Link to="/new" style={location.pathname === "/new" ? styles.navLinkActive : styles.navLink}>New Job</Link>
    </nav>
  );
}

export default function App() {
  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1 style={styles.title}>InviteStory AI</h1>
        <Navigation />
      </header>
      <main style={styles.main}>
        <Routes>
          <Route path="/" element={<JobList />} />
          <Route path="/new" element={<JobUpload />} />
          <Route path="/jobs/:id/spec" element={<SpecEditor />} />
          <Route path="/jobs/:id/review" element={<JobReview />} />
        </Routes>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  app: { minHeight: "100vh", display: "flex", flexDirection: "column" },
  header: { 
    background: "#1a1a2e", 
    color: "white", 
    padding: "1rem 2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  title: { fontSize: "1.5rem", fontWeight: 600 },
  nav: { display: "flex", gap: "1rem" },
  navLink: { color: "#aaa", textDecoration: "none", padding: "0.5rem 1rem", borderRadius: 4 },
  navLinkActive: { color: "white", background: "rgba(255,255,255,0.1)", textDecoration: "none", padding: "0.5rem 1rem", borderRadius: 4 },
  main: { flex: 1, padding: "2rem", maxWidth: "1200px", margin: "0 auto", width: "100%" }
};