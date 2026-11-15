import React, { useState, useEffect, useMemo, useRef } from 'react';
import facultyList from './data/faculty.json';

// WhatsApp icon SVG component
const WhatsAppIcon = ({ size = 16, color = "currentColor" }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill={color}
    style={{ display: "inline-block", verticalAlign: "middle" }}
  >
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.858.002-2.635-1.023-5.11-2.884-6.974C16.772 1.89 14.29 .86 11.655.86c-5.438 0-9.863 4.42-9.867 9.859-.001 1.768.461 3.497 1.285 5.031l-.433 1.574 1.632-.429c1.474.805 3.128 1.229 4.809 1.23h.004c5.427 0 9.849-4.42 9.854-9.855 0-2.636-1.026-5.112-2.888-6.975-1.862-1.864-4.337-2.89-6.973-2.891-5.441 0-9.865 4.42-9.87 9.86-.001 1.739.451 3.435 1.311 4.957l-1.393 5.086 5.203-1.365z" />
  </svg>
);

// Helpers
const getWhatsAppUrl = (phone) => {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length === 10 ? `https://wa.me/91${cleaned}` : `https://wa.me/${cleaned}`;
};

const getOptimizedImageUrl = (url, width = 150, height = 150) => {
  if (!url) return "";
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=${width}&h=${height}&fit=cover&output=webp&q=85`;
};

const getInitials = (name) => {
  if (!name) return "U";
  const cleaned = name.replace(/\b(dr|mr|ms|prof|mrs)\b\.?/gi, "").trim().split(/\s+/);
  if (cleaned.length >= 2) {
    return (cleaned[0][0] + cleaned[cleaned.length - 1][0]).toUpperCase();
  }
  return cleaned[0] ? cleaned[0][0].toUpperCase() : "U";
};

const getInitialsSearchString = (name) => {
  return name
    .replace(/\b(dr|mr|ms|prof|mrs)\b\.?/gi, "")
    .replace(/[^a-zA-Z\s]/g, "")
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toLowerCase();
};

const getAvatarColors = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return {
    bg: `hsl(${hue}, 85%, 93%)`,
    text: `hsl(${hue}, 85%, 25%)`,
    darkBg: `hsl(${hue}, 60%, 15%)`,
    darkText: `hsl(${hue}, 85%, 75%)`
  };
};

const HighlightMatch = ({ text, query }) => {
  if (!query || !query.trim() || !text) return <>{text}</>;
  const escaped = query.trim().replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = String(text).split(regex);
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.trim().toLowerCase() ? (
          <span key={i} className="search-highlight">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
};

// 3D Tilt Card Component
const FacultyCard = ({ faculty, onClick, searchQuery, isDarkMode, onAction }) => {
  const cardRef = useRef(null);
  const [imgError, setImgError] = useState(false);
  const colors = useMemo(() => getAvatarColors(faculty.name), [faculty.name]);
  const initials = useMemo(() => getInitials(faculty.name), [faculty.name]);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = -((y - centerY) / centerY) * 8;
    const rotateY = ((x - centerX) / centerX) * 8;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    card.style.transition = "transform 0.1s ease-out";
    card.style.setProperty("--mx", `${x}px`);
    card.style.setProperty("--my", `${y}px`);
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    card.style.transition = "transform 0.4s ease";
  };

  const primaryPhone = faculty.portalPhone || faculty.officialPhone;
  const primaryEmail = faculty.emails && faculty.emails.length > 0 ? faculty.emails[0] : "";

  return (
    <div className="tilt-container">
      <div
        ref={cardRef}
        className="tilt-card"
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="tilt-glow" />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            justifyContent: "space-between",
            position: "relative",
            zIndex: 1
          }}
        >
          <div>
            {/* Top row with avatar & designation */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
              {faculty.image && !imgError ? (
                <img
                  src={getOptimizedImageUrl(faculty.image, 150, 150)}
                  alt={faculty.name}
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "16px",
                    objectFit: "cover",
                    border: "2px solid var(--border-color)",
                    flexShrink: 0
                  }}
                  onError={() => setImgError(true)}
                  loading="lazy"
                />
              ) : (
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "16px",
                    backgroundColor: isDarkMode ? colors.darkBg : colors.bg,
                    color: isDarkMode ? colors.darkText : colors.text,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: "1.15rem",
                    border: "2px solid var(--border-color)",
                    flexShrink: 0
                  }}
                >
                  {initials}
                </div>
              )}

              <div style={{ minWidth: 0, flex: 1 }}>
                <h3
                  style={{
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    lineHeight: 1.25,
                    marginBottom: "4px"
                  }}
                >
                  <HighlightMatch text={faculty.name} query={searchQuery} />
                </h3>
                <p
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "var(--accent-primary)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}
                >
                  <HighlightMatch text={faculty.designation} query={searchQuery} />
                </p>
              </div>
            </div>

            {/* Department Badge */}
            <div style={{ marginBottom: "12px" }}>
              <span
                style={{
                  display: "inline-block",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: "8px",
                  background: "var(--border-color)",
                  color: "var(--text-secondary)",
                  maxWidth: "100%",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
              >
                {faculty.department}
              </span>
            </div>

            {/* Area of Interest */}
            {faculty.areaOfInterest && (
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "var(--text-muted)",
                  lineHeight: 1.45,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  marginBottom: "14px"
                }}
              >
                <HighlightMatch text={faculty.areaOfInterest} query={searchQuery} />
              </p>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: "12px",
              borderTop: "1px solid var(--border-color)",
              marginTop: "auto"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", gap: "8px" }}>
              {primaryPhone && (
                <>
                  <a
                    href={`tel:${primaryPhone}`}
                    onClick={onAction}
                    title={`Call ${primaryPhone}`}
                    style={{
                      padding: "7px 10px",
                      borderRadius: "10px",
                      background: "var(--border-color)",
                      color: "var(--text-primary)",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      gap: "4px"
                    }}
                  >
                    📞 Call
                  </a>

                  <a
                    href={getWhatsAppUrl(primaryPhone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onAction}
                    title="Chat on WhatsApp"
                    style={{
                      padding: "7px 10px",
                      borderRadius: "10px",
                      background: "rgba(37, 211, 102, 0.15)",
                      color: "#25D366",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      gap: "5px"
                    }}
                  >
                    <WhatsAppIcon size={14} color="#25D366" /> Chat
                  </a>
                </>
              )}
            </div>

            {primaryEmail && (
              <a
                href={`mailto:${primaryEmail}`}
                onClick={onAction}
                title={`Email ${primaryEmail}`}
                style={{
                  padding: "7px 10px",
                  borderRadius: "10px",
                  background: "var(--border-color)",
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                  fontSize: "0.75rem",
                  fontWeight: 600
                }}
              >
                ✉️ Email
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return true;
  });

  const [toast, setToast] = useState({ message: "", visible: false });
  const [pageLimit, setPageLimit] = useState(24);
  const [searchesCount, setSearchesCount] = useState(14320);
  const [helpedCount, setHelpedCount] = useState(1840);
  const [showSettings, setShowSettings] = useState(false);

  // Sync theme
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  // Show Toast
  const triggerToast = (msg) => {
    setToast({ message: msg, visible: true });
  };

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, visible: false }));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  // Track action
  const recordHelped = () => {
    setHelpedCount((prev) => prev + 1);
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    triggerToast(`Copied ${label}: ${text}`);
    recordHelped();
  };

  // Debounced search increment
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 3) return;
    const timer = setTimeout(() => {
      setSearchesCount((prev) => prev + 1);
    }, 1500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Extract unique departments
  const departments = useMemo(() => {
    const set = new Set(facultyList.map((f) => f.department).filter(Boolean));
    return Array.from(set).sort();
  }, []);

  // Department counts
  const deptCounts = useMemo(() => {
    const counts = {};
    for (const f of facultyList) {
      counts[f.department] = (counts[f.department] || 0) + 1;
    }
    return counts;
  }, []);

  // Filtered faculty list
  const filteredFaculty = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return facultyList.filter((f) => {
      if (selectedDept && f.department !== selectedDept) return false;
      if (!q) return true;

      const initials = getInitialsSearchString(f.name);
      if (initials === q || initials.startsWith(q)) return true;

      const nameWords = f.name.toLowerCase().split(/\s+/);
      const nameMatch = nameWords.some((_, idx) => nameWords.slice(idx).join(" ").startsWith(q));

      const portalName = f.portalName?.toLowerCase() || "";
      const portalWords = portalName ? portalName.split(/\s+/) : [];
      const portalMatch = portalWords.some((_, idx) => portalWords.slice(idx).join(" ").startsWith(q));

      const desigWords = f.designation.toLowerCase().split(/\s+/);
      const desigMatch = desigWords.some((_, idx) => desigWords.slice(idx).join(" ").startsWith(q));

      const area = f.areaOfInterest?.toLowerCase() || "";
      const areaTokens = area.split(/[\s,.;-]+/);
      const areaMatch = areaTokens.some((_, idx) => areaTokens.slice(idx).join(" ").startsWith(q));

      const emailMatch = (f.emails || []).some((e) => {
        const lower = e.toLowerCase();
        const [user, domain] = lower.split("@");
        return user.startsWith(q) || (domain && domain.includes(q)) || lower.startsWith(q);
      });

      const phoneMatch =
        (f.portalPhone && f.portalPhone.includes(q)) ||
        (f.officialPhone && f.officialPhone.includes(q));

      const idMatch = f.portalId?.toLowerCase().includes(q) || false;

      return nameMatch || portalMatch || desigMatch || areaMatch || emailMatch || phoneMatch || idMatch;
    });
  }, [searchQuery, selectedDept]);

  // Reset page limit on search change
  useEffect(() => {
    setPageLimit(24);
  }, [searchQuery, selectedDept]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 400) {
        setPageLimit((prev) => Math.min(prev + 24, filteredFaculty.length));
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [filteredFaculty.length]);

  const visibleFaculty = useMemo(() => {
    return filteredFaculty.slice(0, pageLimit);
  }, [filteredFaculty, pageLimit]);

  // Drawer research tags
  const researchTags = useMemo(() => {
    if (!selectedFaculty || !selectedFaculty.areaOfInterest) return [];
    return selectedFaculty.areaOfInterest
      .split(/[;,]/)
      .map((t) => t.trim())
      .filter((t) => t.length > 2 && t.length < 50);
  }, [selectedFaculty]);

  // Handle hardware / browser back button for drawer
  useEffect(() => {
    window.history.pushState({ page: "home" }, "");
    const handlePopState = () => {
      if (selectedFaculty) {
        setSelectedFaculty(null);
        window.history.pushState({ page: "home" }, "");
      } else if (showSettings) {
        setShowSettings(false);
        window.history.pushState({ page: "home" }, "");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [selectedFaculty, showSettings]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Background Animated Gradient Meshes */}
      <div className="floating-mesh mesh-1" />
      <div className="floating-mesh mesh-2" />

      {/* Sticky Header */}
      <header
        className="glass"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          width: "100%",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--border-color)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              height: "40px",
              width: "40px",
              borderRadius: "12px",
              backgroundColor: "var(--accent-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontWeight: 800,
              fontSize: "1.25rem",
              boxShadow: "0 4px 12px var(--accent-glow)"
            }}
          >
            N
          </div>
          <div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.1 }}>
              NERIST
            </h1>
            <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Faculty Explorer
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            style={{
              padding: "10px",
              borderRadius: "12px",
              border: "1px solid var(--border-color)",
              background: "var(--surface-color)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            title="Toggle theme"
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="container-layout">
        <main style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
          {/* Live Engagement Statistics Bar */}
          <div
            className="stats-container animate-fade-in"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
              width: "100%"
            }}
          >
            <div
              className="glass"
              style={{
                padding: "16px 20px",
                borderRadius: "20px",
                border: "1px solid var(--border-color)",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                boxShadow: "var(--card-shadow)"
              }}
            >
              <div
                style={{
                  background: "rgba(255, 74, 0, 0.12)",
                  padding: "10px",
                  borderRadius: "14px",
                  color: "var(--accent-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.4rem"
                }}
              >
                🔍
              </div>
              <div>
                <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.2 }}>
                  {searchesCount.toLocaleString()}
                </span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-secondary)",
                    fontWeight: 600,
                    marginTop: "2px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  Searches
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "0.55rem",
                      fontWeight: 800,
                      color: "#10b981",
                      backgroundColor: "rgba(16, 185, 129, 0.1)",
                      padding: "2px 6px",
                      borderRadius: "6px",
                      border: "1px solid rgba(16, 185, 129, 0.2)",
                      textTransform: "uppercase"
                    }}
                  >
                    <span className="pulse-dot" style={{ width: "6px", height: "6px" }} />
                    Live
                  </span>
                </span>
              </div>
            </div>

            <div
              className="glass"
              style={{
                padding: "16px 20px",
                borderRadius: "20px",
                border: "1px solid var(--border-color)",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                boxShadow: "var(--card-shadow)"
              }}
            >
              <div
                style={{
                  background: "rgba(16, 185, 129, 0.12)",
                  padding: "10px",
                  borderRadius: "14px",
                  color: "#10b981",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.4rem"
                }}
              >
                🤝
              </div>
              <div>
                <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.2 }}>
                  {helpedCount.toLocaleString()}
                </span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-secondary)",
                    fontWeight: 600,
                    marginTop: "2px",
                    display: "block"
                  }}
                >
                  Connections / Calls
                </span>
              </div>
            </div>
          </div>

          {/* Search Box */}
          <div style={{ position: "relative", width: "100%" }}>
            <span
              style={{
                position: "absolute",
                left: "20px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "1.2rem",
                color: "var(--text-muted)",
                pointerEvents: "none"
              }}
            >
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search faculty by name, department, designation, research, phone..."
              className="search-input glass"
              style={{
                width: "100%",
                padding: "16px 50px 16px 54px",
                borderRadius: "20px",
                border: "1px solid var(--border-color)",
                fontSize: "1rem",
                color: "var(--text-primary)",
                outline: "none"
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute",
                  right: "18px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.1rem",
                  color: "var(--text-muted)"
                }}
              >
                ✖
              </button>
            )}
          </div>

          {/* Department Filter Pills */}
          <div className="dept-scroll">
            <button
              onClick={() => setSelectedDept(null)}
              className={`dept-pill ${selectedDept === null ? "active" : ""}`}
            >
              <span>All Departments</span>
              <span className="count-badge">{facultyList.length}</span>
            </button>

            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(selectedDept === dept ? null : dept)}
                className={`dept-pill ${selectedDept === dept ? "active" : ""}`}
              >
                <span>{dept}</span>
                <span className="count-badge">{deptCounts[dept] || 0}</span>
              </button>
            ))}
          </div>

          {/* Results Summary & Counter */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 4px" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>
              Showing {visibleFaculty.length} of {filteredFaculty.length} faculty members
              {selectedDept && <span> in <strong>{selectedDept}</strong></span>}
            </p>

            {(searchQuery || selectedDept) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedDept(null);
                }}
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: "var(--accent-primary)",
                  background: "none",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                Reset filters
              </button>
            )}
          </div>

          {/* Faculty Cards Grid */}
          {visibleFaculty.length > 0 ? (
            <div className="cards-grid">
              {visibleFaculty.map((item) => (
                <FacultyCard
                  key={item.portalId || item.name}
                  faculty={item}
                  onClick={() => setSelectedFaculty(item)}
                  searchQuery={searchQuery}
                  isDarkMode={isDarkMode}
                  onAction={recordHelped}
                />
              ))}
            </div>
          ) : (
            <div
              className="glass"
              style={{
                padding: "60px 20px",
                borderRadius: "24px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px"
              }}
            >
              <div style={{ fontSize: "3rem" }}>🔎</div>
              <h3 style={{ fontSize: "1.3rem", color: "var(--text-primary)" }}>No faculty found</h3>
              <p style={{ color: "var(--text-muted)", maxWidth: "400px", fontSize: "0.9rem" }}>
                We couldn't find any match for "{searchQuery}". Try searching by initials (e.g. "kr") or resetting the department filter.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedDept(null);
                }}
                className="dept-pill active"
                style={{ marginTop: "12px", border: "none", cursor: "pointer" }}
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Load More indicator if more exist */}
          {visibleFaculty.length < filteredFaculty.length && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <button
                onClick={() => setPageLimit((prev) => Math.min(prev + 24, filteredFaculty.length))}
                className="dept-pill"
                style={{ margin: "0 auto", cursor: "pointer" }}
              >
                Load More ({filteredFaculty.length - visibleFaculty.length} remaining)
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Slide-in Detail Drawer */}
      {selectedFaculty && (
        <div className="drawer-backdrop" onClick={() => setSelectedFaculty(null)}>
          <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <button
                className="drawer-close"
                onClick={() => setSelectedFaculty(null)}
                aria-label="Close"
              >
                ✖
              </button>

              <div className="drawer-avatar-wrap">
                {selectedFaculty.image ? (
                  <img
                    src={getOptimizedImageUrl(selectedFaculty.image, 200, 200)}
                    alt={selectedFaculty.name}
                    className="drawer-avatar"
                  />
                ) : (
                  <div
                    className="drawer-avatar"
                    style={{
                      backgroundColor: "var(--accent-primary)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "1.8rem"
                    }}
                  >
                    {getInitials(selectedFaculty.name)}
                  </div>
                )}
              </div>
            </div>

            <div className="drawer-body custom-scrollbar">
              <div>
                <h2 style={{ fontSize: "1.5rem", color: "var(--text-primary)", marginBottom: "4px" }}>
                  {selectedFaculty.name}
                </h2>
                <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--accent-primary)" }}>
                  {selectedFaculty.designation}
                </p>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
                  {selectedFaculty.department}
                </p>
                {selectedFaculty.portalId && (
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                    ID: {selectedFaculty.portalId}
                  </p>
                )}
              </div>

              {/* Research Interests Tags */}
              {researchTags.length > 0 && (
                <div>
                  <h4 style={{ fontSize: "0.85rem", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "8px", letterSpacing: "0.5px" }}>
                    Areas of Specialization
                  </h4>
                  <div className="badge-container">
                    {researchTags.map((tag, i) => (
                      <span key={i} className="interest-badge">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Information & Action Cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <h4 style={{ fontSize: "0.85rem", textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.5px" }}>
                  Contact Information
                </h4>

                {/* Phone & WhatsApp */}
                {(selectedFaculty.portalPhone || selectedFaculty.officialPhone) && (
                  <div
                    className="glass"
                    style={{
                      padding: "16px",
                      borderRadius: "16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Phone Number</div>
                        <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>
                          {selectedFaculty.portalPhone || selectedFaculty.officialPhone}
                        </div>
                      </div>

                      <button
                        onClick={() => copyToClipboard(selectedFaculty.portalPhone || selectedFaculty.officialPhone, "Phone")}
                        style={{
                          background: "var(--border-color)",
                          border: "none",
                          padding: "6px 10px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: "var(--text-primary)"
                        }}
                      >
                        Copy
                      </button>
                    </div>

                    <div style={{ display: "flex", gap: "10px" }}>
                      <a
                        href={`tel:${selectedFaculty.portalPhone || selectedFaculty.officialPhone}`}
                        onClick={recordHelped}
                        className="dept-pill active"
                        style={{
                          flex: 1,
                          justifyContent: "center",
                          textDecoration: "none",
                          background: "var(--accent-primary)",
                          color: "#fff",
                          border: "none"
                        }}
                      >
                        📞 Call Now
                      </a>

                      <a
                        href={getWhatsAppUrl(selectedFaculty.portalPhone || selectedFaculty.officialPhone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={recordHelped}
                        className="dept-pill"
                        style={{
                          flex: 1,
                          justifyContent: "center",
                          textDecoration: "none",
                          background: "#25D366",
                          color: "#fff",
                          border: "none",
                          gap: "6px"
                        }}
                      >
                        <WhatsAppIcon size={16} color="#fff" /> WhatsApp
                      </a>
                    </div>
                  </div>
                )}

                {/* Emails */}
                {selectedFaculty.emails && selectedFaculty.emails.length > 0 && (
                  <div
                    className="glass"
                    style={{
                      padding: "16px",
                      borderRadius: "16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px"
                    }}
                  >
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Email Addresses</div>
                    {selectedFaculty.emails.map((email, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px 0",
                          borderBottom: idx !== selectedFaculty.emails.length - 1 ? "1px solid var(--border-color)" : "none"
                        }}
                      >
                        <a
                          href={`mailto:${email}`}
                          onClick={recordHelped}
                          style={{
                            color: "var(--text-primary)",
                            fontSize: "0.9rem",
                            fontWeight: 600,
                            textDecoration: "none",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}
                        >
                          ✉️ {email}
                        </a>
                        <button
                          onClick={() => copyToClipboard(email, "Email")}
                          style={{
                            background: "var(--border-color)",
                            border: "none",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            color: "var(--text-primary)",
                            marginLeft: "8px"
                          }}
                        >
                          Copy
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Official NERIST Bio Link */}
                {selectedFaculty.profileUrl && (
                  <a
                    href={selectedFaculty.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={recordHelped}
                    className="dept-pill"
                    style={{
                      justifyContent: "center",
                      textDecoration: "none",
                      padding: "12px",
                      fontWeight: 700
                    }}
                  >
                    🌐 View Official NERIST Webpage ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.visible && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "var(--surface-solid)",
            color: "var(--text-primary)",
            padding: "12px 24px",
            borderRadius: "99px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            border: "1px solid var(--border-color)",
            zIndex: 200,
            fontSize: "0.85rem",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <span>✓</span>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
