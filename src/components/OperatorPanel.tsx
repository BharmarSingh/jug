
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { 
  Shield, 
  RotateCcw, 
  Home, 
  Route, 
  Zap, 
  MapPin,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

export const OperatorPanel = () => {
  const [operatorStatus, setOperatorStatus] = useState<'standby' | 'override' | 'emergency'>('standby');
  const [lastCommand, setLastCommand] = useState<string>('');

  const executeCommand = (command: string, description: string) => {
    setLastCommand(description);
    toast.success(`Operator command executed: ${description}`);
    
    if (command === 'ABORT') {
      setOperatorStatus('emergency');
    } else if (command === 'REROUTE' || command === 'RTH') {
      setOperatorStatus('override');
    }
    
    // Reset status after 5 seconds
    setTimeout(() => {
      setOperatorStatus('standby');
    }, 5000);
  };

  const emergencyAbort = () => {
    executeCommand('ABORT', 'Emergency Mission Abort');
  };

  const initiateReroute = () => {
    executeCommand('REROUTE', 'Route Recalculation Initiated');
  };

  const forceReturn = () => {
    executeCommand('RTH', 'Force Return to Home');
  };

  const overrideAutopilot = () => {
    executeCommand('OVERRIDE', 'Manual Control Override');
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-cyan-400 flex items-center space-x-2">
          <Shield className="w-5 h-5" />
          <span>Operator Command Panel</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-slate-300">Operator Status</span>
          <Badge 
            variant={operatorStatus === 'standby' ? 'secondary' : 'default'} 
            className={
              operatorStatus === 'emergency' ? 'bg-red-600 hover:bg-red-700' :
              operatorStatus === 'override' ? 'bg-yellow-600 hover:bg-yellow-700' :
              'bg-slate-600 hover:bg-slate-700'
            }
          >
            {operatorStatus.toUpperCase()}
          </Badge>
        </div>

        <div className="space-y-3">
          {/* Emergency Abort */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                className="w-full bg-red-600 hover:bg-red-700 text-white border border-red-500"
                size="sm"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Emergency Abort
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-slate-800 border-slate-700">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-red-400">Emergency Mission Abort</AlertDialogTitle>
                <AlertDialogDescription className="text-slate-300">
                  This will immediately terminate the current mission and initiate emergency landing procedures. 
                  This action cannot be undone. Are you sure you want to proceed?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-slate-700 text-slate-200 hover:bg-slate-600">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={emergencyAbort}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Confirm Abort
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Reroute Command */}
          <Button 
            onClick={initiateReroute}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            size="sm"
          >
            <Route className="w-4 h-4 mr-2" />
            Initiate Reroute
          </Button>

          {/* Force Return to Home */}
          <Button 
            onClick={forceReturn}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            <Home className="w-4 h-4 mr-2" />
            Force Return to Home
          </Button>

          {/* Manual Override */}
          <Button 
            onClick={overrideAutopilot}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            size="sm"
          >
            <Zap className="w-4 h-4 mr-2" />
            Manual Override
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="pt-3 border-t border-slate-700">
          <h4 className="text-sm font-medium text-slate-300 mb-2">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
              onClick={() => executeCommand('HOVER', 'Hold Position')}
            >
              <MapPin className="w-3 h-3 mr-1" />
              Hold Position
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
              onClick={() => executeCommand('DESCEND', 'Emergency Descent')}
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Emergency Descent
            </Button>
          </div>
        </div>

        {/* Last Command Status */}
        {lastCommand && (
          <div className="pt-3 border-t border-slate-700">
            <div className="flex items-center space-x-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-slate-300">Last Command:</span>
              <span className="text-green-400">{lastCommand}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
