import React from 'react';

export const TailwindTest = () => {
  return (
    <div className="bg-red-500 text-white p-4 m-4 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-2">Tailwind Test</h1>
      <p className="text-sm">If you can see this styled box, Tailwind is working!</p>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2">
        Test Button
      </button>
    </div>
  );
};
