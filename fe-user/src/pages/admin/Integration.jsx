import { useEffect, useState } from "react";
import {
  getAllIntegrations,
  createIntegration,
  updateIntegration,
  deleteIntegration,
} from "../../services/integrationService";

function Integration() {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [form, setForm] = useState({
    name: "",
    provider: "",
    description: "",
    config: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getAllIntegrations();
      setIntegrations(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError(err.message || "Không thể tải dữ liệu integrations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setSelectedIntegration(null);
    setForm({ name: "", provider: "", description: "", config: "" });
  };

  const handleSubmit = async () => {
    try {
      let configValue = form.config.trim();
      if (!configValue) {
        configValue = {};
      } else {
        try {
          configValue = JSON.parse(configValue);
        } catch {
          configValue = form.config;
        }
      }

      const payload = {
        name: form.name,
        provider: form.provider,
        description: form.description,
        config: configValue,
      };

      if (selectedIntegration) {
        await updateIntegration(selectedIntegration.id, payload);
        alert("Cập nhật integration thành công");
      } else {
        await createIntegration(payload);
        alert("Tạo mới integration thành công");
      }

      await loadData();
      resetForm();
      setError("");
    } catch (err) {
      setError(err.message || "Lỗi khi lưu integration");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa integration này?")) return;
    try {
      await deleteIntegration(id);
      await loadData();
      if (selectedIntegration?.id === id) resetForm();
    } catch (err) {
      setError(err.message || "Không thể xóa integration");
    }
  };

  const handleEdit = (integration) => {
    setSelectedIntegration(integration);
    setForm({
      name: integration.name || "",
      provider: integration.provider || "",
      description: integration.description || "",
      config: typeof integration.config === "string"
        ? integration.config
        : JSON.stringify(integration.config || {}, null, 2),
    });
  };

  const renderConfigValue = (config) => {
    if (typeof config === "string") return config || "-";
    return JSON.stringify(config || {}, null, 2);
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerBar}>
        <div>
          <h2 style={styles.pageTitle}>🔄 Quản lý Tích hợp</h2>
          <p style={styles.sectionSubtitle}>Quản lý kết nối và cấu hình các tích hợp hệ thống.</p>
        </div>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}
      {loading ? (
        <div style={styles.loading}>⏳ Đang tải dữ liệu...</div>
      ) : (
        <div>
          <div style={styles.cardRow}>
            <div style={styles.card}>
              <h4 style={styles.cardTitle}>{selectedIntegration ? "Cập nhật Integration" : "Tạo Integration mới"}</h4>
              <div style={styles.formGroup}>
                <label style={styles.label}>Tên tích hợp</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={styles.input}
                  placeholder="Tên tích hợp"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nhà cung cấp</label>
                <input
                  type="text"
                  value={form.provider}
                  onChange={(e) => setForm({ ...form, provider: e.target.value })}
                  style={styles.input}
                  placeholder="Provider hoặc loại tích hợp"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Mô tả</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={styles.textarea}
                  rows={3}
                  placeholder="Mô tả tích hợp"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Cấu hình (JSON)</label>
                <textarea
                  value={form.config}
                  onChange={(e) => setForm({ ...form, config: e.target.value })}
                  style={styles.textarea}
                  rows={5}
                  placeholder='{"apiKey": "...", "endpoint": "https://..."}'
                />
              </div>
              <div style={styles.formActions}>
                <button onClick={handleSubmit} style={styles.primaryButton}>
                  {selectedIntegration ? "Cập nhật integration" : "Tạo integration"}
                </button>
                {selectedIntegration && (
                  <button onClick={resetForm} style={styles.secondaryButton}>
                    Hủy
                  </button>
                )}
              </div>
            </div>
            <div style={styles.cardLarge}>
              <h4 style={styles.cardTitle}>Danh sách integration</h4>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Tên</th>
                      <th style={styles.th}>Provider</th>
                      <th style={styles.th}>Mô tả</th>
                      <th style={styles.th}>Cấu hình</th>
                      <th style={styles.th}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {integrations.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={styles.emptyState}>Chưa có integration nào.</td>
                      </tr>
                    ) : (
                      integrations.map((integration) => (
                        <tr key={integration.id}>
                          <td style={styles.td}>{integration.id}</td>
                          <td style={styles.td}>{integration.name || "-"}</td>
                          <td style={styles.td}>{integration.provider || "-"}</td>
                          <td style={styles.td}>{integration.description || "-"}</td>
                          <td style={styles.td}>{renderConfigValue(integration.config)}</td>
                          <td style={styles.td}>
                            <button onClick={() => handleEdit(integration)} style={styles.actionButton}>✏️</button>
                            <button onClick={() => handleDelete(integration.id)} style={styles.deleteButton}>🗑️</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  },
  headerBar: {
    marginBottom: "24px",
  },
  pageTitle: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "700",
    color: "#1f2937",
  },
  sectionSubtitle: {
    margin: "8px 0 0",
    color: "#475569",
  },
  cardRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1.6fr",
    gap: "20px",
  },
  card: {
    backgroundColor: "#f8fafc",
    padding: "18px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },
  cardLarge: {
    backgroundColor: "#f8fafc",
    padding: "18px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },
  cardTitle: {
    margin: 0,
    marginBottom: "16px",
    fontSize: "18px",
    fontWeight: "600",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "16px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#334155",
  },
  input: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
  },
  textarea: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    minHeight: "120px",
    resize: "vertical",
  },
  formActions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  primaryButton: {
    padding: "10px 18px",
    backgroundColor: "#2563eb",
    border: "none",
    borderRadius: "8px",
    color: "white",
    cursor: "pointer",
    fontWeight: "600",
  },
  secondaryButton: {
    padding: "10px 18px",
    backgroundColor: "#e2e8f0",
    border: "none",
    borderRadius: "8px",
    color: "#334155",
    cursor: "pointer",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "12px",
    backgroundColor: "#e2e8f0",
    color: "#334155",
    fontWeight: "600",
    borderBottom: "1px solid #cbd5e1",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #e2e8f0",
    color: "#475569",
  },
  emptyState: {
    padding: "18px",
    textAlign: "center",
    color: "#64748b",
  },
  actionButton: {
    padding: "6px 10px",
    marginRight: "8px",
    backgroundColor: "#2563eb",
    border: "none",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
  },
  deleteButton: {
    padding: "6px 10px",
    backgroundColor: "#dc2626",
    border: "none",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
  },
  errorBox: {
    padding: "16px",
    marginBottom: "16px",
    backgroundColor: "#fee2e2",
    border: "1px solid #fecaca",
    borderRadius: "10px",
    color: "#b91c1c",
  },
  loading: {
    padding: "24px",
    textAlign: "center",
    color: "#475569",
  },
};

export default Integration;
