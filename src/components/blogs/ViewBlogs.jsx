import React, { useEffect, useState } from 'react';
import { FiSearch, FiFilter } from 'react-icons/fi';
import { FaEdit, FaTrashAlt } from 'react-icons/fa'; // Icons for edit and delete actions
import { useAuth } from '../../context/AuthContext'; // Assuming AuthContext is needed for token
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { toast } from 'react-toastify'; // Import toast for notifications
import StatusConfirmToast from './StatusConfirmToast'; // Import custom confirmation toast component
import DeleteConfirmToast from './DeleteConfirmToast'; // Import custom delete confirmation toast component

const ViewBlogs = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const { user } = useAuth(); // Assuming user info might be needed, or just for token
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const token = localStorage.getItem('accessToken');

      if (!token) {
        setError('Authentication token not found. Please log in.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${backendUrl}/api/blogs`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch blogs');
        }

        const data = await response.json();
        console.log("Fetched blogs data:", data); // Add this log
        setBlogs(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []); // Empty dependency array means this effect runs once on mount

  const handleEdit = (blogId) => {
    navigate(`/dashboard/blogs/edit/${blogId}`); // Navigate to the edit page
  };

  const handleDelete = (blogId) => {
    const deleteBlog = async () => {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const token = localStorage.getItem('accessToken');

      try {
        const response = await fetch(`${backendUrl}/api/blogs/${blogId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete blog post');
        }

        // Update the local state to remove the deleted blog
        setBlogs(prevBlogs => prevBlogs.filter(blog => blog.id !== blogId));
        toast.success('Blog post deleted successfully!');
      } catch (error) {
        toast.error(error.message);
      }
    };

    toast(<DeleteConfirmToast
      blogId={blogId}
      onConfirm={deleteBlog}
    />, {
      closeButton: false,
      autoClose: false,
      draggable: false,
    });
  };

  const handleStatusToggle = (blogId, currentStatus) => {
    const updateStatus = async () => {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const token = localStorage.getItem('accessToken');
      const newStatus = currentStatus ? 0 : 1; // Toggle status (1 for Published, 0 for Draft)

      try {
        const response = await fetch(`${backendUrl}/api/blogs/${blogId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ active: newStatus }), // Only send the active status
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update blog status');
        }

        // Update the local state to reflect the change
        setBlogs(prevBlogs =>
          prevBlogs.map(blog =>
            blog.id === blogId ? { ...blog, active: newStatus } : blog
          )
        );
        toast.success(`Blog status updated to ${newStatus ? 'Published' : 'Draft'}!`);
      } catch (error) {
        toast.error(error.message);
      }
    };

    toast(<StatusConfirmToast
      blogId={blogId}
      currentStatus={currentStatus}
      onConfirm={updateStatus}
    />, {
      closeButton: false,
      autoClose: false,
      draggable: false,
    });
  };

  if (loading) {
    return <div className="text-center py-10">Loading blogs...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="bg-staymaster-white-bg rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-staymaster-text-dark mb-4">View All Blogs</h2>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center border border-staymaster-search-border rounded-lg px-4 py-2 w-full max-w-sm">
          <FiSearch className="w-5 h-5 text-staymaster-text-gray mr-2" />
          <input
            type="text"
            placeholder="Search blogs by title or author"
            className="flex-grow outline-none text-staymaster-text-dark placeholder-staymaster-search-placeholder text-sm"
          />
        </div>
        <button className="flex items-center px-4 py-2 bg-staymaster-filter-button-bg text-staymaster-text-gray border border-staymaster-filter-button-border rounded-lg hover:bg-gray-100 text-sm font-medium transition duration-200">
          <FiFilter className="w-4 h-4 mr-2" /> Filter
        </button>
      </div>

      {blogs.length === 0 ? (
        <div className="text-center py-10 text-staymaster-text-gray">
          No blogs added yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-staymaster-border-light">
            <thead className="bg-staymaster-table-header-bg">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-staymaster-table-header-text uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-staymaster-table-header-text uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-staymaster-table-header-text uppercase tracking-wider">Author</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-staymaster-table-header-text uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-staymaster-table-header-text uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-staymaster-table-header-text uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-staymaster-white-bg divide-y divide-staymaster-border-light">
              {blogs.map((blog) => (
                <tr key={blog.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-staymaster-text-dark">{blog.id}</td>
                  <td className="px-6 py-4 text-sm text-staymaster-text-dark max-w-xs truncate">{blog.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-staymaster-text-dark">{blog.author_id}</td> {/* Display author_id for now */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-staymaster-text-dark">{new Date(blog.created_at).toLocaleDateString()}</td> {/* Format created_at */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleStatusToggle(blog.id, blog.active)}
                      className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer transition-colors duration-200 ${
                        blog.active ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {blog.active ? 'Published' : 'Draft'} {/* Map active status */}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(blog.id)}
                      className="text-staymaster-primary hover:text-teal-700 mr-3"
                      title="Edit Blog"
                    >
                      <FaEdit className="inline-block w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(blog.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Blog"
                    >
                      <FaTrashAlt className="inline-block w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-5 flex justify-between items-center text-sm text-staymaster-text-gray">
        <span>Showing {blogs.length} of {blogs.length} blogs</span>
        {/* Pagination controls would typically go here */}
      </div>
    </div>
  );
};

export default ViewBlogs;