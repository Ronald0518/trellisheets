import React, { useEffect, useState } from 'react';
import ZoneCard from './components/ZoneCard.jsx';

function App() {
  const [zones, setZones] = useState([]);

  useEffect(() => {
    window.electronAPI.loadZones().then(result => {
      if (result.success) setZones(result.zones);
    });
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Virtual Desk</h1>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {zones.map(zone => (
          <ZoneCard key={zone.id} zone={zone} />
        ))}
      </div>
    </div>
  );
}

export default App;
