import React, { useState, useEffect } from "react";
import { FaBox, FaPlus, FaSearch } from "react-icons/fa";

function Inventory() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [stockToAdd, setStockToAdd] = useState("");
  const [newProduct, setNewProduct] = useState({ name: "", price: "", qty: "" });
  const [loading, setLoading] = useState(true);

  // Log audit trail
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

  useEffect(() => {
    fetchProducts();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      fetchProducts();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchProducts = () => {
    fetch("http://localhost:8000/api/products")
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredItems = items.filter((item) =>
    item?.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setStockToAdd("");
  };

  const handleAddStock = (e) => {
    e.preventDefault();
    if (!selectedItem || stockToAdd === "" || isNaN(stockToAdd)) return;

    const updatedQty = selectedItem.stock_quantity + parseInt(stockToAdd, 10);

    fetch(`http://localhost:8000/api/products/${selectedItem.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newQty: updatedQty }),
    })
      .then((res) => res.json())
      .then((updatedProduct) => {
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.id === updatedProduct.id ? updatedProduct : item
          )
        );
        setSelectedItem(null);
        setStockToAdd("");
        
        logAuditTrail(`ADD STOCK`, "SUCCESS");
      })
      .catch((err) => {
        console.error("Error updating stock:", err);
        logAuditTrail(`ADD STOCK`, "FAILED");
      });
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProduct.name) return alert("Product name is required!");

    fetch("http://localhost:8000/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_name: newProduct.name,
        price: parseFloat(newProduct.price) || 0,
        stock_quantity: parseInt(newProduct.qty) || 0,
      }),
    })
      .then((res) => res.json())
      .then((addedProduct) => {
        setItems((prev) => [...prev, addedProduct]);
        setNewProduct({ name: "", price: "", qty: "" });
        
        logAuditTrail(`ADD PRODUCT`, "SUCCESS");
      })
      .catch((err) => {
        console.error("Error adding product:", err);
        logAuditTrail(`ADD PRODUCT`, "FAILED");
      });
  };

  const totalValue = items.reduce(
    (sum, item) => sum + item.price * item.stock_quantity,
    0
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <FaBox style={{ marginRight: "12px" }} />
            Inventory Management
          </h1>
          <p style={styles.subtitle}>Manage products and stock levels</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Products</div>
          <div style={styles.statValue}>{items.length}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Inventory Value</div>
          <div style={styles.statValue}>₱{totalValue.toLocaleString()}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Low Stock Items</div>
          <div style={styles.statValue}>{items.filter(i => i.stock_quantity < 5 && i.stock_quantity > 0).length}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Out of Stock</div>
          <div style={{ ...styles.statValue, color: "#dc3545" }}>{items.filter(i => i.stock_quantity === 0).length}</div>
        </div>
      </div>

      {/* Add New Product Section */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          <FaPlus style={{ marginRight: "8px" }} />
          Add New Product
        </h3>
        <div style={styles.formGrid}>
          <div>
            <label style={styles.label}>Product Name</label>
            <input
              type="text"
              placeholder="Enter product name"
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct((p) => ({ ...p, name: e.target.value }))
              }
              style={styles.input}
            />
          </div>
          <div>
            <label style={styles.label}>Price (₱)</label>
            <input
              type="number"
              placeholder="0.00"
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct((p) => ({ ...p, price: e.target.value }))
              }
              style={styles.input}
            />
          </div>
          <div>
            <label style={styles.label}>Initial Quantity</label>
            <input
              type="number"
              placeholder="0"
              value={newProduct.qty}
              onChange={(e) =>
                setNewProduct((p) => ({ ...p, qty: e.target.value }))
              }
              style={styles.input}
            />
          </div>
          <div style={{ alignSelf: "flex-end" }}>
            <button onClick={handleAddProduct} style={styles.buttonPrimary}>
              <FaPlus style={{ marginRight: "6px" }} />
              Add Product
            </button>
          </div>
        </div>
      </div>

      {/* Search & Add Stock Section */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          <FaSearch style={{ marginRight: "8px" }} />
          Search & Add Stock
        </h3>
        <div style={styles.twoColumnLayout}>
          {/* Search Column */}
          <div>
            <label style={styles.label}>Search Item</label>
            <input
              type="text"
              placeholder="Search by product name..."
              value={searchTerm}
              onChange={handleSearch}
              style={styles.input}
            />

            {searchTerm && (
              <div style={styles.searchResults}>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        ...styles.searchResultItem,
                        backgroundColor:
                          selectedItem?.id === item.id ? "#e7f3ff" : "#fff",
                        borderLeft:
                          selectedItem?.id === item.id ? "4px solid #0d6efd" : "none",
                      }}
                      onClick={() => handleSelectItem(item)}
                    >
                      <div style={styles.resultName}>{item.product_name}</div>
                      <div style={styles.resultQty}>Stock: {item.stock_quantity}</div>
                    </div>
                  ))
                ) : (
                  <div style={styles.noResults}>No matching items found</div>
                )}
              </div>
            )}
          </div>

          {/* Add Stock Column */}
          <div>
            <label style={styles.label}>Add Stock</label>
            {selectedItem ? (
              <div>
                <div style={styles.selectedItemBox}>
                  <div style={styles.selectedItemName}>{selectedItem.product_name}</div>
                  <div style={styles.selectedItemQty}>
                    Current Stock: <strong>{selectedItem.stock_quantity}</strong>
                  </div>
                </div>
                <input
                  type="number"
                  placeholder="Enter quantity to add"
                  value={stockToAdd}
                  onChange={(e) => setStockToAdd(e.target.value)}
                  style={styles.input}
                />
                <button onClick={handleAddStock} style={styles.buttonSuccess}>
                  <FaPlus style={{ marginRight: "6px" }} />
                  Add Stock
                </button>
              </div>
            ) : (
              <div style={styles.placeholderBox}>
                <div style={styles.placeholderText}>
                  👈 Select an item from the list to add stock
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Item List Table */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          <FaBox style={{ marginRight: "8px" }} />
          Product Inventory
        </h3>
        {loading ? (
          <div style={styles.loadingContainer}>Loading products...</div>
        ) : items.length === 0 ? (
          <div style={styles.emptyContainer}>No products in inventory</div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>Product Name</th>
                  <th style={styles.th}>Unit Price</th>
                  <th style={styles.th}>Quantity</th>
                  <th style={styles.th}>Total Value</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} style={styles.tableRow}>
                    <td style={styles.td}>{item.product_name}</td>
                    <td style={styles.td}>₱{parseFloat(item.price).toFixed(2)}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          backgroundColor:
                            item.stock_quantity === 0
                              ? "#dc3545"
                              : item.stock_quantity < 5
                              ? "#ff9800"
                              : "#51cf66",
                        }}
                      >
                        {item.stock_quantity}
                      </span>
                    </td>
                    <td style={styles.td}>
                      ₱{(item.price * item.stock_quantity).toLocaleString()}
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          backgroundColor:
                            item.stock_quantity === 0
                              ? "#f8d7da"
                              : item.stock_quantity < 5
                              ? "#fff3cd"
                              : "#e0ffe0",
                          color:
                            item.stock_quantity === 0
                              ? "#721c24"
                              : item.stock_quantity < 5
                              ? "#856404"
                              : "#2f8a0f",
                        }}
                      >
                        {item.stock_quantity === 0
                          ? "Out of Stock"
                          : item.stock_quantity < 5
                          ? "Low Stock"
                          : "In Stock"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "24px",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
  },
  header: {
    marginBottom: "32px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#1f2937",
    margin: "0 0 8px 0",
    display: "flex",
    alignItems: "center",
  },
  subtitle: {
    fontSize: "14px",
    color: "#6b7280",
    margin: 0,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "16px",
    marginBottom: "32px",
  },
  statCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e5e7eb",
  },
  statLabel: {
    fontSize: "14px",
    color: "#6b7280",
    fontWeight: "500",
    marginBottom: "8px",
  },
  statValue: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#0d6efd",
  },
  card: {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e5e7eb",
    marginBottom: "24px",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1f2937",
    margin: "0 0 16px 0",
    display: "flex",
    alignItems: "center",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    alignItems: "flex-end",
  },
  twoColumnLayout: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "600",
    color: "#374151",
    fontSize: "14px",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
    marginBottom: "12px",
  },
  searchResults: {
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    maxHeight: "300px",
    overflowY: "auto",
    backgroundColor: "#f9fafb",
    marginTop: "8px",
  },
  searchResultItem: {
    padding: "12px",
    cursor: "pointer",
    borderBottom: "1px solid #e5e7eb",
    transition: "background-color 0.2s",
  },
  resultName: {
    fontWeight: "500",
    color: "#1f2937",
    fontSize: "14px",
  },
  resultQty: {
    fontSize: "12px",
    color: "#6b7280",
    marginTop: "4px",
  },
  noResults: {
    padding: "16px",
    color: "#9ca3af",
    fontStyle: "italic",
    textAlign: "center",
  },
  selectedItemBox: {
    backgroundColor: "#f0f7ff",
    border: "2px solid #0d6efd",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "12px",
  },
  selectedItemName: {
    fontWeight: "600",
    color: "#1f2937",
    fontSize: "16px",
  },
  selectedItemQty: {
    fontSize: "14px",
    color: "#6b7280",
    marginTop: "8px",
  },
  placeholderBox: {
    backgroundColor: "#f3f4f6",
    border: "2px dashed #d1d5db",
    borderRadius: "8px",
    padding: "32px 16px",
    textAlign: "center",
  },
  placeholderText: {
    color: "#9ca3af",
    fontSize: "14px",
  },
  buttonPrimary: {
    padding: "10px 20px",
    backgroundColor: "#0d6efd",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    transition: "background-color 0.2s",
  },
  buttonSuccess: {
    width: "100%",
    padding: "10px 20px",
    backgroundColor: "#22c55e",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.2s",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeader: {
    backgroundColor: "#f9fafb",
    borderBottom: "2px solid #e5e7eb",
  },
  th: {
    padding: "12px",
    textAlign: "left",
    fontWeight: "600",
    color: "#374151",
    fontSize: "14px",
  },
  tableRow: {
    borderBottom: "1px solid #e5e7eb",
    transition: "background-color 0.2s",
  },
  td: {
    padding: "12px",
    fontSize: "14px",
    color: "#374151",
  },
  badge: {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "20px",
    color: "white",
    fontWeight: "600",
    fontSize: "12px",
  },
  statusBadge: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "6px",
    fontWeight: "500",
    fontSize: "12px",
  },
  loadingContainer: {
    textAlign: "center",
    padding: "40px",
    color: "#6b7280",
  },
  emptyContainer: {
    textAlign: "center",
    padding: "40px",
    color: "#9ca3af",
  },
};

export default Inventory;