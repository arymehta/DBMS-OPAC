import React, { useState, useEffect } from "react";
import axios from "axios";
import BookComponent from "../components/BookComponent";
import {
  Search as IconSearch,
  X as IconX,
  BookOpen as IconBookOpen,
  ChevronLeft as IconChevronLeft,
  ChevronRight as IconChevronRight,
} from "lucide-react";

const DashboardPage = () => {
  const [books, setBooks] = useState([]);
  const [filters, setFilters] = useState({
    title: "",
    author: "",
    genre: "",
    publication: "",
    lang: "",
    doc_type: "",
  });
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const booksPerPage = 2;

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:3000/catalog/");
        setBooks(response.data ?? []);
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const handleFilter = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post("http://localhost:3000/catalog/", filters);
      console.log("Filtered data:", response.data);
      setBooks(response?.data ?? []);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error filtering books:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const clearFilters = async () => {
    setFilters({
      title: "",
      author: "",
      genre: "",
      publication: "",
      lang: "",
      doc_type: "",
    });
    setShowOnlyAvailable(false);
    setCurrentPage(1);
    try {
      const response = await axios.get("http://localhost:3000/catalog/");
      setBooks(response?.data ?? []);
    } catch (err) {
      console.error("Error resetting filters:", err);
    }
  };

  // Filter books by availability
  const filteredBooks = showOnlyAvailable
    ? books.filter((book) => book.status === "AVAILABLE")
    : books;

  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        {/* <h1 style={styles.heading}>COEP OPAC System</h1> */}
        <h3 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-4">
            COEP OPAC System
          </h3>
        <p style={styles.subtitle}>Search and discover books in our collection</p>
      </div>

      {/* Filter Card - centered and compact */}
      <div style={styles.filterWrapper}>
        <div style={styles.filterCard}>
          <div style={styles.filterHeader}>
            <h2 style={styles.filterTitle}>Search Filters</h2>

            <div style={styles.toggleContainer}>
              <label style={styles.toggleLabel}>
                <span style={styles.toggleText}>Available Only</span>
                <div
                  role="button"
                  aria-pressed={showOnlyAvailable}
                  tabIndex={0}
                  onClick={() => {
                    setShowOnlyAvailable(!showOnlyAvailable);
                    setCurrentPage(1);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setShowOnlyAvailable(!showOnlyAvailable);
                      setCurrentPage(1);
                    }
                  }}
                  style={{
                    ...styles.toggleSwitch,
                    ...(showOnlyAvailable ? styles.toggleSwitchActive : {}),
                  }}
                >
                  <div
                    style={{
                      ...styles.toggleSlider,
                      ...(showOnlyAvailable ? styles.toggleSliderActive : {}),
                    }}
                  ></div>
                </div>
              </label>
            </div>
          </div>

          <form
            className="filter-form"
            style={styles.filterForm}
            onSubmit={handleFilter}
          >
            <div style={styles.inputGroup}>
              <label style={styles.label}>Title</label>
              <input
                type="text"
                name="title"
                value={filters.title}
                onChange={handleChange}
                placeholder="Enter book title"
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Author</label>
              <input
                type="text"
                name="author"
                value={filters.author}
                onChange={handleChange}
                placeholder="Enter author name"
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Genre</label>
              <input
                type="text"
                name="genre"
                value={filters.genre}
                onChange={handleChange}
                placeholder="Enter genre"
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Publication</label>
              <input
                type="text"
                name="publication"
                value={filters.publication}
                onChange={handleChange}
                placeholder="Enter publisher"
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Language</label>
              <input
                type="text"
                name="lang"
                value={filters.lang}
                onChange={handleChange}
                placeholder="Enter language"
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Document Type</label>
              <input
                type="text"
                name="doc_type"
                value={filters.doc_type}
                onChange={handleChange}
                placeholder="Enter document type"
                style={styles.input}
              />
            </div>

            <div style={styles.actions}>
              <button type="submit" style={styles.button}>
                <IconSearch size={16} style={{ marginRight: 8 }} />
                Search
              </button>
              <button
                type="button"
                onClick={clearFilters}
                style={styles.clearButton}
              >
                <IconX size={16} />
                <span style={{ marginLeft: 8 }}>Clear</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Results Section */}
      <div style={styles.resultsSection}>
        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Loading books...</p>
          </div>
        ) : filteredBooks.length > 0 ? (
          <>
            <div style={styles.resultsHeader}>
              <p style={styles.resultCount}>
                Found {filteredBooks.length} book
                {filteredBooks.length !== 1 ? "s" : ""}
                {showOnlyAvailable && " (Available)"}
                {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
              </p>
            </div>

            {currentBooks.map((book) => (
              <BookComponent key={book.id} book={book} />
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={styles.paginationContainer}>
                <button
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  style={{
                    ...styles.paginationButton,
                    ...(currentPage === 1 ? styles.paginationButtonDisabled : {}),
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <IconChevronLeft size={16} />
                  Previous
                </button>

                <div style={styles.pageNumbers}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        style={{
                          ...styles.pageNumber,
                          ...(currentPage === pageNum ? styles.pageNumberActive : {}),
                        }}
                      >
                        {pageNum}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  style={{
                    ...styles.paginationButton,
                    ...(currentPage === totalPages
                      ? styles.paginationButtonDisabled
                      : {}),
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  Next
                  <IconChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={styles.emptyState}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <IconBookOpen size={56} color="#4a5568" />
            </div>
            <p style={styles.emptyText}>
              {showOnlyAvailable ? "No available books found." : "No books found."}
            </p>
            <p style={styles.emptySubtext}>
              {showOnlyAvailable
                ? "Try turning off the 'Available Only' filter"
                : "Try adjusting your search filters"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "100%",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#f5f7fa",
    minHeight: "100vh",
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
    paddingTop: 16,
  },
  heading: {
    fontSize: "clamp(22px, 4.5vw, 34px)",
    margin: 0,
    marginBottom: 6,
    color: "#1a202c",
    fontWeight: 700,
  },
  subtitle: {
    fontSize: "clamp(13px, 2.5vw, 15px)",
    color: "#718096",
    margin: 0,
  },

  /* New wrapper that centers the card and gives a compact max width */
  filterWrapper: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 28,
  },

  filterCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: "16px",
    boxShadow: "0 6px 18px rgba(12, 24, 60, 0.06)",
    width: "100%",
    maxWidth: 980,
    boxSizing: "border-box",
  },
  filterHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
    flexWrap: "wrap",
  },
  filterTitle: {
    fontSize: "clamp(16px, 2.5vw, 18px)",
    color: "#2d3748",
    margin: 0,
    fontWeight: 600,
  },
  toggleContainer: {
    display: "flex",
    alignItems: "center",
  },
  toggleLabel: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
    userSelect: "none",
  },
  toggleText: {
    fontSize: 13,
    fontWeight: 600,
    color: "#4a5568",
  },
  toggleSwitch: {
    position: "relative",
    width: 46,
    height: 24,
    backgroundColor: "#e2e8f0",
    borderRadius: 14,
    transition: "all 0.18s ease",
    cursor: "pointer",
    flexShrink: 0,
  },
  toggleSwitchActive: {
    backgroundColor: "#48bb78",
  },
  toggleSlider: {
    position: "absolute",
    top: 2,
    left: 2,
    width: 20,
    height: 20,
    backgroundColor: "#fff",
    borderRadius: "50%",
    transition: "all 0.18s ease",
    boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
  },
  toggleSliderActive: {
    transform: "translateX(22px)",
  },

  /* Compact and responsive filter form */
  filterForm: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: 11,
    fontWeight: 700,
    color: "#4a5568",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: "0.6px",
  },
  input: {
    padding: "10px 12px",
    border: "1.5px solid #e6edf6",
    borderRadius: 8,
    fontSize: 13,
    transition: "all 0.15s ease",
    outline: "none",
    backgroundColor: "#fff",
    width: "100%",
    boxSizing: "border-box",
  },
  actions: {
    display: "flex",
    gap: 10,
    gridColumn: "1 / -1",
    marginTop: 6,
    justifyContent: "flex-end",
    flexWrap: "wrap",
  },
  button: {
    background:
      "linear-gradient(135deg, rgba(0,18,97,1) 0%, rgba(50,0,100,1) 100%)",
    color: "#fff",
    border: "none",
    padding: "10px 18px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
    transition: "all 0.18s ease",
    boxShadow: "0 6px 14px rgba(102, 126, 234, 0.18)",
    display: "inline-flex",
    alignItems: "center",
  },
  clearButton: {
    background: "#fff",
    color: "#4a5568",
    border: "1.5px solid #e6edf6",
    padding: "10px 14px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
    transition: "all 0.18s ease",
    display: "inline-flex",
    alignItems: "center",
  },
  resultsSection: {
    minHeight: 200,
  },
  resultsHeader: {
    marginBottom: 12,
  },
  resultCount: {
    fontSize: 14,
    color: "#718096",
    margin: 0,
    fontWeight: 500,
    textAlign: "center",
  },
  paginationContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 24,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  paginationButton: {
    background: "#fff",
    color: "#667eea",
    border: "1.5px solid #667eea",
    padding: "8px 14px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 700,
    transition: "all 0.18s ease",
  },
  paginationButtonDisabled: {
    opacity: 0.45,
    cursor: "not-allowed",
    color: "#a0aec0",
    borderColor: "#edf2f7",
  },
  pageNumbers: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  pageNumber: {
    background: "#fff",
    color: "#4a5568",
    border: "1.5px solid #edf2f7",
    padding: "6px 10px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 700,
    minWidth: 36,
    transition: "all 0.18s ease",
  },
  pageNumberActive: {
    background:
      "linear-gradient(135deg, rgba(0,18,97,1) 0%, rgba(50,0,100,1) 100%)",
    color: "#fff",
    borderColor: "#667eea",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 60,
  },
  spinner: {
    width: 44,
    height: 44,
    border: "4px solid #e6edf6",
    borderTop: "4px solid #667eea",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    marginTop: 12,
    color: "#718096",
    fontSize: 15,
  },
  emptyState: {
    textAlign: "center",
    padding: 40,
    backgroundColor: "#fff",
    borderRadius: 10,
    boxShadow: "0 2px 8px rgba(12, 24, 60, 0.04)",
  },
  emptyText: {
    fontSize: 18,
    color: "#2d3748",
    margin: "12px 0 6px",
    fontWeight: 700,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9aa6b2",
    margin: 0,
  },
};

/* Add keyframe animation and some responsive tweaks using a style tag so these styles remain when the component is imported */
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .filter-form input:focus {
    border-color: #667eea !important;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.06) !important;
  }

  .filter-form button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.12) !important;
  }

  .filter-form button:active {
    transform: translateY(0);
  }

  .filter-form button:disabled {
    transform: none !important;
  }

  .pageNumber:hover:not(.pageNumberActive) {
    border-color: #667eea;
    background: #f7fafc;
  }

  .paginationButton:hover:not(:disabled) {
    background: #667eea;
    color: #fff;
  }

  /* Responsiveness: narrow screens place actions full width */
  @media (max-width: 640px) {
    .filter-form {
      gap: 10px;
    }

    .filter-form .actions {
      justify-content: stretch !important;
      gap: 8px;
    }

    .filter-form .actions button {
      width: 100%;
      justify-content: center;
    }
  }
`;
document.head.appendChild(styleSheet);

export default DashboardPage;