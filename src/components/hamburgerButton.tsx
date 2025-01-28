import React from 'react';

type HamburgerButtonProps = {
  onClick: () => void;
};

const HamburgerButton: React.FC<HamburgerButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="block lg:hidden text-slate-800 hover:text-black"
      aria-label="Toggle menu"
    >
      <span className="block w-6 h-1 bg-black mb-1"></span>
      <span className="block w-6 h-1 bg-black mb-1"></span>
      <span className="block w-6 h-1 bg-black mb-1"></span>
    </button>
  );
};

export default HamburgerButton;