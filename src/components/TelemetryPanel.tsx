import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gauge, MapPin, Wind, Thermometer, Navigation, Battery } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Drone {
  id: string;
  name: string;
  status: string;
  battery_level: number;
  altitude: number;
  speed: number;
  heading: number;
  location_lat: number;
  location_lng: number;
}

interface Telemetry {
  altitude: number;
  speed: number;
  heading: number;
  battery_level: number;
  gps_satellites: number;
  signal_strength: number;
  temperature: number;
  humidity: number;
}

export const TelemetryPanel = () => {
  const [drone, setDrone] = useState<Drone | null>(null);
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDroneData = async () => {
      try {
        // Fetch the first available drone
        const { data: droneData, error: droneError } = await supabase
          .from('drones')
          .select('*')
          .limit(1)
          .single();

        if (droneError) throw droneError;
        setDrone(droneData);

        // Fetch latest telemetry for this drone
        if (droneData) {
          const { data: telemetryData, error: telemetryError } = await supabase
            .from('telemetry')
            .select('*')
            .eq('drone_id', droneData.id)
            .order('timestamp', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (telemetryError) throw telemetryError;
          setTelemetry(telemetryData);
        }
      } catch (error) {
        console.error('Error fetching drone data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDroneData();

    // Set up real-time updates
    const channel = supabase
      .channel('telemetry-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'telemetry'
        },
        (payload) => {
          if (payload.eventType === 'INSERT' && payload.new) {
            setTelemetry(payload.new as Telemetry);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="text-slate-300">Loading telemetry...</div>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'flying':
        return <Badge className="bg-green-600 hover:bg-green-700">FLYING</Badge>;
      case 'idle':
        return <Badge className="bg-blue-600 hover:bg-blue-700">IDLE</Badge>;
      case 'maintenance':
        return <Badge className="bg-yellow-600 hover:bg-yellow-700">MAINTENANCE</Badge>;
      case 'offline':
        return <Badge className="bg-red-600 hover:bg-red-700">OFFLINE</Badge>;
      default:
        return <Badge className="bg-gray-600 hover:bg-gray-700">UNKNOWN</Badge>;
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-cyan-400 flex items-center space-x-2">
          <Gauge className="w-5 h-5" />
          <span>Live Telemetry</span>
          {drone && <span className="text-sm text-slate-400">({drone.name})</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-slate-300">Status</span>
          {drone && getStatusBadge(drone.status)}
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300">Altitude</span>
            </div>
            <span className="font-mono text-white">
              {telemetry ? `${telemetry.altitude}m` : `${drone?.altitude || 0}m`}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wind className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300">Speed</span>
            </div>
            <span className="font-mono text-white">
              {telemetry ? `${telemetry.speed} m/s` : `${drone?.speed || 0} m/s`}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Navigation className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300">Heading</span>
            </div>
            <span className="font-mono text-white">
              {telemetry ? `${telemetry.heading}°` : `${drone?.heading || 0}°`}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Battery className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300">Battery</span>
            </div>
            <span className="font-mono text-white">
              {telemetry ? `${telemetry.battery_level}%` : `${drone?.battery_level || 0}%`}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Thermometer className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300">Temperature</span>
            </div>
            <span className="font-mono text-white">
              {telemetry?.temperature ? `${telemetry.temperature}°C` : 'N/A'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Gauge className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300">GPS Satellites</span>
            </div>
            <span className="font-mono text-white">
              {telemetry?.gps_satellites || 'N/A'}
            </span>
          </div>
        </div>

        {drone && (
          <div className="pt-3 border-t border-slate-700">
            <div className="text-xs text-slate-400 space-y-1">
              <div>Lat: {drone.location_lat?.toFixed(6) || 'N/A'}</div>
              <div>Lng: {drone.location_lng?.toFixed(6) || 'N/A'}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};