import React from 'react';
import '../../styles/CounsellorActionsSection.css';

const CounsellorActionsSection = ({
  counsellorStatus,
  setCounsellorStatus,
  isFlagged,
  setIsFlagged,
  counsellorComment,
  setCounsellorComment,
  handleApply,
  isSubmitting,
}) => {

  return (
    <section className="cas-container">
      <h4 className="cas-header">Counsellor Actions</h4>

      <div className="cas-content cas-row">
        <label className="checkbox-label horizontal-flag">
          <input
            type="checkbox"
            checked={isFlagged}
            onChange={() => setIsFlagged(!isFlagged)}
            disabled={isSubmitting}
          />
          <span className="checkbox-text">Flag for review 🚩</span>
        </label>
      </div>

      <div className="cas-content vertical-approval">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={counsellorStatus === 'Approved'}
            onChange={() =>
              setCounsellorStatus(
                counsellorStatus === 'Approved' ? null : 'Approved'
              )
            }
            disabled={isSubmitting}
          />
          <span className="checkbox-text">Approve submission</span>
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={counsellorStatus === 'Denied'}
            onChange={() =>
              setCounsellorStatus(
                counsellorStatus === 'Denied' ? null : 'Denied'
              )
            }
            disabled={isSubmitting}
          />
          <span className="checkbox-text">Deny submission</span>
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
        />
      </div>

      <div className="button-cas-container">
        <button
          className="cas-button"
          onClick={handleApply}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Applying...' : 'Apply'}
        </button>
      </div>
    </section>
  );
};

export default CounsellorActionsSection;
