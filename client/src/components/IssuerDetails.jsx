import { useState } from 'react';

export const IssuerDetails = ({ reservations, fines }) => {
  const [activeTab, setActiveTab] = useState('reservations');

  // Default dummy data if props not provided
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

  const defaultFines = [
    {
      id: 1,
      title: 'Clean Code',
      reason: 'Late return',
      dueDate: '2025-10-01',
      daysOverdue: 32,
      amount: 16.00
    },
    {
      id: 2,
      title: 'The Pragmatic Programmer',
      reason: 'Late return',
      dueDate: '2025-10-10',
      daysOverdue: 23,
      amount: 11.50
    }
  ];

  const reservationData = reservations || defaultReservations;
  const fineData = fines || defaultFines;

  return (
    <>
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {['Reservations', 'Fines'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={`px-6 py-4 font-semibold whitespace-nowrap transition ${
              activeTab === tab.toLowerCase()
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
                          by {reservation.author}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span className="text-gray-600">
                            <span className="font-semibold">Reserved:</span>{' '}
                            {reservation.reservedDate}
                          </span>
                          <span className="text-gray-600">
                            <span className="font-semibold">Expires:</span>{' '}
                            {reservation.expiryDate}
                          </span>
                          <span
                            className={`font-semibold ${
                              reservation.status === 'Available'
                                ? 'text-green-600'
                                : 'text-orange-600'
                            }`}
                          >
                            {reservation.status}
                          </span>
                        </div>
                      </div>
                      <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition whitespace-nowrap">
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'fines' && (
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Outstanding Fines</h3>
            {fineData.length === 0 ? (
              <p className="text-gray-600">No outstanding fines.</p>
            ) : (
              <div className="space-y-4">
                {fineData.map((fine) => (
                  <div
                    key={fine.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-red-300 transition"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-lg mb-1">
                          {fine.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {fine.reason}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span className="text-gray-600">
                            <span className="font-semibold">Due Date:</span>{' '}
                            {fine.dueDate}
                          </span>
                          <span className="text-gray-600">
                            <span className="font-semibold">Days Overdue:</span>{' '}
                            {fine.daysOverdue}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-bold text-red-600">
                          ${fine.amount.toFixed(2)}
                        </span>
                        <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition whitespace-nowrap">
                          Pay Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total Outstanding:</span>
                    <span className="text-2xl font-bold text-red-600">
                      ${fineData.reduce((sum, fine) => sum + fine.amount, 0).toFixed(2)}
                    </span>
                  </div>
                </div>
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