import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { ChefHat, MapPin, Minus, Plus, ReceiptText, ShoppingCart, UtensilsCrossed } from "lucide-react";
import "./styles.css";

const menu = [
  { id: "b1", name: "Smash Burger", category: "Burgers", price: 12.5, emoji: "🍔" },
  { id: "b2", name: "Double Cheese", category: "Burgers", price: 15.0, emoji: "🍔" },
  { id: "s1", name: "Crispy Chicken", category: "Sandwiches", price: 13.5, emoji: "🥪" },
  { id: "f1", name: "Loaded Fries", category: "Sides", price: 7.0, emoji: "🍟" },
  { id: "f2", name: "Onion Rings", category: "Sides", price: 6.0, emoji: "🧅" },
  { id: "d1", name: "Cola", category: "Drinks", price: 3.0, emoji: "🥤" },
  { id: "d2", name: "Lemonade", category: "Drinks", price: 4.0, emoji: "🍋" },
  { id: "x1", name: "Brownie", category: "Dessert", price: 5.5, emoji: "🍫" },
];

const seedOrders = [
  {
    id: "1047",
    location: "Miraflores",
    status: "inProcess",
    paid: true,
    createdAt: Date.now() - 1000 * 60 * 7,
    items: [
      { name: "Double Cheese", qty: 2 },
      { name: "Loaded Fries", qty: 1 },
      { name: "Cola", qty: 2 },
    ],
  },
  {
    id: "1048",
    location: "Miraflores",
    status: "processed",
    paid: false,
    createdAt: Date.now() - 1000 * 60 * 4,
    items: [
      { name: "Crispy Chicken", qty: 1 },
      { name: "Lemonade", qty: 1 },
    ],
  },
];

function money(n) {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(n);
}

function minutesAgo(ts) {
  return Math.max(1, Math.round((Date.now() - ts) / 60000));
}

function App() {
  const [tab, setTab] = useState("pos");
  const [location, setLocation] = useState("Miraflores");
  const [category, setCategory] = useState("Todos");
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState(seedOrders);
  const [nextId, setNextId] = useState(1049);

  const categories = ["Todos", ...new Set(menu.map((x) => x.category))];
  const filteredMenu = category === "Todos" ? menu : menu.filter((x) => x.category === category);
  const subtotal = useMemo(() => cart.reduce((s, x) => s + x.price * x.qty, 0), [cart]);

  const add = (item) => {
    setCart((prev) => {
      const found = prev.find((x) => x.id === item.id);
      return found
        ? prev.map((x) => (x.id === item.id ? { ...x, qty: x.qty + 1 } : x))
        : [...prev, { ...item, qty: 1 }];
    });
  };

  const adjust = (id, delta) => {
    setCart((prev) =>
      prev
        .map((x) => (x.id === id ? { ...x, qty: x.qty + delta } : x))
        .filter((x) => x.qty > 0),
    );
  };

  const pay = () => {
    if (!cart.length) return;
    const order = {
      id: String(nextId),
      location,
      status: "inProcess",
      paid: true,
      createdAt: Date.now(),
      items: cart.map((x) => ({ name: x.name, qty: x.qty })),
    };
    setOrders((prev) => [order, ...prev]);
    setNextId((x) => x + 1);
    setCart([]);
    setTab("kds");
  };

  const advance = (id) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        if (o.status === "inProcess") return { ...o, status: "processed" };
        if (o.status === "processed") return { ...o, status: "delivered" };
        return o;
      }),
    );
  };

  const activeOrders = orders.filter((o) => o.location === location && o.status !== "delivered");

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark"><UtensilsCrossed size={22} /></div>
          <div>
            <div className="brand-title">DittoPOS Lab</div>
            <div className="brand-subtitle">Benchmark web · POS + KDS</div>
          </div>
        </div>
        <div className="location-control">
          <MapPin size={16} />
          <select value={location} onChange={(e) => setLocation(e.target.value)}>
            <option>Miraflores</option>
            <option>San Isidro</option>
            <option>Barranco</option>
          </select>
        </div>
      </header>

      <nav className="tabs">
        <button className={tab === "pos" ? "active" : ""} onClick={() => setTab("pos")}>
          <ShoppingCart size={18} /> POS
        </button>
        <button className={tab === "kds" ? "active" : ""} onClick={() => setTab("kds")}>
          <ChefHat size={18} /> KDS
          <span className="count-badge">{activeOrders.length}</span>
        </button>
        <button className={tab === "locations" ? "active" : ""} onClick={() => setTab("locations")}>
          <MapPin size={18} /> Locales
        </button>
      </nav>

      {tab === "pos" && (
        <main className="pos-layout">
          <section className="catalog-panel">
            <div className="section-heading">
              <div>
                <h1>Tomar pedido</h1>
                <p>Selecciona productos. Al cobrar, el pedido pasa al KDS en estado <b>inProcess</b>.</p>
              </div>
            </div>
            <div className="chips">
              {categories.map((c) => (
                <button key={c} className={category === c ? "chip active" : "chip"} onClick={() => setCategory(c)}>{c}</button>
              ))}
            </div>
            <div className="menu-grid">
              {filteredMenu.map((item) => (
                <button className="menu-card" key={item.id} onClick={() => add(item)}>
                  <div className="food-emoji">{item.emoji}</div>
                  <div className="menu-meta">
                    <strong>{item.name}</strong>
                    <span>{item.category}</span>
                  </div>
                  <div className="menu-price">{money(item.price)}</div>
                </button>
              ))}
            </div>
          </section>

          <aside className="cart-panel">
            <div className="cart-title"><ReceiptText size={19} /> Pedido actual</div>
            <div className="cart-lines">
              {!cart.length && <div className="empty-cart">Agrega productos para comenzar.</div>}
              {cart.map((item) => (
                <div className="cart-line" key={item.id}>
                  <div>
                    <strong>{item.name}</strong>
                    <small>{money(item.price)} c/u</small>
                  </div>
                  <div className="qty-control">
                    <button onClick={() => adjust(item.id, -1)}><Minus size={14} /></button>
                    <span>{item.qty}</span>
                    <button onClick={() => adjust(item.id, 1)}><Plus size={14} /></button>
                  </div>
                  <div className="line-total">{money(item.price * item.qty)}</div>
                </div>
              ))}
            </div>
            <div className="summary">
              <div><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
              <div><span>Impuesto demo</span><strong>{money(subtotal * 0.18)}</strong></div>
              <div className="grand"><span>Total</span><strong>{money(subtotal * 1.18)}</strong></div>
            </div>
            <button className="pay-button" disabled={!cart.length} onClick={pay}>Cobrar y enviar a cocina</button>
            <div className="lab-note">Demo web independiente. La app Ditto original es nativa iOS/Android y usa sincronización Ditto.</div>
          </aside>
        </main>
      )}

      {tab === "kds" && (
        <main className="kds-page">
          <div className="section-heading kds-heading">
            <div>
              <h1>Kitchen Display System</h1>
              <p>Azul = preparando · Verde = listo. Toca una tarjeta para avanzar el estado.</p>
            </div>
            <div className="legend"><span className="dot blue" /> inProcess <span className="dot green" /> processed</div>
          </div>
          <div className="kds-grid">
            {activeOrders.length === 0 && <div className="empty-kds">No hay pedidos activos para {location}.</div>}
            {activeOrders.map((order) => (
              <button key={order.id} className={`ticket ${order.status}`} onClick={() => advance(order.id)}>
                <div className="ticket-head">
                  <div>
                    <span className="ticket-number">#{order.id}</span>
                    <span className="ticket-time">{minutesAgo(order.createdAt)} min</span>
                  </div>
                  <span className={order.paid ? "paid paid-yes" : "paid"}>{order.paid ? "$$" : "$"}</span>
                </div>
                <div className="ticket-items">
                  {order.items.map((item, i) => <div key={i}><b>{item.qty}×</b> {item.name}</div>)}
                </div>
                <div className="ticket-footer">
                  <span>{order.status === "inProcess" ? "EN PREPARACIÓN" : "LISTO"}</span>
                  <small>{order.status === "inProcess" ? "Tocar → marcar listo" : "Tocar → entregar"}</small>
                </div>
              </button>
            ))}
          </div>
        </main>
      )}

      {tab === "locations" && (
        <main className="locations-page">
          <div className="section-heading"><div><h1>Locales demo</h1><p>En Ditto cada local funciona como grupo de sincronización.</p></div></div>
          <div className="location-grid">
            {["Miraflores", "San Isidro", "Barranco"].map((x, i) => (
              <button key={x} className={location === x ? "location-card selected" : "location-card"} onClick={() => { setLocation(x); setTab("pos"); }}>
                <div className="location-icon"><MapPin size={22} /></div>
                <strong>{x}</strong>
                <span>Local {String(i + 1).padStart(2, "0")}</span>
              </button>
            ))}
          </div>
        </main>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
