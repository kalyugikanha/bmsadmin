import React from 'react';
import { FiSearch, FiFilter } from 'react-icons/fi';

const ViewBookings = ({ title }) => {
  // Dummy data for bookings table
  const bookings = [
    { srNo: 1, sl: 3819, status: 'Confirmed - Staymaster', agent: 'Swati', source: 'OTA - Airbnb', property: 'Villa Rohini | 2BHK', bookingDate: 'Feb 25', checkIn: 'Mar 25, 25', checkOut: 'Apr 3, 25', persons: 15 },
    { srNo: 2, sl: 3820, status: 'Confirmed - Staymaster', agent: 'Swati', source: 'OTA - Airbnb', property: 'Villa Rohini | 2BHK', bookingDate: 'Feb 25', checkIn: 'Mar 25, 25', checkOut: 'Apr 3, 25', persons: 15 },
    { srNo: 3, sl: 3821, status: 'Pending', agent: 'Rajat', source: 'Website', property: 'Apartment Delhi | 1BHK', bookingDate: 'Mar 1', checkIn: 'Apr 10, 25', checkOut: 'Apr 15, 25', persons: 2 },
    { srNo: 4, sl: 3822, status: 'Confirmed - Staymaster', agent: 'Swati', source: 'OTA - Airbnb', property: 'Villa Rohini | 2BHK', bookingDate: 'Feb 25', checkIn: 'Mar 25, 25', checkOut: 'Apr 3, 25', persons: 15 },
    { srNo: 5, sl: 3823, status: 'Cancelled', agent: 'Priya', source: 'Direct', property: 'Studio Mumbai | 1RK', bookingDate: 'Feb 28', checkIn: 'Mar 20, 25', checkOut: 'Mar 22, 25', persons: 1 },
    { srNo: 6, sl: 3824, status: 'Confirmed - Staymaster', agent: 'Swati', source: 'OTA - Airbnb', property: 'Villa Rohini | 2BHK', bookingDate: 'Feb 25', checkIn: 'Mar 25, 25', checkOut: 'Apr 3, 25', persons: 15 },
    { srNo: 7, sl: 3825, status: 'Confirmed - Staymaster', agent: 'Swati', source: 'OTA - Airbnb', property: 'Villa Rohini | 2BHK', bookingDate: 'Feb 25', checkIn: 'Mar 25, 25', checkOut: 'Apr 3, 25', persons: 15 },
    { srNo: 8, sl: 3826, status: 'Confirmed - Staymaster', agent: 'Swati', source: 'OTA - Airbnb', property: 'Villa Rohini | 2BHK', bookingDate: 'Feb 25', checkIn: 'Mar 25, 25', checkOut: 'Apr 3, 25', persons: 15 },
    { srNo: 9, sl: 3827, status: 'Confirmed - Staymaster', agent: 'Swati', source: 'OTA - Airbnb', property: 'Villa Rohini | 2BHK', bookingDate: 'Feb 25', checkIn: 'Mar 25, 25', checkOut: 'Apr 3, 25', persons: 15 },
    { srNo: 10, sl: 3828, status: 'Confirmed - Staymaster', agent: 'Swati', source: 'OTA - Airbnb', property: 'Villa Rohini | 2BHK', bookingDate: 'Feb 25', checkIn: 'Mar 25, 25', checkOut: 'Apr 3, 25', persons: 15 },
    { srNo: 11, sl: 3829, status: 'Confirmed - Staymaster', agent: 'Swati', source: 'OTA - Airbnb', property: 'Villa Rohini | 2BHK', bookingDate: 'Feb 25', checkIn: 'Mar 25, 25', checkOut: 'Apr 3, 25', persons: 15 },
    { srNo: 12, sl: 3830, status: 'Confirmed - Staymaster', agent: 'Swati', source: 'OTA - Airbnb', property: 'Villa Rohini | 2BHK', bookingDate: 'Feb 25', checkIn: 'Mar 25, 25', checkOut: 'Apr 3, 25', persons: 15 },
  ];

  const getStatusClasses = (status) => {
    switch (status) {
      case 'Confirmed - Staymaster':
        return 'bg-staymaster-green-status-bg text-staymaster-green-status-text';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-staymaster-white-bg rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-staymaster-text-dark mb-4">{title}</h2>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center border border-staymaster-search-border rounded-lg px-4 py-2 w-full max-w-sm">
          <FiSearch className="w-5 h-5 text-staymaster-text-gray mr-2" />
          <input
            type="text"
            placeholder="Search by booking ID or property name"
            className="flex-grow outline-none text-staymaster-text-dark placeholder-staymaster-search-placeholder text-sm"
          />
        </div>
        <button className="flex items-center px-4 py-2 bg-staymaster-filter-button-bg text-staymaster-text-gray border border-staymaster-filter-button-border rounded-lg hover:bg-gray-100 text-sm font-medium transition duration-200">
          <FiFilter className="w-4 h-4 mr-2" /> Filter
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-staymaster-border-light">
          <thead className="bg-staymaster-table-header-bg">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-staymaster-table-header-text uppercase tracking-wider">SR. NO.</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-staymaster-table-header-text uppercase tracking-wider">SL</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-staymaster-table-header-text uppercase tracking-wider">STATUS</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-staymaster-table-header-text uppercase tracking-wider">AGENT</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-staymaster-table-header-text uppercase tracking-wider">SOURCE</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-staymaster-table-header-text uppercase tracking-wider">NAME OF PROPERTY</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-staymaster-table-header-text uppercase tracking-wider">BOOKING DATE</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-staymaster-table-header-text uppercase tracking-wider">CHECK-IN</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-staymaster-table-header-text uppercase tracking-wider">CHECK-OUT</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-staymaster-table-header-text uppercase tracking-wider">NO. OF PERSONS</th>
            </tr>
          </thead>
          <tbody className="bg-staymaster-white-bg divide-y divide-staymaster-border-light">
            {bookings.map((booking, i) => (
              <tr key={i}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-staymaster-text-dark">{booking.srNo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-staymaster-text-dark">{booking.sl}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(booking.status)}`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-staymaster-text-dark">{booking.agent}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-staymaster-text-dark">{booking.source}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-staymaster-text-dark">{booking.property}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-staymaster-text-dark">{booking.bookingDate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-staymaster-text-dark">{booking.checkIn}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-staymaster-text-dark">{booking.checkOut}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-staymaster-text-dark">{booking.persons}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-5 flex justify-between items-center text-sm text-staymaster-text-gray">
        <span>Showing {bookings.length} of {bookings.length} tasks</span>
      </div>
    </div>
  );
};

export default ViewBookings;