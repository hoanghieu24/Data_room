import { useEffect, useState, useMemo, useCallback } from "react";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../../services/employeeService";
import { getPositions } from "../../services/positionService";
import { getUsers } from "../../services/userService";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
  Switch,
  FormControlLabel,
  Grid,
  Divider,
  Avatar,
  Tab,
  Tabs,
  Paper,
  Stack,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  AttachMoney as MoneyIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  Description as ContractIcon,
  LocalHospital as EmergencyIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
} from "@mui/icons-material";
import { format } from "date-fns";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [positions, setPositions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [viewEmployeeDetails, setViewEmployeeDetails] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    // Thông tin cơ bản
    employee_code: "",
    full_name: "",
    email: "",
    phone: "",
    
    // Thông tin công việc
    position_id: "",
    job_title: "",
    department_id: "",
    manager_id: "",
    work_location: "",
    
    // Hợp đồng & lương
    contract_type: "",
    contract_number: "",
    contract_start_date: "",
    contract_end_date: "",
    salary_grade: "",
    basic_salary: "",
    allowance: "{}",
    bank_account: "",
    bank_name: "",
    
    // Thời gian làm việc
    working_hours: '{"start": "08:00", "end": "17:00"}',
    probation_period: "",
    probation_end_date: "",
    official_start_date: "",
    last_promotion_date: "",
    next_review_date: "",
    
    // Trạng thái
    employment_status: "Đang làm việc",
    is_active: true,
    exit_date: "",
    exit_reason: "",
    
    // Liên hệ khẩn cấp
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relation: "",
    
    // Ghi chú
    hr_notes: "",
    performance_notes: "",
  });
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPosition, setFilterPosition] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");

  const showSnackbar = useCallback((message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [emps, pos, depts, usrs] = await Promise.all([
        getEmployees(),
        getPositions(),
      
        getUsers(),
      ]);
      setEmployees(Array.isArray(emps) ? emps : []);
      setPositions(Array.isArray(pos) ? pos : []);
      setDepartments(Array.isArray(depts) ? depts : []);
      setUsers(Array.isArray(usrs) ? usrs : []);
      setError("");
    } catch (err) {
      setError(err.message || "Không thể tải dữ liệu");
      showSnackbar(err.message || "Lỗi khi tải dữ liệu", "error");
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenDialog = useCallback((employee = null) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        employee_code: employee.employee_code || "",
        full_name: employee.full_name || "",
        email: employee.email || "",
        phone: employee.phone || "",
        position_id: employee.position_id || "",
        job_title: employee.job_title || "",
        department_id: employee.department_id || "",
        manager_id: employee.manager_id || "",
        work_location: employee.work_location || "",
        contract_type: employee.contract_type || "",
        contract_number: employee.contract_number || "",
        contract_start_date: employee.contract_start_date || "",
        contract_end_date: employee.contract_end_date || "",
        salary_grade: employee.salary_grade || "",
        basic_salary: employee.basic_salary || "",
        allowance: employee.allowance || "{}",
        bank_account: employee.bank_account || "",
        bank_name: employee.bank_name || "",
        working_hours: employee.working_hours || '{"start": "08:00", "end": "17:00"}',
        probation_period: employee.probation_period || "",
        probation_end_date: employee.probation_end_date || "",
        official_start_date: employee.official_start_date || "",
        last_promotion_date: employee.last_promotion_date || "",
        next_review_date: employee.next_review_date || "",
        employment_status: employee.employment_status || "Đang làm việc",
        is_active: employee.is_active ?? true,
        exit_date: employee.exit_date || "",
        exit_reason: employee.exit_reason || "",
        emergency_contact_name: employee.emergency_contact_name || "",
        emergency_contact_phone: employee.emergency_contact_phone || "",
        emergency_contact_relation: employee.emergency_contact_relation || "",
        hr_notes: employee.hr_notes || "",
        performance_notes: employee.performance_notes || "",
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        employee_code: "",
        full_name: "",
        email: "",
        phone: "",
        position_id: "",
        job_title: "",
        department_id: "",
        manager_id: "",
        work_location: "",
        contract_type: "",
        contract_number: "",
        contract_start_date: "",
        contract_end_date: "",
        salary_grade: "",
        basic_salary: "",
        allowance: "{}",
        bank_account: "",
        bank_name: "",
        working_hours: '{"start": "08:00", "end": "17:00"}',
        probation_period: "",
        probation_end_date: "",
        official_start_date: "",
        last_promotion_date: "",
        next_review_date: "",
        employment_status: "Đang làm việc",
        is_active: true,
        exit_date: "",
        exit_reason: "",
        emergency_contact_name: "",
        emergency_contact_phone: "",
        emergency_contact_relation: "",
        hr_notes: "",
        performance_notes: "",
      });
    }
    setOpenDialog(true);
  }, []);

  const generateEmployeeCode = useCallback(() => {
    const prefix =
      employees.find((emp) => emp.employee_code)?.employee_code?.match(/^[^\d]+/)?.[0] ||
      "NV";
    const numbers = employees
      .map((emp) => emp.employee_code)
      .filter(Boolean)
      .map((code) => {
        const match = code.match(/(\d+)$/);
        return match ? Number(match[1]) : NaN;
      })
      .filter((num) => !Number.isNaN(num));
    const nextNumber = numbers.length ? Math.max(...numbers) + 1 : 1;
    return `${prefix}${String(nextNumber).padStart(3, "0")}`;
  }, [employees]);

  const handleOpenViewDialog = useCallback((employee) => {
    setViewEmployeeDetails(employee);
    setOpenViewDialog(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setEditingEmployee(null);
    setActiveTab(0);
  }, []);

  const handleCloseViewDialog = useCallback(() => {
    setOpenViewDialog(false);
    setViewEmployeeDetails(null);
    setActiveTab(0);
  }, []);

  const handleOpenDeleteDialog = useCallback((employee) => {
    setSelectedEmployee(employee);
    setOpenDeleteDialog(true);
  }, []);

  const getEmployeeIdentifier = useCallback((employee) => {
    return employee?.id ?? employee?.employee_id ?? "";
  }, []);

  const handleCloseDeleteDialog = useCallback(() => {
    setOpenDeleteDialog(false);
    setSelectedEmployee(null);
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  const handleWorkingHoursChange = useCallback((field, value) => {
    setFormData((prev) => {
      let workingHours = { start: "08:00", end: "17:00" };
      try {
        workingHours = JSON.parse(prev.working_hours || JSON.stringify(workingHours));
      } catch {
        workingHours = { start: "08:00", end: "17:00" };
      }
      return {
        ...prev,
        working_hours: JSON.stringify({ ...workingHours, [field]: value }),
      };
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      const payload = {
        ...formData,
        employee_code: editingEmployee
          ? formData.employee_code || editingEmployee.employee_code
          : formData.employee_code || generateEmployeeCode(),
      };

      delete payload.employee_id;

      if (editingEmployee) {
        const id = getEmployeeIdentifier(editingEmployee);
        await updateEmployee(id, payload);
        showSnackbar("Cập nhật nhân viên thành công", "success");
      } else {
        await createEmployee(payload);
        showSnackbar("Thêm nhân viên mới thành công", "success");
      }
      fetchData();
      handleCloseDialog();
    } catch (err) {
      showSnackbar(err.message || "Có lỗi xảy ra", "error");
    }
  }, [formData, editingEmployee, showSnackbar, fetchData, handleCloseDialog, getEmployeeIdentifier]);

  const handleDelete = useCallback(async () => {
    if (!selectedEmployee) return;

    try {
      const id = getEmployeeIdentifier(selectedEmployee);
      await deleteEmployee(id);
      showSnackbar("Xóa nhân viên thành công", "success");
      fetchData();
      handleCloseDeleteDialog();
    } catch (err) {
      showSnackbar(err.message || "Có lỗi xảy ra khi xóa", "error");
    }
  }, [selectedEmployee, showSnackbar, fetchData, handleCloseDeleteDialog, getEmployeeIdentifier]);

  const handleStatusToggle = useCallback(async (employee) => {
    try {
      const id = getEmployeeIdentifier(employee);
      await updateEmployee(id, {
        ...employee,
        is_active: !employee.is_active,
      });
      showSnackbar(
        `Nhân viên đã được ${!employee.is_active ? "kích hoạt" : "vô hiệu hóa"}`,
        "success"
      );
      fetchData();
    } catch (err) {
      showSnackbar(err.message || "Có lỗi xảy ra", "error");
    }
  }, [showSnackbar, fetchData, getEmployeeIdentifier]);

  // Lọc dữ liệu
  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesSearch =
        employee.employee_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.phone?.includes(searchTerm);

      const matchesPosition =
        filterPosition === "all" || employee.position_id === parseInt(filterPosition);
      
      const matchesDepartment =
        filterDepartment === "all" || employee.department_id === parseInt(filterDepartment);
      
      let matchesStatus = true;
      if (filterStatus === "active") matchesStatus = employee.is_active === true;
      if (filterStatus === "inactive") matchesStatus = employee.is_active === false;

      return matchesSearch && matchesPosition && matchesDepartment && matchesStatus;
    });
  }, [employees, searchTerm, filterPosition, filterDepartment, filterStatus]);

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case "Đang làm việc":
        return "success";
      case "Nghỉ việc":
        return "error";
      case "Nghỉ phép":
        return "warning";
      default:
        return "default";
    }
  }, []);

  const getContractTypeColor = useCallback((type) => {
    switch (type) {
      case "Full-time":
        return "primary";
      case "Part-time":
        return "secondary";
      case "Intern":
        return "info";
      default:
        return "default";
    }
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setFilterPosition("all");
    setFilterDepartment("all");
    setFilterStatus("all");
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            <WorkIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            Quản lý Nhân viên
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tổng số: {filteredEmployees.length} nhân viên
          </Typography>
        </Box>
        <Box>
          <Tooltip title="Tải lại">
            <IconButton onClick={fetchData} sx={{ mr: 1 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Thêm Nhân viên
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Tìm kiếm..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Vị trí</InputLabel>
                <Select
                  value={filterPosition}
                  label="Vị trí"
                  onChange={(e) => setFilterPosition(e.target.value)}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  {positions.map((pos) => (
                    <MenuItem key={pos.id} value={pos.id}>
                      {pos.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Phòng ban</InputLabel>
                <Select
                  value={filterDepartment}
                  label="Phòng ban"
                  onChange={(e) => setFilterDepartment(e.target.value)}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={filterStatus}
                  label="Trạng thái"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="active">Đang hoạt động</MenuItem>
                  <MenuItem value="inactive">Ngừng hoạt động</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button fullWidth variant="outlined" onClick={handleClearFilters}>
                Xóa bộ lọc
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Employees Table */}
      <Card>
        <CardContent>
          <Box overflow="auto">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f5f5f5", borderBottom: "2px solid #e0e0e0" }}>
                  <th style={{ padding: "12px", textAlign: "left" }}>Mã NV</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Họ tên</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Email</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>SĐT</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Vị trí</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Phòng ban</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Loại HĐ</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Trạng thái</th>
                  <th style={{ padding: "12px", textAlign: "center" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: "60px", textAlign: "center" }}>
                      <Typography color="text.secondary">
                        Không tìm thấy nhân viên nào
                      </Typography>
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => (
                    <tr
                      key={emp.id}
                      style={{
                        borderBottom: "1px solid #e0e0e0",
                        opacity: emp.is_active ? 1 : 0.6,
                      }}
                    >
                      <td style={{ padding: "12px" }}>
                        <Chip
                          label={emp.employee_code}
                          size="small"
                          variant="outlined"
                        />
                      </td>
                      <td style={{ padding: "12px" }}>
                        <Typography fontWeight="medium">{emp.full_name}</Typography>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <Typography variant="body2">{emp.email}</Typography>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <Typography variant="body2">{emp.phone || "—"}</Typography>
                      </td>
                      <td style={{ padding: "12px" }}>
                        {positions.find((p) => p.id === emp.position_id)?.name || "—"}
                      </td>
                      <td style={{ padding: "12px" }}>
                        {departments.find((d) => d.id === emp.department_id)?.name || "—"}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <Chip
                          label={emp.contract_type || "—"}
                          size="small"
                          color={getContractTypeColor(emp.contract_type)}
                        />
                      </td>
                      <td style={{ padding: "12px" }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={emp.is_active}
                              onChange={() => handleStatusToggle(emp)}
                              color="success"
                              size="small"
                            />
                          }
                          label={
                            <Typography variant="body2">
                              {emp.is_active ? "Active" : "Inactive"}
                            </Typography>
                          }
                          sx={{ m: 0 }}
                        />
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <Tooltip title="Xem chi tiết">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => handleOpenViewDialog(emp)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Sửa">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenDialog(emp)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenDeleteDialog(emp)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Box>
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog
        open={openViewDialog}
        onClose={handleCloseViewDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: "primary.main", color: "white" }}>
          <Box display="flex" alignItems="center" gap={1}>
            <PersonIcon />
            <Typography variant="h6">Chi tiết nhân viên</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {viewEmployeeDetails && (
            <>
              <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
                <Tab label="Thông tin cơ bản" />
                <Tab label="Công việc & Lương" />
                <Tab label="Hợp đồng" />
                <Tab label="Thông tin khác" />
              </Tabs>

              {/* Tab 1: Thông tin cơ bản */}
              {activeTab === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} display="flex" justifyContent="center">
                    <Avatar
                      sx={{
                        width: 100,
                        height: 100,
                        bgcolor: "primary.main",
                        fontSize: 40,
                      }}
                    >
                      {viewEmployeeDetails.full_name?.charAt(0).toUpperCase()}
                    </Avatar>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom color="primary">
                      Thông tin cá nhân
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Mã nhân viên
                        </Typography>
                        <Typography variant="body1">
                          <Chip label={viewEmployeeDetails.employee_code} size="small" />
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Họ tên
                        </Typography>
                        <Typography variant="body1">{viewEmployeeDetails.full_name}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Email
                        </Typography>
                        <Typography variant="body1">{viewEmployeeDetails.email}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Số điện thoại
                        </Typography>
                        <Typography variant="body1">{viewEmployeeDetails.phone || "—"}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Địa điểm làm việc
                        </Typography>
                        <Typography variant="body1">{viewEmployeeDetails.work_location || "—"}</Typography>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom color="primary">
                      Liên hệ khẩn cấp
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Tên
                        </Typography>
                        <Typography variant="body1">{viewEmployeeDetails.emergency_contact_name || "—"}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Số điện thoại
                        </Typography>
                        <Typography variant="body1">{viewEmployeeDetails.emergency_contact_phone || "—"}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Quan hệ
                        </Typography>
                        <Typography variant="body1">{viewEmployeeDetails.emergency_contact_relation || "—"}</Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              )}

              {/* Tab 2: Công việc & Lương */}
              {activeTab === 1 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom color="primary">
                      Thông tin công việc
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Vị trí
                        </Typography>
                        <Typography variant="body1">
                          {positions.find(p => p.id === viewEmployeeDetails.position_id)?.name || "—"}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Chức danh cụ thể
                        </Typography>
                        <Typography variant="body1">{viewEmployeeDetails.job_title || "—"}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Phòng ban
                        </Typography>
                        <Typography variant="body1">
                          {departments.find(d => d.id === viewEmployeeDetails.department_id)?.name || "—"}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Quản lý trực tiếp
                        </Typography>
                        <Typography variant="body1">
                          {users.find(u => u.id === viewEmployeeDetails.manager_id)?.full_name || "—"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom color="primary">
                      Thông tin lương
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Bậc lương
                        </Typography>
                        <Typography variant="body1">{viewEmployeeDetails.salary_grade || "—"}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Lương cơ bản
                        </Typography>
                        <Typography variant="body1">
                          {viewEmployeeDetails.basic_salary
                            ? new Intl.NumberFormat("vi-VN").format(viewEmployeeDetails.basic_salary) + " VNĐ"
                            : "—"}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Phụ cấp
                        </Typography>
                        <Typography variant="body1">
                          {viewEmployeeDetails.allowance ? "Có" : "Không"}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Ngân hàng
                        </Typography>
                        <Typography variant="body1">{viewEmployeeDetails.bank_name || "—"}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Số tài khoản
                        </Typography>
                        <Typography variant="body1">{viewEmployeeDetails.bank_account || "—"}</Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              )}

              {/* Tab 3: Hợp đồng */}
              {activeTab === 2 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom color="primary">
                      Thông tin hợp đồng
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Loại hợp đồng
                        </Typography>
                        <Chip
                          label={viewEmployeeDetails.contract_type || "—"}
                          color={getContractTypeColor(viewEmployeeDetails.contract_type)}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Số hợp đồng
                        </Typography>
                        <Typography variant="body1">{viewEmployeeDetails.contract_number || "—"}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Ngày bắt đầu
                        </Typography>
                        <Typography variant="body1">
                          {viewEmployeeDetails.contract_start_date
                            ? format(new Date(viewEmployeeDetails.contract_start_date), "dd/MM/yyyy")
                            : "—"}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Ngày kết thúc
                        </Typography>
                        <Typography variant="body1">
                          {viewEmployeeDetails.contract_end_date
                            ? format(new Date(viewEmployeeDetails.contract_end_date), "dd/MM/yyyy")
                            : "—"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom color="primary">
                      Thời gian làm việc
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Giờ làm việc
                        </Typography>
                        <Typography variant="body1">
                          {viewEmployeeDetails.working_hours
                            ? JSON.parse(viewEmployeeDetails.working_hours)?.start + " - " +
                              JSON.parse(viewEmployeeDetails.working_hours)?.end
                            : "—"}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Thời gian thử việc
                        </Typography>
                        <Typography variant="body1">
                          {viewEmployeeDetails.probation_period
                            ? viewEmployeeDetails.probation_period + " ngày"
                            : "—"}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Ngày kết thúc thử việc
                        </Typography>
                        <Typography variant="body1">
                          {viewEmployeeDetails.probation_end_date
                            ? format(new Date(viewEmployeeDetails.probation_end_date), "dd/MM/yyyy")
                            : "—"}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Ngày vào chính thức
                        </Typography>
                        <Typography variant="body1">
                          {viewEmployeeDetails.official_start_date
                            ? format(new Date(viewEmployeeDetails.official_start_date), "dd/MM/yyyy")
                            : "—"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              )}

              {/* Tab 4: Thông tin khác */}
              {activeTab === 3 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom color="primary">
                      Trạng thái làm việc
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Trạng thái
                        </Typography>
                        <Chip
                          label={viewEmployeeDetails.employment_status || "Đang làm việc"}
                          color={getStatusColor(viewEmployeeDetails.employment_status)}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Ngày nghỉ việc
                        </Typography>
                        <Typography variant="body1">
                          {viewEmployeeDetails.exit_date
                            ? format(new Date(viewEmployeeDetails.exit_date), "dd/MM/yyyy")
                            : "—"}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Lý do nghỉ việc
                        </Typography>
                        <Typography variant="body1">{viewEmployeeDetails.exit_reason || "—"}</Typography>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom color="primary">
                      Ghi chú & Đánh giá
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Ghi chú HR
                        </Typography>
                        <Paper sx={{ p: 2, bgcolor: "#f9f9f9" }}>
                          <Typography variant="body2">{viewEmployeeDetails.hr_notes || "Không có ghi chú"}</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Ghi chú đánh giá hiệu suất
                        </Typography>
                        <Paper sx={{ p: 2, bgcolor: "#f9f9f9" }}>
                          <Typography variant="body2">{viewEmployeeDetails.performance_notes || "Không có ghi chú"}</Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom color="primary">
                      Thông tin hệ thống
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Ngày tạo
                        </Typography>
                        <Typography variant="body1">
                          {viewEmployeeDetails.created_at
                            ? format(new Date(viewEmployeeDetails.created_at), "dd/MM/yyyy HH:mm")
                            : "—"}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Cập nhật lần cuối
                        </Typography>
                        <Typography variant="body1">
                          {viewEmployeeDetails.updated_at
                            ? format(new Date(viewEmployeeDetails.updated_at), "dd/MM/yyyy HH:mm")
                            : "—"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              )}

              {/* Actions */}
              <Box display="flex" gap={2} justifyContent="flex-end" mt={3}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    handleCloseViewDialog();
                    handleOpenDialog(viewEmployeeDetails);
                  }}
                  startIcon={<EditIcon />}
                >
                  Chỉnh sửa
                </Button>
                <Button variant="contained" onClick={handleCloseViewDialog}>
                  Đóng
                </Button>
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingEmployee ? "Chỉnh sửa Nhân viên" : "Thêm Nhân viên mới"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 2 }}>
              <Tab label="Thông tin cơ bản" />
              <Tab label="Công việc & Lương" />
              <Tab label="Hợp đồng" />
              <Tab label="Thông tin khác" />
            </Tabs>

            {activeTab === 0 && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Mã nhân viên"
                    value={
                      editingEmployee?.employee_code ||
                      "Tự động tạo khi lưu"
                    }
                    fullWidth
                    size="small"
                    disabled
                    helperText={
                      editingEmployee
                        ? "Mã NV hiện tại"
                        : "Mã NV sẽ được tạo tự động"
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Họ và tên"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Số điện thoại"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Địa điểm làm việc"
                    name="work_location"
                    value={formData.work_location}
                    onChange={handleInputChange}
                    fullWidth
                    size="small"
                  />
                </Grid>
              </Grid>
            )}

            {activeTab === 1 && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Vị trí</InputLabel>
                    <Select
                      name="position_id"
                      value={formData.position_id}
                      label="Vị trí"
                      onChange={handleInputChange}
                    >
                      <MenuItem value="">Chọn vị trí</MenuItem>
                      {positions.map((pos) => (
                        <MenuItem key={pos.id} value={pos.id}>
                          {pos.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Phòng ban</InputLabel>
                    <Select
                      name="department_id"
                      value={formData.department_id}
                      label="Phòng ban"
                      onChange={handleInputChange}
                    >
                      <MenuItem value="">Chọn phòng ban</MenuItem>
                      {departments.map((dept) => (
                        <MenuItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Quản lý</InputLabel>
                    <Select
                      name="manager_id"
                      value={formData.manager_id}
                      label="Quản lý"
                      onChange={handleInputChange}
                    >
                      <MenuItem value="">Chọn quản lý</MenuItem>
                      {users.map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.full_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Chức danh"
                    name="job_title"
                    value={formData.job_title}
                    onChange={handleInputChange}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Bậc lương"
                    name="salary_grade"
                    value={formData.salary_grade}
                    onChange={handleInputChange}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Lương cơ bản"
                    name="basic_salary"
                    type="number"
                    value={formData.basic_salary}
                    onChange={handleInputChange}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Phụ cấp"
                    name="allowance"
                    value={formData.allowance}
                    onChange={handleInputChange}
                    fullWidth
                    size="small"
                    helperText="Nhập JSON hoặc mô tả phụ cấp"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Ngân hàng"
                    name="bank_name"
                    value={formData.bank_name}
                    onChange={handleInputChange}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Số tài khoản"
                    name="bank_account"
                    value={formData.bank_account}
                    onChange={handleInputChange}
                    fullWidth
                    size="small"
                  />
                </Grid>
              </Grid>
            )}

            {activeTab === 2 && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Loại hợp đồng</InputLabel>
                    <Select
                      name="contract_type"
                      value={formData.contract_type}
                      label="Loại hợp đồng"
                      onChange={handleInputChange}
                    >
                      <MenuItem value="">Chọn loại</MenuItem>
                      <MenuItem value="Full-time">Full-time</MenuItem>
                      <MenuItem value="Part-time">Part-time</MenuItem>
                      <MenuItem value="Intern">Intern</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Số hợp đồng"
                    name="contract_number"
                    value={formData.contract_number}
                    onChange={handleInputChange}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Ngày bắt đầu"
                    name="contract_start_date"
                    type="date"
                    value={formData.contract_start_date}
                    onChange={handleInputChange}
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Ngày kết thúc"
                    name="contract_end_date"
                    type="date"
                    value={formData.contract_end_date}
                    onChange={handleInputChange}
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Giờ bắt đầu"
                    name="working_hours_start"
                    type="time"
                    value={(() => {
                      try {
                        return JSON.parse(formData.working_hours).start || "";
                      } catch {
                        return "";
                      }
                    })()}
                    onChange={(e) => handleWorkingHoursChange("start", e.target.value)}
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Giờ kết thúc"
                    name="working_hours_end"
                    type="time"
                    value={(() => {
                      try {
                        return JSON.parse(formData.working_hours).end || "";
                      } catch {
                        return "";
                      }
                    })()}
                    onChange={(e) => handleWorkingHoursChange("end", e.target.value)}
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Thời gian thử việc (ngày)"
                    name="probation_period"
                    type="number"
                    value={formData.probation_period}
                    onChange={handleInputChange}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Ngày kết thúc thử việc"
                    name="probation_end_date"
                    type="date"
                    value={formData.probation_end_date}
                    onChange={handleInputChange}
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Ngày vào chính thức"
                    name="official_start_date"
                    type="date"
                    value={formData.official_start_date}
                    onChange={handleInputChange}
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Ngày thăng chức gần nhất"
                    name="last_promotion_date"
                    type="date"
                    value={formData.last_promotion_date}
                    onChange={handleInputChange}
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Ngày đánh giá kế tiếp"
                    name="next_review_date"
                    type="date"
                    value={formData.next_review_date}
                    onChange={handleInputChange}
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            )}

            {activeTab === 3 && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Trạng thái</InputLabel>
                    <Select
                      name="employment_status"
                      value={formData.employment_status}
                      label="Trạng thái"
                      onChange={handleInputChange}
                    >
                      <MenuItem value="Đang làm việc">Đang làm việc</MenuItem>
                      <MenuItem value="Nghỉ việc">Nghỉ việc</MenuItem>
                      <MenuItem value="Nghỉ phép">Nghỉ phép</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_active}
                        onChange={handleInputChange}
                        name="is_active"
                        color="success"
                      />
                    }
                    label={formData.is_active ? "Kích hoạt" : "Ngừng kích hoạt"}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Ngày nghỉ việc"
                    name="exit_date"
                    type="date"
                    value={formData.exit_date}
                    onChange={handleInputChange}
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Lý do nghỉ việc"
                    name="exit_reason"
                    value={formData.exit_reason}
                    onChange={handleInputChange}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Liên hệ khẩn cấp"
                    name="emergency_contact_name"
                    value={formData.emergency_contact_name}
                    onChange={handleInputChange}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="SĐT khẩn cấp"
                    name="emergency_contact_phone"
                    value={formData.emergency_contact_phone}
                    onChange={handleInputChange}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Mối quan hệ"
                    name="emergency_contact_relation"
                    value={formData.emergency_contact_relation}
                    onChange={handleInputChange}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Ghi chú HR"
                    name="hr_notes"
                    value={formData.hr_notes}
                    onChange={handleInputChange}
                    fullWidth
                    size="small"
                    multiline
                    rows={3}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Ghi chú đánh giá"
                    name="performance_notes"
                    value={formData.performance_notes}
                    onChange={handleInputChange}
                    fullWidth
                    size="small"
                    multiline
                    rows={3}
                  />
                </Grid>
              </Grid>
            )}

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Vui lòng điền đầy đủ thông tin nhân viên. Các trường có dấu * là bắt buộc.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingEmployee ? "Cập nhật" : "Tạo mới"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa nhân viên{" "}
            <strong>{selectedEmployee?.full_name}</strong>?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Hành động này không thể hoàn tác.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Hủy</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Employees;