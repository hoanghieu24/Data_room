import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  message,
} from "antd";

import {
  getPositions,
  createPosition,
  updatePosition,
  deletePosition,
} from "../../services/positionService";

function Positions() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form] = Form.useForm();

  /* ================= LOAD ================= */
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getPositions();
      setData(res || []);
    } catch (err) {
      message.error("Lỗi load positions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= OPEN ================= */
  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue(record);
    setOpen(true);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editing) {
        await updatePosition(editing.id, values);
        message.success("Update thành công 🚀");
      } else {
        await createPosition(values);
        message.success("Tạo mới thành công 🎉");
      }

      setOpen(false);
      fetchData();
    } catch (err) {
      message.error("Có lỗi xảy ra");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    await deletePosition(id);
    message.success("Đã xóa");
    fetchData();
  };

  /* ================= TABLE ================= */
  const columns = [
    { title: "ID", dataIndex: "id" },
    { title: "Name", dataIndex: "name" },
    { title: "Code", dataIndex: "code" },
    {
      title: "Action",
      render: (_, record) => (
        <Space>
          <Button onClick={() => openEdit(record)}>Edit</Button>

          <Popconfirm
            title="Xóa cái này thật à?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>💼 Positions Management</h2>

      <Button type="primary" onClick={openCreate} style={{ marginBottom: 16 }}>
        ➕ Thêm Position
      </Button>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
      />

      {/* ================= MODAL ================= */}
      <Modal
        title={editing ? "Update Position" : "Create Position"}
        open={open}
        onOk={handleSubmit}
        onCancel={() => setOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="Code" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Positions;