import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, TrendingUp, TrendingDown, Minus, Plus, Trash2, Edit2, Save, X, BarChart3, Lock, LogOut, Eye, EyeOff } from 'lucide-react';

// Initial seed data with icons
const INITIAL_DATA = {
  items: {
    "Pika": {
      rarity: "Mythical",
      current_value: 4800,
      icon: "⚡",
      history: [
        { date: "2024-12-01", value: 4600 },
        { date: "2025-01-05", value: 4800 }
      ]
    },
    "Mera": {
      rarity: "Legendary",
      current_value: 3200,
      icon: "🔥",
      history: [
        { date: "2024-12-01", value: 3500 },
        { date: "2024-12-15", value: 3300 },
        { date: "2025-01-05", value: 3200 }
      ]
    },
    "Goro": {
      rarity: "Legendary",
      current_value: 2800,
      icon: "⚡",
      history: [
        { date: "2024-12-01", value: 2700 },
        { date: "2025-01-05", value: 2800 }
      ]
    },
    "Hie": {
      rarity: "Epic",
      current_value: 1500,
      icon: "❄️",
      history: [
        { date: "2024-12-01", value: 1500 }
      ]
    }
  }
};

const RARITY_COLORS = {
  Mythical: 'bg-purple-500',
  Legendary: 'bg-orange-500',
  Epic: 'bg-blue-500',
  Rare: 'bg-green-500',
  Common: 'bg-gray-500'
};

// Admin credentials management
const getAdminCredentials = () => {
  const stored = localStorage.getItem('adminCredentials');
  if (!stored) {
    const defaultCreds = {
      username: 'admin',
      password: 'admin123'
    };
    localStorage.setItem('adminCredentials', JSON.stringify(defaultCreds));
    return defaultCreds;
  }
  return JSON.parse(stored);
};

// Utility Functions
const API_URL = 'http://localhost:3001/api';

const loadData = async () => {
  try {
    const response = await fetch(`${API_URL}/items`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to load data from API:', error);
    return INITIAL_DATA; // Fallback to initial data
  }
};

const saveData = async (data) => {
  // Still save to localStorage as backup
  localStorage.setItem('tradingData', JSON.stringify(data));
  // API updates are done through specific endpoints
};

const getTrend = (history) => {
  if (history.length < 2) return 'stable';
  const latest = history[history.length - 1].value;
  const previous = history[history.length - 2].value;
  if (latest > previous) return 'up';
  if (latest < previous) return 'down';
  return 'stable';
};

const getPercentChange = (history) => {
  if (history.length < 2) return 0;
  const latest = history[history.length - 1].value;
  const previous = history[history.length - 2].value;
  return ((latest - previous) / previous * 100).toFixed(2);
};

// Main App Component
export default function TradingApp() {
  const [currentPage, setCurrentPage] = useState('list');
  const [data, setData] = useState(INITIAL_DATA);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load data from API on mount
  useEffect(() => {
    loadData().then(apiData => {
      setData(apiData);
      setLoading(false);
    });
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadData().then(setData);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // ... rest of your component

  useEffect(() => {
    saveData(data);
  }, [data]);

  useEffect(() => {
    const authStatus = localStorage.getItem('isAdminAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (success) => {
    setIsAuthenticated(success);
    if (success) {
      localStorage.setItem('isAdminAuthenticated', 'true');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAdminAuthenticated');
    setCurrentPage('list');
  };

  const updateData = (newData) => {
    setData(newData);
  };

  const navigateToAdmin = () => {
    if (isAuthenticated) {
      setCurrentPage('admin');
    } else {
      setCurrentPage('login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <nav className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-8 h-8 text-purple-500" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Trading Values
              </h1>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setCurrentPage('list')}
                className={`px-4 py-2 rounded-lg transition ${
                  currentPage === 'list' ? 'bg-purple-600' : 'hover:bg-gray-700'
                }`}
              >
                Value List
              </button>
              <button
                onClick={() => setCurrentPage('compare')}
                className={`px-4 py-2 rounded-lg transition ${
                  currentPage === 'compare' ? 'bg-purple-600' : 'hover:bg-gray-700'
                }`}
              >
                Trade Compare
              </button>
              <button
                onClick={navigateToAdmin}
                className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                  currentPage === 'admin' || currentPage === 'login' ? 'bg-purple-600' : 'hover:bg-gray-700'
                }`}
              >
                <Lock className="w-4 h-4" />
                Admin
              </button>
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg transition hover:bg-red-600 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === 'list' && (
          <ValueList 
            data={data} 
            onSelectItem={(item) => {
              setSelectedItem(item);
              setCurrentPage('detail');
            }}
          />
        )}
        {currentPage === 'detail' && selectedItem && (
          <ItemDetail 
            itemName={selectedItem} 
            data={data} 
            updateData={updateData}
            onBack={() => setCurrentPage('list')}
          />
        )}
        {currentPage === 'compare' && <TradeComparator data={data} />}
        {currentPage === 'login' && (
          <LoginPage onLogin={handleLogin} onSuccess={() => setCurrentPage('admin')} />
        )}
        {currentPage === 'admin' && isAuthenticated && (
          <AdminPanel data={data} updateData={updateData} />
        )}
      </main>
    </div>
  );
}

// Login Page Component
function LoginPage({ onLogin, onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const credentials = getAdminCredentials();
    
    if (username === credentials.username && password === credentials.password) {
      setError('');
      onLogin(true);
      onSuccess();
    } else {
      setError('Invalid username or password');
      onLogin(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-8">
        <div className="flex items-center justify-center mb-6">
          <Lock className="w-12 h-12 text-purple-500" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-6">Admin Login</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-600/20 border border-red-500 text-red-400 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition font-semibold"
          >
            Login
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-600/20 border border-blue-500 rounded-lg text-sm text-blue-300">
          <p className="font-semibold mb-1">Default Credentials:</p>
          <p>Username: admin</p>
          <p>Password: admin123</p>
          <p className="mt-2 text-xs text-blue-400">Change these in the Admin panel after first login!</p>
        </div>
      </div>
    </div>
  );
}

// Value List Component
function ValueList({ data, onSelectItem }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('value-high');

  const items = Object.entries(data.items);
  
  const filteredItems = items.filter(([name]) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  const sortedItems = [...filteredItems].sort(([nameA, itemA], [nameB, itemB]) => {
    switch (sortBy) {
      case 'value-high':
        return itemB.current_value - itemA.current_value;
      case 'value-low':
        return itemA.current_value - itemB.current_value;
      case 'alpha':
        return nameA.localeCompare(nameB);
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="value-high">Highest Value</option>
          <option value="value-low">Lowest Value</option>
          <option value="alpha">Alphabetical</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedItems.map(([name, item]) => {
          const trend = getTrend(item.history);
          const percentChange = getPercentChange(item.history);
          const lastUpdate = item.history[item.history.length - 1]?.date || 'N/A';

          return (
            <div
              key={name}
              onClick={() => onSelectItem(name)}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-5 hover:border-purple-500 cursor-pointer transition transform hover:scale-105"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {item.icon && (
                    <div className="text-3xl">{item.icon}</div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold">{name}</h3>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold mt-1 ${RARITY_COLORS[item.rarity]}`}>
                      {item.rarity}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  {trend === 'up' && <TrendingUp className="text-green-500 w-6 h-6" />}
                  {trend === 'down' && <TrendingDown className="text-red-500 w-6 h-6" />}
                  {trend === 'stable' && <Minus className="text-yellow-500 w-6 h-6" />}
                </div>
              </div>
              
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {item.current_value.toLocaleString()}
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span className={percentChange > 0 ? 'text-green-400' : percentChange < 0 ? 'text-red-400' : 'text-yellow-400'}>
                  {percentChange > 0 ? '+' : ''}{percentChange}%
                </span>
                <span>Updated: {lastUpdate}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Item Detail Component
function ItemDetail({ itemName, data, updateData, onBack }) {
  const item = data.items[itemName];
  const [newValue, setNewValue] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);

  const addValueEntry = () => {
    if (!newValue || !newDate) return;

    const updatedData = { ...data };
    updatedData.items[itemName].history.push({
      date: newDate,
      value: parseFloat(newValue)
    });
    updatedData.items[itemName].history.sort((a, b) => new Date(a.date) - new Date(b.date));
    updatedData.items[itemName].current_value = parseFloat(newValue);
    
    updateData(updatedData);
    setNewValue('');
    setNewDate(new Date().toISOString().split('T')[0]);
  };

  const removeHistoryPoint = (index) => {
    const updatedData = { ...data };
    updatedData.items[itemName].history.splice(index, 1);
    if (updatedData.items[itemName].history.length > 0) {
      updatedData.items[itemName].current_value = 
        updatedData.items[itemName].history[updatedData.items[itemName].history.length - 1].value;
    }
    updateData(updatedData);
  };

  const chartData = item.history.map(entry => ({
    date: entry.date,
    value: entry.value
  }));

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
      >
        ← Back to List
      </button>

      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            {item.icon && (
              <div className="text-6xl">{item.icon}</div>
            )}
            <div>
              <h2 className="text-3xl font-bold mb-2">{itemName}</h2>
              <span className={`inline-block px-3 py-1 rounded text-sm font-semibold ${RARITY_COLORS[item.rarity]}`}>
                {item.rarity}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-purple-400">
              {item.current_value.toLocaleString()}
            </div>
            <div className={`text-lg ${getPercentChange(item.history) > 0 ? 'text-green-400' : getPercentChange(item.history) < 0 ? 'text-red-400' : 'text-yellow-400'}`}>
              {getPercentChange(item.history) > 0 ? '+' : ''}{getPercentChange(item.history)}%
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">Value History</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#9CA3AF' }}
              />
              <Line type="monotone" dataKey="value" stroke="#A855F7" strokeWidth={2} dot={{ fill: '#A855F7', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">Add New Value Entry</h3>
          <div className="flex gap-4">
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="number"
              placeholder="Value"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={addValueEntry}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">History Entries</h3>
          <div className="space-y-2">
            {item.history.map((entry, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg">
                <span className="text-gray-300">{entry.date}</span>
                <span className="font-semibold">{entry.value.toLocaleString()}</span>
                <button
                  onClick={() => removeHistoryPoint(index)}
                  className="p-2 hover:bg-red-600/20 rounded transition"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Trade Comparator Component
function TradeComparator({ data }) {
  const [yourTrade, setYourTrade] = useState([]);
  const [theirTrade, setTheirTrade] = useState([]);
  const [fairnessThreshold, setFairnessThreshold] = useState(5);

  const addItem = (side, itemName, quantity) => {
    if (side === 'your') {
      setYourTrade([...yourTrade, { item: itemName, quantity }]);
    } else {
      setTheirTrade([...theirTrade, { item: itemName, quantity }]);
    }
  };

  const removeItem = (side, index) => {
    if (side === 'your') {
      setYourTrade(yourTrade.filter((_, i) => i !== index));
    } else {
      setTheirTrade(theirTrade.filter((_, i) => i !== index));
    }
  };

  const calculateTotal = (trades) => {
    return trades.reduce((sum, trade) => {
      const itemValue = data.items[trade.item]?.current_value || 0;
      return sum + (itemValue * trade.quantity);
    }, 0);
  };

  const yourTotal = calculateTotal(yourTrade);
  const theirTotal = calculateTotal(theirTrade);
  const difference = theirTotal - yourTotal;
  const percentDiff = yourTotal > 0 ? (difference / yourTotal * 100) : 0;

  let tradeResult = 'fair';
  if (Math.abs(percentDiff) <= fairnessThreshold) {
    tradeResult = 'fair';
  } else if (difference > 0) {
    tradeResult = 'win';
  } else {
    tradeResult = 'loss';
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Fairness Threshold (%)</label>
          <input
            type="number"
            value={fairnessThreshold}
            onChange={(e) => setFairnessThreshold(parseFloat(e.target.value))}
            className="w-32 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TradePanel
          title="Your Trade"
          items={yourTrade}
          allItems={data.items}
          onAdd={(item, qty) => addItem('your', item, qty)}
          onRemove={(index) => removeItem('your', index)}
          total={yourTotal}
        />
        <TradePanel
          title="Their Trade"
          items={theirTrade}
          allItems={data.items}
          onAdd={(item, qty) => addItem('their', item, qty)}
          onRemove={(index) => removeItem('their', index)}
          total={theirTotal}
        />
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
        <h3 className="text-2xl font-bold mb-4">Trade Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Your Total</div>
            <div className="text-2xl font-bold">{yourTotal.toLocaleString()}</div>
          </div>
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Their Total</div>
            <div className="text-2xl font-bold">{theirTotal.toLocaleString()}</div>
          </div>
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Difference</div>
            <div className={`text-2xl font-bold ${difference > 0 ? 'text-green-400' : difference < 0 ? 'text-red-400' : 'text-yellow-400'}`}>
              {difference > 0 ? '+' : ''}{difference.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">
              {percentDiff > 0 ? '+' : ''}{percentDiff.toFixed(2)}%
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-lg text-center text-2xl font-bold ${
          tradeResult === 'win' ? 'bg-green-600/20 text-green-400 border-2 border-green-500' :
          tradeResult === 'loss' ? 'bg-red-600/20 text-red-400 border-2 border-red-500' :
          'bg-yellow-600/20 text-yellow-400 border-2 border-yellow-500'
        }`}>
          {tradeResult === 'win' && '🟢 WIN'}
          {tradeResult === 'loss' && '🔴 LOSS'}
          {tradeResult === 'fair' && '🟡 FAIR'}
        </div>
      </div>
    </div>
  );
}

function TradePanel({ title, items, allItems, onAdd, onRemove, total }) {
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleAdd = () => {
    if (selectedItem && quantity > 0) {
      onAdd(selectedItem, parseInt(quantity));
      setSelectedItem('');
      setQuantity(1);
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      
      <div className="flex gap-2 mb-4">
        <select
          value={selectedItem}
          onChange={(e) => setSelectedItem(e.target.value)}
          className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">Select item...</option>
          {Object.keys(allItems).sort().map(item => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-2 mb-4">
        {items.map((trade, index) => (
          <div key={index} className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg">
            <div className="flex-1">
              <div className="font-semibold">{trade.item} x{trade.quantity}</div>
              <div className="text-sm text-gray-400">
                {(allItems[trade.item]?.current_value * trade.quantity).toLocaleString()}
              </div>
            </div>
            <button
              onClick={() => onRemove(index)}
              className="p-2 hover:bg-red-600/20 rounded transition"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-gray-700">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">Total:</span>
          <span className="text-2xl font-bold text-purple-400">{total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

// Admin Panel Component
function AdminPanel({ data, updateData }) {
  const [editMode, setEditMode] = useState(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemRarity, setNewItemRarity] = useState('Common');
  const [newItemValue, setNewItemValue] = useState('');
  const [newItemIcon, setNewItemIcon] = useState('');
  const [showCredentialsEdit, setShowCredentialsEdit] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [credentialsError, setCredentialsError] = useState('');
  const [credentialsSuccess, setCredentialsSuccess] = useState('');

  const addNewItem = () => {
    if (!newItemName || !newItemValue) return;

    const updatedData = { ...data };
    updatedData.items[newItemName] = {
      rarity: newItemRarity,
      current_value: parseFloat(newItemValue),
      icon: newItemIcon || '📦',
      history: [{
        date: new Date().toISOString().split('T')[0],
        value: parseFloat(newItemValue)
      }]
    };
    
    updateData(updatedData);
    setNewItemName('');
    setNewItemValue('');
    setNewItemRarity('Common');
    setNewItemIcon('');
  };

  const deleteItem = (itemName) => {
    if (!confirm(`Delete ${itemName}?`)) return;
    
    const updatedData = { ...data };
    delete updatedData.items[itemName];
    updateData(updatedData);
  };

  const updateItem = (itemName, field, value) => {
    const updatedData = { ...data };
    updatedData.items[itemName][field] = value;
    updateData(updatedData);
    setEditMode(null);
  };

  const updateCredentials = () => {
    if (!newUsername || !newPassword) {
      setCredentialsError('Username and password are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setCredentialsError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setCredentialsError('Password must be at least 6 characters');
      return;
    }

    const newCredentials = {
      username: newUsername,
      password: newPassword
    };

    localStorage.setItem('adminCredentials', JSON.stringify(newCredentials));
    setCredentialsError('');
    setCredentialsSuccess('Credentials updated successfully! Please login again.');
    
    setTimeout(() => {
      localStorage.removeItem('isAdminAuthenticated');
      window.location.reload();
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Security Settings</h2>
          <button
            onClick={() => setShowCredentialsEdit(!showCredentialsEdit)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition flex items-center gap-2"
          >
            <Lock className="w-4 h-4" />
            {showCredentialsEdit ? 'Hide' : 'Change Credentials'}
          </button>
        </div>

        {showCredentialsEdit && (
          <div className="bg-gray-700/50 p-4 rounded-lg space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">New Username</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter new username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter new password (min 6 characters)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Confirm new password"
              />
            </div>

            {credentialsError && (
              <div className="bg-red-600/20 border border-red-500 text-red-400 px-4 py-2 rounded-lg text-sm">
                {credentialsError}
              </div>
            )}

            {credentialsSuccess && (
              <div className="bg-green-600/20 border border-green-500 text-green-400 px-4 py-2 rounded-lg text-sm">
                {credentialsSuccess}
              </div>
            )}

            <button
              onClick={updateCredentials}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition font-semibold"
            >
              Update Credentials
            </button>
          </div>
        )}
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Add New Item</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Item Name"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="text"
            placeholder="Icon (emoji or URL)"
            value={newItemIcon}
            onChange={(e) => setNewItemIcon(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <select
            value={newItemRarity}
            onChange={(e) => setNewItemRarity(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option>Mythical</option>
            <option>Legendary</option>
            <option>Epic</option>
            <option>Rare</option>
            <option>Common</option>
          </select>
          <input
            type="number"
            placeholder="Initial Value"
            value={newItemValue}
            onChange={(e) => setNewItemValue(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={addNewItem}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Item
          </button>
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Manage Items</h2>
        <div className="space-y-3">
          {Object.entries(data.items).map(([name, item]) => (
            <div key={name} className="bg-gray-700/50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex items-center gap-3">
                  {item.icon && (
                    <div className="text-2xl">{item.icon}</div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold">{name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${RARITY_COLORS[item.rarity]}`}>
                        {item.rarity}
                      </span>
                    </div>
                    {editMode === name ? (
                      <div className="flex gap-2 mt-2">
                        <input
                          type="number"
                          defaultValue={item.current_value}
                          onBlur={(e) => updateItem(name, 'current_value', parseFloat(e.target.value))}
                          className="px-3 py-1 bg-gray-600 border border-gray-500 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <button
                          onClick={() => setEditMode(null)}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded transition"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-2xl font-bold text-purple-400 mt-1">
                        {item.current_value.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditMode(name)}
                    className="p-2 hover:bg-blue-600/20 rounded transition"
                  >
                    <Edit2 className="w-5 h-5 text-blue-400" />
                  </button>
                  <button
                    onClick={() => deleteItem(name)}
                    className="p-2 hover:bg-red-600/20 rounded transition"
                  >
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
