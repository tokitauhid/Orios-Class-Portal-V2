import React, { useState, useEffect, useCallback } from "react";
import Layout from "@theme/Layout";
import SearchOverlay from "@site/src/components/SearchOverlay";
import { getAll, getSubjects, getOneById } from "@site/src/auth";
import styles from "./notes.module.css";

export default function NotesPage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeSubject, setActiveSubject] = useState("All");
  const [activeType, setActiveType] = useState("All");
  const [notesData, setNotesData] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loadingNoteId, setLoadingNoteId] = useState(null);

  useEffect(() => {
    async function init() {
      try {
        const notes = await getAll("notes");
        const routineSubjects = await getSubjects();
        const noteSubjects = notes.map((note) => note.subject).filter(Boolean);
        setNotesData(notes);
        setSubjects(Array.from(new Set([...(routineSubjects || []), ...noteSubjects])));
      } catch {}
    }
    init();
  }, []);

  const types = ["All", "doc", "image", "link"];

  const filtered = notesData.filter((note) => {
    const matchSubject =
      activeSubject === "All" || note.subject === activeSubject;
    const matchType = activeType === "All" || note.type === activeType;
    const q = query.toLowerCase();
    const matchQuery =
      !q ||
      (note.title || "").toLowerCase().includes(q) ||
      (note.subject || "").toLowerCase().includes(q) ||
      (note.description || "").toLowerCase().includes(q) ||
      (note.tags || []).some((t) => t.toLowerCase().includes(q));
    return matchSubject && matchType && matchQuery;
  });

  // Group by subject
  const grouped = {};
  filtered.forEach((note) => {
    if (!grouped[note.subject]) grouped[note.subject] = [];
    grouped[note.subject].push(note);
  });

  const typeIcons = { doc: "📄", image: "🖼️", link: "🔗" };

  /**
   * Handle note click: if the note has _hasFile (fileData was stripped),
   * lazily fetch the full record and trigger the download. Otherwise,
   * open the URL/link directly.
   */
  const handleNoteClick = useCallback(async (e, note) => {
    // Links open normally.
    if (note.type === "link" || (!note._hasFile && !note.fileData)) {
      return; // let the <a> default behavior handle it
    }

    // If we already have fileData, let the default <a> behavior handle it.
    if (note.fileData) {
      return;
    }

    // _hasFile means we need to fetch the full record.
    if (note._hasFile) {
      e.preventDefault();
      setLoadingNoteId(note.id);
      try {
        const fullNote = await getOneById("notes", note.id);
        if (fullNote?.fileData) {
          const a = document.createElement("a");
          a.href = fullNote.fileData;
          a.download = note.title + "." + (note.format || "bin").toLowerCase();
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      } catch (err) {
        console.error("Failed to fetch note file:", err);
      } finally {
        setLoadingNoteId(null);
      }
    }
  }, []);

  return (
    <Layout
      title="Notes — Orios Class"
      description="Subject-wise notes, links, docs, and resources"
    >
      <div className={styles.page}>
        <header className={styles.header}>
          <div
            className={styles.headerContent}
            style={{ position: "relative" }}
          >
            <img
              src="/img/orio1.png"
              alt="Orio 1"
              style={{
                position: "absolute",
                left: "-50px",
                top: "-20px",
                width: "50px",
                height: "50px",
                objectFit: "contain",
                transform: "rotate(-15deg)",
                opacity: 0.9,
              }}
            />
            <img
              src="/img/pucu.png"
              alt="Pucu"
              style={{
                position: "absolute",
                right: "-40px",
                bottom: "-10px",
                width: "60px",
                height: "60px",
                objectFit: "contain",
                transform: "rotate(10deg)",
                opacity: 0.9,
              }}
            />
            <span className={styles.headerIcon}>📝</span>
            <div>
              <h1 className={styles.title}>Notes</h1>
              <p className={styles.subtitle}>
                Subject-wise notes, links, docs, PDFs, and resources
              </p>
            </div>
          </div>
          <button
            className={styles.searchTrigger}
            onClick={() => setSearchOpen(true)}
          >
            🔍 Search everything...
          </button>
        </header>

        {/* Filters */}
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <input
              type="text"
              placeholder="🔍 Filter notes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.filterRow}>
            <select
              value={activeSubject}
              onChange={(e) => setActiveSubject(e.target.value)}
              className={styles.subjectSelect}
            >
              <option value="All">All Subjects</option>
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <div className={styles.pills}>
              {types.map((t) => (
                <button
                  key={t}
                  className={`${styles.pill} ${styles.typePill} ${activeType === t ? styles.pillActive : ""}`}
                  onClick={() => setActiveType(t)}
                >
                  {t === "All"
                    ? "📌 All Types"
                    : `${typeIcons[t]} ${t.charAt(0).toUpperCase() + t.slice(1)}`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notes grouped by subject */}
        <div className={styles.content}>
          {Object.keys(grouped).length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>📭</span>
              <p>No notes found matching your filters.</p>
            </div>
          ) : (
            Object.entries(grouped).map(([subject, notes]) => (
              <section key={subject} className={styles.subjectSection}>
                <h2 className={styles.subjectTitle}>{subject}</h2>
                <div className={styles.notesGrid}>
                  {notes.map((note, i) => (
                    <a
                      key={note.id}
                      href={note.fileData || note.url || "#"}
                      download={
                        note.fileData
                          ? note.title +
                            "." +
                            (note.format || "bin").toLowerCase()
                          : undefined
                      }
                      target={
                        note.type === "link" || (!note.fileData && !note._hasFile)
                          ? "_blank"
                          : undefined
                      }
                      rel={
                        note.type === "link" || (!note.fileData && !note._hasFile)
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className={`${styles.noteCard} ${loadingNoteId === note.id ? styles.noteCardLoading : ""}`}
                      style={{ animationDelay: `${i * 60}ms` }}
                      onClick={(e) => handleNoteClick(e, note)}
                    >
                      <div className={styles.noteHeader}>
                        <span className={styles.noteIcon}>{note.icon}</span>
                        <span className={styles.noteFormat}>{note.format}</span>
                      </div>
                      <h3 className={styles.noteTitle}>{note.title}</h3>
                      <p className={styles.noteDesc}>{note.description}</p>
                      {loadingNoteId === note.id && (
                        <div className={styles.noteLoadingBar}>
                          <div className={styles.noteLoadingBarInner} />
                        </div>
                      )}
                      <div className={styles.noteMeta}>
                        <span className={styles.noteAuthor}>{note.author}</span>
                        <span className={styles.noteDate}>
                          {new Date(note.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className={styles.noteTags}>
                        {(note.tags || []).map((tag) => (
                          <span key={tag} className={styles.tag}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>

      <SearchOverlay
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        data={notesData}
      />
    </Layout>
  );
}
