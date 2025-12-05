'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, BellRing, Volume2, VolumeX, X, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
}

// Create notification sound using Web Audio API
const createNotificationSound = () => {
  if (typeof window === 'undefined') return null;
  
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  return () => {
    // Create a pleasant notification chime
    const playTone = (frequency: number, startTime: number, duration: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime + startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + startTime + duration);
      
      oscillator.start(audioContext.currentTime + startTime);
      oscillator.stop(audioContext.currentTime + startTime + duration);
    };
    
    // Play a pleasant two-tone chime
    playTone(880, 0, 0.15);      // A5
    playTone(1108.73, 0.15, 0.2); // C#6
    playTone(1318.51, 0.3, 0.3);  // E6
  };
};

export default function OrderNotification() {
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastCheckedCount, setLastCheckedCount] = useState<number | null>(null);
  const playSoundRef = useRef<(() => void) | null>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Initialize audio
  useEffect(() => {
    playSoundRef.current = createNotificationSound();
    
    // Load sound preference from localStorage
    const savedSoundPref = localStorage.getItem('orderNotificationSound');
    if (savedSoundPref !== null) {
      setSoundEnabled(savedSoundPref === 'true');
    }
  }, []);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (soundEnabled && playSoundRef.current) {
      try {
        playSoundRef.current();
      } catch (err) {
        console.log('Could not play sound:', err);
      }
    }
  }, [soundEnabled]);

  // Fetch pending orders
  const fetchPendingOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders?status=PENDING');
      if (res.ok) {
        const data = await res.json();
        const pending = Array.isArray(data) ? data.filter((o: Order) => o.status === 'PENDING') : [];
        
        // Check if there are new orders
        if (lastCheckedCount !== null && pending.length > lastCheckedCount) {
          const newCount = pending.length - lastCheckedCount;
          setNewOrdersCount(prev => prev + newCount);
          playNotificationSound();
          
          // Show toast notification
          toast.custom((t) => (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4"
            >
              <div className="bg-white/20 p-2 rounded-full">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-lg">🔔 New Order!</p>
                <p className="text-white/90">You have {newCount} new pending order{newCount > 1 ? 's' : ''}</p>
              </div>
              <button 
                onClick={() => toast.dismiss(t.id)}
                className="ml-4 hover:bg-white/20 p-1 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          ), { duration: 5000 });
        }
        
        setPendingOrders(pending);
        setLastCheckedCount(pending.length);
      }
    } catch (error) {
      console.error('Failed to fetch pending orders:', error);
    }
  }, [lastCheckedCount, playNotificationSound]);

  // Poll for new orders every 30 seconds
  useEffect(() => {
    fetchPendingOrders();
    const interval = setInterval(fetchPendingOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchPendingOrders]);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle sound and save preference
  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem('orderNotificationSound', String(newValue));
    toast.success(newValue ? '🔔 Notifications sound enabled' : '🔕 Notifications sound disabled');
  };

  // Clear new orders count when viewing notifications
  const handleBellClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      setNewOrdersCount(0);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={notificationRef}>
      {/* Notification Bell Button */}
      <button
        onClick={handleBellClick}
        className="relative p-1.5 lg:p-2 rounded-lg lg:rounded-xl bg-white/90 lg:bg-white dark:bg-chocolate-800 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-chocolate-700"
      >
        <AnimatePresence mode="wait">
          {pendingOrders.length > 0 ? (
            <motion.div
              key="ringing"
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, 15, -15, 10, -10, 5, -5, 0] }}
              transition={{ duration: 0.5, repeat: newOrdersCount > 0 ? Infinity : 0, repeatDelay: 2 }}
            >
              <BellRing className="w-5 h-5 lg:w-6 lg:h-6 text-orange-500" />
            </motion.div>
          ) : (
            <Bell className="w-5 h-5 lg:w-6 lg:h-6 text-gray-500 dark:text-gray-400" />
          )}
        </AnimatePresence>
        
        {/* Badge */}
        {pendingOrders.length > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] lg:text-xs font-bold rounded-full min-w-[16px] lg:min-w-[20px] h-4 lg:h-5 flex items-center justify-center px-1"
          >
            {pendingOrders.length}
          </motion.span>
        )}
        
        {/* New orders indicator */}
        {newOrdersCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="absolute -bottom-1 -right-1 bg-green-500 w-2 h-2 lg:w-3 lg:h-3 rounded-full"
          />
        )}
      </button>

      {/* Notifications Dropdown */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-chocolate-900 rounded-xl shadow-2xl border border-gray-200 dark:border-chocolate-700 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-chocolate-600 to-chocolate-700 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold">Pending Orders</h3>
                <p className="text-sm text-white/80">{pendingOrders.length} order{pendingOrders.length !== 1 ? 's' : ''} waiting</p>
              </div>
              <button
                onClick={toggleSound}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title={soundEnabled ? 'Disable sound' : 'Enable sound'}
              >
                {soundEnabled ? (
                  <Volume2 className="w-5 h-5" />
                ) : (
                  <VolumeX className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Orders List */}
            <div className="max-h-80 overflow-y-auto">
              {pendingOrders.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No pending orders</p>
                </div>
              ) : (
                pendingOrders.map((order, index) => (
                  <motion.a
                    key={order.id}
                    href="/admin/dashboard/orders"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="block p-4 border-b border-gray-100 dark:border-chocolate-800 hover:bg-gray-50 dark:hover:bg-chocolate-800 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
                        <ShoppingBag className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">
                            {order.customerName || 'Customer'}
                          </p>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            {formatTime(order.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Order #{order.id.slice(-6).toUpperCase()}
                        </p>
                        <p className="text-sm font-medium text-chocolate-600 dark:text-chocolate-400">
                          {order.total.toFixed(2)} EGP
                        </p>
                      </div>
                    </div>
                  </motion.a>
                ))
              )}
            </div>

            {/* Footer */}
            {pendingOrders.length > 0 && (
              <a
                href="/admin/dashboard/orders"
                className="block p-3 text-center text-chocolate-600 dark:text-chocolate-400 hover:bg-gray-50 dark:hover:bg-chocolate-800 font-medium transition-colors"
              >
                View All Orders →
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
