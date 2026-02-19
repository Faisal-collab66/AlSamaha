import React, { useEffect, useState } from 'react';
import {
  collection, query, orderBy, limit, onSnapshot, doc,
  updateDoc, getDocs, where, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';

type OrderStatus = 'RECEIVED' | 'PREPARING' | 'READY' | 'PICKED_UP' | 'DELIVERED' | 'CANCELLED';

interface Order {
  id: string;
  status: OrderStatus;
  customerId: string;
  driverId?: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  paymentMethod: string;
  delivery: { type: string; address?: { line1: string } };
  timestamps: { createdAt: any };
}

interface Driver {
  id: string;
  isOnline: boolean;
  activeOrderId?: string;
}

const STATUS_FLOW: Record<OrderStatus, OrderStatus | null> = {
  RECEIVED: 'PREPARING',
  PREPARING: 'READY',
  READY: 'PICKED_UP',
  PICKED_UP: 'DELIVERED',
  DELIVERED: null,
  CANCELLED: null,
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  RECEIVED: '#6B7280',
  PREPARING: '#F59E0B',
  READY: '#3B82F6',
  PICKED_UP: '#8B5CF6',
  DELIVERED: '#22C55E',
  CANCELLED: '#EF4444',
};

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<OrderStatus | 'ALL'>('ALL');

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('timestamps.createdAt', 'desc'), limit(50));
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order)));
    });

    const driverUnsub = onSnapshot(collection(db, 'drivers'), (snap) => {
      setDrivers(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Driver)));
    });

    return () => { unsub(); driverUnsub(); };
  }, []);

  const advanceStatus = async (orderId: string, currentStatus: OrderStatus) => {
    const next = STATUS_FLOW[currentStatus];
    if (!next) return;
    const statusField = next.toLowerCase() + 'At';
    await updateDoc(doc(db, 'orders', orderId), {
      status: next,
      [`timestamps.${statusField}`]: serverTimestamp(),
      ...(next === 'PICKED_UP' ? { trackingEnabled: true } : {}),
    });
    toast.success(`Order updated to ${next}`);
  };

  const cancelOrder = async (orderId: string) => {
    if (!window.confirm('Cancel this order?')) return;
    await updateDoc(doc(db, 'orders', orderId), {
      status: 'CANCELLED',
      'timestamps.cancelledAt': serverTimestamp(),
    });
    toast.success('Order cancelled');
  };

  const assignDriver = async (orderId: string, driverId: string) => {
    if (!driverId) return;
    await updateDoc(doc(db, 'orders', orderId), { driverId });
    await updateDoc(doc(db, 'drivers', driverId), { activeOrderId: orderId });
    toast.success('Driver assigned');
  };

  const stats = {
    total: orders.length,
    received: orders.filter((o) => o.status === 'RECEIVED').length,
    preparing: orders.filter((o) => o.status === 'PREPARING').length,
    ready: orders.filter((o) => o.status === 'READY').length,
    delivering: orders.filter((o) => o.status === 'PICKED_UP').length,
    delivered: orders.filter((o) => o.status === 'DELIVERED').length,
    revenue: orders.filter((o) => o.status === 'DELIVERED').reduce((s, o) => s + o.total, 0),
  };

  const filteredOrders = filter === 'ALL' ? orders : orders.filter((o) => o.status === filter);
  const onlineDrivers = drivers.filter((d) => d.isOnline && !d.activeOrderId);

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Al Samaha — Admin Dashboard</h1>

      {/* Stats */}
      <div style={styles.statsGrid}>
        {[
          { label: 'New', value: stats.received, color: '#6B7280' },
          { label: 'Preparing', value: stats.preparing, color: '#F59E0B' },
          { label: 'Ready', value: stats.ready, color: '#3B82F6' },
          { label: 'Delivering', value: stats.delivering, color: '#8B5CF6' },
          { label: 'Delivered', value: stats.delivered, color: '#22C55E' },
          { label: "Today's Revenue", value: `$${stats.revenue.toFixed(2)}`, color: '#1B5E20' },
        ].map((s) => (
          <div key={s.label} style={{ ...styles.statCard, borderLeft: `4px solid ${s.color}` }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: '#6B7280' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={styles.filterRow}>
        {(['ALL', 'RECEIVED', 'PREPARING', 'READY', 'PICKED_UP', 'DELIVERED', 'CANCELLED'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              ...styles.filterBtn,
              backgroundColor: filter === f ? '#1B5E20' : '#F3F4F6',
              color: filter === f ? '#fff' : '#374151',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th>Order ID</th>
              <th>Items</th>
              <th>Type</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Driver</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => {
              const nextStatus = STATUS_FLOW[order.status];
              return (
                <tr key={order.id} style={styles.trow}>
                  <td style={styles.td}>
                    <code style={{ fontSize: 12 }}>#{order.id.slice(-8).toUpperCase()}</code>
                  </td>
                  <td style={styles.td}>
                    <div style={{ fontSize: 13 }}>
                      {order.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}
                    </div>
                  </td>
                  <td style={styles.td}>{order.delivery.type}</td>
                  <td style={styles.td}>${order.total.toFixed(2)}</td>
                  <td style={styles.td}>{order.paymentMethod}</td>
                  <td style={styles.td}>
                    <span style={{
                      backgroundColor: STATUS_COLORS[order.status] + '20',
                      color: STATUS_COLORS[order.status],
                      padding: '2px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                    }}>
                      {order.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {!order.driverId && order.status === 'READY' ? (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <select
                          value={selectedDriver[order.id] ?? ''}
                          onChange={(e) => setSelectedDriver((p) => ({ ...p, [order.id]: e.target.value }))}
                          style={styles.select}
                        >
                          <option value="">Assign driver</option>
                          {onlineDrivers.map((d) => (
                            <option key={d.id} value={d.id}>{d.id.slice(-6)}</option>
                          ))}
                        </select>
                        <button
                          style={styles.btnSmall}
                          onClick={() => assignDriver(order.id, selectedDriver[order.id])}
                        >
                          ✓
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: '#6B7280' }}>
                        {order.driverId ? `#${order.driverId.slice(-6)}` : '—'}
                      </span>
                    )}
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {nextStatus && (
                        <button
                          style={{ ...styles.btnSmall, backgroundColor: '#1B5E20', color: '#fff' }}
                          onClick={() => advanceStatus(order.id, order.status)}
                        >
                          → {nextStatus}
                        </button>
                      )}
                      {!['DELIVERED', 'CANCELLED'].includes(order.status) && (
                        <button
                          style={{ ...styles.btnSmall, backgroundColor: '#FEE2E2', color: '#EF4444' }}
                          onClick={() => cancelOrder(order.id)}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredOrders.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>No orders</div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { padding: 24, backgroundColor: '#F9FAFB', minHeight: '100vh' },
  title: { fontSize: 24, fontWeight: 700, color: '#1B5E20', marginBottom: 24 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 24 },
  statCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  filterRow: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 },
  filterBtn: { border: 'none', borderRadius: 999, padding: '4px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 500 },
  tableWrapper: { backgroundColor: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { backgroundColor: '#F3F4F6' },
  trow: { borderBottom: '1px solid #F0F0F0' },
  td: { padding: '12px 16px', verticalAlign: 'middle', fontSize: 14, color: '#374151' },
  select: { padding: '4px 8px', borderRadius: 6, border: '1px solid #D1D5DB', fontSize: 13 },
  btnSmall: { padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, backgroundColor: '#F3F4F6', color: '#374151' },
};
