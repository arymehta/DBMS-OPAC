import React from "react";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const styles = {
    card: {
        border: "1px solid #e0e0e0",
        borderRadius: 8,
        padding: 20,
        maxWidth: 750,
        background: "#fff",
        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        fontFamily: "Arial, sans-serif",
        margin: "16px auto",
    },
    headerRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 16,
        gap: 20,
    },
    imageContainer: {
        flexShrink: 0,
        width: 140,
        height: 200,
        borderRadius: 6,
        overflow: "hidden",
        boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
    },
    bookImage: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
    },
    textContainer: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
    },
    title: { margin: 0, fontSize: 22, color: "#111" },
    subtitle: { margin: "6px 0 14px", color: "#555", fontSize: 14 },
    metaContainer: {
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(160px, 1fr))",
        gap: 10,
    },
    field: {
        display: "flex",
        flexDirection: "column",
        padding: "4px 0",
    },
    label: {
        color: "#777",
        fontSize: 13,
        marginBottom: 2,
    },
    value: {
        color: "#111",
        fontWeight: 500,
        fontSize: 14,
        lineHeight: 1.4,
    },
    actions: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        marginTop: 20,
    },
    button: {
        background: "#1976d2",
        color: "#fff",
        border: "none",
        padding: "8px 14px",
        borderRadius: 4,
        cursor: "pointer",
        fontSize: 14,
        fontWeight: 500,
    },
    status: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: 14,
    },
};

const dummyBook = {
    isbn_id: 9780131103627,
    title: "The C Programming Language",
    author: "Brian W. Kernighan",
    genre: "Programming",
    publication: "Prentice Hall",
    lang: "English",
    pages: 272,
    doc_type: "Hardcover",
    status: "AVAILABLE",
    dewey_dec_loc: "005.13 KER",
};

const BookComponent = () => {
    const {
        isbn_id,
        title,
        author,
        genre,
        publication,
        lang,
        pages,
        doc_type,
        status,
        dewey_dec_loc,
    } = dummyBook;

    const url = `https://covers.openlibrary.org/b/isbn/${isbn_id}-M.jpg`;

    return (
        <div style={styles.card} data-testid="book-component">
            <div style={styles.headerRow}>
                {/* Left: Book Image */}
                <div style={styles.imageContainer}>
                    <img src={url} alt={title} style={styles.bookImage} />
                </div>

                {/* Right: Title, Author, and Details */}
                <div style={styles.textContainer}>
                    <h2 style={styles.title}>{title || "Untitled"}</h2>
                    <div style={styles.subtitle}>by {author || "Unknown author"}</div>

                    <div style={styles.metaContainer}>
                        <div style={styles.field}>
                            <div style={styles.label}>ISBN</div>
                            <div style={styles.value}>{isbn_id ?? "N/A"}</div>
                        </div>

                        <div style={styles.field}>
                            <div style={styles.label}>Genre</div>
                            <div style={styles.value}>{genre || "N/A"}</div>
                        </div>

                        <div style={styles.field}>
                            <div style={styles.label}>Publication</div>
                            <div style={styles.value}>{publication || "N/A"}</div>
                        </div>

                        <div style={styles.field}>
                            <div style={styles.label}>Language</div>
                            <div style={styles.value}>{lang || "N/A"}</div>
                        </div>

                        <div style={styles.field}>
                            <div style={styles.label}>Pages</div>
                            <div style={styles.value}>{pages || "N/A"}</div>
                        </div>

                        <div style={styles.field}>
                            <div style={styles.label}>Document Type</div>
                            <div style={styles.value}>{doc_type || "N/A"}</div>
                        </div>

                        <div style={styles.field}>
                            <div style={styles.label}>Dewey Decimal</div>
                            <div style={styles.value}>{dewey_dec_loc || "N/A"}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Actions */}
            <div style={styles.actions}>
                <div
                    style={{
                        ...styles.status,
                        color: status === "AVAILABLE" ? "green" : "red",
                    }}
                >
                    {status === "AVAILABLE" ? (
                        <>
                            <FontAwesomeIcon icon={faCheck} />
                            Available
                        </>
                    ) : (
                        "Not Available"
                    )}
                </div>
                <button style={styles.button}>Issue Book</button>
            </div>
        </div>
    );
};

export default BookComponent;
