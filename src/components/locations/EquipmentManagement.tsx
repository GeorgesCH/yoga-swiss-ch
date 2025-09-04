import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { 
  Search, Plus, Package, AlertTriangle, CheckCircle, 
  Calendar, MapPin, User, Settings, Edit2, Trash2,
  Clock, TrendingDown, TrendingUp, Activity, Wrench
} from 'lucide-react';

// Mock data for equipment
const mockEquipment = [
  {
    id: 'eq1',
    name: 'Yoga Mats (Premium)',
    category: 'Mats',
    location: 'Main Studio Zürich',
    quantity: 30,
    condition: 'Good',
    last_maintenance: '2024-01-10',
    next_maintenance: '2024-04-10',
    purchase_date: '2023-06-15',
    cost: 45.00,
    supplier: 'Swiss Yoga Supplies',
    status: 'Active',
    usage_frequency: 'High',
    notes: 'High-quality eco-friendly mats'
  },
  {
    id: 'eq2',
    name: 'Yoga Blocks',
    category: 'Props',
    location: 'Main Studio Zürich',
    quantity: 50,
    condition: 'Excellent',
    last_maintenance: '2024-01-15',
    next_maintenance: '2024-07-15',
    purchase_date: '2023-08-20',
    cost: 15.00,
    supplier: 'ZenCraft',
    status: 'Active',
    usage_frequency: 'Medium',
    notes: 'Cork blocks, eco-friendly'
  },
  {
    id: 'eq3',
    name: 'Sound System (Bose)',
    category: 'Audio',
    location: 'Hot Yoga Geneva',
    quantity: 1,
    condition: 'Good',
    last_maintenance: '2023-12-20',
    next_maintenance: '2024-06-20',
    purchase_date: '2022-03-10',
    cost: 2500.00,
    supplier: 'AudioTech Swiss',
    status: 'Active',
    usage_frequency: 'High',
    notes: 'Professional sound system with wireless microphones'
  },
  {
    id: 'eq4',
    name: 'Meditation Cushions',
    category: 'Props',
    location: 'Wellness Center Lugano',
    quantity: 20,
    condition: 'Fair',
    last_maintenance: '2024-01-05',
    next_maintenance: '2024-03-05',
    purchase_date: '2022-11-30',
    cost: 35.00,
    supplier: 'Mindful Living',
    status: 'Needs Replacement',
    usage_frequency: 'Low',
    notes: 'Some cushions showing wear, need replacement soon'
  },
  {
    id: 'eq5',
    name: 'Air Conditioning Unit',
    category: 'Climate',
    location: 'Main Studio Zürich',
    quantity: 2,
    condition: 'Excellent',
    last_maintenance: '2024-01-08',
    next_maintenance: '2024-07-08',
    purchase_date: '2023-04-15',
    cost: 3200.00,
    supplier: 'ClimaTech AG',
    status: 'Active',
    usage_frequency: 'High',
    notes: 'Energy-efficient units with smart controls'
  }
];

const categoryColors = {
  'Mats': 'bg-blue-100 text-blue-800',
  'Props': 'bg-green-100 text-green-800',
  'Audio': 'bg-purple-100 text-purple-800',
  'Climate': 'bg-orange-100 text-orange-800',
  'Cleaning': 'bg-cyan-100 text-cyan-800',
  'Storage': 'bg-gray-100 text-gray-800'
};

const conditionColors = {
  'Excellent': 'bg-green-100 text-green-800',
  'Good': 'bg-blue-100 text-blue-800',
  'Fair': 'bg-yellow-100 text-yellow-800',
  'Poor': 'bg-red-100 text-red-800'
};

const statusColors = {
  'Active': 'bg-green-100 text-green-800',
  'Maintenance': 'bg-yellow-100 text-yellow-800',
  'Needs Replacement': 'bg-red-100 text-red-800',
  'Retired': 'bg-gray-100 text-gray-800'
};

export function EquipmentManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('name');

  // Get unique values for filters
  const categories = [...new Set(mockEquipment.map(e => e.category))];
  const locations = [...new Set(mockEquipment.map(e => e.location))];
  const conditions = [...new Set(mockEquipment.map(e => e.condition))];

  // Filter and sort equipment
  const filteredEquipment = useMemo(() => {
    let filtered = mockEquipment.filter(equipment => {
      const matchesSearch = searchTerm === '' || 
        equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipment.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipment.supplier.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || equipment.category === selectedCategory;
      const matchesLocation = selectedLocation === 'all' || equipment.location === selectedLocation;
      const matchesCondition = selectedCondition === 'all' || equipment.condition === selectedCondition;

      return matchesSearch && matchesCategory && matchesLocation && matchesCondition;
    });

    // Sort equipment
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'cost':
          return b.cost - a.cost;
        case 'quantity':
          return b.quantity - a.quantity;
        case 'condition':
          return a.condition.localeCompare(b.condition);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchTerm, selectedCategory, selectedLocation, selectedCondition, sortBy]);

  const toggleEquipmentSelection = (equipmentId: string) => {
    setSelectedEquipment(prev => 
      prev.includes(equipmentId)
        ? prev.filter(id => id !== equipmentId)
        : [...prev, equipmentId]
    );
  };

  const toggleAllEquipment = () => {
    if (selectedEquipment.length === filteredEquipment.length) {
      setSelectedEquipment([]);
    } else {
      setSelectedEquipment(filteredEquipment.map(e => e.id));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getConditionIcon = (condition: string) => {
    switch (condition) {
      case 'Excellent':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Good':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'Fair':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'Poor':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getUsageIcon = (frequency: string) => {
    switch (frequency) {
      case 'High':
        return <TrendingUp className="w-4 h-4 text-red-600" />;
      case 'Medium':
        return <Activity className="w-4 h-4 text-yellow-600" />;
      case 'Low':
        return <TrendingDown className="w-4 h-4 text-green-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const EquipmentRow = ({ equipment }: { equipment: any }) => (
    <div className="flex items-center p-4 border-b hover:bg-gray-50">
      <Checkbox 
        checked={selectedEquipment.includes(equipment.id)}
        onCheckedChange={() => toggleEquipmentSelection(equipment.id)}
      />
      
      <div className="flex-1 ml-4">
        <div className="grid grid-cols-8 gap-4 items-center">
          <div className="col-span-2">
            <div className="font-medium">{equipment.name}</div>
            <div className="text-sm text-muted-foreground">{equipment.supplier}</div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge className={categoryColors[equipment.category] || 'bg-gray-100'}>
              {equipment.category}
            </Badge>
          </div>
          
          <div className="text-sm">
            <div className="flex items-center space-x-1">
              <MapPin className="w-3 h-3 text-muted-foreground" />
              <span>{equipment.location}</span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="font-medium">{equipment.quantity}</div>
            <div className="text-xs text-muted-foreground">units</div>
          </div>
          
          <div className="flex items-center space-x-2">
            {getConditionIcon(equipment.condition)}
            <Badge className={conditionColors[equipment.condition]}>
              {equipment.condition}
            </Badge>
          </div>
          
          <div className="text-sm">
            <div className="font-medium">{formatCurrency(equipment.cost)}</div>
            <div className="text-xs text-muted-foreground">per unit</div>
          </div>
          
          <div className="flex items-center space-x-2">
            {getUsageIcon(equipment.usage_frequency)}
            <Badge variant="outline" className={statusColors[equipment.status]}>
              {equipment.status}
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 ml-4">
        <Button variant="outline" size="sm">
          <Edit2 className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm">
          <Wrench className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  // Calculate summary stats
  const stats = {
    total: mockEquipment.length,
    totalValue: mockEquipment.reduce((sum, e) => sum + (e.cost * e.quantity), 0),
    needsMaintenance: mockEquipment.filter(e => 
      new Date(e.next_maintenance) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    ).length,
    needsReplacement: mockEquipment.filter(e => e.status === 'Needs Replacement').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Equipment Management</h2>
          <p className="text-muted-foreground">
            Track and manage equipment across all locations
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Maintenance Schedule
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Equipment
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Equipment</p>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-blue-600">items tracked</p>
              </div>
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</p>
                <p className="text-xs text-green-600">investment</p>
              </div>
              <TrendingUp className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Needs Maintenance</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.needsMaintenance}</p>
                <p className="text-xs text-yellow-600">within 30 days</p>
              </div>
              <Wrench className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Needs Replacement</p>
                <p className="text-2xl font-bold text-red-600">{stats.needsReplacement}</p>
                <p className="text-xs text-red-600">urgent attention</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search equipment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Conditions</SelectItem>
                  {conditions.map(condition => (
                    <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-3">
              {selectedEquipment.length > 0 && (
                <Badge variant="outline">
                  {selectedEquipment.length} selected
                </Badge>
              )}
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="cost">Cost</SelectItem>
                  <SelectItem value="quantity">Quantity</SelectItem>
                  <SelectItem value="condition">Condition</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Column Headers */}
          <div className="grid grid-cols-8 gap-4 p-4 border-b bg-gray-50 text-sm font-medium text-muted-foreground">
            <div className="col-span-2 flex items-center space-x-3">
              <Checkbox 
                checked={selectedEquipment.length === filteredEquipment.length}
                onCheckedChange={toggleAllEquipment}
              />
              <span>Equipment</span>
            </div>
            <div>Category</div>
            <div>Location</div>
            <div>Quantity</div>
            <div>Condition</div>
            <div>Cost</div>
            <div>Status</div>
          </div>

          {/* Equipment List */}
          <div className="divide-y">
            {filteredEquipment.map(equipment => (
              <EquipmentRow key={equipment.id} equipment={equipment} />
            ))}
          </div>

          {filteredEquipment.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="font-medium mb-2">No equipment found</h3>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}