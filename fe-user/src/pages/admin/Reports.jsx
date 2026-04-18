import { useEffect, useState } from "react";
import {
  getAllReportTemplates,
  createReportTemplate,
  updateReportTemplate,
  deleteReportTemplate,
  getAllReportRuns,
  createReportRun,
  updateReportRun,
  deleteReportRun,
} from "../../services/reportService";

function Reports() {
  const generateReportCode = () => `RPT-${Date.now()}`;

  const [activeTab, setActiveTab] = useState("templates");
  const [templates, setTemplates] = useState([]);
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedRun, setSelectedRun] = useState(null);
  const [templateForm, setTemplateForm] = useState({
    report_code: generateReportCode(),
    name: "",
    description: "",
    payload: "",
  });
  const [runForm, setRunForm] = useState({
    template_id: "",
    name: "",
    scheduled_date: "",
    parameters: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [templatesData, runsData] = await Promise.all([
        getAllReportTemplates(),
        getAllReportRuns(),
      ]);
      setTemplates(Array.isArray(templatesData) ? templatesData : []);
      setRuns(Array.isArray(runsData) ? runsData : []);
      setError("");
    } catch (err) {
      setError(err.message || "Không thể tải dữ liệu báo cáo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetTemplateForm = () => {
    setSelectedTemplate(null);
    setTemplateForm({ report_code: generateReportCode(), name: "", description: "", payload: "" });
  };

  const resetRunForm = () => {
    setSelectedRun(null);
    setRunForm({ template_id: "", name: "", scheduled_date: "", parameters: "" });
  };

  const getTemplateName = (templateId) => {
    const idString = String(templateId || "");
    const template = templates.find(
      (item) => String(item.id) === idString || String(item.report_id || "") === idString
    );
    return template ? template.name || template.title || `Template ${template.id}` : "-";
  };

  const handleSubmitTemplate = async () => {
    try {
      const reportCode = selectedTemplate ? selectedTemplate.report_code : (templateForm.report_code || generateReportCode());
      const payload = {
        report_code: reportCode,
        name: templateForm.name,
        description: templateForm.description,
        template: templateForm.payload,
      };
      if (selectedTemplate) {
        await updateReportTemplate(selectedTemplate.id, payload);
      } else {
        await createReportTemplate(payload);
      }
      await loadData();
      resetTemplateForm();
      setError("");
      alert("Lưu template thành công");
    } catch (err) {
      setError(err.message || "Lỗi khi lưu template");
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (!window.confirm("Xóa template này?")) return;
    try {
      await deleteReportTemplate(id);
      await loadData();
      if (selectedTemplate?.id === id) resetTemplateForm();
    } catch (err) {
      setError(err.message || "Không thể xóa template");
    }
  };

  const handleEditTemplate = (template) => {
    setSelectedTemplate(template);
    setTemplateForm({
      report_code: template.report_code || template.code || "",
      name: template.name || template.title || "",
      description: template.description || "",
      payload: template.template || JSON.stringify(template, null, 2) || "",
    });
  };

  const handleSubmitRun = async () => {
    try {
      const payload = {
        template_id: parseInt(runForm.template_id) || runForm.template_id,
        name: runForm.name,
        scheduled_date: runForm.scheduled_date,
        parameters: runForm.parameters,
      };
      if (selectedRun) {
        await updateReportRun(selectedRun.id, payload);
      } else {
        await createReportRun(payload);
      }
      await loadData();
      resetRunForm();
      setError("");
      alert("Lưu report run thành công");
    } catch (err) {
      setError(err.message || "Lỗi khi lưu report run");
    }
  };

  const handleDeleteRun = async (id) => {
    if (!window.confirm("Xóa report run này?")) return;
    try {
      await deleteReportRun(id);
      await loadData();
      if (selectedRun?.id === id) resetRunForm();
    } catch (err) {
      setError(err.message || "Không thể xóa report run");
    }
  };

  const handleEditRun = (run) => {
    setSelectedRun(run);
    setRunForm({
      template_id: run.template_id || run.report_template_id || "",
      name: run.name || run.run_name || "",
      scheduled_date: run.scheduled_date || run.execution_date || "",
      parameters: typeof run.parameters === "string" ? run.parameters : JSON.stringify(run.parameters || {}, null, 2),
    });
  };

  const renderTemplateSection = () => (
    <>
      <div style={styles.sectionHeader}>
        <div>
          <h3 style={styles.sectionTitle}>Report Templates</h3>
          <p style={styles.sectionSubtitle}>Quản lý mẫu báo cáo (template) để tạo các lần chạy báo cáo.</p>
        </div>
      </div>

      <div style={styles.cardRow}>
        <div style={styles.card}>
          <h4 style={styles.cardTitle}>{selectedTemplate ? "Cập nhật Template" : "Tạo Template mới"}</h4>
          <div style={styles.formGroup}>
            <label style={styles.label}>Mã báo cáo</label>
            <input
              type="text"
              value={templateForm.report_code}
              style={{ ...styles.input, backgroundColor: "#f3f4f6", cursor: "not-allowed" }}
              placeholder="Mã báo cáo tự tạo"
              disabled
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Tên template</label>
            <input
              type="text"
              value={templateForm.name}
              onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
              style={styles.input}
              placeholder="Tên template"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Mô tả</label>
            <textarea
              value={templateForm.description}
              onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
              style={styles.textarea}
              rows={3}
              placeholder="Mô tả template"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Nội dung template</label>
            <textarea
              value={templateForm.payload}
              onChange={(e) => setTemplateForm({ ...templateForm, payload: e.target.value })}
              style={styles.textarea}
              rows={6}
              placeholder="JSON hoặc nội dung template"
            />
          </div>
          <div style={styles.formActions}>
            <button onClick={handleSubmitTemplate} style={styles.primaryButton}>
              {selectedTemplate ? "Cập nhật template" : "Tạo template"}
            </button>
            {selectedTemplate && (
              <button onClick={resetTemplateForm} style={styles.secondaryButton}>
                Hủy
              </button>
            )}
          </div>
        </div>

        <div style={styles.cardLarge}>
          <h4 style={styles.cardTitle}>Danh sách template</h4>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Tên</th>
                  <th style={styles.th}>Mô tả</th>
                  <th style={styles.th}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {templates.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={styles.emptyState}>Chưa có template nào.</td>
                  </tr>
                ) : (
                  templates.map((template) => (
                    <tr key={template.id}>
                      <td style={styles.td}>{template.id}</td>
                      <td style={styles.td}>{template.name || template.title || "-"}</td>
                      <td style={styles.td}>{template.description || "-"}</td>
                      <td style={styles.td}>
                        <button onClick={() => handleEditTemplate(template)} style={styles.actionButton}>✏️</button>
                        <button onClick={() => handleDeleteTemplate(template.id)} style={styles.deleteButton}>🗑️</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );

  const renderRunSection = () => (
    <>
      <div style={styles.sectionHeader}>
        <div>
          <h3 style={styles.sectionTitle}>Report Runs</h3>
          <p style={styles.sectionSubtitle}>Lên lịch và quản lý các lần chạy báo cáo.</p>
        </div>
      </div>

      <div style={styles.cardRow}>
        <div style={styles.card}>
          <h4 style={styles.cardTitle}>{selectedRun ? "Cập nhật Run" : "Tạo Run mới"}</h4>
          <div style={styles.formGroup}>
            <label style={styles.label}>Chọn template</label>
            <select
              value={runForm.template_id}
              onChange={(e) => setRunForm({ ...runForm, template_id: e.target.value })}
              style={styles.input}
            >
              <option value="">-- Chọn template --</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name || template.title || `Template ${template.id}`}
                </option>
              ))}
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Tên run</label>
            <input
              type="text"
              value={runForm.name}
              onChange={(e) => setRunForm({ ...runForm, name: e.target.value })}
              style={styles.input}
              placeholder="Tên run"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Ngày chạy</label>
            <input
              type="date"
              value={runForm.scheduled_date}
              onChange={(e) => setRunForm({ ...runForm, scheduled_date: e.target.value })}
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Tham số</label>
            <textarea
              value={runForm.parameters}
              onChange={(e) => setRunForm({ ...runForm, parameters: e.target.value })}
              style={styles.textarea}
              rows={5}
              placeholder="JSON hoặc tham số chạy"
            />
          </div>
          <div style={styles.formActions}>
            <button onClick={handleSubmitRun} style={styles.primaryButton}>
              {selectedRun ? "Cập nhật run" : "Tạo run"}
            </button>
            {selectedRun && (
              <button onClick={resetRunForm} style={styles.secondaryButton}>
                Hủy
              </button>
            )}
          </div>
        </div>

        <div style={styles.cardLarge}>
          <h4 style={styles.cardTitle}>Danh sách report run</h4>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Template</th>
                  <th style={styles.th}>Tên run</th>
                  <th style={styles.th}>Ngày chạy</th>
                  <th style={styles.th}>Trạng thái</th>
                  <th style={styles.th}>Tham số</th>
                  <th style={styles.th}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {runs.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={styles.emptyState}>Chưa có report run nào.</td>
                  </tr>
                ) : (
                  runs.map((run) => (
                    <tr key={run.id}>
                      <td style={styles.td}>{run.id}</td>
                      <td style={styles.td}>{getTemplateName(run.template_id || run.report_template_id)}</td>
                      <td style={styles.td}>{run.name || run.run_name || "-"}</td>
                      <td style={styles.td}>{run.scheduled_date?.split("T")[0] || run.execution_date?.split("T")[0] || "-"}</td>
                      <td style={styles.td}>{run.status || "-"}</td>
                      <td style={styles.td}>{typeof run.parameters === "string" ? run.parameters : JSON.stringify(run.parameters || {}, null, 2)}</td>
                      <td style={styles.td}>
                        <button onClick={() => handleEditRun(run)} style={styles.actionButton}>✏️</button>
                        <button onClick={() => handleDeleteRun(run.id)} style={styles.deleteButton}>🗑️</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div style={styles.container}>
      <div style={styles.headerBar}>
        <h2 style={styles.pageTitle}>📊 Quản lý Báo cáo</h2>
        <div style={styles.tabBar}>
          <button
            style={activeTab === "templates" ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab("templates")}
          >
            Templates
          </button>
          <button
            style={activeTab === "runs" ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab("runs")}
          >
            Runs
          </button>
        </div>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}
      {loading ? (
        <div style={styles.loading}>⏳ Đang tải dữ liệu...</div>
      ) : (
        <div>
          {activeTab === "templates" ? renderTemplateSection() : renderRunSection()}
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
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "12px",
  },
  pageTitle: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "700",
    color: "#1f2937",
  },
  tabBar: {
    display: "flex",
    gap: "10px",
  },
  tab: {
    padding: "10px 18px",
    borderRadius: "999px",
    border: "1px solid #cbd5e1",
    backgroundColor: "#f8fafc",
    cursor: "pointer",
    color: "#334155",
  },
  tabActive: {
    padding: "10px 18px",
    borderRadius: "999px",
    border: "1px solid #2563eb",
    backgroundColor: "#2563eb",
    color: "white",
    cursor: "pointer",
  },
  sectionHeader: {
    marginBottom: "20px",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "700",
    color: "#111827",
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
    fontWeight: "600",
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
  emptyState: {
    textAlign: "center",
    padding: "24px",
    color: "#64748b",
  },
  loading: {
    padding: "24px",
    textAlign: "center",
    color: "#475569",
  },
  errorBox: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    padding: "14px 16px",
    borderRadius: "10px",
    marginBottom: "18px",
    border: "1px solid #fecaca",
  },
};

export default Reports;
