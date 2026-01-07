import { useState, useEffect } from 'react';
import { FiClock, FiX, FiTrash2 } from 'react-icons/fi';
import api from '../utils/api';
import useAuthStore from '../stores/useAuthStore';
import toast from 'react-hot-toast';

const SearchHistory = ({ onSearchClick, className = '' }) => {
  const { isAuthenticated } = useAuthStore();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory();
    }
  }, [isAuthenticated]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/users/search-history');
      setHistory(data.data || []);
    } catch (error) {
      console.error('Failed to fetch search history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchClick = (query) => {
    if (onSearchClick) {
      onSearchClick(query);
    }
    setShowHistory(false);
  };

  const handleDeleteItem = async (index, e) => {
    e.stopPropagation();
    try {
      const { data } = await api.delete(`/users/search-history/${index}`);
      setHistory(data.data || []);
      toast.success('Removed from history');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Clear all search history?')) return;
    
    try {
      await api.delete('/users/search-history');
      setHistory([]);
      toast.success('Search history cleared');
    } catch (error) {
      toast.error('Failed to clear history');
    }
  };

  if (!isAuthenticated || history.length === 0) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <FiClock className="text-lg" />
        <span>Recent Searches ({history.length})</span>
      </button>

      {showHistory && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowHistory(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Recent Searches</h3>
              {history.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <FiTrash2 className="text-xs" />
                  Clear All
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  Loading...
                </div>
              ) : (
                <div className="py-2">
                  {history.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearchClick(item.query)}
                      className="w-full px-4 py-2.5 hover:bg-gray-50 flex items-center justify-between group transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 text-left">
                        <FiClock className="text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.query}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(item.timestamp).toLocaleDateString('vi-VN', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteItem(index, e)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <FiX className="text-lg" />
                      </button>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SearchHistory;
