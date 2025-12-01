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
    X,
    BookOpen,
} from "lucide-react";
import useAuthContext from '../hooks/useAuthContext';
import { BACKEND_URL } from "../config"; 

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
                const response = await axios.get(`${BACKEND_URL}/fines/user/${state.user.uid}`);
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
            await axios.post(`${BACKEND_URL}/fines/pay/${fineId}`, {
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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col items-center justify-center gap-4">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-100 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
                <p className="text-gray-500 font-medium">Loading your fines...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col items-center justify-center gap-4">
                <div className="p-4 bg-red-100 rounded-full">
                    <AlertCircle className="text-red-500" size={48} />
                </div>
                <p className="text-red-600 font-medium">{error}</p>
            </div>
        );
    }

    if (!fines.length) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col items-center justify-center gap-4">
                <div className="p-6 bg-emerald-100 rounded-full">
                    <CheckCircle className="text-emerald-500" size={60} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">All Clear!</h3>
                <p className="text-gray-500">You have no outstanding fines</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Decorative Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
            </div>

            <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl shadow-indigo-500/30 mb-6">
                        <Wallet className="text-white" size={36} />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-900 bg-clip-text text-transparent mb-2">
                        My Fines
                    </h1>
                    <p className="text-gray-500">View and manage your overdue fines</p>
                </div>

                {/* Fines Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {fines.map((fine) => (
                        <div
                            key={fine.id}
                            className={`bg-white/80 backdrop-blur-sm rounded-2xl border overflow-hidden shadow-sm hover:shadow-xl hover:shadow-gray-200/60 transition-all duration-300 ${
                                fine.status === "PAID" ? "border-emerald-200" : "border-red-200"
                            }`}
                        >
                            {/* Status Bar */}
                            <div className={`h-1.5 ${fine.status === "PAID" ? "bg-emerald-500" : "bg-red-500"}`}></div>
                            
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${fine.status === "PAID" ? "bg-emerald-100" : "bg-red-100"}`}>
                                            <BookOpen size={20} className={fine.status === "PAID" ? "text-emerald-600" : "text-red-600"} />
                                        </div>
                                        <h3 className="font-bold text-gray-900 line-clamp-1">
                                            {fine.book_title ?? "Unknown Book"}
                                        </h3>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                        fine.status === "PAID" 
                                            ? "bg-emerald-100 text-emerald-700" 
                                            : "bg-red-100 text-red-700"
                                    }`}>
                                        {fine.status}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-5">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Clock size={16} className="text-gray-400" />
                                        <span>Due: <strong>{fine.due_date?.split("T")[0]}</strong></span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <CreditCard size={16} className="text-gray-400" />
                                        <span>Amount: <strong className="text-lg text-gray-900">₹{fine.amount}</strong></span>
                                    </div>
                                </div>

                                {fine.status !== "PAID" && (
                                    <button
                                        onClick={() => setSelectedFine(fine)}
                                        className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30"
                                    >
                                        Pay Fine
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Payment Modal */}
                {selectedFine && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
                            <button 
                                onClick={() => { setSelectedFine(null); setSbiDtu(""); }}
                                className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-gray-400" />
                            </button>

                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-100 rounded-full mb-4">
                                    <CreditCard className="text-indigo-600" size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Confirm Payment</h3>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                <p className="text-gray-600 text-center">
                                    Pay <span className="text-2xl font-bold text-gray-900">₹{selectedFine.amount}</span>
                                    <br />
                                    <span className="text-sm">for <em className="text-indigo-600">{selectedFine.book_title}</em></span>
                                </p>
                            </div>
                            
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    SBI DTU Number
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter your SBI DTU number"
                                    value={sbiDtu}
                                    onChange={(e) => setSbiDtu(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setSelectedFine(null); setSbiDtu(""); }}
                                    className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handlePayFine(selectedFine.id)}
                                    disabled={processing}
                                    className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-300 disabled:to-gray-300 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/30 disabled:shadow-none flex items-center justify-center gap-2"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        "Confirm Payment"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyFinesPage;
