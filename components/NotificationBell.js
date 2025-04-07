import { useEffect, useState } from "react";
import axios from "axios";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const { data } = await axios.get("/notifications");
    setNotifications(data);
  };

  const unseenCount = notifications.filter(n => !n.seen).length;

  return (
    <div className="relative">
      <button
        onClick={() => setShowList(!showList)}
        className="relative p-2"
      >
        🔔
        {unseenCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
            {unseenCount}
          </span>
        )}
      </button>

      {showList && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg p-4 rounded">
          <h3 className="text-lg font-bold mb-2">Notifications</h3>
          {notifications.length === 0 ? (
            <p className="text-sm text-gray-500">No notifications yet</p>
          ) : (
            notifications.map((n, index) => (
              <div key={index} className="mb-2">
                <p>{n.message}</p>
                <small className="text-gray-400">
                  {new Date(n.createdAt).toLocaleString()}
                </small>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
