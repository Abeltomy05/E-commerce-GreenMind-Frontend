import React from 'react';
import { X } from 'lucide-react';
import './confirmdelete.scss';

const DeleteConfirmationModal = ({ onConfirm, onCancel }) => {
  return (
    <div className="delete-confirmation-modal">
      <div className="modal-content">
        <button className="close-button" onClick={onCancel}>
          <X size={24} />
        </button>
        <h2>Confirm Deletion</h2>
        <p>Are you sure you want to delete this address?</p>
        <div className="button-group">
          <button className="cancel-button" onClick={onCancel}>Cancel</button>
          <button className="confirm-button" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;

