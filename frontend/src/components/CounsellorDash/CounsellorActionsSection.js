import React from 'react';
import '../../styles/CounsellorActionsSection.css';

const CounsellorActionsSection = ({
  counsellorStatus,
  setCounsellorStatus,
  counsellorComment,
  setCounsellorComment,
  handleApply,
  isSubmitting,
}) => {
  // switch status on and off
  const handleCheckboxChange = (type) => {
    if (counsellorStatus === type) {
      setCounsellorStatus(null);
    } else {
      setCounsellorStatus(type);
    }
  };

  return (
    <section className="container">
      <h4 className="header">Counsellor Actions</h4>

      <div className="content">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={counsellorStatus === 'Flagged'}
            onChange={() => handleCheckboxChange('Flagged')}
            disabled={isSubmitting}
          />
          <span className="checkbox-text">
            Flag for review
          </span>
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={counsellorStatus === 'Approved'}
            onChange={() => handleCheckboxChange('Approved')}
            disabled={isSubmitting}
          />
          <span className="checkbox-text">
            Approve submission
          </span>
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={counsellorStatus === 'Denied'}
            onChange={() => handleCheckboxChange('Denied')}
            disabled={isSubmitting}
          />
          <span className="checkbox-text">
            Deny submission
          </span>
        </label>
      </div>

      <div className="comment">
        <label htmlFor="counsellorComment">Comments (Optional)</label>
        <textarea
          id="counsellorComment"
          className="comment-text"
          placeholder="Add any notes or comments about this submission..."
          rows="4"
          value={counsellorComment}
          onChange={(e) => setCounsellorComment(e.target.value)}
          disabled={isSubmitting}
        ></textarea>
      </div>

      <div className="button-container">
        <button
          className="button"
          onClick={handleApply}
          disabled={isSubmitting || !counsellorStatus}
        >
          {isSubmitting ? 'Applying...' : 'Apply'}
        </button>
      </div>
    </section>
  );
};

export default CounsellorActionsSection;