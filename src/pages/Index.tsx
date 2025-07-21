
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { DroneHeader } from '@/components/DroneHeader';
import { TelemetryPanel } from '@/components/TelemetryPanel';
import { MissionPlanner } from '@/components/MissionPlanner';
import { CommandCenter } from '@/components/CommandCenter';
import { LiveMap } from '@/components/LiveMap';
import { AlertSystem } from '@/components/AlertSystem';
import { OperatorPanel } from '@/components/OperatorPanel';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <DroneHeader />
      
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Map - Takes up 2 columns on large screens */}
          <div className="lg:col-span-2">
            <LiveMap />
          </div>
          
          {/* Right Panel - Telemetry and Controls */}
          <div className="space-y-6">
            <TelemetryPanel />
            <CommandCenter />
            <OperatorPanel />
          </div>
        </div>
        
        {/* Bottom Section - Mission Planner and Alerts */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MissionPlanner />
          <AlertSystem />
        </div>
      </div>
    </div>
  );
};

export default Index;
