import React from "react";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useAuthContext from '../hooks/useAuthContext';
import axios from "axios";
import { BACKEND_URL } from "../config";
import { toast } from 'sonner';

const styles = {
    card: {
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        padding: "24px",
        maxWidth: "60%",
        background: "#fff",
        boxShadow: "0 4px 6px rgba(0,0,0,0.07)",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        margin: "16px auto",
        transition: "all 0.3s ease",
    },
    headerRow: {
        display: "flex",
        flexDirection: "row",
        gap: "24px",
        marginBottom: 20,
        maxWidth: "100%",
    },
    imageContainer: {
        flexShrink: 0,
        width: 140,
        height: 200,
        borderRadius: 8,
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        backgroundColor: "#f7fafc",
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
        minWidth: 0,
    },
    title: {
        margin: 0,
        fontSize: "clamp(18px, 4vw, 22px)",
        color: "#1a202c",
        fontWeight: 700,
        lineHeight: 1.3,
        marginBottom: 8,
    },
    subtitle: {
        margin: 0,
        color: "#718096",
        fontSize: "clamp(13px, 3vw, 14px)",
        marginBottom: 16,
        fontWeight: 500,
    },
    metaContainer: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: "12px",
    },
    field: {
        display: "flex",
        flexDirection: "column",
        padding: "4px 6px",
        backgroundColor: "#f7fafc",
        borderRadius: 6,
        border: "1px solid #e2e8f0",
    },
    label: {
        color: "#4a5568",
        fontSize: 11,
        marginBottom: 4,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        fontWeight: 600,
    },
    value: {
        color: "#2d3748",
        fontWeight: 500,
        fontSize: "clamp(13px, 3vw, 14px)",
        lineHeight: 1.4,
        wordBreak: "break-word",
    },
    actions: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 20,
        paddingTop: 20,
        borderTop: "1px solid #e2e8f0",
        gap: 16,
        flexWrap: "wrap",
    },
    button: {
        background: "linear-gradient(135deg, #001261ff 0%, #320064ff 100%)",
        color: "#fff",
        border: "none",
        padding: "12px 24px",
        borderRadius: 8,
        cursor: "pointer",
        fontSize: "clamp(14px, 3vw, 15px)",
        fontWeight: 600,
        transition: "all 0.3s ease",
        boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
        flex: "1 1 auto",
        minWidth: "140px",
        maxWidth: "200px",
    },
    statusBadge: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 16px",
        borderRadius: 20,
        fontSize: "clamp(13px, 3vw, 14px)",
        fontWeight: 600,
        whiteSpace: "nowrap",
    },
    availableBadge: {
        backgroundColor: "#d4edda",
        color: "#155724",
        border: "1px solid #c3e6cb",
    },
    unavailableBadge: {
        backgroundColor: "#f8d7da",
        color: "#721c24",
        border: "1px solid #f5c6cb",
    },
};

const BookComponent = ({ book }) => {
    const {
        isbn_id,
        title,
        author,
        genre,
        publication,
        lang,
        doc_type,
        status,
    } = book;

    const url = `https://covers.openlibrary.org/b/isbn/${isbn_id}-M.jpg`;
    const isAvailable = status === "AVAILABLE";
    const { state, dispatch } = useAuthContext();
    const { user } = state;

    const createReservation = async (book) => {
        console.log("Creating reservation for book:", book);
        console.log("User ID:", user?.uid);
        console.log("ISBN ID:", book.isbn_id);
        console.log("Library ID:", book.library_id);
        try {
            const response = await axios.post(`${BACKEND_URL}/reservations`, {
                uid: user?.uid,
                isbn_id: book?.isbn_id,
                library_id: book?.library_id,
            });
            console.log("Reservation response:", response.data);
            if(response) {
                toast.success(response.data.message);
            }
            else {
                toast.error("Failed to create reservation.");
            }
        } catch (error) {
            console.error("Error creating reservation:", error);
        }
    }
    // console.log(user);

    return (
        <div style={styles.card} data-testid="book-component" className="book-card">
            <div style={styles.headerRow} className="book-header">
                {/* Book Image */}
                <div style={styles.imageContainer}>
                    <img 
                        src={url} 
                        alt={title} 
                        style={styles.bookImage}
                        onError={(e) => {
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 200"%3E%3Crect fill="%23e2e8f0" width="140" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%234a5568" font-family="Arial" font-size="14"%3ENo Cover%3C/text%3E%3C/svg%3E';
                        }}
                    />
                </div>

                {/* Book Details */}
                <div style={styles.textContainer}>
                    <h2 style={styles.title}>{title || "Untitled"}</h2>
                    <div style={styles.subtitle}>by {author || "Unknown Author"}</div>

                    <div style={styles.metaContainer}>
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
                            <div style={styles.label}>Document Type</div>
                            <div style={styles.value}>{doc_type || "N/A"}</div>
                        </div>
                    </div>
                     {/* Actions Row */}
            <div style={styles.actions}>
                <div
                    style={{
                        ...styles.statusBadge,
                        ...(isAvailable ? styles.availableBadge : styles.unavailableBadge),
                    }}
                >
                    <FontAwesomeIcon icon={isAvailable ? faCheck : faXmark} />
                    {isAvailable ? "Available Now" : "Not Available"}
                </div>
                <button onClick={() => createReservation(book)} style={styles.button} className="reserve-btn">
                    Reserve Book
                </button>
            </div>
                </div>
            </div>

           
        </div>
    );
};

// Add responsive styles and hover effects
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
        .book-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(0,0,0,0.1) !important;
        }
        
        .reserve-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5) !important;
        }
        
        .reserve-btn:active {
            transform: translateY(0);
        }
        
        /* Mobile optimizations */
        @media (max-width: 768px) {
            .book-card {
                max-width: 100% !important;
            }
        }
        
        @media (max-width: 640px) {
            .book-header {
                flex-direction: column !important;
                align-items: center !important;
            }
            
            .book-card {
                padding: 16px !important;
            }
                .book-card {
                max-width: 100% !important;
            }
        }
        
        @media (max-width: 480px) {
            .book-header > div:first-child {
                width: 120px !important;
                height: 172px !important;
            }
                .book-card {
                max-width: 100% !important;
            }
        }
    `;
    
    if (!document.head.querySelector('style[data-book-component]')) {
        styleSheet.setAttribute('data-book-component', 'true');
        document.head.appendChild(styleSheet);
    }
}

export default BookComponent;