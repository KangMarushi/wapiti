import { useEffect, useState } from 'react';
import { Alert } from '../types/types';

export default function AlertBell() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showAlerts, setShowAlerts] = useState(false);

  useEffect(() => {
    fetchAlerts();
    // Poll for new alerts every minute
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  async function fetchAlerts() {
    try {
      const res = await fetch('/api/alerts');
      const data = await res.json();
      setAlerts(data.alerts || []);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    }
  }

  async function markAsRead(alertId: string) {
    try {
      await fetch('/api/alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: alertId })
      });
      fetchAlerts();
    } catch (error) {
      console.error('Failed to mark alert as read:', error);
    }
  }

  const unreadAlerts = alerts.filter(alert => !alert.isRead);

  return (
    <div className="relative">
      <button
        onClick={() => setShowAlerts(!showAlerts)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadAlerts.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadAlerts.length}
          </span>
        )}
      </button>

      {showAlerts && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {alerts.length === 0 ? (
              <p className="p-4 text-gray-500 text-center">No alerts</p>
            ) : (
              alerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-4 border-b border-gray-100 ${
                    alert.isRead ? 'bg-gray-50' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${
                          alert.severity === 'critical'
                            ? 'bg-red-600'
                            : alert.severity === 'warning'
                            ? 'bg-yellow-500'
                            : 'bg-blue-500'
                        }`}
                      />
                    </div>
                    <div className="ml-3 w-full">
                      <p className="text-sm text-gray-900">{alert.message}</p>
                      <div className="mt-1 flex justify-between items-center">
                        <p className="text-xs text-gray-500">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                        {!alert.isRead && (
                          <button
                            onClick={() => markAsRead(alert.id)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
} 