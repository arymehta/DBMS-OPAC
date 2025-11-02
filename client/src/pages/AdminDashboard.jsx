import { BookOpen, Plus, FileText, Users, Search, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { toast } from 'sonner';
import { library } from '@fortawesome/fontawesome-svg-core';


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

    useEffect(() => {
        const getDashboardStats = async () => {
            try {
                const membersResponse = await axios.get(`${BACKEND_URL}/members/num-members`);
                const issuesResponse = await axios.get(`${BACKEND_URL}/issues/total-issues`);
                const booksResponse = await axios.get(`${BACKEND_URL}/books/get/total-books`);
                setNumBooks(booksResponse.data.data);
                setNumMembers(membersResponse.data.data);
                setNumActiveIssues(issuesResponse.data.data.active_issues);
                setNumOverdueIssues(issuesResponse.data.data.overdue_issues);
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            }
        };

        getDashboardStats();
    }, []);

    const stats = [
        { label: 'Total Books', value: numBooks, icon: BookOpen, color: 'blue' },
        { label: 'Total Members', value: numMembers, icon: Users, color: 'purple' },
        { label: 'Active Issues', value: numActiveIssues, icon: Calendar, color: 'green' },
        { label: 'Overdue Issues', value: numOverdueIssues, icon: Calendar, color: 'red' }
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
            for(let i=0;i<(bookForm.copies || 1);i++) {
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">OPAC Admin Dashboard</h1>
                    <p className="text-gray-600">Manage your library system</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                                </div>
                                <div className={`bg-${stat.color}-100 p-3 rounded-lg`}>
                                    <stat.icon className={`text-${stat.color}-600`} size={24} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Action Section */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-lg mb-8">
                    {/* Tab Navigation */}
                    <div className="flex border-b border-gray-200 overflow-x-auto">
                        <button
                            onClick={() => setActiveSection('issue')}
                            className={`px-6 py-4 font-semibold whitespace-nowrap transition flex items-center gap-2 ${activeSection === 'issue'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <FileText size={20} />
                            Issue Book
                        </button>
                        <button
                            onClick={() => setActiveSection('return')}
                            className={`px-6 py-4 font-semibold whitespace-nowrap transition flex items-center gap-2 ${activeSection === 'return'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <BookOpen size={20} />
                            Return Book
                        </button>
                        <button
                            onClick={() => setActiveSection('add')}
                            className={`px-6 py-4 font-semibold whitespace-nowrap transition flex items-center gap-2 ${activeSection === 'add'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <Plus size={20} />
                            Add Book
                        </button>
                        <button
                            onClick={() => setActiveSection('search')}
                            className={`px-6 py-4 font-semibold whitespace-nowrap transition flex items-center gap-2 ${activeSection === 'search'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <Search size={20} />
                            Search
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="p-8">
                        {activeSection === 'issue' && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Issue Book to Member</h2>
                                <div className="max-w-2xl">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Member ID 
                                            </label>
                                            <input
                                                type="text"
                                                value={issueForm.uid}
                                                onChange={(e) => setIssueForm({ ...issueForm, uid: e.target.value ? parseInt(e.target.value) : '' })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Enter member ID or email"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Book ID
                                            </label>
                                            <input
                                                type="text"
                                                value={issueForm.book_id}
                                                onChange={(e) => setIssueForm({ ...issueForm, book_id: e.target.value ? parseInt(e.target.value) : '' })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Enter book ID"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Due Date (Optional)
                                            </label>
                                            <input
                                                type="date"
                                                value={issueForm.due_date}
                                                onChange={(e) => setIssueForm({ ...issueForm, due_date: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>

                                        <button
                                            onClick={handleIssueSubmit}
                                            disabled={isSubmittingIssue}
                                            className="w-full bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmittingIssue ? 'Issuing...' : 'Issue Book'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'return' && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Return Book</h2>
                                <div className="max-w-2xl">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Book ID
                                            </label>
                                            <input
                                                type="text"
                                                value={returnForm.book_id}
                                                onChange={(e) => setReturnForm({ ...returnForm, book_id: e.target.value ? parseInt(e.target.value) : '' })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Enter book ID"
                                            />
                                        </div>

                                        <button
                                            onClick={handleReturnSubmit}
                                            disabled={isSubmittingReturn}
                                            className="w-full bg-green-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmittingReturn ? 'Returning...' : 'Return Book'}
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
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Book</h2>
                                <div className="max-w-3xl">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Title *
                                            </label>
                                            <input
                                                type="text"
                                                value={bookForm.title}
                                                onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Book title"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Author *
                                            </label>
                                            <input
                                                type="text"
                                                value={bookForm.author}
                                                onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Author name"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                ISBN *
                                            </label>
                                            <input
                                                type="text"
                                                value={bookForm.isbn_id}
                                                onChange={(e) => setBookForm({ ...bookForm, isbn_id: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="ISBN number"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Publisher
                                            </label>
                                            <input
                                                type="text"
                                                value={bookForm.publication}
                                                onChange={(e) => setBookForm({ ...bookForm, publication: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Publisher name"
                                            />
                                        </div>


                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Category *
                                            </label>
                                            <select
                                                value={bookForm.genre}
                                                onChange={(e) => setBookForm({ ...bookForm, genre: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Number of Copies
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={bookForm.copies}
                                                onChange={(e) => setBookForm({ ...bookForm, copies: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="1"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Pages
                                            </label>
                                            <input
                                                type="text"
                                                value={bookForm.pages}
                                                onChange={(e) => setBookForm({ ...bookForm, pages: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="e.g., 300"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Language
                                            </label>
                                            <input
                                                type="text"
                                                value={bookForm.lang}
                                                onChange={(e) => setBookForm({ ...bookForm, lang: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="e.g., English"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Document Type
                                            </label>
                                            <input
                                                type="text"
                                                value={bookForm.doc_type}
                                                onChange={(e) => setBookForm({ ...bookForm, doc_type: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="e.g., PDF"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Shelf Location
                                            </label>
                                            <input
                                                type="text"
                                                value={bookForm.dewey_dec_loc}
                                                onChange={(e) => setBookForm({ ...bookForm, dewey_dec_loc: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="e.g., A-23"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Library ID
                                            </label>
                                            <input
                                                type="text"
                                                value={bookForm.library_id}
                                                onChange={(e) => setBookForm({ ...bookForm, library_id: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="e.g., 300"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleAddBookSubmit}
                                        className="w-full mt-6 bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                                    >
                                        Add Book to Library
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeSection === 'search' && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Search Books or Members</h2>
                                <div className="max-w-2xl">
                                    <div className="relative mb-6">
                                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="text"
                                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Search by title, author, ISBN, or member name..."
                                        />
                                    </div>
                                    <div className="flex gap-4">
                                        <button className="flex-1 bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                                            Search Books
                                        </button>
                                        <button className="flex-1 bg-purple-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-purple-700 transition">
                                            Search Members
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Issues */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Issues</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Member</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Book</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Issue Date</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Due Date</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentIssues.map((issue) => (
                                    <tr key={issue.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4">{issue.member}</td>
                                        <td className="py-3 px-4">{issue.book}</td>
                                        <td className="py-3 px-4 text-gray-600">{issue.date}</td>
                                        <td className="py-3 px-4 text-gray-600">{issue.due}</td>
                                        <td className="py-3 px-4">
                                            <button className="text-blue-600 hover:text-blue-700 font-semibold">
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;