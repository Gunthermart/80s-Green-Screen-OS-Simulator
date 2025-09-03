import React from 'react';

interface DescriptionPanelProps {
  description: string;
  t: { [key: string]: string };
}

const DescriptionPanel: React.FC<DescriptionPanelProps> = ({ description, t }) => {
  return (
    <div className="w-full lg:w-1/3 bg-gray-800 rounded-lg p-6 shadow-lg flex flex-col">
      <h2 className="text-2xl font-bold mb-4 border-b border-gray-700 pb-2 text-indigo-300">{t.locationClue}</h2>
      <div className="prose prose-invert text-gray-300 leading-relaxed flex-grow overflow-y-auto">
        <p>{description}</p>
      </div>
    </div>
  );
};

export default DescriptionPanel;
