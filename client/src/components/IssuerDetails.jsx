import moment from 'moment';
import { useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';
import { BACKEND_URL } from '../config';
import axios from 'axios';


export const IssuerDetails = () => {
  const [activeTab, setActiveTab] = useState('reservations');
  // Default dummy data if props not provided
  const { state } = useContext(AuthContext);
  const [reservations, setReservations] = useState([]);
  const [activeIssues, setActiveIssues] = useState([]);
  const [previousIssues, setPreviousIssues] = useState([]);

  useEffect(() => {
    const uid = state.user?.uid;
    const getReservations = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/reservations/${uid}`);
        if (response.status === 200) {
          const data = response?.data;
          setReservations(data);
        } else {
          console.error('Failed to fetch reservations');
        }
      } catch (error) {
        console.error('Error fetching reservations:', error);
      }
    };

    const getActiveIssues = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/issues/active/${uid}`);
        if (response.status === 200) {
          const data = response?.data;
          console.log("activeIssues data:", data);
          setActiveIssues(data);
        } else {
          console.error('Failed to fetch activeIssues');
        }
      } catch (error) {
        console.error('Error fetching activeIssues:', error);
      }
    };

    const getPreviousIssues = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/issues/past/${uid}`);
        if (response.status === 200) {
          const data = response?.data;
          console.log("previousIssues data:", data);
          setPreviousIssues(data);
        } else {
          console.error('Failed to fetch previousIssues');
        }
      } catch (error) {
        console.error('Error fetching previousIssues:', error);
      }
    };
    getReservations();
    getActiveIssues();
    getPreviousIssues();
  }, []);

  const cancelReservation = async (reservationId) => {
    try {
      const response = await axios.delete(`http://localhost:3000/reservations/cancel/${reservationId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log("Cancel reservation response:", response.data);
      toast.success("Reservation canceled successfully");
    } catch (error) {
      console.error("Error canceling reservation:", error);
      toast.error("Failed to cancel reservation");
    }
    setReservations(reservations.filter(reservation => reservation.reservation_id !== reservationId));
  };
  const defaultReservations = [
    {
      id: 1,
      title: 'The Midnight Library',
      author: 'Matt Haig',
      reservedDate: '2025-10-15',
      expiryDate: '2025-11-05',
      status: 'Available'
    },
    {
      id: 2,
      title: 'Atomic Habits',
      author: 'James Clear',
      reservedDate: '2025-10-20',
      expiryDate: '2025-11-10',
      status: 'In Queue (3rd)'
    }
  ];

  const defaultActiveIssues = [
    {
      id: 1,
      title: 'Clean Code',
      description: 'Some description here',
      dueDate: '2025-10-01',
      daysOverdue: 32,
      amount: 16.00
    },
    {
      id: 2,
      title: 'The Pragmatic Programmer',
      description: 'Some description here',
      dueDate: '2025-10-10',
      daysOverdue: 23,
      amount: 11.50
    }
  ];

  const reservationData = reservations || defaultReservations;
  const issueData = activeIssues || defaultActiveIssues;
  const previousIssueData = previousIssues || defaultActiveIssues;
  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {['Reservations', 'Active Issues', 'Previous Issues'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`px-6 py-4 font-semibold whitespace-nowrap transition ${activeTab === tab.toLowerCase()
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'reservations' && (
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Active Reservations</h3>
              {reservationData.length === 0 ? (
                <p className="text-gray-600">No active reservations.</p>
              ) : (
                <div className="space-y-4">
                  {reservationData.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 text-lg mb-1">
                            {reservation.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            <span className="font-semibold">By:</span>{' '}
                            {reservation.author}
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            <span className="font-semibold">At Library:</span>{' '}
                            {reservation.library_name}
                          </p>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">
                                <span className="font-semibold">Expires:</span>{' '}
                                {moment(reservation?.expires_at).format("Do MMMM, YYYY, h:mm a")}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">
                                <span className="font-semibold">Status:</span>{' '}
                              </span>
                              <span
                                className={`font-semibold ${reservation.status === 'RESERVED'
                                  ? 'text-green-600'
                                  : 'text-orange-600'
                                  }`}
                              >
                                {reservation.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button onClick={() => { cancelReservation(reservation?.reservation_id); console.log("Cancel reservation:", reservation.reservation_id) }} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition whitespace-nowrap">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'active issues' && (
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Active Issues</h3>
              {issueData.length === 0 ? (
                <p className="text-gray-600">No active issues.</p>
              ) : (
                <div className="space-y-4">
                  {issueData.map((issue) => (
                    <div
                      key={issue.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-red-300 transition"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 text-lg mb-1">
                            {issue.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {issue.library_name}
                          </p>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <span className="text-gray-600">
                              <span className="font-semibold">Issued On:</span>{' '}
                              {moment(issue?.issued_on).format("Do MMMM, YYYY, h:mm a")}
                            </span>
                            <span className="text-gray-600">
                              <span className="font-semibold">Due:</span>{' '}
                              {moment(issue?.due_date).format("Do MMMM, YYYY, h:mm a")}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <span className="text-gray-600">
                              {moment(issue?.due_date).diff(moment(issue?.issued_on)) > 0 ? (
                                <>
                                  <span className="font-semibold text-green-600">Days Left:{' '}
                                    {moment(issue?.due_date).diff(moment(issue?.issued_on), 'days')}{' '}
                                    days
                                  </span>
                                </>
                              ) : (
                                <span className="font-semibold text-red-600">Overdue : {moment(issue?.due_date).diff(moment(issue?.issued_on), 'days')} days</span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTab === 'previous issues' && (
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Previous Issues</h3>
              {issueData.length === 0 ? (
                <p className="text-gray-600">No previous issues.</p>
              ) : (
                <div className="space-y-4">
                  {previousIssueData.map((issue) => (
                    <div
                      key={issue.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-red-300 transition"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 text-lg mb-1">
                            {issue.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {issue.library_name}
                          </p>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <span className="text-gray-600">
                              <span className="font-semibold">Issued On:</span>{' '}
                              {moment(issue?.issued_on).format("Do MMMM, YYYY, h:mm a")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <br /><br />
    </>
  );
}