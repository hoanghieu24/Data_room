import { useEffect, useState } from "react";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  changeStatus,
  changeIsVip,
} from "../../services/customerService";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    is_active: "1",
    is_vip: "0",
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [searchTerm, searchField, customers]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getCustomers();
      setCustomers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      alert("Lỗi load khách hàng");
    } finally {
      setLoading(false);
    }
  };

  const filterCustomers = () => {
    if (!searchTerm.trim()) {
      setFilteredCustomers(customers);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    const filtered = customers.filter((customer) => {
      if (searchField === "all") {
        return (
          (customer.name && customer.name.toLowerCase().includes(term)) ||
          (customer.email && customer.email.toLowerCase().includes(term)) ||
          (customer.phone && customer.phone.toLowerCase().includes(term)) ||
          (customer.id && customer.id.toString().includes(term))
        );
      } else if (searchField === "name") {
        return customer.name && customer.name.toLowerCase().includes(term);
      } else if (searchField === "email") {
        return customer.email && customer.email.toLowerCase().includes(term);
      } else if (searchField === "phone") {
        return customer.phone && customer.phone.toLowerCase().includes(term);
      } else if (searchField === "id") {
        return customer.id && customer.id.toString().includes(term);
      }
      return false;
    });

    setFilteredCustomers(filtered);
  };

  const handleSubmit = async () => {
    if (editingId) {
      await updateCustomer(editingId, form);
    } else {
      await createCustomer(form);
    }
    resetForm();
    fetchData();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xóa khách hàng này?")) {
      await deleteCustomer(id);
      fetchData();
    }
  };

  const handleEdit = (c) => {
    setEditingId(c.id);
    setForm({
      name: c.name || "",
      email: c.email || "",
      phone: c.phone || "",
      is_active: String(c.is_active),
      is_vip: String(c.is_vip),
    });
  };

  const handleChangeStatus = async (id) => {
    await changeStatus(id);
    fetchData();
  };

  const handleChangeVip = async (id) => {
    await changeIsVip(id);
    fetchData();
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      name: "",
      email: "",
      phone: "",
      is_active: "1",
      is_vip: "0",
    });
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchField("all");
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p style={styles.loadingText}>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>👥 Quản lý khách hàng</h1>
        <p style={styles.subtitle}>Quản lý thông tin và phân loại khách hàng</p>
      </div>

      {/* Form Section */}
      <div style={styles.formSection}>
        <div style={styles.formHeader}>
          <h3 style={styles.formTitle}>
            {editingId ? "✏️ Chỉnh sửa khách hàng" : "➕ Thêm khách hàng mới"}
          </h3>
        </div>
        <div style={styles.formGrid}>
          <input
            style={styles.input}
            placeholder="Họ và tên *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            style={styles.input}
            placeholder="Email *"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            style={styles.input}
            placeholder="Số điện thoại"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <select
            style={styles.select}
            value={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.value })}
          >
            <option value="1">🟢 Hoạt động</option>
            <option value="0">🔴 Ngừng hoạt động</option>
          </select>
          <select
            style={styles.select}
            value={form.is_vip}
            onChange={(e) => setForm({ ...form, is_vip: e.target.value })}
          >
            <option value="0">⭐ Thường</option>
            <option value="1">👑 VIP</option>
          </select>
          <div style={styles.formActions}>
            <button style={styles.btnPrimary} onClick={handleSubmit}>
              {editingId ? "💾 Cập nhật" : "➕ Thêm khách hàng"}
            </button>
            {editingId && (
              <button style={styles.btnSecondary} onClick={resetForm}>
                ❌ Hủy
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div style={styles.searchSection}>
        <div style={styles.searchHeader}>
          <h3 style={styles.searchTitle}>🔍 Tìm kiếm khách hàng</h3>
        </div>
        <div style={styles.searchContainer}>
          <div style={styles.searchInputWrapper}>
            <select
              style={styles.searchFieldSelect}
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
            >
              <option value="all">🔍 Tất cả</option>
              <option value="id">🆔 ID</option>
              <option value="name">👤 Họ tên</option>
              <option value="email">📧 Email</option>
              <option value="phone">📱 Số điện thoại</option>
            </select>
            <input
              style={styles.searchInput}
              type="text"
              placeholder={`Tìm kiếm theo ${searchField === "all" ? "tất cả" : searchField === "name" ? "họ tên" : searchField === "email" ? "email" : searchField === "phone" ? "số điện thoại" : "ID"}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button style={styles.clearSearchBtn} onClick={clearSearch} title="Xóa tìm kiếm">
                ✖️
              </button>
            )}
          </div>
          <div style={styles.searchStats}>
            <span>
              📊 Kết quả: <strong>{filteredCustomers.length}</strong> / {customers.length} khách hàng
            </span>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div style={styles.tableSection}>
        <div style={styles.tableHeader}>
          <h3 style={styles.tableTitle}>📋 Danh sách khách hàng</h3>
          <div style={styles.stats}>
            Tổng số: <strong>{customers.length}</strong> khách hàng
          </div>
        </div>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Họ tên</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>SĐT</th>
                <th style={styles.th}>Trạng thái</th>
                <th style={styles.th}>Hạng</th>
                <th style={styles.th}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={styles.emptyData}>
                    <div style={styles.emptyIcon}>📭</div>
                    <div>
                      {searchTerm
                        ? "Không tìm thấy khách hàng phù hợp"
                        : "Chưa có dữ liệu khách hàng"}
                    </div>
                    {searchTerm && (
                      <div style={styles.emptyHint}>
                        Không tìm thấy "{searchTerm}" trong danh sách khách hàng
                      </div>
                    )}
                    {!searchTerm && (
                      <div style={styles.emptyHint}>
                        Hãy thêm khách hàng mới bằng form bên trên
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id} style={styles.tr}>
                    <td style={styles.td}>#{c.id}</td>
                    <td style={styles.td}>
                      <strong>{c.name}</strong>
                    </td>
                    <td style={styles.td}>{c.email || "—"}</td>
                    <td style={styles.td}>{c.phone || "—"}</td>
                    <td style={styles.td}>
                      <button
                        style={styles.iconButton}
                        onClick={() => handleChangeStatus(c.id)}
                        title={c.is_active == 1 ? "Đang hoạt động" : "Đã ngừng"}
                      >
                        {c.is_active == 1 ? (
                          <span style={styles.statusActive}>🟢 Active</span>
                        ) : (
                          <span style={styles.statusInactive}>🔴 Inactive</span>
                        )}
                      </button>
                    </td>
                    <td style={styles.td}>
                      <button
                        style={styles.iconButton}
                        onClick={() => handleChangeVip(c.id)}
                        title={c.is_vip == 1 ? "Khách hàng VIP" : "Khách hàng thường"}
                      >
                        {c.is_vip == 1 ? (
                          <span style={styles.vipBadge}>👑 VIP</span>
                        ) : (
                          <span style={styles.normalBadge}>⭐ Thường</span>
                        )}
                      </button>
                    </td>
                    <td style={styles.td}>
                      <button
                        style={styles.btnEdit}
                        onClick={() => handleEdit(c)}
                        title="Chỉnh sửa"
                      >
                        ✏️
                      </button>
                      <button
                        style={styles.btnDelete}
                        onClick={() => handleDelete(c.id)}
                        title="Xóa"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "32px 24px",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  header: {
    marginBottom: "32px",
    textAlign: "center",
  },
  title: {
    fontSize: "32px",
    fontWeight: "600",
    color: "#1a1a2e",
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "16px",
    color: "#6c757d",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#f8f9fa",
  },
  loadingSpinner: {
    width: "40px",
    height: "40px",
    border: "3px solid #e9ecef",
    borderTop: "3px solid #007bff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    marginTop: "16px",
    color: "#6c757d",
    fontSize: "14px",
  },
  formSection: {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    marginBottom: "24px",
    overflow: "hidden",
  },
  formHeader: {
    padding: "20px 24px",
    borderBottom: "1px solid #e9ecef",
    backgroundColor: "#f8f9fa",
  },
  formTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1a1a2e",
    margin: 0,
  },
  formGrid: {
    padding: "24px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "16px",
  },
  input: {
    padding: "12px 16px",
    border: "1px solid #dee2e6",
    borderRadius: "8px",
    fontSize: "14px",
    transition: "all 0.2s",
    outline: "none",
    backgroundColor: "white",
  },
  select: {
    padding: "12px 16px",
    border: "1px solid #dee2e6",
    borderRadius: "8px",
    fontSize: "14px",
    transition: "all 0.2s",
    outline: "none",
    backgroundColor: "white",
    cursor: "pointer",
  },
  formActions: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  btnPrimary: {
    padding: "12px 24px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
    flex: 1,
  },
  btnSecondary: {
    padding: "12px 24px",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  searchSection: {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    marginBottom: "24px",
    overflow: "hidden",
  },
  searchHeader: {
    padding: "16px 24px",
    borderBottom: "1px solid #e9ecef",
    backgroundColor: "#f8f9fa",
  },
  searchTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1a1a2e",
    margin: 0,
  },
  searchContainer: {
    padding: "20px 24px",
  },
  searchInputWrapper: {
    position: "relative",
    display: "flex",
    gap: "12px",
    marginBottom: "12px",
  },
  searchFieldSelect: {
    padding: "10px 16px",
    border: "1px solid #dee2e6",
    borderRadius: "8px",
    fontSize: "14px",
    backgroundColor: "white",
    cursor: "pointer",
    outline: "none",
    minWidth: "140px",
  },
  searchInput: {
    flex: 1,
    padding: "10px 40px 10px 16px",
    border: "1px solid #dee2e6",
    borderRadius: "8px",
    fontSize: "14px",
    transition: "all 0.2s",
    outline: "none",
  },
  clearSearchBtn: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    color: "#6c757d",
    padding: "4px 8px",
    borderRadius: "4px",
    transition: "all 0.2s",
  },
  searchStats: {
    fontSize: "13px",
    color: "#6c757d",
    paddingTop: "8px",
    borderTop: "1px solid #e9ecef",
  },
  tableSection: {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    overflow: "hidden",
  },
  tableHeader: {
    padding: "20px 24px",
    borderBottom: "1px solid #e9ecef",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
    backgroundColor: "#f8f9fa",
  },
  tableTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1a1a2e",
    margin: 0,
  },
  stats: {
    fontSize: "14px",
    color: "#6c757d",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    padding: "16px 20px",
    textAlign: "left",
    backgroundColor: "#f8f9fa",
    fontWeight: "600",
    fontSize: "14px",
    color: "#495057",
    borderBottom: "2px solid #dee2e6",
  },
  tr: {
    transition: "background-color 0.2s",
    borderBottom: "1px solid #e9ecef",
  },
  td: {
    padding: "16px 20px",
    fontSize: "14px",
    color: "#212529",
  },
  statusActive: {
    display: "inline-block",
    padding: "4px 12px",
    backgroundColor: "#d4edda",
    color: "#155724",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
  },
  statusInactive: {
    display: "inline-block",
    padding: "4px 12px",
    backgroundColor: "#f8d7da",
    color: "#721c24",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
  },
  vipBadge: {
    display: "inline-block",
    padding: "4px 12px",
    backgroundColor: "#fff3cd",
    color: "#856404",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
  },
  normalBadge: {
    display: "inline-block",
    padding: "4px 12px",
    backgroundColor: "#e9ecef",
    color: "#495057",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
  },
  btnEdit: {
    padding: "6px 10px",
    marginRight: "8px",
    backgroundColor: "transparent",
    border: "1px solid #dee2e6",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.2s",
  },
  btnDelete: {
    padding: "6px 10px",
    backgroundColor: "transparent",
    border: "1px solid #dee2e6",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.2s",
  },
  iconButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  emptyData: {
    padding: "60px 20px",
    textAlign: "center",
    color: "#6c757d",
  },
  emptyIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  emptyHint: {
    fontSize: "12px",
    marginTop: "8px",
    color: "#adb5bd",
  },
};

// Add keyframes and hover effects
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  button:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  button:active {
    transform: translateY(0);
  }
  
  input:focus, select:focus {
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
  }
  
  tr:hover {
    background-color: #f8f9fa;
  }
  
  .clearSearchBtn:hover {
    background-color: #e9ecef;
  }
`;
document.head.appendChild(styleSheet);

export default Customers;