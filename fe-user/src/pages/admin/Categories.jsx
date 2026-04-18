import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Popconfirm,
  message,
  Input as SearchInput,
} from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryTypes,
} from "../../services/categoryService";

const { Option } = Select;

function Categories() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchField, setSearchField] = useState("all");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form] = Form.useForm();

  /* ================= LOAD ================= */
  const fetchData = async () => {
    try {
      setLoading(true);

      const [catRes, typeRes] = await Promise.all([
        getCategories(),
        getCategoryTypes(),
      ]);

      setData(catRes || []);
      setFilteredData(catRes || []);
      setTypes(typeRes || []);
    } catch (err) {
      message.error("Lỗi load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= SEARCH ================= */
  useEffect(() => {
    filterData();
  }, [searchText, searchField, data]);

  const filterData = () => {
    if (!searchText.trim()) {
      setFilteredData(data);
      return;
    }

    const term = searchText.toLowerCase().trim();
    const filtered = data.filter((item) => {
      if (searchField === "all") {
        return (
          (item.id && item.id.toString().includes(term)) ||
          (item.code && item.code.toLowerCase().includes(term)) ||
          (item.name && item.name.toLowerCase().includes(term)) ||
          (item.category_type_name && item.category_type_name.toLowerCase().includes(term))
        );
      } else if (searchField === "id") {
        return item.id && item.id.toString().includes(term);
      } else if (searchField === "code") {
        return item.code && item.code.toLowerCase().includes(term);
      } else if (searchField === "name") {
        return item.name && item.name.toLowerCase().includes(term);
      } else if (searchField === "type") {
        return item.category_type_name && item.category_type_name.toLowerCase().includes(term);
      }
      return false;
    });

    setFilteredData(filtered);
  };

  const clearSearch = () => {
    setSearchText("");
    setSearchField("all");
  };

  /* ================= OPEN MODAL ================= */
  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      ...record,
      category_type_id: Number(record.category_type_id),
      is_active: Number(record.is_active),
    });
    setOpen(true);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      values.category_type_id = Number(values.category_type_id);
      values.is_active = Number(values.is_active);

      if (editing) {
        await updateCategory(editing.id, values);
        message.success("Update thành công 🚀");
      } else {
        await createCategory(values);
        message.success("Tạo mới thành công 🎉");
      }

      setOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      message.error("Có lỗi xảy ra");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    await deleteCategory(id);
    message.success("Đã xóa");
    fetchData();
  };

  /* ================= TABLE ================= */
  const columns = [
    { title: "ID", dataIndex: "id", width: 80 },
    { title: "Code", dataIndex: "code", width: 150 },
    { title: "Name", dataIndex: "name", width: 200 },
    {
      title: "Type",
      dataIndex: "category_type_name",
      width: 150,
    },
    {
      title: "Status",
      width: 100,
      render: (_, r) => (r.is_active == 1 ? "✅ Active" : "⛔ Inactive"),
    },
    {
      title: "Action",
      width: 150,
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => openEdit(record)}>
            ✏️ Edit
          </Button>

          <Popconfirm
            title="Xóa cái này thật à?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button size="small" danger>
              🗑️ Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📂 Quản lý danh mục</h1>
        <p style={styles.subtitle}>Quản lý danh mục sản phẩm và loại danh mục</p>
      </div>

      {/* Search Section */}
      <div style={styles.searchSection}>
        <div style={styles.searchHeader}>
          <h3 style={styles.searchTitle}>🔍 Tìm kiếm danh mục</h3>
        </div>
        <div style={styles.searchContainer}>
          <div style={styles.searchInputWrapper}>
            <Select
              style={styles.searchFieldSelect}
              value={searchField}
              onChange={setSearchField}
            >
              <Option value="all">🔍 Tất cả</Option>
              <Option value="id">🆔 ID</Option>
              <Option value="code">📝 Code</Option>
              <Option value="name">🏷️ Name</Option>
              <Option value="type">📂 Type</Option>
            </Select>
            <SearchInput
              style={styles.searchInput}
              placeholder={`Tìm kiếm theo ${searchField === "all" ? "tất cả" : searchField === "id" ? "ID" : searchField === "code" ? "code" : searchField === "name" ? "tên" : "loại danh mục"}...`}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
              allowClear
            />
          </div>
          <div style={styles.searchStats}>
            <span>
              📊 Kết quả: <strong>{filteredData.length}</strong> / {data.length} danh mục
            </span>
            <Button 
              size="small" 
              icon={<ReloadOutlined />} 
              onClick={fetchData}
              style={{ marginLeft: 12 }}
            >
              Làm mới
            </Button>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div style={styles.actionBar}>
        <Button type="primary" onClick={openCreate} icon={<span>➕</span>}>
          Thêm danh mục mới
        </Button>
      </div>

      {/* Table Section */}
      <div style={styles.tableSection}>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} danh mục`,
          }}
          locale={{
            emptyText: searchText ? "Không tìm thấy danh mục phù hợp" : "Chưa có dữ liệu danh mục",
          }}
        />
      </div>

      <Modal
        title={
          <div style={styles.modalTitle}>
            {editing ? "✏️ Chỉnh sửa danh mục" : "➕ Thêm danh mục mới"}
          </div>
        }
        open={open}
        onOk={handleSubmit}
        onCancel={() => setOpen(false)}
        okText={editing ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item 
            name="code" 
            label="Mã danh mục" 
            rules={[
              { required: true, message: "Vui lòng nhập mã danh mục" },
              { min: 2, message: "Mã danh mục phải có ít nhất 2 ký tự" }
            ]}
          >
            <Input placeholder="Nhập mã danh mục" />
          </Form.Item>

          <Form.Item 
            name="name" 
            label="Tên danh mục" 
            rules={[
              { required: true, message: "Vui lòng nhập tên danh mục" },
              { min: 2, message: "Tên danh mục phải có ít nhất 2 ký tự" }
            ]}
          >
            <Input placeholder="Nhập tên danh mục" />
          </Form.Item>

          <Form.Item
            name="category_type_id"
            label="Loại danh mục"
            rules={[{ required: true, message: "Vui lòng chọn loại danh mục" }]}
          >
            <Select placeholder="Chọn loại danh mục">
              {types.map((t) => (
                <Option key={t.id} value={t.id}>
                  {t.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="is_active" label="Trạng thái" initialValue={1}>
            <Select>
              <Option value={1}>🟢 Hoạt động</Option>
              <Option value={0}>🔴 Ngừng hoạt động</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
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
    display: "flex",
    gap: "12px",
    marginBottom: "12px",
  },
  searchFieldSelect: {
    width: "140px",
  },
  searchInput: {
    flex: 1,
  },
  searchStats: {
    fontSize: "13px",
    color: "#6c757d",
    paddingTop: "8px",
    borderTop: "1px solid #e9ecef",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actionBar: {
    marginBottom: "20px",
    display: "flex",
    justifyContent: "flex-end",
  },
  tableSection: {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    overflow: "hidden",
    padding: "0 0 20px 0",
  },
  modalTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1a1a2e",
  },
};

export default Categories;