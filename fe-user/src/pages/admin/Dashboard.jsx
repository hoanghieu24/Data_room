import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  LinearProgress,
  Alert,
  Snackbar,
  Tooltip,
  Zoom,
  Fade,
  Grow,
  Slide,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Badge,
  Divider,
  Stack,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
  People as PeopleIcon,
  Description as ContractIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  GetApp as DownloadIcon,
  Visibility as ViewIcon,
  History as HistoryIcon,
  Close as CloseIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  MoreVert as MoreVertIcon,
  Print as PrintIcon,
  FileCopy as FileCopyIcon,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getAllPayments } from "../../services/paymentService";
import { getAllContracts } from "../../services/contractService";
import { getCustomers } from "../../services/customerService";
import { getDocumentStatistics } from "../../services/documentService";

export default function Dashboard() {
  // State management
  const [stats, setStats] = useState({
    totalRevenue: 0,
    paidAmount: 0,
    pendingAmount: 0,
    totalContracts: 0,
    totalCustomers: 0,
    overdueCount: 0,
    collectionRate: 0,
  });
  const [recentPayments, setRecentPayments] = useState([]);
  const [recentContracts, setRecentContracts] = useState([]);
  const [paymentTrend, setPaymentTrend] = useState([]);
  const [contractStatus, setContractStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Dialog states
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [openContractDialog, setOpenContractDialog] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  // Helper functions
  const formatCurrency = useCallback((amount) => {
    if (!amount && amount !== 0) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  }, []);

  const formatDateTime = useCallback((dateString) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "—";
    }
  }, []);

  const showSnackbar = useCallback((message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  }, []);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      
      const [paymentsRes, contractsRes, customersRes, docStats] = await Promise.all([
        getAllPayments(),
        getAllContracts(),
        getCustomers(),
        getDocumentStatistics(),
      ]);

      // Parse payments data
      const payments = Array.isArray(paymentsRes) ? paymentsRes : paymentsRes?.data || [];
      const contracts = Array.isArray(contractsRes) ? contractsRes : contractsRes?.data || [];
      const customers = Array.isArray(customersRes) ? customersRes : customersRes?.data || [];

      // Calculate statistics
      const totalRevenue = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
      const paidAmount = payments.reduce((sum, p) => sum + (parseFloat(p.paid_amount) || 0), 0);
      const pendingAmount = totalRevenue - paidAmount;
      const overdueCount = payments.filter(p => p.status === "overdue" || p.status === "expired").length;
      const collectionRate = totalRevenue > 0 ? (paidAmount / totalRevenue) * 100 : 0;

      setStats({
        totalRevenue,
        paidAmount,
        pendingAmount,
        totalContracts: contracts.length,
        totalCustomers: customers.length,
        overdueCount,
        collectionRate,
      });

      // Get recent payments (last 5)
      const sortedPayments = [...payments].sort(
        (a, b) => new Date(b.created_at || b.payment_date || 0) - new Date(a.created_at || a.payment_date || 0)
      );
      setRecentPayments(sortedPayments.slice(0, 5));

      // Get recent contracts (last 5)
      const sortedContracts = [...contracts].sort(
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
      );
      setRecentContracts(sortedContracts.slice(0, 5));

      // Calculate payment trend (last 6 months)
      const monthlyData = {};
      payments.forEach(payment => {
        const date = new Date(payment.payment_date || payment.created_at);
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = { month: monthYear, amount: 0, paid: 0 };
        }
        monthlyData[monthYear].amount += parseFloat(payment.amount) || 0;
        monthlyData[monthYear].paid += parseFloat(payment.paid_amount) || 0;
      });
      
      const trendData = Object.values(monthlyData).slice(-6);
      setPaymentTrend(trendData);

      // Calculate contract status distribution
      const statusCount = {
        active: contracts.filter(c => c.status === "active" || c.is_active === true).length,
        pending: contracts.filter(c => c.status === "pending").length,
        completed: contracts.filter(c => c.status === "completed" || c.status === "done").length,
        cancelled: contracts.filter(c => c.status === "cancelled").length,
      };
      
      setContractStatus([
        { name: "Đang hoạt động", value: statusCount.active, color: "#4caf50" },
        { name: "Chờ xử lý", value: statusCount.pending, color: "#ff9800" },
        { name: "Hoàn thành", value: statusCount.completed, color: "#2196f3" },
        { name: "Đã hủy", value: statusCount.cancelled, color: "#f44336" },
      ]);

    } catch (err) {
      console.error("Lỗi tải dashboard:", err);
      setError(err.message || "Không thể tải dữ liệu dashboard");
      showSnackbar(err.message || "Lỗi khi tải dữ liệu", "error");
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle view payment detail
  const handleViewPayment = useCallback((payment) => {
    setSelectedPayment(payment);
    setOpenPaymentDialog(true);
  }, []);

  // Handle view contract detail
  const handleViewContract = useCallback((contract) => {
    setSelectedContract(contract);
    setOpenContractDialog(true);
  }, []);

  // Get status color
  const getPaymentStatusColor = useCallback((status) => {
    switch (status) {
      case "paid":
      case "done":
        return "success";
      case "pending":
        return "warning";
      case "overdue":
      case "expired":
        return "error";
      case "partial":
        return "info";
      default:
        return "default";
    }
  }, []);

  const getPaymentStatusLabel = useCallback((status) => {
    switch (status) {
      case "paid":
      case "done":
        return "✅ Đã thanh toán";
      case "pending":
        return "⏳ Chờ thanh toán";
      case "overdue":
        return "⚠️ Quá hạn";
      case "expired":
        return "❌ Hết hạn";
      case "partial":
        return "🔄 Thanh toán một phần";
      default:
        return status;
    }
  }, []);

  const getContractStatusColor = useCallback((status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "success";
      case "pending":
        return "warning";
      case "completed":
      case "done":
        return "info";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            <DashboardIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            Tổng quan Admin
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Chào mừng bạn trở lại! Đây là bức tranh toàn cảnh hệ thống
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Tooltip title="Tải lại dữ liệu">
            <IconButton onClick={fetchDashboardData}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
          >
            In báo cáo
          </Button>
        </Box>
      </Box>

      {/* Error Message */}
      {error && (
        <Fade in={true}>
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        </Fade>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Zoom in={true} style={{ transitionDelay: "0ms" }}>
            <Card sx={{ bgcolor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
                    <MoneyIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight="bold">
                      {formatCurrency(stats.totalRevenue)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tổng doanh thu
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Zoom in={true} style={{ transitionDelay: "50ms" }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: "success.main", width: 56, height: 56 }}>
                    <CheckCircleIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" color="success.main">
                      {formatCurrency(stats.paidAmount)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Đã thu
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Zoom in={true} style={{ transitionDelay: "100ms" }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: "warning.main", width: 56, height: 56 }}>
                    <ScheduleIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" color="warning.main">
                      {formatCurrency(stats.pendingAmount)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Còn phải thu
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Zoom in={true} style={{ transitionDelay: "150ms" }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: "error.main", width: 56, height: 56 }}>
                    <WarningIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" color="error.main">
                      {stats.overdueCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Khoản quá hạn
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
      </Grid>

      {/* Second Row Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Fade in={true} timeout={500}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: "info.main" }}>
                    <ContractIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4">{stats.totalContracts}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Hợp đồng
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Fade>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Fade in={true} timeout={600}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: "secondary.main" }}>
                    <PeopleIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4">{stats.totalCustomers}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Khách hàng
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Fade>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Fade in={true} timeout={700}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: "success.main" }}>
                    <TrendingUpIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" color="success.main">
                      {stats.collectionRate.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tỷ lệ thu hồi
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Fade>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Fade in={true} timeout={800}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: "warning.main" }}>
                    <ReceiptIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4">{recentPayments.length}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Thanh toán gần đây
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Fade>
        </Grid>
      </Grid>

      {/* Progress Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📈 Tiến độ thu hồi vốn
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
            <Box sx={{ flex: 1 }}>
              <LinearProgress
                variant="determinate"
                value={stats.collectionRate}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
            <Typography variant="h6" fontWeight="bold" color="primary">
              {stats.collectionRate.toFixed(1)}%
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              Đã thu: {formatCurrency(stats.paidAmount)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Còn lại: {formatCurrency(stats.pendingAmount)}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📊 Xu hướng thanh toán (6 tháng gần nhất)
              </Typography>
              <Box sx={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={paymentTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      name="Tổng giá trị"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                    />
                    <Area
                      type="monotone"
                      dataKey="paid"
                      name="Đã thanh toán"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🥧 Phân bố trạng thái hợp đồng
              </Typography>
              <Box sx={{ height: 350, display: "flex", justifyContent: "center" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={contractStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {contractStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Payments & Contracts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  🕒 Thanh toán gần đây
                </Typography>
                <Chip label={`${recentPayments.length} khoản`} size="small" />
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "grey.50" }}>
                      <TableCell>Mã thanh toán</TableCell>
                      <TableCell>Hợp đồng</TableCell>
                      <TableCell align="right">Số tiền</TableCell>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell align="center">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentPayments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">
                            Chưa có thanh toán nào
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentPayments.map((payment, idx) => (
                        <Grow
                          in={true}
                          style={{ transitionDelay: `${idx * 50}ms` }}
                          key={payment.id}
                        >
                          <TableRow hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {payment.payment_code}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(payment.payment_date)}
                              </Typography>
                            </TableCell>
                            <TableCell>{payment.contract_number}</TableCell>
                            <TableCell align="right">
                              <Typography fontWeight="bold">
                                {formatCurrency(payment.amount)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Đã trả: {formatCurrency(payment.paid_amount)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={getPaymentStatusLabel(payment.status)}
                                color={getPaymentStatusColor(payment.status)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title="Xem chi tiết">
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewPayment(payment)}
                                >
                                  <ViewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        </Grow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  📄 Hợp đồng mới nhất
                </Typography>
                <Chip label={`${recentContracts.length} hợp đồng`} size="small" />
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "grey.50" }}>
                      <TableCell>Mã hợp đồng</TableCell>
                      <TableCell>Khách hàng</TableCell>
                      <TableCell align="right">Giá trị</TableCell>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell align="center">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentContracts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">
                            Chưa có hợp đồng nào
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentContracts.map((contract, idx) => (
                        <Grow
                          in={true}
                          style={{ transitionDelay: `${idx * 50}ms` }}
                          key={contract.id}
                        >
                          <TableRow hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {contract.contract_number}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(contract.start_date)} → {formatDate(contract.end_date)}
                              </Typography>
                            </TableCell>
                            <TableCell>{contract.customer_name}</TableCell>
                            <TableCell align="right">
                              <Typography fontWeight="bold">
                                {formatCurrency(contract.total_amount || contract.amount)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={contract.status === "active" ? "Đang hoạt động" : contract.status}
                                color={getContractStatusColor(contract.status)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title="Xem chi tiết">
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewContract(contract)}
                                >
                                  <ViewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        </Grow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            ⚡ Truy cập nhanh
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ContractIcon />}
                href="/admin/contracts"
                sx={{ py: 1.5 }}
              >
                Quản lý hợp đồng
              </Button>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ReceiptIcon />}
                href="/admin/payments"
                sx={{ py: 1.5 }}
              >
                Quản lý thanh toán
              </Button>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<PeopleIcon />}
                href="/admin/customers"
                sx={{ py: 1.5 }}
              >
                Quản lý khách hàng
              </Button>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FileCopyIcon />}
                href="/admin/documents"
                sx={{ py: 1.5 }}
              >
                Quản lý tài liệu
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Payment Detail Dialog */}
      <Dialog
        open={openPaymentDialog}
        onClose={() => setOpenPaymentDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Chi tiết thanh toán</Typography>
            <IconButton onClick={() => setOpenPaymentDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedPayment && (
            <Stack spacing={2}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Mã thanh toán:</Typography>
                <Typography variant="body2" fontWeight="bold">{selectedPayment.payment_code}</Typography>
              </Box>
              <Divider />
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Hợp đồng:</Typography>
                <Typography variant="body2">{selectedPayment.contract_number}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Khách hàng:</Typography>
                <Typography variant="body2">{selectedPayment.customer_name}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Ngày thanh toán:</Typography>
                <Typography variant="body2">{formatDate(selectedPayment.payment_date)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Số tiền:</Typography>
                <Typography variant="body2" fontWeight="bold" color="primary">
                  {formatCurrency(selectedPayment.amount)}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Đã thanh toán:</Typography>
                <Typography variant="body2" color="success.main">
                  {formatCurrency(selectedPayment.paid_amount)}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Còn lại:</Typography>
                <Typography variant="body2" color="warning.main">
                  {formatCurrency((selectedPayment.amount || 0) - (selectedPayment.paid_amount || 0))}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Phương thức:</Typography>
                <Typography variant="body2">{selectedPayment.payment_method || "-"}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Trạng thái:</Typography>
                <Chip
                  label={getPaymentStatusLabel(selectedPayment.status)}
                  color={getPaymentStatusColor(selectedPayment.status)}
                  size="small"
                />
              </Box>
              {selectedPayment.notes && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>Ghi chú:</Typography>
                    <Typography variant="body2">{selectedPayment.notes}</Typography>
                  </Box>
                </>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPaymentDialog(false)} variant="contained">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Contract Detail Dialog */}
      <Dialog
        open={openContractDialog}
        onClose={() => setOpenContractDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Chi tiết hợp đồng</Typography>
            <IconButton onClick={() => setOpenContractDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedContract && (
            <Stack spacing={2}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Mã hợp đồng:</Typography>
                <Typography variant="body2" fontWeight="bold">{selectedContract.contract_number}</Typography>
              </Box>
              <Divider />
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Khách hàng:</Typography>
                <Typography variant="body2">{selectedContract.customer_name}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Ngày bắt đầu:</Typography>
                <Typography variant="body2">{formatDate(selectedContract.start_date)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Ngày kết thúc:</Typography>
                <Typography variant="body2">{formatDate(selectedContract.end_date)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Giá trị hợp đồng:</Typography>
                <Typography variant="body2" fontWeight="bold" color="primary">
                  {formatCurrency(selectedContract.total_amount || selectedContract.amount)}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Trạng thái:</Typography>
                <Chip
                  label={selectedContract.status === "active" ? "Đang hoạt động" : selectedContract.status}
                  color={getContractStatusColor(selectedContract.status)}
                  size="small"
                />
              </Box>
              {selectedContract.description && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>Mô tả:</Typography>
                    <Typography variant="body2">{selectedContract.description}</Typography>
                  </Box>
                </>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenContractDialog(false)} variant="contained">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        TransitionComponent={Slide}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}