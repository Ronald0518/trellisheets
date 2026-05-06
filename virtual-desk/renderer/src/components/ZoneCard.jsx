import React from 'react';

function ZoneCard({ zone }) {
  return (
    <div className="border rounded p-4" style={{ backgroundColor: zone.color }}>
      <h2 className="font-semibold mb-2">{zone.name}</h2>
      <p className="text-sm break-all">{zone.folderPath}</p>
    </div>
  );
}

export default ZoneCard;
