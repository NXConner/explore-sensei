import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, Square, MapPin, Clock, Users, CheckCircle, AlertCircle, Camera, FileText, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner, LoadingOverlay } from '@/components/ui/LoadingSpinner';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { AnimatedDiv, HoverAnimation } from '@/components/ui/Animations';

interface TimeEntry {
  id: string;
  employee_id: string;
  job_id: string;
  start_time: string;
  end_time?: string;
  break_duration: number;
  total_hours: number;
  hourly_rate: number;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  status: 'active' | 'paused' | 'completed' | 'pending_approval' | 'approved' | 'rejected';
  notes?: string;
  photos?: string[];
  gps_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface Job {
  id: string;
  title: string;
  location: string;
  client_id: string;
  clients?: {
    name: string;
  };
}

interface Employee {
  id: string;
  name: string;
  hourly_rate: number;
  role: string;
}

interface TimeTrackingModalProps {
  onClose: () => void;
}

export const TimeTrackingModal: React.FC<TimeTrackingModalProps> = ({ onClose }) => {
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [breakDuration, setBreakDuration] = useState(0);
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [gpsError, setGpsError] = useState<string>('');
  const [isTracking, setIsTracking] = useState(false);
  const [showApprovalQueue, setShowApprovalQueue] = useState(false);
  const [pendingApprovals, setPendingApprovals] = useState<TimeEntry[]>([]);
  
  const { toast } = useToast();
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    fetchData();
    startTimeUpdate();
    getCurrentLocation();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [entriesRes, jobsRes, employeesRes] = await Promise.all([
        supabase.from('time_entries').select(`
          *,
          jobs (title, location, client_id, clients (name)),
          employees (name, hourly_rate, role)
        `).order('created_at', { ascending: false }),
        supabase.from('jobs').select('id, title, location, client_id, clients (name)').eq('status', 'in_progress'),
        supabase.from('employees').select('id, name, hourly_rate, role')
      ]);

      if (entriesRes.data) setTimeEntries(entriesRes.data as TimeEntry[]);
      if (jobsRes.data) setJobs(jobsRes.data as Job[]);
      if (employeesRes.data) setEmployees(employeesRes.data as Employee[]);

      // Find active entry
      const active = entriesRes.data?.find((entry: any) => entry.status === 'active');
      if (active) {
        setActiveEntry(active);
        setIsTracking(true);
      }

      // Get pending approvals
      const pendingRes = await supabase
        .from('time_entries')
        .select(`
          *,
          jobs (title, location, client_id, clients (name)),
          employees (name, hourly_rate, role)
        `)
        .eq('status', 'pending_approval');

      if (pendingRes.data) setPendingApprovals(pendingRes.data as TimeEntry[]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load time tracking data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startTimeUpdate = () => {
    intervalRef.current = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
  };

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by this browser');
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Reverse geocoding to get address
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${import.meta.env.VITE_OPENCAGE_API_KEY}`
      );
      const data = await response.json();
      const address = data.results?.[0]?.formatted || 'Unknown location';

      setGpsLocation({ lat: latitude, lng: longitude, address });
      setGpsError('');
    } catch (error) {
      console.error('Error getting location:', error);
      setGpsError('Unable to get current location');
    }
  };

  const startTracking = async () => {
    if (!selectedJob) {
      toast({
        title: 'Error',
        description: 'Please select a job',
        variant: 'destructive'
      });
      return;
    }

    if (!gpsLocation) {
      toast({
        title: 'Error',
        description: 'GPS location is required to start tracking',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const newEntry: Partial<TimeEntry> = {
        employee_id: user.id,
        job_id: selectedJob,
        start_time: new Date().toISOString(),
        break_duration: 0,
        total_hours: 0,
        hourly_rate: employees.find(e => e.id === user.id)?.hourly_rate || 0,
        location: gpsLocation,
        status: 'active',
        notes,
        gps_verified: true
      };

      const { data, error } = await supabase
        .from('time_entries')
        .insert([newEntry])
        .select()
        .single();

      if (error) throw error;

      setActiveEntry(data);
      setIsTracking(true);
      toast({
        title: 'Success',
        description: 'Time tracking started'
      });
    } catch (error) {
      console.error('Error starting tracking:', error);
      toast({
        title: 'Error',
        description: 'Failed to start time tracking',
        variant: 'destructive'
      });
    }
  };

  const pauseTracking = async () => {
    if (!activeEntry) return;

    try {
      const { error } = await supabase
        .from('time_entries')
        .update({ status: 'paused' })
        .eq('id', activeEntry.id);

      if (error) throw error;

      setActiveEntry({ ...activeEntry, status: 'paused' });
      toast({
        title: 'Paused',
        description: 'Time tracking paused'
      });
    } catch (error) {
      console.error('Error pausing tracking:', error);
      toast({
        title: 'Error',
        description: 'Failed to pause time tracking',
        variant: 'destructive'
      });
    }
  };

  const resumeTracking = async () => {
    if (!activeEntry) return;

    try {
      const { error } = await supabase
        .from('time_entries')
        .update({ status: 'active' })
        .eq('id', activeEntry.id);

      if (error) throw error;

      setActiveEntry({ ...activeEntry, status: 'active' });
      toast({
        title: 'Resumed',
        description: 'Time tracking resumed'
      });
    } catch (error) {
      console.error('Error resuming tracking:', error);
      toast({
        title: 'Error',
        description: 'Failed to resume time tracking',
        variant: 'destructive'
      });
    }
  };

  const stopTracking = async () => {
    if (!activeEntry) return;

    try {
      const endTime = new Date();
      const startTime = new Date(activeEntry.start_time);
      const totalMs = endTime.getTime() - startTime.getTime();
      const totalHours = (totalMs / (1000 * 60 * 60)) - (breakDuration / 60);

      const { error } = await supabase
        .from('time_entries')
        .update({
          end_time: endTime.toISOString(),
          total_hours: Math.max(0, totalHours),
          status: 'pending_approval'
        })
        .eq('id', activeEntry.id);

      if (error) throw error;

      setActiveEntry(null);
      setIsTracking(false);
      setSelectedJob('');
      setNotes('');
      setBreakDuration(0);
      
      toast({
        title: 'Time Entry Submitted',
        description: 'Your time entry has been submitted for approval'
      });

      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error stopping tracking:', error);
      toast({
        title: 'Error',
        description: 'Failed to stop time tracking',
        variant: 'destructive'
      });
    }
  };

  const approveTimeEntry = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('time_entries')
        .update({ status: 'approved' })
        .eq('id', entryId);

      if (error) throw error;

      toast({
        title: 'Approved',
        description: 'Time entry has been approved'
      });

      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error approving entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve time entry',
        variant: 'destructive'
      });
    }
  };

  const rejectTimeEntry = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('time_entries')
        .update({ status: 'rejected' })
        .eq('id', entryId);

      if (error) throw error;

      toast({
        title: 'Rejected',
        description: 'Time entry has been rejected'
      });

      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error rejecting entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject time entry',
        variant: 'destructive'
      });
    }
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'pending_approval': return 'bg-blue-500';
      case 'approved': return 'bg-green-600';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <ErrorBoundary>
      <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="w-full max-w-6xl h-[90vh] hud-element m-4 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-primary/30">
            <h2 className="text-2xl font-bold text-glow flex items-center gap-2">
              <Clock className="h-6 w-6" />
              Time Tracking & Payroll
            </h2>
            <Button onClick={onClose} variant="ghost" size="icon">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <Tabs defaultValue="tracking" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="tracking">Time Tracking</TabsTrigger>
                <TabsTrigger value="entries">Time Entries</TabsTrigger>
                <TabsTrigger value="approvals">Approvals</TabsTrigger>
              </TabsList>

              <TabsContent value="tracking" className="space-y-6">
                <LoadingOverlay isLoading={isLoading}>
                  {/* GPS Status */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Location Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {gpsLocation ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>GPS Verified: {gpsLocation.address}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          <span>{gpsError || 'Getting location...'}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Active Time Entry */}
                  {activeEntry && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>Active Time Entry</span>
                          <Badge className={getStatusColor(activeEntry.status)}>
                            {activeEntry.status}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Job</Label>
                            <p className="text-sm text-muted-foreground">
                              {jobs.find(j => j.id === activeEntry.job_id)?.title}
                            </p>
                          </div>
                          <div>
                            <Label>Duration</Label>
                            <p className="text-sm text-muted-foreground">
                              {formatDuration(activeEntry.start_time)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          {activeEntry.status === 'active' ? (
                            <Button onClick={pauseTracking} variant="outline" className="gap-2">
                              <Pause className="h-4 w-4" />
                              Pause
                            </Button>
                          ) : (
                            <Button onClick={resumeTracking} className="gap-2">
                              <Play className="h-4 w-4" />
                              Resume
                            </Button>
                          )}
                          <Button onClick={stopTracking} variant="destructive" className="gap-2">
                            <Square className="h-4 w-4" />
                            Stop
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Start New Entry */}
                  {!activeEntry && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Start Time Tracking</CardTitle>
                        <CardDescription>
                          Select a job and start tracking your time with GPS verification
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="job-select">Job</Label>
                            <Select value={selectedJob} onValueChange={setSelectedJob}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a job" />
                              </SelectTrigger>
                              <SelectContent>
                                {jobs.map((job) => (
                                  <SelectItem key={job.id} value={job.id}>
                                    {job.title} - {job.clients?.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="break-duration">Break Duration (minutes)</Label>
                            <Input
                              id="break-duration"
                              type="number"
                              value={breakDuration}
                              onChange={(e) => setBreakDuration(Number(e.target.value))}
                              placeholder="0"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="notes">Notes</Label>
                          <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add any notes about your work..."
                            rows={3}
                          />
                        </div>

                        <Button 
                          onClick={startTracking} 
                          disabled={!selectedJob || !gpsLocation}
                          className="w-full gap-2"
                        >
                          <Play className="h-4 w-4" />
                          Start Tracking
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </LoadingOverlay>
              </TabsContent>

              <TabsContent value="entries" className="space-y-4">
                <div className="grid gap-4">
                  {timeEntries.map((entry) => (
                    <HoverAnimation key={entry.id}>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="font-semibold">
                                {jobs.find(j => j.id === entry.job_id)?.title}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {new Date(entry.start_time).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge className={getStatusColor(entry.status)}>
                              {entry.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <Label className="text-xs">Duration</Label>
                              <p>{formatDuration(entry.start_time, entry.end_time)}</p>
                            </div>
                            <div>
                              <Label className="text-xs">Hours</Label>
                              <p>{entry.total_hours.toFixed(2)}h</p>
                            </div>
                            <div>
                              <Label className="text-xs">Rate</Label>
                              <p>${entry.hourly_rate}/hr</p>
                            </div>
                            <div>
                              <Label className="text-xs">Total</Label>
                              <p>${(entry.total_hours * entry.hourly_rate).toFixed(2)}</p>
                            </div>
                          </div>
                          
                          {entry.notes && (
                            <div className="mt-3">
                              <Label className="text-xs">Notes</Label>
                              <p className="text-sm text-muted-foreground">{entry.notes}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </HoverAnimation>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="approvals" className="space-y-4">
                <div className="grid gap-4">
                  {pendingApprovals.map((entry) => (
                    <HoverAnimation key={entry.id}>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="font-semibold">
                                {jobs.find(j => j.id === entry.job_id)?.title}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {employees.find(e => e.id === entry.employee_id)?.name} • 
                                {new Date(entry.start_time).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge className={getStatusColor(entry.status)}>
                              {entry.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                            <div>
                              <Label className="text-xs">Duration</Label>
                              <p>{formatDuration(entry.start_time, entry.end_time)}</p>
                            </div>
                            <div>
                              <Label className="text-xs">Hours</Label>
                              <p>{entry.total_hours.toFixed(2)}h</p>
                            </div>
                            <div>
                              <Label className="text-xs">Rate</Label>
                              <p>${entry.hourly_rate}/hr</p>
                            </div>
                            <div>
                              <Label className="text-xs">Total</Label>
                              <p>${(entry.total_hours * entry.hourly_rate).toFixed(2)}</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => approveTimeEntry(entry.id)}
                              size="sm"
                              className="gap-2"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Approve
                            </Button>
                            <Button 
                              onClick={() => rejectTimeEntry(entry.id)}
                              variant="destructive"
                              size="sm"
                              className="gap-2"
                            >
                              <AlertCircle className="h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </HoverAnimation>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};