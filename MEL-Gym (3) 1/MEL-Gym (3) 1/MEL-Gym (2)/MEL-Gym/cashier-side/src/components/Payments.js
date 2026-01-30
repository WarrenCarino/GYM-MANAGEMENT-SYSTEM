import React, { useEffect, useState, useRef } from "react";

// ============================================
// UNIVERSAL API - WORKS ON ANY DEVICE/BROWSER
// ============================================
const getAPIUrl = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8000';
  }
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = window.location.port ? `:${window.location.port}` : '';
  return `${protocol}//${hostname}${port}`;
};

const API_URL = getAPIUrl();
console.log('🌐 API URL:', API_URL);

const apiCall = async (endpoint, method = 'GET', body = null) => {
  const url = `${API_URL}${endpoint}`;
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) options.body = JSON.stringify(body);
  const response = await fetch(url, options);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return await response.json();
};

// ============================================
// AUDIT TRAIL LOGGING
// ============================================
const logAuditTrail = async (action, status) => {
  try {
    const cashierId = localStorage.getItem("cashierId");

    if (!cashierId) {
      console.error("❌ Cashier ID not found in localStorage");
      return;
    }

    const auditData = {
      id: parseInt(cashierId) || cashierId,
      role: "cashier",
      action: action,
      status: status
    };

    const response = await fetch("http://localhost:8000/api/audit-trail", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json"
      },
      body: JSON.stringify(auditData)
    });

    const responseData = await response.json();

    if (response.ok && responseData.success) {
      console.log("✅ Audit trail logged successfully!");
    } else {
      console.error("❌ Failed to log audit trail");
    }
  } catch (error) {
    console.error("❌ Error logging audit trail:", error);
  }
};

// ============================================
// MAIN PAYMENTS COMPONENT
// ============================================

function Payments() {
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [members, setMembers] = useState([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [activeTab, setActiveTab] = useState("products");
  const [walkinName, setWalkinName] = useState("");
  const [cash, setCash] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [newMembershipType, setNewMembershipType] = useState("");
  const [rfidInput, setRfidInput] = useState("");
  const [loading, setLoading] = useState(false);
  const rfidInputRef = useRef(null);

  const WALKIN_PRICE = 100;

  const fetchMembers = async () => {
    try {
      const data = await apiCall('/api/cashier/members');
      setMembers(data || []);
    } catch (err) {
      console.error('Error fetching members:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await apiCall('/api/products');
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  useEffect(() => {
    rfidInputRef.current?.focus();
    fetchMembers();
    fetchProducts();
  }, []);

  const handleRfidSubmit = (e) => {
    if (e.key === "Enter" && rfidInput.trim()) {
      searchMemberByRfid(rfidInput.trim());
    }
  };

  const searchMemberByRfid = (rfid) => {
    const member = members.find((m) => m.rfid && m.rfid.toLowerCase() === rfid.toLowerCase());
    if (member) {
      selectMember(member);
      setRfidInput("");
      alert("✅ Member found!");
      logAuditTrail(`RFID SCAN - ${member.member_name}`, "SUCCESS");
    } else {
      alert("❌ RFID not found");
      setRfidInput("");
      logAuditTrail(`RFID SCAN - Invalid`, "FAILED");
    }
  };

  const filteredProducts = productSearch.trim() === "" ? [] : products.filter((p) =>
    p.product_name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredMembers = memberSearch.trim() === "" ? [] : members.filter((m) =>
    m.member_name.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const addToCart = (product) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      if (existing.quantity + 1 > product.stock_quantity) {
        alert(`❌ Only ${product.stock_quantity} available`);
        return;
      }
      setCart(cart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      if (product.stock_quantity < 1) {
        alert(`❌ Out of stock`);
        return;
      }
      setCart([...cart, { ...product, quantity: 1, type: "product" }]);
    }
    logAuditTrail(`ADD TO CART - ${product.product_name}`, "SUCCESS");
  };

  const addWalkinToCart = () => {
    if (!walkinName.trim()) {
      alert("⚠️ Enter name");
      return;
    }
    setCart([...cart, {
      id: `walkin-${Date.now()}`,
      product_name: `Walk-in: ${walkinName}`,
      price: WALKIN_PRICE,
      quantity: 1,
      type: "walkin"
    }]);
    setWalkinName("");
    logAuditTrail(`ADD WALKIN - ${walkinName}`, "SUCCESS");
  };

  const selectMember = (member) => {
    setSelectedMember(member);
    setMemberSearch("");
    setRfidInput("");
    
    const isExpired = member.membership_end ? new Date(member.membership_end) < new Date() : false;
    const isInactive = member.status === "inactive";
    const withoutMembership = cart.filter((item) => item.type !== "membership");
    
    if (isExpired || isInactive) {
      const price = { Daily: 30, Weekly: 500, Monthly: 2000 }[member.membership_type] || 2000;
      setCart([...withoutMembership, {
        id: `membership-${member.id}`,
        product_name: `${member.membership_type} Membership${isInactive ? " (Activation)" : " (Renewal)"}`,
        price,
        quantity: 1,
        type: "membership"
      }]);
    } else {
      setCart(withoutMembership);
    }
    logAuditTrail(`SELECT MEMBER - ${member.member_name}`, "SUCCESS");
  };

  const handleChangePlan = () => {
    if (!selectedMember) return;
    setNewMembershipType(selectedMember.membership_type);
    setShowChangePlanModal(true);
  };

  const handleSaveChangePlan = () => {
    if (!newMembershipType) return;
    setSelectedMember((prev) => prev ? { ...prev, membership_type: newMembershipType } : prev);
    const price = { Daily: 30, Weekly: 500, Monthly: 2000 }[newMembershipType] || 2000;
    const withoutMembership = cart.filter((item) => item.type !== "membership");
    setCart([...withoutMembership, {
      id: `membership-${selectedMember.id}`,
      product_name: `${newMembershipType} Membership`,
      price,
      quantity: 1,
      type: "membership"
    }]);
    setShowChangePlanModal(false);
    logAuditTrail(`CHANGE PLAN - ${selectedMember.member_name} to ${newMembershipType}`, "SUCCESS");
  };

  const handleQtyChange = (id, newQty) => {
    const numQty = parseInt(newQty) || 1;
    setCart(cart.map((item) => {
      if (item.id === id) {
        const maxQty = item.stock_quantity || 999;
        const finalQty = Math.min(Math.max(numQty, 1), maxQty);
        return { ...item, quantity: finalQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    const item = cart.find((i) => i.id === id);
    setCart(cart.filter((item) => item.id !== id));
    logAuditTrail(`REMOVE FROM CART - ${item?.product_name}`, "SUCCESS");
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const change = cash ? Math.max(0, Number(cash) - totalAmount) : 0;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("Cart empty");
      return;
    }
    if (Number(cash) < totalAmount) {
      alert("Insufficient cash");
      logAuditTrail(`CHECKOUT - Insufficient Cash`, "FAILED");
      return;
    }

    setLoading(true);
    try {
      const now = new Date();
      const items = cart.map((item) => ({
        product: item.product_name,
        quantity: item.quantity,
        total_amount: item.price * item.quantity
      }));

      let transactionMemberName = selectedMember ? selectedMember.member_name : "Walk-in Customer";
      if (!selectedMember && cart.some(item => item.type === "walkin")) {
        const walkinItem = cart.find(item => item.type === "walkin");
        if (walkinItem && walkinItem.product_name.includes(":")) {
          transactionMemberName = walkinItem.product_name.split(":")[1].trim();
        }
      }

      // SAVE TRANSACTION - USES UNIVERSAL API
      const transactionData = await apiCall('/api/cashier/transactions', 'POST', {
        member_name: transactionMemberName,
        membership_type: selectedMember ? selectedMember.membership_type : null,
        items: items,
        total_amount: totalAmount
      });

      const orNumber = transactionData.or_number;

      // UPDATE PRODUCT STOCK - USES UNIVERSAL API
      for (const item of cart) {
        if (item.type === "product") {
          await apiCall(`/api/products/${item.id}`, 'PUT', {
            newQty: item.stock_quantity - item.quantity
          });
        }
      }

      // UPDATE MEMBERSHIP - USES UNIVERSAL API
      if (selectedMember && cart.find((i) => i.type === "membership")) {
        try {
          let newEndDate = new Date();
          const currentType = selectedMember.membership_type;
          const isExpired = selectedMember.membership_end ? new Date(selectedMember.membership_end) < new Date() : false;
          const isInactive = selectedMember.status === "inactive";
          
          if (isExpired || isInactive) {
            newEndDate = new Date();
          } else {
            newEndDate = new Date(selectedMember.membership_end || new Date());
          }
          
          if (currentType === "Weekly") {
            newEndDate.setDate(newEndDate.getDate() + 7);
          } else if (currentType === "Monthly") {
            newEndDate.setMonth(newEndDate.getMonth() + 1);
          }
          
          const formattedEndDate = newEndDate.toISOString().split("T")[0];

          await apiCall(`/api/cashier/members/${selectedMember.id}/membership`, 'PUT', {
            membership_type: currentType,
            membership_end: formattedEndDate
          });

          await apiCall(`/api/cashier/members/${selectedMember.id}/status`, 'PUT', {
            status: "active"
          });
        } catch (err) {
          console.log("Membership update skipped:", err);
        }
      }

      if (selectedMember && !selectedMember.rfid) {
        try {
          await apiCall(`/api/cashier/members/${selectedMember.id}/status`, 'PUT', {
            status: "inactive"
          });
        } catch (err) {
          console.log("Inactive status save skipped:", err);
        }
      }

      setReceipt({
        orNumber: orNumber || "N/A",
        memberName: transactionMemberName,
        transactionDateTime: now.toLocaleString(),
        items: cart.map((item) => ({
          description: item.product_name,
          quantity: item.quantity,
          amount: (item.price * item.quantity).toFixed(2)
        })),
        totalAmount,
        cash: Number(cash),
        change
      });
      setShowReceipt(true);
      setCart([]);
      setCash("");
      setSelectedMember(null);
      await fetchProducts();

      logAuditTrail(`CHECKOUT - ${transactionMemberName} (OR: ${orNumber})`, "SUCCESS");

    } catch (err) {
      alert(`Error: ${err.message}`);
      console.error("Checkout error:", err);
      logAuditTrail(`CHECKOUT - Error`, "FAILED");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.container}>
      <div style={s.mainPanel}>
        <div style={s.tabContainer}>
          <button onClick={() => setActiveTab("products")} style={{...s.tabButton, ...(activeTab === "products" ? s.tabButtonActive : {})}}>🛒 Products</button>
          <button onClick={() => setActiveTab("members")} style={{...s.tabButton, ...(activeTab === "members" ? s.tabButtonActive : {})}}>👥 Members</button>
          <button onClick={() => setActiveTab("walkin")} style={{...s.tabButton, ...(activeTab === "walkin" ? s.tabButtonActive : {})}}>🚶 Walk-in</button>
        </div>

        {activeTab === "products" && (
          <div>
            <input type="text" placeholder="Search product..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} style={s.searchInput} />
            <div style={s.list}>
              {filteredProducts.map((product) => (
                <div key={product.id} onClick={() => addToCart(product)} style={s.listItem}>
                  <strong>{product.product_name}</strong>
                  <div style={s.productInfo}>₱{product.price} • Stock: {product.stock_quantity}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "members" && (
          <div>
            <input type="text" placeholder="Search member..." value={memberSearch} onChange={(e) => setMemberSearch(e.target.value)} style={s.searchInput} />
            <div style={s.list}>
              {filteredMembers.map((member) => (
                <div key={member.id} onClick={() => selectMember(member)} style={s.listItem}>
                  <strong>{member.member_name}</strong>
                  <div style={s.productInfo}>{member.membership_type} • {member.status}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "walkin" && (
          <div style={s.walkinContainer}>
            <div style={s.walkinBox}>
              <div style={s.walkinLabel}>1 Day Pass</div>
              <div style={s.walkinPrice}>₱{WALKIN_PRICE}</div>
            </div>
            <input type="text" placeholder="Enter name" value={walkinName} onChange={(e) => setWalkinName(e.target.value)} style={s.searchInput} />
            <button onClick={addWalkinToCart} style={s.addBtn}>Add Walk-in</button>
          </div>
        )}
      </div>

      <div style={s.cartPanel}>
        <div style={s.rfidScannerSection}>
          <h4 style={{margin: "0 0 10px 0"}}>🎫 RFID Scanner</h4>
          <div style={s.rfidInputContainer}>
            <input ref={rfidInputRef} type="text" placeholder="Scan RFID card..." value={rfidInput} onChange={(e) => setRfidInput(e.target.value)} onKeyPress={handleRfidSubmit} style={s.rfidInput} autoFocus />
            <button onClick={() => searchMemberByRfid(rfidInput)} style={s.rfidButton}>Search</button>
          </div>
          {rfidInput && <div style={s.rfidDisplayBox}><div style={{fontSize: "12px", color: "#666"}}>Scanned RFID:</div><div style={{fontSize: "16px", fontWeight: "bold", color: "#007bff", fontFamily: "monospace"}}>{rfidInput}</div></div>}
        </div>

        {selectedMember && (
          <div style={s.memberBox}>
            <div><div style={{fontWeight: "bold"}}>👤 {selectedMember.member_name}</div><div style={{fontSize: "12px", color: "#666"}}>{selectedMember.membership_type} • {selectedMember.status}</div><button onClick={handleChangePlan} style={s.smallBtn}>Change Plan</button></div>
            <button onClick={() => { setSelectedMember(null); setRfidInput(""); setCart(cart.filter((item) => item.type !== "membership")); logAuditTrail(`DESELECT MEMBER - ${selectedMember.member_name}`, "SUCCESS"); }} style={s.clearBtn}>✕</button>
          </div>
        )}

        <h3 style={s.cartTitle}>💳 PAYMENT</h3>
        <div style={s.cartListContainer}>
          <table style={s.cartTable}>
            <thead><tr style={s.tableHeader}><th style={s.th}>Item</th><th style={s.th}>Qty</th><th style={s.th}>Price</th><th style={s.th}>Total</th><th style={s.th}></th></tr></thead>
            <tbody>
              {cart.length > 0 ? cart.map((item) => (
                <tr key={item.id} style={s.tableRow}>
                  <td style={s.td}>{item.product_name}</td>
                  <td style={s.td}>{item.type === "product" ? <input type="number" value={item.quantity} onChange={(e) => handleQtyChange(item.id, e.target.value)} min="1" max={item.stock_quantity || 999} style={{width: "50px", padding: "4px", borderRadius: "4px", border: "1px solid #ddd", textAlign: "center"}} /> : <span>1</span>}</td>
                  <td style={s.td}>₱{item.price}</td>
                  <td style={s.td}>₱{(item.price * item.quantity).toFixed(2)}</td>
                  <td style={s.td}><button onClick={() => removeFromCart(item.id)} style={s.removeBtn}>🗑️</button></td>
                </tr>
              )) : <tr><td colSpan="5" style={s.emptyCart}>No items</td></tr>}
            </tbody>
          </table>
        </div>

        <div style={s.bottomSection}>
          <div style={s.cashSection}>
            <label style={s.cashLabel}>Cash: ₱ <input type="number" value={cash} onChange={(e) => setCash(e.target.value)} style={s.cashInput} /></label>
            <div style={s.totalRow}><strong>Total:</strong> <span style={{fontSize: "18px", fontWeight: "bold"}}>₱{totalAmount.toFixed(2)}</span></div>
            <div style={s.totalRow}><strong>Change:</strong> <span style={{fontSize: "18px", fontWeight: "bold", color: "#28a745"}}>₱{change.toFixed(2)}</span></div>
          </div>
          <button onClick={handleCheckout} style={{...s.checkoutBtn, opacity: cart.length === 0 ? 0.5 : 1}} disabled={cart.length === 0 || loading}>{loading ? '⏳ PROCESSING...' : '💳 CHECKOUT'}</button>
        </div>

        {showChangePlanModal && (<div style={s.modalOverlay}><div style={s.modalContent}><h3>🔄 Change Plan</h3><select value={newMembershipType} onChange={(e) => setNewMembershipType(e.target.value)} style={s.modalInput}><option value="Weekly">Weekly - ₱500</option><option value="Monthly">Monthly - ₱2000</option></select><div style={{display: "flex", gap: "10px"}}><button onClick={handleSaveChangePlan} style={{...s.modalBtn, background: "#28a745"}}>Save</button><button onClick={() => setShowChangePlanModal(false)} style={{...s.modalBtn, background: "#6c757d"}}>Cancel</button></div></div></div>)}

        {showReceipt && receipt && (<div style={s.receiptOverlay}><div style={s.receiptPopup}><h3 style={{textAlign: "center", color: "#28a745"}}>✅ PAYMENT SUCCESS</h3><div style={s.receiptInfo}><div><strong>OR:</strong> {receipt.orNumber}</div><div><strong>Customer:</strong> {receipt.memberName}</div><div><strong>Date:</strong> {receipt.transactionDateTime}</div></div><table style={s.receiptTable}><tbody>{receipt.items.map((item, idx) => (<tr key={idx} style={{borderBottom: "1px solid #eee"}}><td>{item.description}</td><td style={{textAlign: "center"}}>{item.quantity}</td><td style={{textAlign: "right"}}>₱{item.amount}</td></tr>))}</tbody></table><div style={{paddingTop: "10px", borderTop: "2px solid #eee"}}><div style={{display: "flex", justifyContent: "space-between", marginBottom: "5px"}}><strong>Total:</strong> <strong>₱{receipt.totalAmount.toFixed(2)}</strong></div><div style={{display: "flex", justifyContent: "space-between", marginBottom: "5px"}}>Cash: ₱{receipt.cash.toFixed(2)}</div><div style={{display: "flex", justifyContent: "space-between", marginBottom: "10px"}}>Change: ₱{receipt.change.toFixed(2)}</div></div><button onClick={() => setShowReceipt(false)} style={s.closeReceiptBtn}>Close</button></div></div>)}
      </div>
    </div>
  );
}

const s = {
  container: { display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "20px", padding: "20px", background: "#f4f6f8", minHeight: "100vh" },
  mainPanel: { background: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" },
  cartPanel: { background: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column" },
  rfidScannerSection: { marginBottom: "20px", padding: "15px", background: "#f0f8ff", borderRadius: "8px", border: "2px solid #007bff" },
  rfidInputContainer: { display: "flex", gap: "10px", marginBottom: "10px" },
  rfidInput: { flex: 1, padding: "10px", fontSize: "16px", borderRadius: "6px", border: "2px solid #007bff", outline: "none" },
  rfidButton: { padding: "10px 20px", background: "#007bff", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" },
  rfidDisplayBox: { padding: "10px", background: "#fff", borderRadius: "6px", border: "1px solid #bbb", marginTop: "10px" },
  tabContainer: { display: "flex", gap: "10px", marginBottom: "15px", borderBottom: "2px solid #e0e0e0" },
  tabButton: { flex: 1, padding: "12px", background: "transparent", border: "none", borderBottom: "2px solid transparent", fontSize: "15px", fontWeight: "bold", color: "#666", cursor: "pointer" },
  tabButtonActive: { color: "#007bff", borderBottom: "2px solid #007bff" },
  searchInput: { width: "100%", padding: "10px", marginBottom: "12px", borderRadius: "8px", border: "1px solid #ddd", outline: "none" },
  list: { maxHeight: "50vh", overflowY: "auto", border: "1px solid #eee", borderRadius: "8px", padding: "8px", background: "#fafafa" },
  listItem: { padding: "12px", marginBottom: "8px", background: "#fff", borderRadius: "6px", cursor: "pointer", border: "1px solid #e0e0e0" },
  productInfo: { fontSize: "12px", color: "#666", marginTop: "4px" },
  walkinContainer: { display: "flex", flexDirection: "column", gap: "15px" },
  walkinBox: { background: "#e7f3ff", border: "2px solid #007bff", borderRadius: "12px", padding: "30px", textAlign: "center" },
  walkinLabel: { fontSize: "14px", color: "#666" },
  walkinPrice: { fontSize: "48px", fontWeight: "bold", color: "#007bff" },
  addBtn: { padding: "12px", background: "#28a745", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" },
  memberBox: { background: "#e7f7e7", padding: "15px", borderRadius: "6px", marginBottom: "15px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  smallBtn: { background: "#17a2b8", color: "#fff", border: "none", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", cursor: "pointer", marginTop: "5px" },
  clearBtn: { background: "#dc3545", color: "#fff", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" },
  cartTitle: { margin: "0 0 15px 0", fontSize: "18px", fontWeight: "bold" },
  cartListContainer: { flex: 1, overflowY: "auto", maxHeight: "35vh", marginBottom: "15px", border: "1px solid #eee", borderRadius: "8px" },
  cartTable: { width: "100%", borderCollapse: "collapse" },
  tableHeader: { background: "#f8f9fa", position: "sticky", top: 0 },
  th: { padding: "10px", textAlign: "left", borderBottom: "2px solid #dee2e6", fontSize: "14px", fontWeight: "bold" },
  tableRow: { borderBottom: "1px solid #eee" },
  td: { padding: "10px", fontSize: "14px" },
  removeBtn: { background: "transparent", border: "none", cursor: "pointer", fontSize: "16px" },
  emptyCart: { textAlign: "center", padding: "20px", color: "#999" },
  bottomSection: { display: "flex", flexDirection: "column", gap: "15px" },
  cashSection: { padding: "15px", background: "#f8f9fa", borderRadius: "8px" },
  cashLabel: { display: "flex", alignItems: "center", fontWeight: "bold" },
  cashInput: { marginLeft: "10px", padding: "8px", borderRadius: "6px", border: "1px solid #ddd", width: "120px" },
  totalRow: { display: "flex", justifyContent: "space-between", marginTop: "8px" },
  checkoutBtn: { padding: "15px", background: "#28a745", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", fontSize: "16px", cursor: "pointer" },
  modalOverlay: { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modalContent: { background: "#fff", padding: "25px", borderRadius: "10px", width: "400px", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" },
  modalInput: { width: "100%", padding: "12px", fontSize: "16px", border: "1px solid #ddd", borderRadius: "6px", marginBottom: "15px" },
  modalBtn: { flex: 1, padding: "10px", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" },
  receiptOverlay: { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  receiptPopup: { background: "#fff", padding: "25px", borderRadius: "12px", width: "450px", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 8px 24px rgba(0,0,0,0.3)" },
  receiptInfo: { padding: "15px", background: "#f8f9fa", borderRadius: "8px", marginBottom: "15px", fontSize: "14px" },
  receiptTable: { width: "100%", marginBottom: "15px", fontSize: "14px" },
  closeReceiptBtn: { width: "100%", padding: "12px", background: "#007bff", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }
};

export default Payments;