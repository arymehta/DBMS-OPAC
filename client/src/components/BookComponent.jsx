import React from "react";
import { Check, X, BookOpen, User, Tag, Building2, Languages, FileText, CalendarClock } from "lucide-react";
import useAuthContext from '../hooks/useAuthContext';
import axios from "axios";
import { BACKEND_URL } from "../config";
import { toast } from 'sonner';

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

    const coverUrl = `https://covers.openlibrary.org/b/isbn/${isbn_id}-M.jpg`;
    console.log("Cover URL:", coverUrl);
    const isAvailable = status === "AVAILABLE";
    const { state } = useAuthContext();
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
            if (response) {
                toast.success(response.data.message);
            } else {
                toast.error("Failed to create reservation.");
            }
        } catch (error) {
            console.error("Error creating reservation:", error);
            toast.error("Failed to create reservation.");
        }
    };

    return (
        <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/60 transition-all duration-300 overflow-hidden h-full flex flex-col">
            {/* Book Cover */}
            <div className="relative bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4 min-h-[200px]">
                <img
                    src={coverUrl}
                    alt={title}
                    className="max-h-44 w-auto object-contain rounded-lg shadow-md group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                    }}
                />
                <div className="hidden absolute inset-0 items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
                    <BookOpen size={48} className="text-indigo-300" />
                </div>
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${
                        isAvailable 
                            ? 'bg-emerald-500 text-white' 
                            : 'bg-red-500 text-white'
                    }`}>
                        {isAvailable ? <Check size={14} /> : <X size={14} />}
                        {isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-grow">
                {/* Title & Author */}
                <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors mb-1">
                        {title || "Untitled"}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1.5">
                        <User size={14} className="text-gray-400" />
                        {author || "Unknown Author"}
                    </p>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-2 mb-5 flex-grow">
                    <div className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-lg">
                        <Tag size={14} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Genre</p>
                            <p className="text-sm font-medium text-gray-700 truncate">{genre || "N/A"}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-lg">
                        <Building2 size={14} className="text-purple-500 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Publisher</p>
                            <p className="text-sm font-medium text-gray-700 truncate">{publication || "N/A"}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-lg">
                        <Languages size={14} className="text-teal-500 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Language</p>
                            <p className="text-sm font-medium text-gray-700 truncate">{lang || "N/A"}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-lg">
                        <FileText size={14} className="text-orange-500 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Type</p>
                            <p className="text-sm font-medium text-gray-700 truncate">{doc_type || "N/A"}</p>
                        </div>
                    </div>
                </div>

                {/* Reserve Button */}
                <button
                    onClick={() => createReservation(book)}
                    disabled={!isAvailable}
                    className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                        isAvailable
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                >
                    <CalendarClock size={18} />
                    {isAvailable ? 'Reserve This Book' : 'Currently Unavailable'}
                </button>
            </div>
        </div>
    );
};

export default BookComponent;