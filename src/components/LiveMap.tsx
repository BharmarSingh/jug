
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation, Crosshair } from 'lucide-react';

export const LiveMap = () => {
  const [dronePosition, setDronePosition] = useState({ x: 50, y: 50 });
  const [heading, setHeading] = useState(45);

  // Simulate drone movement
  useEffect(() => {
    const interval = setInterval(() => {
      setDronePosition(prev => ({
        x: Math.max(5, Math.min(95, prev.x + (Math.random() - 0.5) * 4)),
        y: Math.max(5, Math.min(95, prev.y + (Math.random() - 0.5) * 4))
      }));
      setHeading(prev => (prev + (Math.random() - 0.5) * 10) % 360);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-slate-800 border-slate-700 h-96">
      <CardHeader>
        <CardTitle className="text-cyan-400 flex items-center space-x-2">
          <Navigation className="w-5 h-5" />
          <span>Live Position</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-full">
        <div className="relative w-full h-64 bg-slate-900 rounded-lg border border-slate-600 overflow-hidden">
          {/* Grid lines */}
          <div className="absolute inset-0">
            {[...Array(10)].map((_, i) => (
              <div key={`h-${i}`} 
                   className="absolute w-full border-t border-slate-700 opacity-30" 
                   style={{ top: `${i * 10}%` }} />
            ))}
            {[...Array(10)].map((_, i) => (
              <div key={`v-${i}`} 
                   className="absolute h-full border-l border-slate-700 opacity-30" 
                   style={{ left: `${i * 10}%` }} />
            ))}
          </div>
          
          {/* Waypoints */}
          <div className="absolute w-3 h-3 bg-yellow-400 rounded-full border-2 border-yellow-300"
               style={{ left: '20%', top: '30%', transform: 'translate(-50%, -50%)' }}>
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-yellow-400 whitespace-nowrap">
              WP1
            </div>
          </div>
          
          <div className="absolute w-3 h-3 bg-yellow-400 rounded-full border-2 border-yellow-300"
               style={{ left: '70%', top: '60%', transform: 'translate(-50%, -50%)' }}>
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-yellow-400 whitespace-nowrap">
              WP2
            </div>
          </div>
          
          <div className="absolute w-3 h-3 bg-yellow-400 rounded-full border-2 border-yellow-300"
               style={{ left: '40%', top: '80%', transform: 'translate(-50%, -50%)' }}>
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-yellow-400 whitespace-nowrap">
              WP3
            </div>
          </div>
          
          {/* Home position */}
          <div className="absolute w-4 h-4 bg-green-400 rounded-full border-2 border-green-300"
               style={{ left: '10%', top: '10%', transform: 'translate(-50%, -50%)' }}>
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-green-400 whitespace-nowrap">
              HOME
            </div>
          </div>
          
          {/* Drone position */}
          <div className="absolute w-6 h-6 bg-cyan-400 rounded-full border-2 border-cyan-300 flex items-center justify-center"
               style={{ 
                 left: `${dronePosition.x}%`, 
                 top: `${dronePosition.y}%`, 
                 transform: 'translate(-50%, -50%)' 
               }}>
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <div className="absolute w-8 h-0.5 bg-cyan-400 origin-left"
                 style={{ 
                   transform: `rotate(${heading}deg)`,
                   left: '50%',
                   top: '50%',
                   marginTop: '-1px'
                 }}></div>
          </div>
          
          {/* Flight path */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <path
              d={`M 10% 10% Q 20% 30% 30% 30% T 70% 60% Q 40% 80% 40% 80%`}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.6"
            />
          </svg>
        </div>
        
        <div className="flex items-center justify-between mt-4 text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-cyan-400">
              <Crosshair className="w-4 h-4" />
              <span>Drone</span>
            </div>
            <div className="flex items-center space-x-1 text-yellow-400">
              <MapPin className="w-4 h-4" />
              <span>Waypoints</span>
            </div>
            <div className="flex items-center space-x-1 text-green-400">
              <MapPin className="w-4 h-4" />
              <span>Home</span>
            </div>
          </div>
          <div className="text-slate-400">
            Heading: {heading.toFixed(0)}°
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
