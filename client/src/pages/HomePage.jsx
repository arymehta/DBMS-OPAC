import React, { useState, useEffect } from "react";
import axios from "axios";
import BookComponent from "../components/BookComponent";

const HomePage = () => {
  const [books, setBooks] = useState([]);
  const [filters, setFilters] = useState({
    title: "",
    author: "",
    genre: "",
    publication: "",
    lang: "",
  });
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
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
    });
    setCurrentPage(1);
    try {
      const response = await axios.get("http://localhost:3000/catalog/");
      setBooks(response?.data ?? []);
    } catch (err) {
      console.error("Error resetting filters:", err);
    }
  };

  const totalPages = Math.ceil(books.length / booksPerPage);
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = books.slice(indexOfFirstBook, indexOfLastBook);

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
        <h1 style={styles.heading}>COEP OPAC System</h1>
        <p style={styles.subtitle}>Search and discover books in our collection</p>
      </div>

      {/* Filter Form */}
        <div style={styles.filterCard}>
          <h2 style={styles.filterTitle}>Search Filters</h2>
          <form style={styles.filterForm} onSubmit={handleFilter}>
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

          <div style={styles.actions}>
            <button type="submit" style={styles.button}>
              🔍 Search
            </button>
            <button type="button" onClick={clearFilters} style={styles.clearButton}>
              ✕ Clear Filters
            </button>
          </div>
        </form>
      </div>

      {/* Results Section */}
      <div style={styles.resultsSection}>
        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Loading books...</p>
          </div>
        ) : books.length > 0 ? (
          <>
            <div style={styles.resultsHeader}>
              <p style={styles.resultCount}>
                Found {books.length} book{books.length !== 1 ? 's' : ''} 
                {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
              </p>
            </div>
            
            {currentBooks.map((book) => <BookComponent key={book.id} book={book} />)}
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={styles.paginationContainer}>
                <button 
                  onClick={goToPrevPage} 
                  disabled={currentPage === 1}
                  style={{
                    ...styles.paginationButton,
                    ...(currentPage === 1 ? styles.paginationButtonDisabled : {})
                  }}
                >
                  ← Previous
                </button>
                
                <div style={styles.pageNumbers}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      style={{
                        ...styles.pageNumber,
                        ...(currentPage === pageNum ? styles.pageNumberActive : {})
                      }}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>
                
                <button 
                  onClick={goToNextPage} 
                  disabled={currentPage === totalPages}
                  style={{
                    ...styles.paginationButton,
                    ...(currentPage === totalPages ? styles.paginationButtonDisabled : {})
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={styles.emptyState}>
            <p style={styles.emptyIcon}>📖</p>
            <p style={styles.emptyText}>No books found.</p>
            <p style={styles.emptySubtext}>Try adjusting your search filters</p>
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
    marginBottom: 32,
    paddingTop: 20,
  },
  heading: {
    fontSize: "clamp(24px, 5vw, 36px)",
    margin: 0,
    marginBottom: 8,
    color: "#1a202c",
    fontWeight: 700,
  },
  subtitle: {
    fontSize: "clamp(14px, 3vw, 16px)",
    color: "#718096",
    margin: 0,
  },
  filterCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: "20px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)",
    marginBottom: 32,
  },
  filterTitle: {
    fontSize: "clamp(18px, 4vw, 20px)",
    color: "#2d3748",
    marginTop: 0,
    marginBottom: 20,
    fontWeight: 600,
  },
  filterForm: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "16px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "#4a5568",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  input: {
    padding: "12px 14px",
    border: "2px solid #e2e8f0",
    borderRadius: 8,
    fontSize: 15,
    transition: "all 0.2s ease",
    outline: "none",
    backgroundColor: "#fff",
    width: "100%",
    boxSizing: "border-box",
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    gridColumn: "1 / -1",
    marginTop: 8,
    justifyContent: "center",
  },
  button: {
    background: "linear-gradient(135deg, #001261ff 0%, #320064ff 100%)",
    color: "#fff",
    border: "none",
    padding: "12px 28px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 600,
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
    flex: "1 1 auto",
    minWidth: "140px",
    maxWidth: "200px",
  },
  clearButton: {
    background: "#fff",
    color: "#4a5568",
    border: "2px solid #e2e8f0",
    padding: "12px 28px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 600,
    transition: "all 0.3s ease",
    flex: "1 1 auto",
    minWidth: "140px",
    maxWidth: "200px",
  },
  resultsSection: {
    minHeight: 200,
  },
  resultsHeader: {
    marginBottom: 16,
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
    marginTop: 32,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  paginationButton: {
    background: "#fff",
    color: "#667eea",
    border: "2px solid #667eea",
    padding: "10px 20px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    transition: "all 0.3s ease",
  },
  paginationButtonDisabled: {
    opacity: 0.4,
    cursor: "not-allowed",
    color: "#a0aec0",
    borderColor: "#e2e8f0",
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
    border: "2px solid #e2e8f0",
    padding: "8px 14px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    minWidth: 40,
    transition: "all 0.3s ease",
  },
  pageNumberActive: {
    background: "linear-gradient(135deg, #001261ff 0%, #320064ff 100%)",
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
    width: 50,
    height: 50,
    border: "4px solid #e2e8f0",
    borderTop: "4px solid #667eea",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    marginTop: 16,
    color: "#718096",
    fontSize: 16,
  },
  emptyState: {
    textAlign: "center",
    padding: 60,
    backgroundColor: "#fff",
    borderRadius: 12,
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
  },
  emptyIcon: {
    fontSize: 64,
    margin: 0,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    color: "#2d3748",
    margin: 0,
    marginBottom: 8,
    fontWeight: 600,
  },
  emptySubtext: {
    fontSize: 15,
    color: "#a0aec0",
    margin: 0,
  },
};

// Add keyframe animation and responsive styles
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  input:focus {
    border-color: #667eea !important;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
  }
  
  button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4) !important;
  }
  
  button:active {
    transform: translateY(0);
  }
  
  button:disabled {
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
  
  /* Mobile optimizations */
  @media (max-width: 768px) {
    body {
      font-size: 14px;
    }
  }
  
  @media (max-width: 480px) {
    /* Make filter inputs stack vertically on very small screens */
    form[style*="grid"] {
      grid-template-columns: 1fr !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default HomePage;