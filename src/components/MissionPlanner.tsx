
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Route, Plus, Trash2, Edit, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface Waypoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  altitude: number;
  task: string;
  duration: number;
}

export const MissionPlanner = () => {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([
    { id: '1', name: 'WP1', lat: 37.7749, lng: -122.4194, altitude: 100, task: 'Survey', duration: 30 },
    { id: '2', name: 'WP2', lat: 37.7849, lng: -122.4094, altitude: 120, task: 'Photo', duration: 15 },
    { id: '3', name: 'WP3', lat: 37.7649, lng: -122.4294, altitude: 80, task: 'Hover', duration: 45 }
  ]);

  const [newWaypoint, setNewWaypoint] = useState({
    name: '',
    lat: '',
    lng: '',
    altitude: '',
    task: 'Survey',
    duration: ''
  });

  const addWaypoint = () => {
    if (!newWaypoint.name || !newWaypoint.lat || !newWaypoint.lng || !newWaypoint.altitude) {
      toast.error('Please fill in all required fields');
      return;
    }

    const waypoint: Waypoint = {
      id: Date.now().toString(),
      name: newWaypoint.name,
      lat: parseFloat(newWaypoint.lat),
      lng: parseFloat(newWaypoint.lng),
      altitude: parseFloat(newWaypoint.altitude),
      task: newWaypoint.task,
      duration: parseFloat(newWaypoint.duration) || 0
    };

    setWaypoints(prev => [...prev, waypoint]);
    setNewWaypoint({ name: '', lat: '', lng: '', altitude: '', task: 'Survey', duration: '' });
    toast.success('Waypoint added successfully');
  };

  const removeWaypoint = (id: string) => {
    setWaypoints(prev => prev.filter(wp => wp.id !== id));
    toast.success('Waypoint removed');
  };

  const uploadMission = () => {
    toast.success('Mission uploaded to drone');
  };

  const totalDistance = waypoints.length > 1 ? ((waypoints.length - 1) * 0.5).toFixed(1) : '0';
  const estimatedTime = waypoints.reduce((sum, wp) => sum + wp.duration, 0) + (waypoints.length * 2);

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-cyan-400 flex items-center space-x-2">
          <Route className="w-5 h-5" />
          <span>Mission Route Planner</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mission Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-900 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400">{waypoints.length}</div>
            <div className="text-sm text-slate-400">Waypoints</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400">{totalDistance} km</div>
            <div className="text-sm text-slate-400">Distance</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400">{estimatedTime}</div>
            <div className="text-sm text-slate-400">Est. Time (min)</div>
          </div>
          <div className="text-center">
            <Button onClick={uploadMission} className="bg-green-600 hover:bg-green-700 text-white">
              <Upload className="w-1 h-4 mr-0" />
              Upload Mission
            </Button>
          </div>
        </div>

        {/* Add Waypoint Form */}
        <div className="p-4 bg-slate-900 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-4">Add New Waypoint</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <Input
              placeholder="Name"
              value={newWaypoint.name}
              onChange={(e) => setNewWaypoint(prev => ({ ...prev, name: e.target.value }))}
              className="bg-slate-800 border-slate-600 text-white"
            />
            <Input
              placeholder="Latitude"
              type="number"
              step="0.000001"
              value={newWaypoint.lat}
              onChange={(e) => setNewWaypoint(prev => ({ ...prev, lat: e.target.value }))}
              className="bg-slate-800 border-slate-600 text-white"
            />
            <Input
              placeholder="Longitude"
              type="number"
              step="0.000001"
              value={newWaypoint.lng}
              onChange={(e) => setNewWaypoint(prev => ({ ...prev, lng: e.target.value }))}
              className="bg-slate-800 border-slate-600 text-white"
            />
            <Input
              placeholder="Altitude (m)"
              type="number"
              value={newWaypoint.altitude}
              onChange={(e) => setNewWaypoint(prev => ({ ...prev, altitude: e.target.value }))}
              className="bg-slate-800 border-slate-600 text-white"
            />
            <select
              value={newWaypoint.task}
              onChange={(e) => setNewWaypoint(prev => ({ ...prev, task: e.target.value }))}
              className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white"
            >
              <option value="Survey">Survey</option>
              <option value="Photo">Photo</option>
              <option value="Video">Video</option>
              <option value="Hover">Hover</option>
              <option value="Landing">Landing</option>
            </select>
            <Button onClick={addWaypoint} className="bg-cyan-600 hover:bg-cyan-700 text-white">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </div>

        {/* Waypoints List */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-white">Mission Waypoints</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {waypoints.map((waypoint, index) => (
              <div key={waypoint.id} className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-white">{waypoint.name}</div>
                    <div className="text-sm text-slate-400">
                      {waypoint.lat.toFixed(6)}, {waypoint.lng.toFixed(6)} • {waypoint.altitude}m
                    </div>
                  </div>
                  <Badge variant="outline" className="border-cyan-400 text-cyan-400">
                    {waypoint.task}
                  </Badge>
                  {waypoint.duration > 0 && (
                    <span className="text-sm text-slate-400">{waypoint.duration}s</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeWaypoint(waypoint.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
