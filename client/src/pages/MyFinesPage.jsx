import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    CreditCard,
    Clock,
    CheckCircle,
    XCircle,
    Loader2,
    Wallet,
    AlertCircle,
} from "lucide-react";
import useAuthContext from '../hooks/useAuthContext';

const MyFinesPage = () => {
    const { state } = useAuthContext();
    const [fines, setFines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFine, setSelectedFine] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState("");
    const [sbiDtu, setSbiDtu] = useState("");

    useEffect(() => {
        const fetchFines = async () => {
            console.log("Fetching fines for user ID:", state.user);
            
            try {
                const response = await axios.get(`http://localhost:3000/fines/user/${state.user.uid}`);
                setFines(response.data ?? []);
            } catch (err) {
                console.error("Error fetching fines:", err);
                setError("Failed to load fines. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchFines();
    }, []);

    const handlePayFine = async (fineId) => {
        if (!sbiDtu.trim()) {
            alert("Please enter your SBI DTU number");
            return;
        }

        setProcessing(true);
        try {
            await axios.post(`http://localhost:3000/fines/pay/${fineId}`, {
                sbi_dtu: sbiDtu
            });
            setFines((prev) =>
                prev.map((f) => (f.id === fineId ? { ...f, status: "PAID" } : f))
            );
            setSelectedFine(null);
            setSbiDtu("");
        } catch (err) {
            console.error("Error paying fine:", err);
            alert("Failed to process payment. Try again.");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div style={styles.centerContainer}>
                <Loader2 style={styles.spinner} size={40} />
                <p style={styles.loadingText}>Loading your fines...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.centerContainer}>
                <AlertCircle color="#E53E3E" size={48} />
                <p style={{ ...styles.loadingText, color: "#E53E3E" }}>{error}</p>
            </div>
        );
    }

    if (!fines.length) {
        return (
            <div style={styles.centerContainer}>
                <CheckCircle color="#38A169" size={60} />
                <p style={styles.emptyText}>You have no outstanding fines 🎉</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <Wallet size={36} color="#553C9A" />
                <h2 style={styles.heading}>My Fines</h2>
                <p style={styles.subtitle}>View and manage your overdue fines</p>
            </div>

            <div style={styles.cardsGrid}>
                {fines.map((fine) => (
                    <div
                        key={fine.id}
                        style={{
                            ...styles.card,
                            borderLeftColor: fine.status === "PAID" ? "#38A169" : "#E53E3E",
                        }}
                    >
                        <div style={styles.cardHeader}>
                            <h3 style={styles.bookTitle}>{fine.book_title ?? "Unknown Book"}</h3>
                            {fine.status === "PAID" ? (
                                <span style={{ ...styles.statusBadge, backgroundColor: "#C6F6D5", color: "#276749" }}>
                                    PAID
                                </span>
                            ) : (
                                <span style={{ ...styles.statusBadge, backgroundColor: "#FED7D7", color: "#9B2C2C" }}>
                                    UNPAID
                                </span>
                            )}
                        </div>

                        <div style={styles.cardBody}>
                            <div style={styles.detailRow}>
                                <Clock size={16} color="#4A5568" />
                                <span>Due Date: <strong>{fine.due_date?.split("T")[0]}</strong></span>
                            </div>
                            <div style={styles.detailRow}>
                                <CreditCard size={16} color="#4A5568" />
                                <span>Amount: <strong>₹{fine.amount}</strong></span>
                            </div>
                        </div>

                        {fine.status !== "PAID" && (
                            <button
                                style={styles.payButton}
                                onClick={() => setSelectedFine(fine)}
                            >
                                Pay Fine
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {selectedFine && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <h3 style={styles.modalTitle}>Confirm Payment</h3>
                        <p style={styles.modalText}>
                            Are you sure you want to pay <strong>₹{selectedFine.amount}</strong> for{" "}
                            <em>{selectedFine.book_title}</em>?
                        </p>
                        
                        <div style={styles.inputGroup}>
                            <label style={styles.inputLabel}>SBI DTU Number:</label>
                            <input
                                type="text"
                                placeholder="Enter your SBI DTU number"
                                value={sbiDtu}
                                onChange={(e) => setSbiDtu(e.target.value)}
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.modalActions}>
                            <button
                                onClick={() => handlePayFine(selectedFine.id)}
                                style={{
                                    ...styles.modalButton,
                                    backgroundColor: "#2F855A",
                                    color: "#fff",
                                    opacity: processing ? 0.7 : 1,
                                    cursor: processing ? "wait" : "pointer",
                                }}
                                disabled={processing}
                            >
                                {processing ? "Processing..." : "Yes, Pay"}
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedFine(null);
                                    setSbiDtu("");
                                }}
                                style={{
                                    ...styles.modalButton,
                                    backgroundColor: "#E2E8F0",
                                    color: "#2D3748",
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        backgroundColor: "#f7fafc",
        minHeight: "100vh",
        padding: "30px 20px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    header: {
        textAlign: "center",
        marginBottom: 30,
    },
    heading: {
        fontSize: "2rem",
        fontWeight: "700",
        color: "#2D3748",
        marginBottom: 6,
    },
    subtitle: {
        fontSize: "0.95rem",
        color: "#718096",
    },
    cardsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "18px",
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: "18px",
        boxShadow: "0 6px 12px rgba(0,0,0,0.05)",
        borderLeft: "6px solid #E2E8F0",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
    },
    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    bookTitle: {
        fontSize: "1.1rem",
        fontWeight: 600,
        color: "#2D3748",
        margin: 0,
    },
    statusBadge: {
        fontSize: "0.75rem",
        padding: "4px 10px",
        borderRadius: 6,
        fontWeight: 700,
        textTransform: "uppercase",
    },
    cardBody: {
        marginTop: 10,
        marginBottom: 10,
    },
    detailRow: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: "0.9rem",
        color: "#4A5568",
        marginTop: 4,
    },
    payButton: {
        background: "linear-gradient(135deg, #6B46C1 0%, #553C9A 100%)",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        padding: "10px 16px",
        fontWeight: 600,
        fontSize: "0.9rem",
        cursor: "pointer",
        width: "100%",
        transition: "all 0.2s ease",
    },
    modalOverlay: {
        position: "fixed",
        top: 0, left: 0, width: "100%", height: "100%",
        backgroundColor: "rgba(0,0,0,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000,
    },
    modal: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: "24px",
        boxShadow: "0 6px 18px rgba(0,0,0,0.2)",
        maxWidth: "400px",
        width: "90%",
        textAlign: "center",
    },
    modalTitle: {
        fontSize: "1.3rem",
        fontWeight: "700",
        marginBottom: 12,
    },
    modalText: {
        fontSize: "0.95rem",
        color: "#4A5568",
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 20,
        textAlign: "left",
    },
    inputLabel: {
        display: "block",
        fontSize: "0.9rem",
        fontWeight: 600,
        color: "#2D3748",
        marginBottom: 6,
    },
    input: {
        width: "100%",
        padding: "10px 12px",
        border: "1px solid #CBD5E0",
        borderRadius: 6,
        fontSize: "0.9rem",
        outline: "none",
        transition: "border-color 0.2s ease",
    },
    modalActions: {
        display: "flex",
        justifyContent: "center",
        gap: "10px",
    },
    modalButton: {
        border: "none",
        borderRadius: 8,
        padding: "10px 16px",
        fontWeight: 700,
        fontSize: "0.9rem",
    },
    spinner: {
        animation: "spin 1s linear infinite",
    },
    centerContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "80vh",
        gap: 10,
    },
    loadingText: {
        fontSize: "1rem",
        color: "#4A5568",
        fontWeight: 500,
    },
    emptyText: {
        fontSize: "1.2rem",
        color: "#2D3748",
        fontWeight: 600,
        marginTop: 10,
    },
};

export default MyFinesPage;
