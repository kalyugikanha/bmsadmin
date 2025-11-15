import React from 'react';
import { toast } from 'react-toastify';

const StatusConfirmToast = ({ closeToast, blogId, currentStatus, onConfirm }) => {
  const newStatusText = currentStatus ? 'Draft' : 'Published';

  const handleConfirm = () => {
    onConfirm(blogId, currentStatus);
    closeToast();
  };

  const handleCancel = () => {
    closeToast();
  };

  return (
    <div className="p-2">
      <p className="text-sm font-semibold mb-3">
        Are you sure you want to change the status of blog ID: {blogId} to {newStatusText}?
      </p>
      <div className="flex justify-end space-x-2">
        <button
          onClick={handleCancel}
          className="px-3 py-1 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          className="px-3 py-1 text-sm rounded-md bg-blue-500 text-white hover:bg-blue-600"
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

export default StatusConfirmToast;