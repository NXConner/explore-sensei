import React, { useState, useEffect } from 'react';
import { X, Cloud, Sun, CloudRain, Snowflake as Snow, Wind, AlertTriangle, MapPin, Clock, Thermometer, Droplets, Eye, Zap, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/monitoring';
import { LoadingOverlay } from '@/components/ui/LoadingSpinner';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { HoverAnimation } from '@/components/ui/Animations';
import { useJobSites } from '@/hooks/useJobSites';
import { useWeatherAlerts as usePersistedWeatherAlerts } from '@/hooks/useWeatherAlerts';

interface WeatherAlert {
  id: string;
  type: 'severe' | 'warning' | 'watch' | 'advisory';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affected_areas: string[];
  start_time: string;
  end_time: string;
  created_at: string;
}

interface WeatherForecast {
  date: string;
  temperature_high: number;
  temperature_low: number;
  condition: string;
  precipitation_chance: number;
  wind_speed: number;
  wind_direction: string;
  humidity: number;
  visibility: number;
  uv_index: number;
  icon: string;
}

interface CurrentWeather {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  wind_speed: number;
  wind_direction: string;
  pressure: number;
  visibility: number;
  uv_index: number;
  feels_like: number;
  icon: string;
  last_updated: string;
}

interface JobSiteWeather {
  job_site_id: string;
  job_site_name: string;
  address: string;
  current_weather: CurrentWeather;
  forecast: WeatherForecast[];
  alerts: WeatherAlert[];
  recommendations: string[];
  risk_level: 'low' | 'medium' | 'high' | 'critical';
}

interface WeatherRadarModalProps {
  onClose: () => void;
}

export const WeatherRadarModal: React.FC<WeatherRadarModalProps> = ({ onClose }) => {
  const [weatherData, setWeatherData] = useState<JobSiteWeather[]>([]);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(300000); // 5 minutes
  const [weatherSettings, setWeatherSettings] = useState({
    temperature_unit: 'fahrenheit' as 'fahrenheit' | 'celsius',
    wind_unit: 'mph' as 'mph' | 'kmh',
    alert_threshold: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    auto_refresh: true
  });
  const [activeTab, setActiveTab] = useState<'radar' | 'alerts' | 'forecast' | 'settings'>('radar');
  
  const { toast } = useToast();
  const { data: jobSites } = useJobSites();
  const { data: persistedAlerts } = usePersistedWeatherAlerts();

  useEffect(() => {
    fetchWeatherData();
    if (weatherSettings.auto_refresh) {
      const interval = setInterval(fetchWeatherData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, weatherSettings.auto_refresh, jobSites]);

  const fetchWeatherData = async () => {
    setIsLoading(true);
    try {
      // Use jobs as the source of job sites with coordinates
      if (!jobSites || jobSites.length === 0) {
        setWeatherData([]);
      } else {
        // Simulate weather data fetching (in real app, would call a Weather API)
        const weatherDataPromises = jobSites.map(async (site) => {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return {
          job_site_id: site.id,
          job_site_name: site.name,
          address: site.client_name ? `${site.client_name}` : 'N/A',
          current_weather: {
            location: site.name,
            temperature: Math.round(Math.random() * 40 + 30), // 30-70°F
            condition: ['Clear', 'Partly Cloudy', 'Cloudy', 'Rainy'][Math.floor(Math.random() * 4)],
            humidity: Math.round(Math.random() * 40 + 40), // 40-80%
            wind_speed: Math.round(Math.random() * 20 + 5), // 5-25 mph
            wind_direction: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
            pressure: Math.round(Math.random() * 10 + 29.5), // 29.5-39.5 inHg
            visibility: Math.round(Math.random() * 5 + 5), // 5-10 miles
            uv_index: Math.round(Math.random() * 8 + 2), // 2-10
            feels_like: Math.round(Math.random() * 40 + 30),
            icon: 'sun',
            last_updated: new Date().toISOString()
          },
          forecast: generateForecast(),
          alerts: generateAlerts(),
          recommendations: generateRecommendations(),
          risk_level: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
        } as JobSiteWeather;
        });

        const weatherResults = await Promise.all(weatherDataPromises);
        setWeatherData(weatherResults);
      }

      // Persisted alerts will be applied via the effect below

    } catch (error) {
      logger.error('Error fetching weather data', { error });
      toast({
        title: 'Error',
        description: 'Failed to load weather data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Apply persisted weather alerts from database when available
  useEffect(() => {
    try {
      if (!persistedAlerts) return;
      const mapped: WeatherAlert[] = persistedAlerts.map((a: any) => {
        const msg: string = String(a.message || 'Weather alert');
        const parts = msg.split(':');
        const title = parts.length > 1 ? parts[0] : 'Weather Alert';
        const description = parts.length > 1 ? parts.slice(1).join(':').trim() : msg;
        const sevRaw = String(a.severity || 'medium').toLowerCase();
        const sev = sevRaw as WeatherAlert['severity'];
        return {
          id: a.id,
          type: (sevRaw === 'high' || sevRaw === 'critical' || sevRaw === 'extreme' ? 'warning' : 'advisory') as WeatherAlert['type'],
          severity: sev,
          title,
          description,
          affected_areas: [
            a.location?.lat != null && a.location?.lng != null
              ? `${a.location.lat}, ${a.location.lng}`
              : 'N/A',
          ],
          start_time: new Date().toISOString(),
          end_time: (a.expires instanceof Date ? a.expires : new Date(a.expires)).toISOString(),
          created_at: new Date().toISOString(),
        } as WeatherAlert;
      });
      setAlerts(mapped);
    } catch (err) {
      logger.warn('Failed to apply persisted weather alerts', { error: err });
    }
  }, [persistedAlerts]);

  const generateForecast = (): WeatherForecast[] => {
    const forecast = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      forecast.push({
        date: date.toISOString().split('T')[0],
        temperature_high: Math.round(Math.random() * 20 + 60),
        temperature_low: Math.round(Math.random() * 20 + 40),
        condition: ['Clear', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Stormy'][Math.floor(Math.random() * 5)],
        precipitation_chance: Math.round(Math.random() * 100),
        wind_speed: Math.round(Math.random() * 25 + 5),
        wind_direction: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
        humidity: Math.round(Math.random() * 40 + 40),
        visibility: Math.round(Math.random() * 5 + 5),
        uv_index: Math.round(Math.random() * 8 + 2),
        icon: 'sun'
      });
    }
    return forecast;
  };

  const generateAlerts = (): WeatherAlert[] => {
    const alertTypes = ['severe', 'warning', 'watch', 'advisory'];
    const severities = ['low', 'medium', 'high', 'critical'];
    const alerts = [];
    
    if (Math.random() > 0.7) { // 30% chance of alerts
      alerts.push({
        id: `alert-${Date.now()}`,
        type: alertTypes[Math.floor(Math.random() * alertTypes.length)] as any,
        severity: severities[Math.floor(Math.random() * severities.length)] as any,
        title: 'Weather Advisory',
        description: 'Potential weather conditions that may affect work',
        affected_areas: ['Current Location'],
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString()
      });
    }
    
    return alerts;
  };

  const generateRecommendations = (): string[] => {
    const recommendations = [
      'Weather conditions are optimal for outdoor work',
      'Consider starting work earlier to avoid afternoon heat',
      'Monitor wind conditions for equipment safety',
      'Ensure proper hydration for crew members',
      'Check UV index and provide sun protection',
      'Be aware of potential precipitation later today'
    ];
    
    return recommendations.slice(0, Math.floor(Math.random() * 3) + 2);
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear': return <Sun className="h-5 w-5 text-yellow-500" />;
      case 'partly cloudy': return <Cloud className="h-5 w-5 text-gray-500" />;
      case 'cloudy': return <Cloud className="h-5 w-5 text-gray-600" />;
      case 'rainy': return <CloudRain className="h-5 w-5 text-blue-500" />;
      case 'stormy': return <Zap className="h-5 w-5 text-purple-500" />;
      case 'snow': return <Snow className="h-5 w-5 text-blue-300" />;
      default: return <Sun className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'extreme':
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const convertTemperature = (temp: number) => {
    if (weatherSettings.temperature_unit === 'celsius') {
      return Math.round((temp - 32) * 5 / 9);
    }
    return temp;
  };

  const convertWindSpeed = (speed: number) => {
    if (weatherSettings.wind_unit === 'kmh') {
      return Math.round(speed * 1.60934);
    }
    return speed;
  };

  return (
    <ErrorBoundary>
      <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="w-full max-w-7xl h-[90vh] hud-element m-4 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-primary/30">
            <h2 className="text-2xl font-bold text-glow flex items-center gap-2">
              <Cloud className="h-6 w-6" />
              Weather Radar & Alerts
            </h2>
            <Button onClick={onClose} variant="ghost" size="icon">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="radar">Weather Radar</TabsTrigger>
                <TabsTrigger value="alerts">Alerts</TabsTrigger>
                <TabsTrigger value="forecast">Forecast</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="radar" className="space-y-6">
                <LoadingOverlay isLoading={isLoading}>
                  <div className="grid gap-4">
                    {weatherData.map((site) => (
                      <HoverAnimation key={site.job_site_id}>
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h3 className="font-semibold">{site.job_site_name}</h3>
                                <p className="text-sm text-muted-foreground">{site.address}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={getRiskColor(site.risk_level)}>
                                  {site.risk_level} risk
                                </Badge>
                                {getWeatherIcon(site.current_weather.condition)}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Thermometer className="h-4 w-4" />
                                <span>{convertTemperature(site.current_weather.temperature)}°{weatherSettings.temperature_unit === 'celsius' ? 'C' : 'F'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Wind className="h-4 w-4" />
                                <span>{convertWindSpeed(site.current_weather.wind_speed)} {weatherSettings.wind_unit}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Droplets className="h-4 w-4" />
                                <span>{site.current_weather.humidity}%</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                <span>{site.current_weather.visibility} mi</span>
                              </div>
                            </div>
                            
                            {site.alerts.length > 0 && (
                              <Alert className="mt-3">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                  {site.alerts.length} weather alert(s) for this location
                                </AlertDescription>
                              </Alert>
                            )}
                            
                            <div className="mt-3">
                              <Label className="text-xs font-medium">Recommendations</Label>
                              <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                                {site.recommendations.map((rec, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <span className="text-primary">•</span>
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </CardContent>
                        </Card>
                      </HoverAnimation>
                    ))}
                  </div>
                </LoadingOverlay>
              </TabsContent>

              <TabsContent value="alerts" className="space-y-6">
                <div className="grid gap-4">
                  {alerts.map((alert) => (
                    <HoverAnimation key={alert.id}>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="font-semibold">{alert.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {new Date(alert.start_time).toLocaleDateString()} - {new Date(alert.end_time).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge className={getAlertColor(alert.severity)}>
                              {alert.severity}
                            </Badge>
                          </div>
                          
                          <p className="text-sm mb-3">{alert.description}</p>
                          
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{alert.affected_areas.join(', ')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>Until {new Date(alert.end_time).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </HoverAnimation>
                  ))}
                  
                  {alerts.length === 0 && (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Active Weather Alerts</h3>
                        <p className="text-muted-foreground">
                          All job sites are clear of weather warnings and advisories.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="forecast" className="space-y-6">
                <div className="grid gap-4">
                  {weatherData.map((site) => (
                    <HoverAnimation key={site.job_site_id}>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">{site.job_site_name}</CardTitle>
                          <CardDescription>{site.address}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
                            {site.forecast.map((day, index) => (
                              <div key={index} className="text-center p-2 border rounded">
                                <div className="text-xs font-medium mb-1">
                                  {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                                </div>
                                {getWeatherIcon(day.condition)}
                                <div className="text-sm font-semibold mt-1">
                                  {convertTemperature(day.temperature_high)}°
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {convertTemperature(day.temperature_low)}°
                                </div>
                                <div className="text-xs text-blue-500">
                                  {day.precipitation_chance}%
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </HoverAnimation>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Weather Settings</CardTitle>
                    <CardDescription>
                      Configure weather display and alert preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Temperature Unit</Label>
                        <Select 
                          value={weatherSettings.temperature_unit} 
                          onValueChange={(value: any) => setWeatherSettings(prev => ({
                            ...prev,
                            temperature_unit: value
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
                            <SelectItem value="celsius">Celsius (°C)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Wind Speed Unit</Label>
                        <Select 
                          value={weatherSettings.wind_unit} 
                          onValueChange={(value: any) => setWeatherSettings(prev => ({
                            ...prev,
                            wind_unit: value
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mph">Miles per Hour (mph)</SelectItem>
                            <SelectItem value="kmh">Kilometers per Hour (km/h)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Alert Threshold</Label>
                        <Select 
                          value={weatherSettings.alert_threshold} 
                          onValueChange={(value: any) => setWeatherSettings(prev => ({
                            ...prev,
                            alert_threshold: value
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Auto Refresh</Label>
                        <Select 
                          value={weatherSettings.auto_refresh ? 'enabled' : 'disabled'} 
                          onValueChange={(value) => setWeatherSettings(prev => ({
                            ...prev,
                            auto_refresh: value === 'enabled'
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="enabled">Enabled</SelectItem>
                            <SelectItem value="disabled">Disabled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={fetchWeatherData} className="gap-2">
                        <Cloud className="h-4 w-4" />
                        Refresh Weather Data
                      </Button>
                      <Button variant="outline" onClick={() => setWeatherSettings({
                        temperature_unit: 'fahrenheit',
                        wind_unit: 'mph',
                        alert_threshold: 'medium',
                        auto_refresh: true
                      })}>
                        Reset to Defaults
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};