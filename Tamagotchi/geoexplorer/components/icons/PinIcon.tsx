
import React from 'react';

const PinIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M12 0C7.31 0 3 4.31 3 9.25c0 4.97 9 14.75 9 14.75s9-9.78 9-14.75C21 4.31 16.69 0 12 0zm0 12a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
  </svg>
);

export default PinIcon;
