import { BookOpen, Plus, FileText, Users, Calendar, AlertTriangle, RotateCcw, Library, Clock, CheckCircle, BookMarked, Hash, User, CalendarDays, Loader2, Building2, MapPin, Phone, Mail, Clock3 } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { toast } from 'sonner';


export const AdminDashboard = () => {
    const [activeSection, setActiveSection] = useState('issue');
    const [issueForm, setIssueForm] = useState({
        uid: '',
        book_id: '',
        due_date: ''
    });
    const [isSubmittingIssue, setIsSubmittingIssue] = useState(false);
    const [returnForm, setReturnForm] = useState({
        book_id: ''
    });
    const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);
    const [libraryForm, setLibraryForm] = useState({
        name: '',
        street: '',
        city: '',
        state: '',
        zip_code: '',
        contact_number: '',
        email: '',
        opening_hours: '',
        closing_hours: ''
    });
    const [isSubmittingLibrary, setIsSubmittingLibrary] = useState(false);
    const [bookForm, setBookForm] = useState({
        isbn_id: '',
        title: '',
        author: '',
        genre: '',
        publication: '',
        lang: '',
        pages: '',
        doc_type: '',
        library_id: '',
        dewey_dec_loc: '',
        uid: ''
    });
    const [numBooks, setNumBooks] = useState(0);
    const [numMembers, setNumMembers] = useState(0);
    const [numActiveIssues, setNumActiveIssues] = useState(0);
    const [numOverdueIssues, setNumOverdueIssues] = useState(0);
    const [issueHistory, setIssueHistory] = useState([]);
    const [libraries, setLibraries] = useState([]);

    useEffect(() => {
        const getDashboardStats = async () => {
            try {
                const membersResponse = await axios.get(`${BACKEND_URL}/members/num-members`);
                const issuesResponse = await axios.get(`${BACKEND_URL}/issues/total-issues`);
                const booksResponse = await axios.get(`${BACKEND_URL}/books/get/total-books`);
                const issueHistoryResponse = await axios.get(`${BACKEND_URL}/issues/issue-history`);
                const librariesResponse = await axios.get(`${BACKEND_URL}/library/all`);
                setNumBooks(booksResponse.data.data);
                setNumMembers(membersResponse.data.data);
                setNumActiveIssues(issuesResponse.data.data.active_issues);
                setNumOverdueIssues(issuesResponse.data.data.overdue_issues);
                console.log("Issue History:", issueHistoryResponse.data.data);
                setIssueHistory(issueHistoryResponse.data.data);
                setLibraries(librariesResponse.data.data || []);
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            }
        };

        getDashboardStats();
    }, []);

    const stats = [
        { label: 'Total Books', value: numBooks, icon: BookOpen, gradient: 'from-blue-500 to-blue-600', bgLight: 'bg-blue-50', textColor: 'text-blue-600' },
        { label: 'Total Members', value: numMembers, icon: Users, gradient: 'from-purple-500 to-purple-600', bgLight: 'bg-purple-50', textColor: 'text-purple-600' },
        { label: 'Active Issues', value: numActiveIssues, icon: CheckCircle, gradient: 'from-emerald-500 to-emerald-600', bgLight: 'bg-emerald-50', textColor: 'text-emerald-600' },
        { label: 'Overdue Issues', value: numOverdueIssues, icon: AlertTriangle, gradient: 'from-rose-500 to-rose-600', bgLight: 'bg-rose-50', textColor: 'text-rose-600' }
    ]
    const recentIssues = [
        { id: 1, member: 'John Doe', book: 'Clean Code', date: '2025-11-02', due: '2025-11-16' },
        { id: 2, member: 'Jane Smith', book: 'Design Patterns', date: '2025-11-01', due: '2025-11-15' },
        { id: 3, member: 'Bob Wilson', book: 'The Pragmatic Programmer', date: '2025-11-01', due: '2025-11-15' }
    ];

    const handleIssueSubmit = async (e) => {
        e.preventDefault();
        if (isSubmittingIssue) return;

        // Validate form (due_date is optional)
        if (!issueForm.uid || !issueForm.book_id) {
            toast.error("Please fill in Member ID and Book ID");
            return;
        }

        setIsSubmittingIssue(true);
        const requestBody = {
            book_id: issueForm.book_id,
            uid: issueForm.uid,
            due_date: issueForm.due_date
        };
        console.log('Issue Book:', requestBody);
        try {
            const response = await axios.post(`${BACKEND_URL}/issues`, requestBody);

            // Check if the message indicates success or failure
            if (response.data.message === "Book issued successfully") {
                toast.success("Book issued successfully!");
                setIssueForm({ uid: '', book_id: '', due_date: '' });
            } else {
                // Backend returned an error message with 200 status
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Error issuing book:", error);
            const errorMessage = error.response?.data?.error || "Failed to issue book";
            toast.error(errorMessage);
        } finally {
            setIsSubmittingIssue(false);
        }
    };

    const handleAddBookSubmit = async (e) => {
        e.preventDefault();
        console.log('Add Book:', bookForm);
        try {
            for (let i = 0; i < (bookForm.copies || 1); i++) {
                await axios.post(`${BACKEND_URL}/isbn/add`, bookForm);
            }
            toast.success("Book added successfully!");
            setBookForm({
                isbn_id: '',
                title: '',
                author: '',
                genre: '',
                publication: '',
                lang: '',
                pages: '',
                doc_type: '',
                library_id: '',
                dewey_dec_loc: '',
                uid: '',
                copies: ''
            });
        } catch (error) {
            console.error("Error adding book:", error);
            toast.error("Failed to add book. Please check the details and try again.");
        }
    };

    const handleReturnSubmit = async (e) => {
        e.preventDefault();
        if (isSubmittingReturn) return;

        // Validate form
        if (!returnForm.book_id) {
            toast.error("Please enter Book ID");
            return;
        }

        setIsSubmittingReturn(true);
        console.log('Return Book:', returnForm);
        try {
            const response = await axios.patch(`${BACKEND_URL}/issues/${returnForm.book_id}/return`);

            // Check if the message indicates success or failure
            if (response.data.message === "Book returned successfully") {
                toast.success("Book returned successfully!");
                setReturnForm({ book_id: '' });
            } else {
                // Backend returned an error message with 200 status
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Error returning book:", error);
            const errorMessage = error.response?.data?.error || "Failed to return book";
            toast.error(errorMessage);
        } finally {
            setIsSubmittingReturn(false);
        }
    };

    const handleAddLibrarySubmit = async (e) => {
        e.preventDefault();
        if (isSubmittingLibrary) return;

        // Validate required fields
        if (!libraryForm.name || !libraryForm.city || !libraryForm.state) {
            toast.error("Please fill in Library Name, City, and State");
            return;
        }

        setIsSubmittingLibrary(true);
        console.log('Add Library:', libraryForm);
        try {
            const response = await axios.post(`${BACKEND_URL}/library/add`, libraryForm);

            if (response.data.message === "Library added successfully") {
                toast.success("Library added successfully!");
                setLibraryForm({
                    name: '',
                    street: '',
                    city: '',
                    state: '',
                    zip_code: '',
                    contact_number: '',
                    email: '',
                    opening_hours: '',
                    closing_hours: ''
                });
            } else {
                toast.error(response.data.message || "Failed to add library");
            }
        } catch (error) {
            console.error("Error adding library:", error);
            const errorMessage = error.response?.data?.message || "Failed to add library";
            toast.error(errorMessage);
        } finally {
            setIsSubmittingLibrary(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Decorative Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-10">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30">
                            <Library className="text-white" size={32} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
                                Admin Dashboard
                            </h1>
                            <p className="text-gray-500 mt-1 flex items-center gap-2">
                                <Clock size={16} />
                                Manage your library system efficiently
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                        >
                            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.gradient} opacity-5 rounded-bl-full group-hover:opacity-10 transition-opacity`}></div>
                            <div className="flex items-start justify-between relative">
                                <div>
                                    <p className="text-gray-500 text-sm font-medium mb-2">{stat.label}</p>
                                    <p className="text-4xl font-bold text-gray-900 tracking-tight">{stat.value.toLocaleString()}</p>
                                </div>
                                <div className={`${stat.bgLight} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                                    <stat.icon className={stat.textColor} size={24} />
                                </div>
                            </div>
                            <div className={`mt-4 h-1 rounded-full bg-gradient-to-r ${stat.gradient} opacity-60`}></div>
                        </div>
                    ))}
                </div>

                {/* Main Action Section */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/40 mb-10 overflow-hidden">
                    {/* Tab Navigation */}
                    <div className="flex border-b border-gray-100 bg-gray-50/50">
                        <button
                            onClick={() => setActiveSection('issue')}
                            className={`relative px-8 py-5 font-semibold whitespace-nowrap transition-all duration-300 flex items-center gap-3 ${activeSection === 'issue'
                                ? 'text-blue-600 bg-white'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                                }`}
                        >
                            <div className={`p-2 rounded-lg transition-colors ${activeSection === 'issue' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                <FileText size={18} className={activeSection === 'issue' ? 'text-blue-600' : 'text-gray-500'} />
                            </div>
                            Issue Book
                            {activeSection === 'issue' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveSection('return')}
                            className={`relative px-8 py-5 font-semibold whitespace-nowrap transition-all duration-300 flex items-center gap-3 ${activeSection === 'return'
                                ? 'text-emerald-600 bg-white'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                                }`}
                        >
                            <div className={`p-2 rounded-lg transition-colors ${activeSection === 'return' ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                                <RotateCcw size={18} className={activeSection === 'return' ? 'text-emerald-600' : 'text-gray-500'} />
                            </div>
                            Return Book
                            {activeSection === 'return' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveSection('add')}
                            className={`relative px-8 py-5 font-semibold whitespace-nowrap transition-all duration-300 flex items-center gap-3 ${activeSection === 'add'
                                ? 'text-purple-600 bg-white'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                                }`}
                        >
                            <div className={`p-2 rounded-lg transition-colors ${activeSection === 'add' ? 'bg-purple-100' : 'bg-gray-100'}`}>
                                <Plus size={18} className={activeSection === 'add' ? 'text-purple-600' : 'text-gray-500'} />
                            </div>
                            Add Book
                            {activeSection === 'add' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveSection('library')}
                            className={`relative px-8 py-5 font-semibold whitespace-nowrap transition-all duration-300 flex items-center gap-3 ${activeSection === 'library'
                                ? 'text-amber-600 bg-white'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                                }`}
                        >
                            <div className={`p-2 rounded-lg transition-colors ${activeSection === 'library' ? 'bg-amber-100' : 'bg-gray-100'}`}>
                                <Building2 size={18} className={activeSection === 'library' ? 'text-amber-600' : 'text-gray-500'} />
                            </div>
                            Add Library
                            {activeSection === 'library' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500"></div>
                            )}
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="w-full p-8 lg:p-10">
                        {activeSection === 'issue' && (
                            <div className="animate-in fade-in duration-300">
                                <div className="text-center mb-8">
                                    <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-2xl mb-4">
                                        <FileText className="text-blue-600" size={28} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">Issue Book to Member</h2>
                                    <p className="text-gray-500 mt-2">Assign a book to a library member</p>
                                </div>
                                <div className="max-w-xl mx-auto">
                                    <div className="space-y-5">
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                <span className="flex items-center gap-2">
                                                    <User size={16} className="text-gray-400" />
                                                    Member ID
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                value={issueForm.uid}
                                                onChange={(e) => setIssueForm({ ...issueForm, uid: e.target.value ? parseInt(e.target.value) : '' })}
                                                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-gray-50/50 hover:bg-white"
                                                placeholder="Enter member ID"
                                            />
                                        </div>

                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                <span className="flex items-center gap-2">
                                                    <BookMarked size={16} className="text-gray-400" />
                                                    Book ID
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                value={issueForm.book_id}
                                                onChange={(e) => setIssueForm({ ...issueForm, book_id: e.target.value ? parseInt(e.target.value) : '' })}
                                                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-gray-50/50 hover:bg-white"
                                                placeholder="Enter book ID"
                                            />
                                        </div>
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                <span className="flex items-center gap-2">
                                                    <CalendarDays size={16} className="text-gray-400" />
                                                    Due Date
                                                    <span className="text-xs text-gray-400 font-normal">(Optional)</span>
                                                </span>
                                            </label>
                                            <input
                                                type="date"
                                                value={issueForm.due_date}
                                                onChange={(e) => setIssueForm({ ...issueForm, due_date: e.target.value })}
                                                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-gray-50/50 hover:bg-white"
                                            />
                                        </div>

                                        <button
                                            onClick={handleIssueSubmit}
                                            disabled={isSubmittingIssue}
                                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-6 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 flex items-center justify-center gap-2"
                                        >
                                            {isSubmittingIssue ? (
                                                <>
                                                    <Loader2 size={20} className="animate-spin" />
                                                    Issuing...
                                                </>
                                            ) : (
                                                <>
                                                    <FileText size={20} />
                                                    Issue Book
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'return' && (
                            <div className="animate-in fade-in duration-300">
                                <div className="text-center mb-8">
                                    <div className="inline-flex items-center justify-center p-3 bg-emerald-100 rounded-2xl mb-4">
                                        <RotateCcw className="text-emerald-600" size={28} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">Return Book</h2>
                                    <p className="text-gray-500 mt-2">Process a book return from a member</p>
                                </div>
                                <div className="max-w-xl mx-auto">
                                    <div className="space-y-5">
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                <span className="flex items-center gap-2">
                                                    <BookMarked size={16} className="text-gray-400" />
                                                    Book ID
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                value={returnForm.book_id}
                                                onChange={(e) => setReturnForm({ ...returnForm, book_id: e.target.value ? parseInt(e.target.value) : '' })}
                                                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 bg-gray-50/50 hover:bg-white"
                                                placeholder="Enter book ID to return"
                                            />
                                        </div>

                                        <button
                                            onClick={handleReturnSubmit}
                                            disabled={isSubmittingReturn}
                                            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold px-6 py-4 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 flex items-center justify-center gap-2"
                                        >
                                            {isSubmittingReturn ? (
                                                <>
                                                    <Loader2 size={20} className="animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <RotateCcw size={20} />
                                                    Return Book
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/*       isbn_id: '',
      title : '',
      author: ''    ,
      genre: '',
      publication: '',
      lang: '',
      pages: '',
      doc_type: '',
      library_id: '',
      dewey_dec_loc: '',
      uid: '' */}
                        {activeSection === 'add' && (
                            <div className="animate-in fade-in duration-300">
                                <div className="text-center mb-8">
                                    <div className="inline-flex items-center justify-center p-3 bg-purple-100 rounded-2xl mb-4">
                                        <Plus className="text-purple-600" size={28} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">Add New Book</h2>
                                    <p className="text-gray-500 mt-2">Add a new book to the library collection</p>
                                </div>
                                <div className="max-w-4xl mx-auto">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                        <div className="group md:col-span-2 lg:col-span-1">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                <span className="flex items-center gap-2">
                                                    <BookOpen size={16} className="text-gray-400" />
                                                    Title <span className="text-red-400">*</span>
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                value={bookForm.title}
                                                onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-gray-50/50 hover:bg-white"
                                                placeholder="Book title"
                                            />
                                        </div>

                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                <span className="flex items-center gap-2">
                                                    <User size={16} className="text-gray-400" />
                                                    Author <span className="text-red-400">*</span>
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                value={bookForm.author}
                                                onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-gray-50/50 hover:bg-white"
                                                placeholder="Author name"
                                            />
                                        </div>

                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                <span className="flex items-center gap-2">
                                                    <Hash size={16} className="text-gray-400" />
                                                    ISBN <span className="text-red-400">*</span>
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                value={bookForm.isbn_id}
                                                onChange={(e) => setBookForm({ ...bookForm, isbn_id: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-gray-50/50 hover:bg-white"
                                                placeholder="ISBN number"
                                            />
                                        </div>

                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Publisher
                                            </label>
                                            <input
                                                type="text"
                                                value={bookForm.publication}
                                                onChange={(e) => setBookForm({ ...bookForm, publication: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-gray-50/50 hover:bg-white"
                                                placeholder="Publisher name"
                                            />
                                        </div>


                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Category <span className="text-red-400">*</span>
                                            </label>
                                            <select
                                                value={bookForm.genre}
                                                onChange={(e) => setBookForm({ ...bookForm, genre: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-gray-50/50 hover:bg-white appearance-none cursor-pointer"
                                            >
                                                <option value="">Select category</option>
                                                <option value="fiction">Fiction</option>
                                                <option value="non-fiction">Non-Fiction</option>
                                                <option value="science">Science</option>
                                                <option value="technology">Technology</option>
                                                <option value="history">History</option>
                                                <option value="biography">Biography</option>
                                                <option value="reference">Reference</option>
                                            </select>
                                        </div>

                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Number of Copies
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={bookForm.copies}
                                                onChange={(e) => setBookForm({ ...bookForm, copies: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-gray-50/50 hover:bg-white"
                                                placeholder="1"
                                            />
                                        </div>

                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Pages
                                            </label>
                                            <input
                                                type="text"
                                                value={bookForm.pages}
                                                onChange={(e) => setBookForm({ ...bookForm, pages: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-gray-50/50 hover:bg-white"
                                                placeholder="e.g., 300"
                                            />
                                        </div>

                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Language
                                            </label>
                                            <input
                                                type="text"
                                                value={bookForm.lang}
                                                onChange={(e) => setBookForm({ ...bookForm, lang: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-gray-50/50 hover:bg-white"
                                                placeholder="e.g., English"
                                            />
                                        </div>

                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Document Type
                                            </label>
                                            <input
                                                type="text"
                                                value={bookForm.doc_type}
                                                onChange={(e) => setBookForm({ ...bookForm, doc_type: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-gray-50/50 hover:bg-white"
                                                placeholder="e.g., Hardcover"
                                            />
                                        </div>
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Shelf Location
                                            </label>
                                            <input
                                                type="text"
                                                value={bookForm.dewey_dec_loc}
                                                onChange={(e) => setBookForm({ ...bookForm, dewey_dec_loc: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-gray-50/50 hover:bg-white"
                                                placeholder="e.g., A-23"
                                            />
                                        </div>
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Library
                                            </label>
                                            <select
                                                value={bookForm.library_id}
                                                onChange={(e) => setBookForm({ ...bookForm, library_id: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-gray-50/50 hover:bg-white appearance-none cursor-pointer"
                                            >
                                                <option value="">Select a library</option>
                                                {libraries.map((lib) => (
                                                    <option key={lib.library_id} value={lib.library_id}>
                                                        {lib.name} ({lib.city}, {lib.state})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleAddBookSubmit}
                                        className="w-full mt-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold px-6 py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 flex items-center justify-center gap-2"
                                    >
                                        <Plus size={20} />
                                        Add Book to Library
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeSection === 'library' && (
                            <div className="animate-in fade-in duration-300">
                                <div className="text-center mb-8">
                                    <div className="inline-flex items-center justify-center p-3 bg-amber-100 rounded-2xl mb-4">
                                        <Building2 className="text-amber-600" size={28} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">Add New Library</h2>
                                    <p className="text-gray-500 mt-2">Register a new library branch in the system</p>
                                </div>
                                <div className="max-w-4xl mx-auto">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                        <div className="group md:col-span-2 lg:col-span-1">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                <span className="flex items-center gap-2">
                                                    <Building2 size={16} className="text-gray-400" />
                                                    Library Name <span className="text-red-400">*</span>
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                value={libraryForm.name}
                                                onChange={(e) => setLibraryForm({ ...libraryForm, name: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 bg-gray-50/50 hover:bg-white"
                                                placeholder="e.g., Central Library"
                                            />
                                        </div>

                                        <div className="group md:col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                <span className="flex items-center gap-2">
                                                    <MapPin size={16} className="text-gray-400" />
                                                    Street Address
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                value={libraryForm.street}
                                                onChange={(e) => setLibraryForm({ ...libraryForm, street: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 bg-gray-50/50 hover:bg-white"
                                                placeholder="123 Main Street"
                                            />
                                        </div>

                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                City <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={libraryForm.city}
                                                onChange={(e) => setLibraryForm({ ...libraryForm, city: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 bg-gray-50/50 hover:bg-white"
                                                placeholder="City name"
                                            />
                                        </div>

                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                State <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={libraryForm.state}
                                                onChange={(e) => setLibraryForm({ ...libraryForm, state: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 bg-gray-50/50 hover:bg-white"
                                                placeholder="State name"
                                            />
                                        </div>

                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                ZIP Code
                                            </label>
                                            <input
                                                type="text"
                                                value={libraryForm.zip_code}
                                                onChange={(e) => setLibraryForm({ ...libraryForm, zip_code: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 bg-gray-50/50 hover:bg-white"
                                                placeholder="e.g., 411001"
                                            />
                                        </div>

                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                <span className="flex items-center gap-2">
                                                    <Phone size={16} className="text-gray-400" />
                                                    Contact Number
                                                </span>
                                            </label>
                                            <input
                                                type="tel"
                                                value={libraryForm.contact_number}
                                                onChange={(e) => setLibraryForm({ ...libraryForm, contact_number: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 bg-gray-50/50 hover:bg-white"
                                                placeholder="+91 9876543210"
                                            />
                                        </div>

                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                <span className="flex items-center gap-2">
                                                    <Mail size={16} className="text-gray-400" />
                                                    Email Address
                                                </span>
                                            </label>
                                            <input
                                                type="email"
                                                value={libraryForm.email}
                                                onChange={(e) => setLibraryForm({ ...libraryForm, email: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 bg-gray-50/50 hover:bg-white"
                                                placeholder="library@example.com"
                                            />
                                        </div>

                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                <span className="flex items-center gap-2">
                                                    <Clock3 size={16} className="text-gray-400" />
                                                    Opening Hours
                                                </span>
                                            </label>
                                            <input
                                                type="time"
                                                value={libraryForm.opening_hours}
                                                onChange={(e) => setLibraryForm({ ...libraryForm, opening_hours: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 bg-gray-50/50 hover:bg-white"
                                            />
                                        </div>

                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                <span className="flex items-center gap-2">
                                                    <Clock3 size={16} className="text-gray-400" />
                                                    Closing Hours
                                                </span>
                                            </label>
                                            <input
                                                type="time"
                                                value={libraryForm.closing_hours}
                                                onChange={(e) => setLibraryForm({ ...libraryForm, closing_hours: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 bg-gray-50/50 hover:bg-white"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleAddLibrarySubmit}
                                        disabled={isSubmittingLibrary}
                                        className="w-full mt-8 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold px-6 py-4 rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 flex items-center justify-center gap-2"
                                    >
                                        {isSubmittingLibrary ? (
                                            <>
                                                <Loader2 size={20} className="animate-spin" />
                                                Adding Library...
                                            </>
                                        ) : (
                                            <>
                                                <Building2 size={20} />
                                                Add Library
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Issues */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden">
                    <div className="p-6 lg:p-8 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 rounded-xl">
                                    <Calendar className="text-indigo-600" size={22} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Recent Issues</h2>
                                    <p className="text-gray-500 text-sm">Latest book issues and their status</p>
                                </div>
                            </div>
                            <span className="px-3 py-1.5 bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-full">
                                {issueHistory.length} Records
                            </span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/80">
                                    <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Member ID</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Book ID</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Issue Date</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Due Date</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {issueHistory.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <BookOpen size={48} className="mb-3 opacity-50" />
                                                <p className="font-medium">No issue records found</p>
                                                <p className="text-sm">Issue history will appear here</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    issueHistory.map((issue, index) => (
                                        <tr key={index} className="hover:bg-blue-50/50 transition-colors duration-150">
                                            <td className="py-4 px-6">
                                                <span className="font-medium text-gray-900">{issue.uid}</span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-lg text-gray-700 font-mono text-sm">
                                                    <Hash size={14} />
                                                    {issue.book_id}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-gray-600">
                                                <span className="flex items-center gap-2">
                                                    <CalendarDays size={16} className="text-gray-400" />
                                                    {new Date(issue.issued_on).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-gray-600">
                                                <span className="flex items-center gap-2">
                                                    <Clock size={16} className="text-gray-400" />
                                                    {new Date(issue.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                                                    issue.status === 'ACTIVE' 
                                                        ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200' 
                                                        : issue.status === 'OVERDUE'
                                                        ? 'bg-rose-100 text-rose-700 ring-1 ring-rose-200'
                                                        : 'bg-gray-100 text-gray-700 ring-1 ring-gray-200'
                                                }`}>
                                                    {issue.status === 'ACTIVE' && <CheckCircle size={14} />}
                                                    {issue.status === 'OVERDUE' && <AlertTriangle size={14} />}
                                                    {issue.status}
                                                </span>
                                            </td>   
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;