import React from 'react';

const GuessMarker: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle cx="12" cy="12" r="10" fill="white" stroke="#4A5568" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="7" fill="currentColor" />
  </svg>
);

export default GuessMarker;
