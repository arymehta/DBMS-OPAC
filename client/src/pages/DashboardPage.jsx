import React, { useState, useEffect } from "react";
import axios from "axios";
import BookComponent from "../components/BookComponent";
import {
  Search as IconSearch,
  X as IconX,
  BookOpen as IconBookOpen,
  ChevronLeft as IconChevronLeft,
  ChevronRight as IconChevronRight,
  Filter,
  Library,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";
import { BACKEND_URL } from "../config"; 

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
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);
  const booksPerPage = 6;

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BACKEND_URL}/catalog/`);
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
      const response = await axios.post(`${BACKEND_URL}/catalog/`, filters);
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
      const response = await axios.get(`${BACKEND_URL}/catalog/`);
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

  // Generate page numbers with ellipsis for large page counts
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl shadow-indigo-500/30 mb-6">
            <Library className="text-white" size={40} />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-900 bg-clip-text text-transparent mb-4">
            COEP OPAC System
          </h1>
          <p className="text-gray-500 text-lg">
            Search and discover books in our collection
          </p>
        </div>

        {/* Filter Card */}
        <div className="mb-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
            {/* Filter Header */}
            <div 
              className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 cursor-pointer"
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-100 rounded-xl">
                  <SlidersHorizontal className="text-indigo-600" size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Search Filters</h2>
                  <p className="text-sm text-gray-500">Refine your book search</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Available Only Toggle */}
                <label className="flex items-center gap-3 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                  <span className="text-sm font-semibold text-gray-600">Available Only</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={showOnlyAvailable}
                    onClick={() => {
                      setShowOnlyAvailable(!showOnlyAvailable);
                      setCurrentPage(1);
                    }}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                      showOnlyAvailable ? 'bg-emerald-500' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                        showOnlyAvailable ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </label>

                {/* Expand/Collapse Button */}
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <IconChevronLeft 
                    size={20} 
                    className={`text-gray-400 transition-transform duration-300 ${isFilterExpanded ? '-rotate-90' : 'rotate-0'}`}
                  />
                </button>
              </div>
            </div>

            {/* Filter Form */}
            <div className={`transition-all duration-300 ease-in-out ${isFilterExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
              <form onSubmit={handleFilter} className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={filters.title}
                      onChange={handleChange}
                      placeholder="Enter book title"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Author
                    </label>
                    <input
                      type="text"
                      name="author"
                      value={filters.author}
                      onChange={handleChange}
                      placeholder="Enter author name"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Genre
                    </label>
                    <input
                      type="text"
                      name="genre"
                      value={filters.genre}
                      onChange={handleChange}
                      placeholder="Enter genre"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Publication
                    </label>
                    <input
                      type="text"
                      name="publication"
                      value={filters.publication}
                      onChange={handleChange}
                      placeholder="Enter publisher"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Language
                    </label>
                    <input
                      type="text"
                      name="lang"
                      value={filters.lang}
                      onChange={handleChange}
                      placeholder="Enter language"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Document Type
                    </label>
                    <input
                      type="text"
                      name="doc_type"
                      value={filters.doc_type}
                      onChange={handleChange}
                      placeholder="Enter document type"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                  >
                    <IconX size={18} />
                    Clear Filters
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-200"
                  >
                    <IconSearch size={18} />
                    Search Books
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-100 rounded-full"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
              </div>
              <p className="mt-6 text-gray-500 font-medium flex items-center gap-2">
                <Loader2 size={18} className="animate-spin" />
                Loading books...
              </p>
            </div>
          ) : filteredBooks.length > 0 ? (
            <>
              {/* Results Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <IconBookOpen className="text-indigo-600" size={20} />
                  </div>
                  <div>
                    <p className="text-gray-900 font-semibold">
                      Found {filteredBooks.length} book{filteredBooks.length !== 1 ? "s" : ""}
                      {showOnlyAvailable && <span className="text-emerald-600 ml-1">(Available)</span>}
                    </p>
                    {totalPages > 1 && (
                      <p className="text-sm text-gray-500">
                        Showing page {currentPage} of {totalPages}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Books Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {currentBooks.map((book) => (
                  <BookComponent key={book.id} book={book} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 py-8">
                  <button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 font-semibold rounded-xl transition-all duration-200 ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600'
                    }`}
                  >
                    <IconChevronLeft size={18} />
                    Previous
                  </button>

                  <div className="flex items-center gap-1 mx-2">
                    {getPageNumbers().map((pageNum, index) => (
                      pageNum === '...' ? (
                        <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400">...</span>
                      ) : (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`min-w-[42px] h-[42px] rounded-xl font-semibold transition-all duration-200 ${
                            currentPage === pageNum
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                              : 'bg-white border border-gray-200 text-gray-600 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    ))}
                  </div>

                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 font-semibold rounded-xl transition-all duration-200 ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600'
                    }`}
                  >
                    Next
                    <IconChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-20 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-100">
              <div className="p-6 bg-gray-100 rounded-full mb-6">
                <IconBookOpen size={48} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {showOnlyAvailable ? "No available books found" : "No books found"}
              </h3>
              <p className="text-gray-500 text-center max-w-md mb-6">
                {showOnlyAvailable
                  ? "Try turning off the 'Available Only' filter or adjust your search criteria"
                  : "Try adjusting your search filters to find what you're looking for"}
              </p>
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-100 text-indigo-700 font-semibold rounded-xl hover:bg-indigo-200 transition-colors"
              >
                <IconX size={18} />
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;