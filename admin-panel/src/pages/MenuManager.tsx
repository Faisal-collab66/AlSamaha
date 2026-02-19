import React, { useEffect, useState } from 'react';
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, onSnapshot, serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';

interface Category { id: string; name: string; sortOrder: number; isActive: boolean }
interface MenuItem {
  id: string; categoryId: string; name: string; description: string;
  price: number; imageUrl?: string; isAvailable: boolean;
}

const emptyItem: Omit<MenuItem, 'id'> = {
  categoryId: '', name: '', description: '', price: 0, imageUrl: '', isAvailable: true,
};

export default function MenuManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [activeTab, setActiveTab] = useState<'categories' | 'items'>('items');
  const [editItem, setEditItem] = useState<Partial<MenuItem> | null>(null);
  const [editCat, setEditCat] = useState<Partial<Category> | null>(null);

  useEffect(() => {
    const catUnsub = onSnapshot(
      query(collection(db, 'menuCategories'), orderBy('sortOrder')),
      (snap) => setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category)))
    );
    const itemUnsub = onSnapshot(collection(db, 'menuItems'), (snap) =>
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() } as MenuItem)))
    );
    return () => { catUnsub(); itemUnsub(); };
  }, []);

  // ── Item CRUD ──
  const saveItem = async () => {
    if (!editItem) return;
    if (!editItem.name || !editItem.categoryId) { toast.error('Name and category required'); return; }
    if (editItem.id) {
      await updateDoc(doc(db, 'menuItems', editItem.id), { ...editItem });
      toast.success('Item updated');
    } else {
      await addDoc(collection(db, 'menuItems'), { ...emptyItem, ...editItem, modifiers: [] });
      toast.success('Item added');
    }
    setEditItem(null);
  };

  const toggleItemAvailability = async (item: MenuItem) => {
    await updateDoc(doc(db, 'menuItems', item.id), { isAvailable: !item.isAvailable });
  };

  const deleteItem = async (id: string) => {
    if (!window.confirm('Delete this item?')) return;
    await deleteDoc(doc(db, 'menuItems', id));
    toast.success('Deleted');
  };

  // ── Category CRUD ──
  const saveCat = async () => {
    if (!editCat?.name) return;
    if (editCat.id) {
      await updateDoc(doc(db, 'menuCategories', editCat.id), { name: editCat.name, sortOrder: editCat.sortOrder ?? 0, isActive: editCat.isActive ?? true });
    } else {
      await addDoc(collection(db, 'menuCategories'), { name: editCat.name, sortOrder: editCat.sortOrder ?? 0, isActive: true });
    }
    setEditCat(null);
    toast.success('Saved');
  };

  const deleteCat = async (id: string) => {
    if (!window.confirm('Delete category? Items will remain.')) return;
    await deleteDoc(doc(db, 'menuCategories', id));
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Menu Manager</h1>

      <div style={styles.tabRow}>
        {(['items', 'categories'] as const).map((t) => (
          <button key={t} onClick={() => setActiveTab(t)}
            style={{ ...styles.tab, ...(activeTab === t ? styles.tabActive : {}) }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Items ── */}
      {activeTab === 'items' && (
        <div>
          <button style={styles.addBtn} onClick={() => setEditItem({ ...emptyItem })}>+ Add Item</button>
          <div style={styles.grid}>
            {items.map((item) => (
              <div key={item.id} style={{ ...styles.card, opacity: item.isAvailable ? 1 : 0.5 }}>
                {item.imageUrl && <img src={item.imageUrl} alt={item.name} style={styles.img} />}
                <div style={styles.cardBody}>
                  <div style={styles.itemName}>{item.name}</div>
                  <div style={styles.itemCat}>{categories.find((c) => c.id === item.categoryId)?.name}</div>
                  <div style={styles.itemPrice}>${item.price.toFixed(2)}</div>
                  <div style={styles.cardActions}>
                    <button style={styles.btn} onClick={() => setEditItem(item)}>Edit</button>
                    <button
                      style={{ ...styles.btn, backgroundColor: item.isAvailable ? '#FEF3C7' : '#D1FAE5' }}
                      onClick={() => toggleItemAvailability(item)}
                    >
                      {item.isAvailable ? 'Disable' : 'Enable'}
                    </button>
                    <button style={{ ...styles.btn, color: '#EF4444' }} onClick={() => deleteItem(item.id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Item modal */}
          {editItem && (
            <div style={styles.modal}>
              <div style={styles.modalCard}>
                <h2>{editItem.id ? 'Edit Item' : 'New Item'}</h2>
                <label style={styles.label}>Category</label>
                <select style={styles.input} value={editItem.categoryId} onChange={(e) => setEditItem({ ...editItem, categoryId: e.target.value })}>
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {[
                  { key: 'name', label: 'Name', type: 'text' },
                  { key: 'description', label: 'Description', type: 'text' },
                  { key: 'price', label: 'Price ($)', type: 'number' },
                  { key: 'imageUrl', label: 'Image URL', type: 'text' },
                ].map(({ key, label, type }) => (
                  <div key={key}>
                    <label style={styles.label}>{label}</label>
                    <input
                      type={type}
                      style={styles.input}
                      value={(editItem as any)[key] ?? ''}
                      onChange={(e) => setEditItem({ ...editItem, [key]: type === 'number' ? parseFloat(e.target.value) : e.target.value })}
                    />
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button style={{ ...styles.addBtn, flex: 1 }} onClick={saveItem}>Save</button>
                  <button style={{ ...styles.btn, flex: 1 }} onClick={() => setEditItem(null)}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Categories ── */}
      {activeTab === 'categories' && (
        <div>
          <button style={styles.addBtn} onClick={() => setEditCat({ name: '', sortOrder: categories.length, isActive: true })}>
            + Add Category
          </button>
          <table style={styles.table}>
            <thead><tr style={styles.thead}><th>Name</th><th>Sort Order</th><th>Active</th><th>Actions</th></tr></thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} style={styles.trow}>
                  <td style={styles.td}>{cat.name}</td>
                  <td style={styles.td}>{cat.sortOrder}</td>
                  <td style={styles.td}>{cat.isActive ? '✅' : '❌'}</td>
                  <td style={styles.td}>
                    <button style={styles.btn} onClick={() => setEditCat(cat)}>Edit</button>
                    <button style={{ ...styles.btn, color: '#EF4444', marginLeft: 4 }} onClick={() => deleteCat(cat.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {editCat && (
            <div style={styles.modal}>
              <div style={styles.modalCard}>
                <h2>{editCat.id ? 'Edit Category' : 'New Category'}</h2>
                <label style={styles.label}>Name</label>
                <input style={styles.input} value={editCat.name ?? ''} onChange={(e) => setEditCat({ ...editCat, name: e.target.value })} />
                <label style={styles.label}>Sort Order</label>
                <input type="number" style={styles.input} value={editCat.sortOrder ?? 0} onChange={(e) => setEditCat({ ...editCat, sortOrder: parseInt(e.target.value) })} />
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button style={{ ...styles.addBtn, flex: 1 }} onClick={saveCat}>Save</button>
                  <button style={{ ...styles.btn, flex: 1 }} onClick={() => setEditCat(null)}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { padding: 24, backgroundColor: '#F9FAFB', minHeight: '100vh' },
  title: { fontSize: 24, fontWeight: 700, color: '#1B5E20', marginBottom: 16 },
  tabRow: { display: 'flex', gap: 8, marginBottom: 20 },
  tab: { padding: '8px 20px', borderRadius: 8, border: '1px solid #D1D5DB', cursor: 'pointer', background: '#fff', fontWeight: 500 },
  tabActive: { backgroundColor: '#1B5E20', color: '#fff', border: 'none' },
  addBtn: { padding: '8px 20px', backgroundColor: '#1B5E20', color: '#fff', borderRadius: 8, border: 'none', cursor: 'pointer', marginBottom: 16, fontWeight: 600 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  img: { width: '100%', height: 140, objectFit: 'cover' },
  cardBody: { padding: 12 },
  itemName: { fontWeight: 600, fontSize: 15, marginBottom: 4 },
  itemCat: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  itemPrice: { fontSize: 16, fontWeight: 700, color: '#1B5E20', marginBottom: 8 },
  cardActions: { display: 'flex', gap: 4 },
  btn: { padding: '4px 10px', borderRadius: 6, border: '1px solid #E5E7EB', cursor: 'pointer', fontSize: 12, backgroundColor: '#F9FAFB' },
  modal: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: 400, maxHeight: '90vh', overflowY: 'auto' },
  label: { display: 'block', fontSize: 13, color: '#6B7280', marginTop: 12, marginBottom: 4 },
  input: { width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14, boxSizing: 'border-box' },
  table: { width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' },
  thead: { backgroundColor: '#F3F4F6' },
  trow: { borderBottom: '1px solid #F0F0F0' },
  td: { padding: '12px 16px', fontSize: 14, color: '#374151' },
};
