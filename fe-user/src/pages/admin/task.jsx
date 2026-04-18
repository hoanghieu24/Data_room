import { useEffect, useState } from "react";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../../services/taskService";
import { getEmployees } from "../../services/employeeService";
import { getCategories } from "../../services/categoryService";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("title");

  const [form, setForm] = useState({
    title: "",
    description: "",
    task_type_id: "",
    status_id: "",
    priority_id: "",
    is_active: true,
    assigned_to: "",
    created_by: 1,
  });

  /* ================= LOAD ================= */
  const fetchData = async () => {
    try {
      setLoading(true);

      const [taskRes, cateRes, employeeRes] = await Promise.all([
        getTasks(),
        getCategories(),
        getEmployees(),
      ]);

      const tasksData = Array.isArray(taskRes) ? taskRes : [];
      setTasks(tasksData);
      setFilteredTasks(tasksData);
      setCategories(Array.isArray(cateRes) ? cateRes : []);
      setUsers(Array.isArray(employeeRes) ? employeeRes : []);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= SEARCH ================= */
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTasks(tasks);
      return;
    }

    const filtered = tasks.filter((task) => {
      const searchValue = searchTerm.toLowerCase();
      switch (searchField) {
        case "title":
          return task.title?.toLowerCase().includes(searchValue);
        case "code":
          return task.task_code?.toLowerCase().includes(searchValue);
        case "description":
          return task.description?.toLowerCase().includes(searchValue);
        case "assignee":
          const assignee = getUserName(task.assigned_to);
          return assignee?.toLowerCase().includes(searchValue);
        default:
          return true;
      }
    });
    setFilteredTasks(filtered);
  }, [searchTerm, searchField, tasks]);

  /* ================= HELPER ================= */
  const getByType = (typeId) =>
    categories.filter((c) => c.category_type_id === typeId);

  const getUserName = (id) => {
    const user = users.find((u) => u.id === id);
    return user ? user.full_name || user.name || user.username : "-";
  };

  const getIdByName = (name, typeId) => {
    const found = categories.find(
      (c) => c.name === name && c.category_type_id === typeId
    );
    return found ? found.id : "";
  };

  /* ================= VALIDATE ================= */
  const validate = () => {
    if (!form.title.trim()) {
      alert("Vui lòng nhập tiêu đề task");
      return false;
    }
    if (!form.assigned_to) {
      alert("Vui lòng chọn người nhận task");
      return false;
    }
    return true;
  };

  /* ================= CREATE ================= */
  const handleCreate = async () => {
    if (!validate()) return;

    await createTask({
      ...form,
      assigned_to: form.assigned_to || null,
      created_by: form.created_by || 1,
      is_active: form.is_active ? 1 : 0,
      task_type_id: form.task_type_id || null,
      status_id: form.status_id || null,
      priority_id: form.priority_id || null,
      description: form.description || null,
    });

    resetForm();
    fetchData();
  };

  /* ================= UPDATE ================= */
  const handleUpdate = async () => {
    if (!validate()) return;

    await updateTask(editingId, {
      ...form,
      assigned_to: form.assigned_to || null,
      created_by: form.created_by || 1,
      is_active: form.is_active ? 1 : 0,
      task_type_id: form.task_type_id || null,
      status_id: form.status_id || null,
      priority_id: form.priority_id || null,
      description: form.description || null,
    });

    resetForm();
    fetchData();
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa task này?")) return;
    await deleteTask(id);
    fetchData();
  };

  /* ================= EDIT ================= */
  const handleEdit = (t) => {
    setEditingId(t.id);

    setForm({
      title: t.title || "",
      description: t.description || "",
      task_type_id: getIdByName(t.task_type, 1),
      status_id: getIdByName(t.status, 3),
      priority_id: getIdByName(t.priority, 5),
      is_active: Number(t.is_active) === 1,
      assigned_to: Number(t.assigned_to) || "",
      created_by: t.created_by || 1,
    });
  };

  /* ================= RESET ================= */
  const resetForm = () => {
    setEditingId(null);
    setForm({
      title: "",
      description: "",
      task_type_id: "",
      status_id: "",
      priority_id: "",
      is_active: true,
      assigned_to: "",
      created_by: 1,
    });
  };

  if (loading) return <div style={styles.loading}>⏳ Đang tải dữ liệu...</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📋 Quản lý Task</h2>

      {/* ================= SEARCH BAR ================= */}
      <div style={styles.searchContainer}>
        <div style={styles.searchBox}>
          <select
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
            style={styles.searchSelect}
          >
            <option value="title">Tiêu đề</option>
            <option value="code">Mã task</option>
            <option value="description">Mô tả</option>
            <option value="assignee">Người nhận</option>
          </select>
          <input
            type="text"
            placeholder="🔍 Tìm kiếm task..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSearchField("title");
              }}
              style={styles.clearButton}
            >
              ✖
            </button>
          )}
        </div>
        <div style={styles.resultCount}>
          {filteredTasks.length} / {tasks.length} task
        </div>
      </div>

      {/* ================= FORM ================= */}
      <div style={styles.formContainer}>
        <div style={styles.formGrid}>
          <input
            placeholder="Tiêu đề *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            style={styles.input}
          />

          <input
            placeholder="Mô tả"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            style={styles.input}
          />

          <select
            value={form.assigned_to}
            onChange={(e) =>
              setForm({
                ...form,
                assigned_to: Number(e.target.value) || "",
              })
            }
            style={styles.select}
          >
            <option value="">-- Chọn người nhận * --</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.full_name || u.name || u.username}
              </option>
            ))}
          </select>

          <select
            value={form.task_type_id}
            onChange={(e) =>
              setForm({
                ...form,
                task_type_id: Number(e.target.value) || "",
              })
            }
            style={styles.select}
          >
            <option value="">-- Loại Task --</option>
            {getByType(1).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={form.status_id}
            onChange={(e) =>
              setForm({
                ...form,
                status_id: Number(e.target.value) || "",
              })
            }
            style={styles.select}
          >
            <option value="">-- Trạng thái --</option>
            {getByType(3).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={form.priority_id}
            onChange={(e) =>
              setForm({
                ...form,
                priority_id: Number(e.target.value) || "",
              })
            }
            style={styles.select}
          >
            <option value="">-- Độ ưu tiên --</option>
            {getByType(5).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={String(form.is_active)}
            onChange={(e) =>
              setForm({
                ...form,
                is_active: e.target.value === "true",
              })
            }
            style={styles.select}
          >
            <option value="true">✅ Active</option>
            <option value="false">❌ Inactive</option>
          </select>
        </div>

        <div style={styles.buttonGroup}>
          {editingId ? (
            <>
              <button onClick={handleUpdate} style={styles.saveButton}>
                💾 Lưu thay đổi
              </button>
              <button onClick={resetForm} style={styles.cancelButton}>
                ❌ Hủy
              </button>
            </>
          ) : (
            <button onClick={handleCreate} style={styles.addButton}>
              ➕ Thêm task mới
            </button>
          )}
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Code</th>
              <th style={styles.th}>Tiêu đề</th>
              <th style={styles.th}>Mô tả</th>
              <th style={styles.th}>Loại Task</th>
              <th style={styles.th}>Trạng thái</th>
              <th style={styles.th}>Ưu tiên</th>
              <th style={styles.th}>Active</th>
              <th style={styles.th}>Người nhận</th>
              <th style={styles.th}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan="10" style={styles.emptyState}>
                  {searchTerm ? "🔍 Không tìm thấy task phù hợp" : "📭 Không có dữ liệu"}
                </td>
              </tr>
            ) : (
              filteredTasks.map((t) => (
                <tr key={t.id} style={styles.tableRow}>
                  <td style={styles.td}>{t.id}</td>
                  <td style={styles.td}>
                    <span style={styles.codeBadge}>{t.task_code}</span>
                  </td>
                  <td style={styles.td}>
                    <strong>{t.title}</strong>
                  </td>
                  <td style={styles.td}>{t.description || "-"}</td>
                  <td style={styles.td}>
                    <span style={styles.typeBadge}>{t.task_type || "-"}</span>
                  </td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.statusBadge,
                        ...getStatusStyle(t.status),
                      }}
                    >
                      {t.status || "*"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.priorityBadge,
                        ...getPriorityStyle(t.priority),
                      }}
                    >
                      {t.priority || "-"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {Number(t.is_active) === 1 ? "✅" : "❌"}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.assigneeInfo}>
                      👤 {getUserName(t.assigned_to)}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <button
                      onClick={() => handleEdit(t)}
                      style={styles.editButton}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      style={styles.deleteButton}
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  container: {
    padding: "24px",
    maxWidth: "1400px",
    margin: "0 auto",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  title: {
    fontSize: "28px",
    fontWeight: "600",
    marginBottom: "24px",
    color: "#333",
  },
  searchContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    gap: "16px",
  },
  searchBox: {
    flex: 1,
    display: "flex",
    gap: "8px",
    position: "relative",
  },
  searchSelect: {
    padding: "10px 12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    backgroundColor: "white",
    fontSize: "14px",
    cursor: "pointer",
  },
  searchInput: {
    flex: 1,
    padding: "10px 12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    transition: "border-color 0.3s",
  },
  clearButton: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    color: "#999",
    padding: "4px",
  },
  resultCount: {
    fontSize: "14px",
    color: "#666",
    whiteSpace: "nowrap",
  },
  formContainer: {
    backgroundColor: "#f8f9fa",
    padding: "20px",
    borderRadius: "8px",
    marginBottom: "24px",
    border: "1px solid #e9ecef",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "12px",
    marginBottom: "16px",
  },
  input: {
    padding: "10px 12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    transition: "border-color 0.3s",
  },
  select: {
    padding: "10px 12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: "white",
    cursor: "pointer",
  },
  buttonGroup: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
  },
  addButton: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "background-color 0.3s",
  },
  saveButton: {
    padding: "10px 20px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  cancelButton: {
    padding: "10px 20px",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  tableWrapper: {
    overflowX: "auto",
    borderRadius: "8px",
    border: "1px solid #e9ecef",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "white",
  },
  tableHeader: {
    backgroundColor: "#f8f9fa",
    borderBottom: "2px solid #dee2e6",
  },
  th: {
    padding: "12px",
    textAlign: "left",
    fontWeight: "600",
    color: "#495057",
    fontSize: "14px",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #e9ecef",
    fontSize: "14px",
    color: "#666",
  },
  tableRow: {
    transition: "background-color 0.3s",
  },
  codeBadge: {
    fontFamily: "monospace",
    backgroundColor: "#f8f9fa",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "500",
  },
  typeBadge: {
    backgroundColor: "#e7f3ff",
    color: "#0066cc",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
  },
  statusBadge: {
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "500",
    display: "inline-block",
  },
  priorityBadge: {
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "500",
    display: "inline-block",
  },
  assigneeInfo: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  editButton: {
    padding: "6px 12px",
    marginRight: "8px",
    backgroundColor: "#ffc107",
    color: "#333",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    transition: "opacity 0.3s",
  },
  deleteButton: {
    padding: "6px 12px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    transition: "opacity 0.3s",
  },
  emptyState: {
    textAlign: "center",
    padding: "48px",
    color: "#999",
    fontSize: "16px",
  },
  loading: {
    textAlign: "center",
    padding: "48px",
    fontSize: "18px",
    color: "#666",
  },
};

const getStatusStyle = (status) => {
  const statusStyles = {
    "Đang xử lý": { backgroundColor: "#fff3cd", color: "#856404" },
    "Hoàn thành": { backgroundColor: "#d4edda", color: "#155724" },
    "Chờ duyệt": { backgroundColor: "#cce5ff", color: "#004085" },
    "Tạm dừng": { backgroundColor: "#f8d7da", color: "#721c24" },
  };
  return statusStyles[status] || {};
};

const getPriorityStyle = (priority) => {
  const priorityStyles = {
    "Cao": { backgroundColor: "#f8d7da", color: "#721c24" },
    "Trung bình": { backgroundColor: "#fff3cd", color: "#856404" },
    "Thấp": { backgroundColor: "#d1ecf1", color: "#0c5460" },
  };
  return priorityStyles[priority] || {};
};

export default Tasks;