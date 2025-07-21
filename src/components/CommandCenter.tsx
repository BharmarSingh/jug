
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Square, RotateCcw, Home, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export const CommandCenter = () => {
  const [missionStatus, setMissionStatus] = useState<'idle' | 'active' | 'paused' | 'returning'>('idle');
  const [commands, setCommands] = useState<Array<{id: string, command: string, status: 'sent' | 'acknowledged' | 'executed', timestamp: Date}>>([]);

  const sendCommand = (commandType: string, description: string) => {
    const newCommand = {
      id: Date.now().toString(),
      command: description,
      status: 'sent' as const,
      timestamp: new Date()
    };
    
    setCommands(prev => [newCommand, ...prev.slice(0, 4)]);
    
    // Simulate command acknowledgment
    setTimeout(() => {
      setCommands(prev => prev.map(cmd => 
        cmd.id === newCommand.id ? {...cmd, status: 'acknowledged'} : cmd
      ));
    }, 1000);
    
    setTimeout(() => {
      setCommands(prev => prev.map(cmd => 
        cmd.id === newCommand.id ? {...cmd, status: 'executed'} : cmd
      ));
    }, 2000);
    
    toast.success(`Command sent: ${description}`);
  };

  const startMission = () => {
    setMissionStatus('active');
    sendCommand('START_MISSION', 'Mission Start');
  };

  const pauseMission = () => {
    setMissionStatus('paused');
    sendCommand('PAUSE_MISSION', 'Mission Pause');
  };

  const returnToHome = () => {
    setMissionStatus('returning');
    sendCommand('RTH', 'Return to Home');
  };

  const emergencyStop = () => {
    setMissionStatus('idle');
    sendCommand('EMERGENCY_STOP', 'Emergency Stop');
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-cyan-400 flex items-center space-x-2">
          <Play className="w-5 h-5" />
          <span>Command Center</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-slate-300">Mission Status</span>
          <Badge variant={missionStatus === 'active' ? 'default' : 'secondary'} 
                 className={
                   missionStatus === 'active' ? 'bg-green-600 hover:bg-green-700' :
                   missionStatus === 'paused' ? 'bg-yellow-600 hover:bg-yellow-700' :
                   missionStatus === 'returning' ? 'bg-blue-600 hover:bg-blue-700' :
                   'bg-slate-600 hover:bg-slate-700'
                 }>
            {missionStatus.toUpperCase()}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={startMission}
            disabled={missionStatus === 'active'}
            className="bg-green-600 hover:bg-green-700 text-white"
            size="sm"
          >
            <Play className="w-4 h-4 mr-1" />
            Start
          </Button>
          
          <Button 
            onClick={pauseMission}
            disabled={missionStatus === 'idle'}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
            size="sm"
          >
            <Square className="w-4 h-4 mr-1" />
            Pause
          </Button>
          
          <Button 
            onClick={returnToHome}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            <Home className="w-4 h-4 mr-1" />
            RTH
          </Button>
          
          <Button 
            onClick={emergencyStop}
            className="bg-red-600 hover:bg-red-700 text-white"
            size="sm"
          >
            <AlertTriangle className="w-4 h-4 mr-1" />
            E-Stop
          </Button>
        </div>
        
        <div className="pt-3 border-t border-slate-700">
          <h4 className="text-sm font-medium text-slate-300 mb-2">Recent Commands</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {commands.map((cmd) => (
              <div key={cmd.id} className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{cmd.command}</span>
                <Badge 
                  variant="outline" 
                  className={`text-xs px-1 py-0 ${
                    cmd.status === 'executed' ? 'border-green-400 text-green-400' :
                    cmd.status === 'acknowledged' ? 'border-yellow-400 text-yellow-400' :
                    'border-slate-400 text-slate-400'
                  }`}
                >
                  {cmd.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
