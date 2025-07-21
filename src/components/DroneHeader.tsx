
import React from 'react';
import { Plane, Signal, Wifi, Battery, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export const DroneHeader = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Plane className="w-8 h-8 text-cyan-400" />
            <h1 className="text-2xl font-bold text-white">DroneOps Dashboard</h1>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="flex items-center space-x-1 text-green-400">
              <Signal className="w-4 h-4" />
              <span>CONNECTED</span>
            </div>
            <div className="flex items-center space-x-1 text-cyan-400">
              <Wifi className="w-4 h-4" />
              <span>GPS: 12 SAT</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Battery className="w-5 h-5 text-green-400" />
            <span className="text-sm font-medium">87%</span>
          </div>
          <div className="text-sm text-slate-300">
            Flight Time: 00:14:32
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-300">
            <span>Welcome, {user?.email}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-slate-300 hover:text-white"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
