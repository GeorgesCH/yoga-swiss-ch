import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  Wind, 
  Thermometer,
  Eye,
  Droplets,
  AlertTriangle,
  CheckCircle,
  MapPin
} from 'lucide-react';

interface WeatherData {
  location: string;
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'windy';
  humidity: number;
  windSpeed: number;
  visibility: number;
  uvIndex: number;
  recommendation: 'excellent' | 'good' | 'fair' | 'poor';
  hourlyForecast: Array<{
    time: string;
    temp: number;
    condition: string;
  }>;
}

interface WeatherWidgetProps {
  location?: string;
  showRecommendations?: boolean;
  compact?: boolean;
}

export function WeatherWidget({ 
  location = "Zürich", 
  showRecommendations = true,
  compact = false 
}: WeatherWidgetProps) {
  // Mock weather data - in a real app this would come from a weather API
  const [weatherData, setWeatherData] = useState<WeatherData>({
    location: location,
    temperature: 18,
    condition: 'sunny',
    humidity: 65,
    windSpeed: 12,
    visibility: 10,
    uvIndex: 5,
    recommendation: 'excellent',
    hourlyForecast: [
      { time: '14:00', temp: 19, condition: 'sunny' },
      { time: '15:00', temp: 20, condition: 'sunny' },
      { time: '16:00', temp: 19, condition: 'cloudy' },
      { time: '17:00', temp: 18, condition: 'cloudy' },
      { time: '18:00', temp: 17, condition: 'cloudy' },
      { time: '19:00', temp: 16, condition: 'rainy' },
    ]
  });

  const getWeatherIcon = (condition: string, size: 'sm' | 'md' | 'lg' = 'md') => {
    const iconSize = size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-6 w-6' : 'h-8 w-8';
    
    switch (condition) {
      case 'sunny':
        return <Sun className={`${iconSize} text-primary`} />;
      case 'cloudy':
        return <Cloud className={`${iconSize} text-muted-foreground`} />;
      case 'rainy':
        return <CloudRain className={`${iconSize} text-primary`} />;
      case 'snowy':
        return <CloudSnow className={`${iconSize} text-muted-foreground`} />;
      case 'windy':
        return <Wind className={`${iconSize} text-muted-foreground`} />;
      default:
        return <Sun className={`${iconSize} text-primary`} />;
    }
  };



  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'excellent':
        return <CheckCircle className="h-4 w-4" />;
      case 'good':
        return <CheckCircle className="h-4 w-4" />;
      case 'fair':
        return <AlertTriangle className="h-4 w-4" />;
      case 'poor':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getRecommendationText = (recommendation: string) => {
    switch (recommendation) {
      case 'excellent':
        return 'Perfect for outdoor yoga! 🧘‍♀️';
      case 'good':
        return 'Great conditions for outdoor practice';
      case 'fair':
        return 'Okay for outdoor, but be prepared';
      case 'poor':
        return 'Consider indoor alternatives';
      default:
        return 'Weather conditions unknown';
    }
  };

  if (compact) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{weatherData.location}</span>
            </div>
            <div className="flex items-center gap-3">
              {getWeatherIcon(weatherData.condition, 'sm')}
              <span className="font-semibold">{weatherData.temperature}°C</span>
              {showRecommendations && (
                <Badge variant="secondary">
                  {weatherData.recommendation}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            {getWeatherIcon(weatherData.condition, 'md')}
            <span>Weather in {weatherData.location}</span>
          </div>
          <span className="text-2xl font-bold ml-auto">{weatherData.temperature}°C</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Conditions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Droplets className="h-4 w-4 text-primary" />
            <span>{weatherData.humidity}% humidity</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Wind className="h-4 w-4 text-muted-foreground" />
            <span>{weatherData.windSpeed} km/h wind</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Eye className="h-4 w-4 text-primary" />
            <span>{weatherData.visibility} km visibility</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Sun className="h-4 w-4 text-primary" />
            <span>UV {weatherData.uvIndex}</span>
          </div>
        </div>

        {/* Hourly Forecast */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Next 6 Hours</h4>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {weatherData.hourlyForecast.map((hour, index) => (
              <div key={index} className="flex flex-col items-center gap-1 min-w-[60px] bg-muted/50 rounded-lg p-2">
                <span className="text-xs text-muted-foreground">{hour.time}</span>
                {getWeatherIcon(hour.condition, 'sm')}
                <span className="text-sm font-medium">{hour.temp}°</span>
              </div>
            ))}
          </div>
        </div>

        {/* Yoga Recommendations */}
        {showRecommendations && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Outdoor Yoga Conditions</h4>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
              {getRecommendationIcon(weatherData.recommendation)}
              <span className="font-medium">{getRecommendationText(weatherData.recommendation)}</span>
            </div>
            
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Best outdoor yoga times: 7-10 AM, 6-8 PM</p>
              <p>• Bring water and sunscreen for UV protection</p>
              <p>• Check conditions before heading to outdoor locations</p>
            </div>
          </div>
        )}

        {/* Swiss Weather Notice */}
        <div className="bg-muted/30 border border-border rounded-lg p-3 text-sm">
          <div className="flex items-center gap-2 mb-1">
            <span>🇨🇭</span>
            <span className="font-medium">Swiss Weather Alert</span>
          </div>
          <p className="text-muted-foreground text-xs">
            Mountain weather can change rapidly. Always check local conditions for alpine locations.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}