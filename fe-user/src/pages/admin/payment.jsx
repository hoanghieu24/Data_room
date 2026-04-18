import { useEffect, useState } from "react";
import {
  getAllPayments,
  createPayment,
  updatePayment,
  deletePayment
} from "../../services/paymentService";
import { getAllContracts } from "../../services/contractService";

function PaymentManagement() {
  const [payments, setPayments] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    contract_id: "",
    payment_date: "",
    payment_method: "",
    amount: "",
    paid_amount: "",
    transaction_id: "",
    notes: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [paymentsRes, contractsRes] = await Promise.all([
      getAllPayments(),
      getAllContracts()
    ]);

    setPayments(Array.isArray(paymentsRes) ? paymentsRes : paymentsRes?.data || []);
    setContracts(Array.isArray(contractsRes) ? contractsRes : contractsRes?.data || []);
  };

  // 🔥 Tính số tiền còn lại của contract
  const getContractRemaining = (contractId) => {
    const contract = contracts.find(c => c.id === Number(contractId));
    if (!contract) return 0;

    const totalPaid = payments
      .filter(p => p.contract_id === Number(contractId))
      .reduce((sum, p) => sum + (Number(p.paid_amount) || 0), 0);

    const total = Number(contract.total_amount || contract.amount || 0);

    return total - totalPaid;
  };

  // 🔥 Submit
  const handleSubmit = async () => {
    if (!form.contract_id || !form.amount) {
      alert("Điền thiếu thông tin rồi bro 😏");
      return;
    }

    const paymentData = {
      contract_id: Number(form.contract_id),
      payment_date: form.payment_date,
      payment_method: form.payment_method,
      amount: Number(form.amount),
      paid_amount: Number(form.paid_amount) || 0,
      transaction_id: form.transaction_id,
      notes: form.notes
    };

    try {
      if (editingId) {
        await updatePayment(editingId, paymentData);
      } else {
        await createPayment(paymentData);
      }

      resetForm();
      loadData();
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra 😢");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      contract_id: "",
      payment_date: "",
      payment_method: "",
      amount: "",
      paid_amount: "",
      transaction_id: "",
      notes: ""
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xóa thanh toán này?")) {
      await deletePayment(id);
      loadData();
    }
  };

  // 🔥 format tiền
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND"
    }).format(amount || 0);
  };

  // 🔥 màu status
  const getStatusColor = (status) => {
    if (status === "paid") return "#28a745";
    if (status === "partial") return "#ffc107";
    if (status === "overdue") return "#dc3545";
    return "#6c757d";
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h2>💰 Quản lý Thanh toán</h2>

      {/* FORM */}
      <div style={{ background: "white", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
        <h3>{editingId ? "✏️ Sửa" : "➕ Thêm"} thanh toán</h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: "10px" }}>
          
          {/* CONTRACT */}
          <select
            value={form.contract_id}
            onChange={(e) => setForm({ ...form, contract_id: e.target.value })}
          >
            <option value="">Chọn hợp đồng</option>
            {contracts.map(c => (
              <option key={c.id} value={c.id}>
                {c.contract_number} - Còn: {formatCurrency(getContractRemaining(c.id))}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={form.payment_date}
            onChange={(e) => setForm({ ...form, payment_date: e.target.value })}
          />

          <select
            value={form.payment_method}
            onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
          >
            <option value="">Phương thức</option>
            <option value="Chuyển khoản">🏦 Chuyển khoản</option>
            <option value="Tiền mặt">💰 Tiền mặt</option>
          </select>

          <input
            type="number"
            placeholder="Số tiền"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />

          <input
            type="number"
            placeholder="Đã thanh toán"
            value={form.paid_amount}
            onChange={(e) => setForm({ ...form, paid_amount: e.target.value })}
          />

          <input
            type="text"
            placeholder="Mã giao dịch"
            value={form.transaction_id}
            onChange={(e) => setForm({ ...form, transaction_id: e.target.value })}
          />

          <textarea
            placeholder="Ghi chú"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows="2"
          />
        </div>

        <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
          <button onClick={handleSubmit} style={{ background: "#28a745", color: "white", padding: "8px 16px", border: "none", borderRadius: "4px" }}>
            {editingId ? "Cập nhật" : "Thêm mới"}
          </button>

          {editingId && (
            <button onClick={resetForm} style={{ background: "#6c757d", color: "white", padding: "8px 16px", border: "none", borderRadius: "4px" }}>
              Hủy
            </button>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", background: "white" }}>
          <thead style={{ background: "#f8f9fa" }}>
            <tr>
              <th>Mã</th>
              <th>Hợp đồng</th>
              <th>Ngày</th>
              <th>Số tiền</th>
              <th>Đã thanh toán</th>
              <th>Còn lại</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {payments.map(p => {
              const remaining = Number(p.amount || 0) - Number(p.paid_amount || 0);

              return (
                <tr key={p.id} style={{ borderBottom: "1px solid #ddd" }}>
                  <td>{p.payment_code}</td>
                  <td>{p.contract_number}</td>
                  <td>{p.payment_date?.split("T")[0]}</td>
                  <td>{formatCurrency(p.amount)}</td>
                  <td>{formatCurrency(p.paid_amount)}</td>

                  <td style={{ color: remaining > 0 ? "#dc3545" : "#28a745" }}>
                    {formatCurrency(remaining)}
                  </td>

                  <td>
                    <span style={{
                      background: getStatusColor(p.status),
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: "4px"
                    }}>
                      {p.status === "paid"
                        ? "Đã thanh toán"
                        : p.status === "partial"
                          ? "Thanh toán 1 phần"
                          : "Chờ thanh toán"}
                    </span>
                  </td>

                  <td>
                    <button
                      onClick={() => {
                        setEditingId(p.id);
                        setForm({
                          contract_id: p.contract_id || "",
                          payment_date: p.payment_date?.split("T")[0] || "",
                          payment_method: p.payment_method || "",
                          amount: p.amount || "",
                          paid_amount: p.paid_amount || "",
                          transaction_id: p.transaction_id || "",
                          notes: p.notes || ""
                        });
                      }}
                    >
                      ✏️
                    </button>

                    <button onClick={() => handleDelete(p.id)}>
                      🗑️
                    </button>
                  </td>
                </tr>
              );
            })}

            {payments.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "40px" }}>
                  Chưa có thanh toán nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PaymentManagement;