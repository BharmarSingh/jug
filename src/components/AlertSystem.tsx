import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, Info, AlertCircle, CheckCircle, Brain } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  ai_recommendation?: string;
  created_at: string;
  acknowledged: boolean;
  acknowledged_by?: string;
}

export const AlertSystem = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const { data, error } = await supabase
          .from('alerts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        setAlerts((data || []) as Alert[]);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();

    // Set up real-time updates for alerts
    const channel = supabase
      .channel('alerts-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alerts'
        },
        (payload) => {
          if (payload.eventType === 'INSERT' && payload.new) {
            setAlerts(prev => [payload.new as Alert, ...prev.slice(0, 9)]);
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            setAlerts(prev => prev.map(alert => 
              alert.id === payload.new.id ? payload.new as Alert : alert
            ));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const acknowledgeAlert = async (alertId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('alerts')
        .update({ 
          acknowledged: true, 
          acknowledged_by: user.id 
        })
        .eq('id', alertId);

      if (error) throw error;
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case 'info': return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const getAlertColor = (type: Alert['type']) => {
    switch (type) {
      case 'critical': return 'bg-red-600 hover:bg-red-700';
      case 'warning': return 'bg-yellow-600 hover:bg-yellow-700';
      case 'info': return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  if (loading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="text-slate-300">Loading alerts...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-cyan-400 flex items-center space-x-2">
          <Brain className="w-5 h-5" />
          <span>AI Alert System</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="text-center text-slate-400 py-8">
                <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>AI monitoring system active</p>
                <p className="text-xs">No alerts detected</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id} className="p-4 bg-slate-700 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getAlertIcon(alert.type)}
                      <Badge className={getAlertColor(alert.type)}>
                        {alert.type.toUpperCase()}
                      </Badge>
                      {alert.ai_recommendation && (
                        <Badge variant="outline" className="border-purple-400 text-purple-400 text-xs">
                          AI
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">
                      {formatTimestamp(alert.created_at)}
                    </span>
                  </div>
                  
                  <h4 className="font-medium text-white mb-1">{alert.title}</h4>
                  <p className="text-slate-300 text-sm mb-2">{alert.message}</p>
                  
                  {alert.ai_recommendation && (
                    <div className="bg-slate-600 p-3 rounded-lg mb-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Brain className="w-4 h-4 text-cyan-400" />
                        <span className="text-cyan-400 font-medium text-sm">AI Recommendation</span>
                      </div>
                      <p className="text-slate-300 text-sm">{alert.ai_recommendation}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    {!alert.acknowledged ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="text-xs"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Acknowledge
                      </Button>
                    ) : (
                      <Badge variant="outline" className="border-green-400 text-green-400 text-xs">
                        ACKNOWLEDGED
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};