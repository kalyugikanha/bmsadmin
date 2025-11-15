import React from 'react';
import { toast } from 'react-toastify';

const DeleteConfirmToast = ({ closeToast, blogId, onConfirm }) => {
  const handleConfirm = () => {
    onConfirm(blogId);
    closeToast();
  };

  const handleCancel = () => {
    closeToast();
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg text-center">
      <p className="text-lg font-semibold mb-4 text-gray-800">
        Are you sure you want to delete blog ID: {blogId}?
      </p>
      <p className="text-sm text-gray-600 mb-6">
        This action cannot be undone.
      </p>
      <div className="flex justify-center space-x-4">
        <button
          onClick={handleCancel}
          className="px-5 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition duration-200"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          className="px-5 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 transition duration-200"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default DeleteConfirmToast;