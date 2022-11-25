import React from 'react'

const ApplyButton = ({ onClick }) => (
  <button
    onClick={onClick}
    type="button"
    className="btn sign-blue apply"
  >
    <span className="btn_text">Apply</span>
  </button>
)

export default ApplyButton
