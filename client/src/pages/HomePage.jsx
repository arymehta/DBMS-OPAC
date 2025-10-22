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

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:3000/catalog/");
        // console.log("Response from server:", response.data);
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
    try {
      const response = await axios.get("http://localhost:3000/catalog/");
      setBooks(response?.data ?? []);
    } catch (err) {
      console.error("Error resetting filters:", err);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Library Catalog</h1>

      {/* Filter Form */}
      <form style={styles.filterForm} onSubmit={handleFilter}>
        <input
          type="text"
          name="title"
          value={filters.title}
          onChange={handleChange}
          placeholder="Search by title"
          style={styles.input}
        />
        <input
          type="text"
          name="author"
          value={filters.author}
          onChange={handleChange}
          placeholder="Search by author"
          style={styles.input}
        />
        <input
          type="text"
          name="genre"
          value={filters.genre}
          onChange={handleChange}
          placeholder="Search by genre"
          style={styles.input}
        />
        <input
          type="text"
          name="publication"
          value={filters.publication}
          onChange={handleChange}
          placeholder="Search by publication"
          style={styles.input}
        />
        <input
          type="text"
          name="lang"
          value={filters.lang}
          onChange={handleChange}
          placeholder="Search by language"
          style={styles.input}
        />

        <div style={styles.actions}>
          <button type="submit" style={styles.button}>
            Search
          </button>
          <button type="button" onClick={clearFilters} style={styles.clearButton}>
            Clear
          </button>
        </div>
      </form>

      {loading ? (
        <p style={{ textAlign: "center", marginTop: 20 }}>Loading...</p>
      ) : books.length > 0 ? (
        books.map((book) => <BookComponent key={book.id} book={book} />)
      ) : (
        <p style={{ textAlign: "center", marginTop: 20 }}>No books found.</p>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 900,
    margin: "0 auto",
    padding: 20,
    fontFamily: "Arial, sans-serif",
  },
  heading: {
    fontSize: 26,
    marginBottom: 16,
    textAlign: "center",
    color: "#222",
  },
  filterForm: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
    marginBottom: 24,
  },
  input: {
    padding: "8px 10px",
    border: "1px solid #ccc",
    borderRadius: 4,
    fontSize: 14,
  },
  actions: {
    display: "flex",
    gap: 8,
    justifyContent: "center",
    gridColumn: "1 / -1",
    marginTop: 8,
  },
  button: {
    background: "#1976d2",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: 4,
    cursor: "pointer",
  },
  clearButton: {
    background: "#888",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: 4,
    cursor: "pointer",
  },
};

export default HomePage;
