import { useState } from 'react';
import { Filter, X, Calendar, Users, MapPin, Clock, DollarSign, Star, ChevronDown, Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Separator } from '../ui/separator';
import { Slider } from '../ui/slider';
import { useLanguage } from '../LanguageProvider';

export interface ScheduleFilters {
  search: string;
  locations: string[];
  instructors: string[];
  categories: string[];
  levels: string[];
  languages: string[];
  timeRange: {
    start?: string;
    end?: string;
  };
  dateRange: {
    start?: string;
    end?: string;
  };
  priceRange: {
    min?: number;
    max?: number;
  };
  capacityRange: {
    min?: number;
    max?: number;
  };
  occupancyRange: {
    min?: number;
    max?: number;
  };
  status: string[];
  paymentMethods: string[];
  contentTypes: string[];
  hasWaitlist?: boolean;
  isOnline?: boolean;
  isFull?: boolean;
  isRecurring?: boolean;
  showCancelled?: boolean;
}

interface AdvancedScheduleFiltersProps {
  filters: ScheduleFilters;
  onFiltersChange: (filters: ScheduleFilters) => void;
  availableOptions: {
    locations: Array<{ id: string; name: string; }>;
    instructors: Array<{ id: string; name: string; }>;
    categories: string[];
    levels: string[];
  };
}

export function AdvancedScheduleFilters({ 
  filters, 
  onFiltersChange, 
  availableOptions 
}: AdvancedScheduleFiltersProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  
  const languages = [
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
  ];

  const contentTypes = [
    { value: 'class', label: 'Classes' },
    { value: 'workshop', label: 'Workshops' },
    { value: 'course', label: 'Courses/Series' },
    { value: 'private', label: 'Private Classes' },
    { value: 'event', label: 'Events/Retreats' }
  ];

  const paymentMethods = [
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'twint', label: 'TWINT' },
    { value: 'cash', label: 'Cash' },
    { value: 'package', label: 'Package' },
    { value: 'membership', label: 'Membership' }
  ];

  const statusOptions = [
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'completed', label: 'Completed' }
  ];

  const updateFilter = (key: keyof ScheduleFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const updateArrayFilter = (key: keyof ScheduleFilters, value: string, checked: boolean) => {
    const currentArray = (filters[key] as string[]) || [];
    const newArray = checked 
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value);
    
    updateFilter(key, newArray);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      locations: [],
      instructors: [],
      categories: [],
      levels: [],
      languages: [],
      timeRange: {},
      dateRange: {},
      priceRange: {},
      capacityRange: {},
      occupancyRange: {},
      status: [],
      paymentMethods: [],
      contentTypes: [],
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    count += filters.locations?.length || 0;
    count += filters.instructors?.length || 0;
    count += filters.categories?.length || 0;
    count += filters.levels?.length || 0;
    count += filters.languages?.length || 0;
    count += filters.status?.length || 0;
    count += filters.paymentMethods?.length || 0;
    count += filters.contentTypes?.length || 0;
    if (filters.timeRange?.start || filters.timeRange?.end) count++;
    if (filters.dateRange?.start || filters.dateRange?.end) count++;
    if (filters.priceRange?.min || filters.priceRange?.max) count++;
    if (filters.capacityRange?.min || filters.capacityRange?.max) count++;
    if (filters.occupancyRange?.min || filters.occupancyRange?.max) count++;
    if (filters.hasWaitlist !== undefined) count++;
    if (filters.isOnline !== undefined) count++;
    if (filters.isFull !== undefined) count++;
    if (filters.isRecurring !== undefined) count++;
    if (filters.showCancelled !== undefined) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="flex items-center gap-4">
      {/* Search Input */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search classes, instructors..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Quick Filters */}
      <Select 
        value={filters.locations?.[0] || 'all'} 
        onValueChange={(value) => updateFilter('locations', value === 'all' ? [] : [value])}
      >
        <SelectTrigger className="w-40">
          <MapPin className="h-4 w-4" />
          <SelectValue placeholder="Location" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Locations</SelectItem>
          {availableOptions.locations.map(location => (
            <SelectItem key={location.id} value={location.id}>
              {location.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select 
        value={filters.instructors?.[0] || 'all'} 
        onValueChange={(value) => updateFilter('instructors', value === 'all' ? [] : [value])}
      >
        <SelectTrigger className="w-40">
          <Users className="h-4 w-4" />
          <SelectValue placeholder="Instructor" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Instructors</SelectItem>
          {availableOptions.instructors.map(instructor => (
            <SelectItem key={instructor.id} value={instructor.id}>
              {instructor.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Advanced Filters Button */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="relative">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="end">
          <div className="max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Advanced Filters</h3>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  Clear All
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-4 space-y-6">
              {/* Content Types */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Content Types</Label>
                <div className="grid grid-cols-2 gap-2">
                  {contentTypes.map(type => (
                    <div key={type.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`content-${type.value}`}
                        checked={filters.contentTypes?.includes(type.value) || false}
                        onCheckedChange={(checked) => updateArrayFilter('contentTypes', type.value, !!checked)}
                      />
                      <Label htmlFor={`content-${type.value}`} className="text-sm">
                        {type.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Categories */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Categories</Label>
                <div className="grid grid-cols-2 gap-2">
                  {availableOptions.categories.map(category => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={filters.categories?.includes(category) || false}
                        onCheckedChange={(checked) => updateArrayFilter('categories', category, !!checked)}
                      />
                      <Label htmlFor={`category-${category}`} className="text-sm">
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Levels */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Levels</Label>
                <div className="grid grid-cols-2 gap-2">
                  {availableOptions.levels.map(level => (
                    <div key={level} className="flex items-center space-x-2">
                      <Checkbox
                        id={`level-${level}`}
                        checked={filters.levels?.includes(level) || false}
                        onCheckedChange={(checked) => updateArrayFilter('levels', level, !!checked)}
                      />
                      <Label htmlFor={`level-${level}`} className="text-sm">
                        {level}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Languages */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Languages</Label>
                <div className="grid grid-cols-2 gap-2">
                  {languages.map(lang => (
                    <div key={lang.code} className="flex items-center space-x-2">
                      <Checkbox
                        id={`lang-${lang.code}`}
                        checked={filters.languages?.includes(lang.code) || false}
                        onCheckedChange={(checked) => updateArrayFilter('languages', lang.code, !!checked)}
                      />
                      <Label htmlFor={`lang-${lang.code}`} className="text-sm flex items-center gap-1">
                        <span>{lang.flag}</span>
                        {lang.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Date Range */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Date Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="date-start" className="text-xs text-muted-foreground">From</Label>
                    <Input
                      id="date-start"
                      type="date"
                      value={filters.dateRange?.start || ''}
                      onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, start: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="date-end" className="text-xs text-muted-foreground">To</Label>
                    <Input
                      id="date-end"
                      type="date"
                      value={filters.dateRange?.end || ''}
                      onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, end: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Time Range */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Time Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="time-start" className="text-xs text-muted-foreground">From</Label>
                    <Input
                      id="time-start"
                      type="time"
                      value={filters.timeRange?.start || ''}
                      onChange={(e) => updateFilter('timeRange', { ...filters.timeRange, start: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="time-end" className="text-xs text-muted-foreground">To</Label>
                    <Input
                      id="time-end"
                      type="time"
                      value={filters.timeRange?.end || ''}
                      onChange={(e) => updateFilter('timeRange', { ...filters.timeRange, end: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Price Range */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Price Range (CHF {filters.priceRange?.min || 0} - {filters.priceRange?.max || 100})
                </Label>
                <Slider
                  value={[filters.priceRange?.min || 0, filters.priceRange?.max || 100]}
                  onValueChange={([min, max]) => updateFilter('priceRange', { min, max })}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              <Separator />

              {/* Capacity Range */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Capacity Range ({filters.capacityRange?.min || 1} - {filters.capacityRange?.max || 50} participants)
                </Label>
                <Slider
                  value={[filters.capacityRange?.min || 1, filters.capacityRange?.max || 50]}
                  onValueChange={([min, max]) => updateFilter('capacityRange', { min, max })}
                  min={1}
                  max={50}
                  step={1}
                  className="w-full"
                />
              </div>

              <Separator />

              {/* Occupancy Range */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Occupancy Rate ({filters.occupancyRange?.min || 0}% - {filters.occupancyRange?.max || 100}%)
                </Label>
                <Slider
                  value={[filters.occupancyRange?.min || 0, filters.occupancyRange?.max || 100]}
                  onValueChange={([min, max]) => updateFilter('occupancyRange', { min, max })}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              <Separator />

              {/* Status */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Status</Label>
                <div className="space-y-2">
                  {statusOptions.map(status => (
                    <div key={status.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status.value}`}
                        checked={filters.status?.includes(status.value) || false}
                        onCheckedChange={(checked) => updateArrayFilter('status', status.value, !!checked)}
                      />
                      <Label htmlFor={`status-${status.value}`} className="text-sm">
                        {status.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Payment Methods */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Payment Methods</Label>
                <div className="space-y-2">
                  {paymentMethods.map(method => (
                    <div key={method.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`payment-${method.value}`}
                        checked={filters.paymentMethods?.includes(method.value) || false}
                        onCheckedChange={(checked) => updateArrayFilter('paymentMethods', method.value, !!checked)}
                      />
                      <Label htmlFor={`payment-${method.value}`} className="text-sm">
                        {method.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Boolean Filters */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has-waitlist"
                    checked={filters.hasWaitlist || false}
                    onCheckedChange={(checked) => updateFilter('hasWaitlist', checked || undefined)}
                  />
                  <Label htmlFor="has-waitlist" className="text-sm">
                    Has Waitlist
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is-online"
                    checked={filters.isOnline || false}
                    onCheckedChange={(checked) => updateFilter('isOnline', checked || undefined)}
                  />
                  <Label htmlFor="is-online" className="text-sm">
                    Online Classes Only
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is-full"
                    checked={filters.isFull || false}
                    onCheckedChange={(checked) => updateFilter('isFull', checked || undefined)}
                  />
                  <Label htmlFor="is-full" className="text-sm">
                    Full Classes Only
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is-recurring"
                    checked={filters.isRecurring || false}
                    onCheckedChange={(checked) => updateFilter('isRecurring', checked || undefined)}
                  />
                  <Label htmlFor="is-recurring" className="text-sm">
                    Recurring Classes
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-cancelled"
                    checked={filters.showCancelled || false}
                    onCheckedChange={(checked) => updateFilter('showCancelled', checked || undefined)}
                  />
                  <Label htmlFor="show-cancelled" className="text-sm">
                    Show Cancelled Classes
                  </Label>
                </div>
              </div>
            </div>

            <div className="p-4 border-t bg-muted/30">
              <Button 
                onClick={() => setIsOpen(false)}
                className="w-full"
              >
                Apply Filters ({activeFiltersCount})
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Active:</span>
          <Badge variant="secondary">{activeFiltersCount}</Badge>
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}