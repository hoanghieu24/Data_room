import { useEffect, useState, useMemo, useCallback } from "react";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
} from "../../services/userService";
import { getRoles, updateUserRole } from "../../services/roleService";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
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
  Card,
  CardContent,
  Divider,
  Avatar,
  Stack,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Security as SecurityIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  AdminPanelSettings as AdminIcon,
} from "@mui/icons-material";
import { format } from "date-fns";

function Users() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewUserDetails, setViewUserDetails] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    phone: "",
    code: "",
    department_id: "",
    is_active: true,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [usersData, rolesData] = await Promise.all([
        getUsers(),
        getRoles(),
      ]);
      setUsers(usersData);
      setRoles(rolesData);
      setError("");
    } catch (err) {
      setError(err.message || "Không thể tải dữ liệu");
      showSnackbar(err.message || "Lỗi khi tải dữ liệu", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showSnackbar = useCallback((message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  }, []);

  const handleOpenDialog = useCallback((user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username || "",
        email: user.email || "",
        password: "",
        confirmPassword: "",
        full_name: user.full_name || "",
        phone: user.phone || "",
        code: user.code || "",
        department_id: user.department_id || "",
        is_active: user.is_active ?? true,
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        full_name: "",
        phone: "",
        code: "",
        department_id: "",
        is_active: true,
      });
    }
    setOpenDialog(true);
  }, []);

  const handleOpenViewDialog = useCallback(async (user) => {
    try {
      // Nếu bạn có API lấy chi tiết user
      // const userDetails = await getUserById(user.id);
      // setViewUserDetails(userDetails);
      
      // Nếu không có API riêng, dùng dữ liệu từ state
      setViewUserDetails(user);
      setOpenViewDialog(true);
    } catch (err) {
      showSnackbar("Không thể tải thông tin chi tiết", "error");
    }
  }, [showSnackbar]);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setEditingUser(null);
  }, []);

  const handleCloseViewDialog = useCallback(() => {
    setOpenViewDialog(false);
    setViewUserDetails(null);
  }, []);

  const handleOpenDeleteDialog = useCallback((user) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  }, []);

  const handleCloseDeleteDialog = useCallback(() => {
    setOpenDeleteDialog(false);
    setSelectedUser(null);
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  const validateForm = useCallback(() => {
    if (!formData.username.trim()) {
      showSnackbar("Vui lòng nhập username", "error");
      return false;
    }
    if (!formData.email.trim()) {
      showSnackbar("Vui lòng nhập email", "error");
      return false;
    }
    if (!editingUser && !formData.password) {
      showSnackbar("Vui lòng nhập mật khẩu", "error");
      return false;
    }
    if (!editingUser && formData.password !== formData.confirmPassword) {
      showSnackbar("Mật khẩu xác nhận không khớp", "error");
      return false;
    }
    if (!formData.full_name.trim()) {
      showSnackbar("Vui lòng nhập họ tên", "error");
      return false;
    }
    if (!formData.code) {
      showSnackbar("Vui lòng chọn vai trò", "error");
      return false;
    }
    return true;
  }, [formData, editingUser, showSnackbar]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    try {
      const userData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        code: formData.code,
        department_id: formData.department_id || null,
        is_active: formData.is_active,
      };

      if (!editingUser) {
        userData.password = formData.password;
      }

      if (editingUser) {
        await updateUser(editingUser.id, userData);
        showSnackbar("Cập nhật user thành công", "success");
      } else {
        await createUser(userData);
        showSnackbar("Tạo user mới thành công", "success");
      }

      fetchData();
      handleCloseDialog();
    } catch (err) {
      showSnackbar(err.message || "Có lỗi xảy ra", "error");
    }
  }, [formData, editingUser, validateForm, showSnackbar, fetchData, handleCloseDialog]);

  const handleDelete = useCallback(async () => {
    if (!selectedUser) return;

    try {
      await deleteUser(selectedUser.id);
      showSnackbar("Xóa user thành công", "success");
      fetchData();
      handleCloseDeleteDialog();
    } catch (err) {
      showSnackbar(err.message || "Có lỗi xảy ra khi xóa", "error");
    }
  }, [selectedUser, showSnackbar, fetchData, handleCloseDeleteDialog]);
  const handleStatusToggle = useCallback(async (userId, currentStatus) => {
    try {
      await toggleUserStatus(userId, !currentStatus);
      showSnackbar(
        `User đã được ${!currentStatus ? "kích hoạt" : "vô hiệu hóa"}`,
        "success",
      );
      fetchData();
    } catch (err) {
      showSnackbar(err.message || "Có lỗi xảy ra", "error");
    }
  }, [showSnackbar, fetchData]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phone && user.phone.includes(searchTerm));

      const matchesRole = filterRole === "all" || user.code === filterRole;

      let matchesStatus = true;
      if (filterStatus === "active") matchesStatus = user.is_active === true;
      if (filterStatus === "inactive") matchesStatus = user.is_active === false;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, filterRole, filterStatus]);

  const getRoleColor = useCallback((roleCode) => {
    switch (roleCode) {
      case "ADMIN":
        return "error";
      case "STAFF":
        return "primary";
      case "CUSTOMER":
        return "success";
      default:
        return "default";
    }
  }, []);

  const getRoleName = useCallback((roleCode) => {
    const role = roles.find((r) => r.code === roleCode);
    return role ? role.name : roleCode;
  }, [roles]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setFilterRole("all");
    setFilterStatus("all");
  }, []);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            <PersonIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            Quản lý Người dùng
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tổng số: {filteredUsers.length} người dùng
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
            sx={{ borderRadius: 2 }}
          >
            Thêm User
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
                InputProps={{
                  endAdornment: searchTerm && (
                    <IconButton size="small" onClick={() => setSearchTerm("")}>
                      <CancelIcon fontSize="small" />
                    </IconButton>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Lọc theo Role</InputLabel>
                <Select
                  value={filterRole}
                  label="Lọc theo Role"
                  onChange={(e) => setFilterRole(e.target.value)}
                >
                  <MenuItem value="all">Tất cả Role</MenuItem>
                  {roles.map((role) => (
                    <MenuItem key={role.id} value={role.code}>
                      {role.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Lọc theo trạng thái</InputLabel>
                <Select
                  value={filterStatus}
                  label="Lọc theo trạng thái"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="active">Đang hoạt động</MenuItem>
                  <MenuItem value="inactive">Không hoạt động</MenuItem>
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

      {/* Users Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "primary.light" }}>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                ID
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                Username
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                <Box display="flex" alignItems="center">
                  <EmailIcon sx={{ mr: 1, fontSize: 16 }} />
                  Email
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                Họ tên
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                <Box display="flex" alignItems="center">
                  <PhoneIcon sx={{ mr: 1, fontSize: 16 }} />
                  SĐT
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                <Box display="flex" alignItems="center">
                  <SecurityIcon sx={{ mr: 1, fontSize: 16 }} />
                  Role
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                Trạng thái
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">
                    Không tìm thấy user nào
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  hover
                  sx={{
                    "&:hover": { backgroundColor: "action.hover" },
                    opacity: user.is_active ? 1 : 0.7,
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      #{user.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight="medium">{user.username}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography>{user.full_name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{user.phone || "—"}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.code}
                      size="small"
                      color={getRoleColor(user.code)}
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <FormControlLabel
                        control={
                          <Switch
                            checked={user.is_active}
                            onChange={() =>
                              handleStatusToggle(user.id, user.is_active)
                            }
                            color="success"
                            size="small"
                          />
                        }
                        label={
                          <Typography variant="body2">
                            {user.is_active ? "Active" : "Inactive"}
                          </Typography>
                        }
                        sx={{ m: 0 }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="Xem chi tiết">
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => handleOpenViewDialog(user)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sửa">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDialog(user)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleOpenDeleteDialog(user)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* View Details Dialog */}
      <Dialog
        open={openViewDialog}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: "primary.main", color: "white" }}>
          <Box display="flex" alignItems="center" gap={1}>
            <PersonIcon />
            <Typography variant="h6">Chi tiết người dùng</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {viewUserDetails && (
            <Grid container spacing={3}>
              {/* Avatar Section */}
              <Grid item xs={12} display="flex" justifyContent="center">
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: getRoleColor(viewUserDetails.code),
                    fontSize: 48,
                  }}
                >
                  {viewUserDetails.full_name?.charAt(0).toUpperCase()}
                </Avatar>
              </Grid>

              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary">
                  Thông tin cơ bản
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      ID
                    </Typography>
                    <Typography variant="body1">#{viewUserDetails.id}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Username
                    </Typography>
                    <Typography variant="body1">
                      {viewUserDetails.username}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Họ tên
                    </Typography>
                    <Typography variant="body1">
                      {viewUserDetails.full_name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">
                      {viewUserDetails.email}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Số điện thoại
                    </Typography>
                    <Typography variant="body1">
                      {viewUserDetails.phone || "Chưa cập nhật"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Vai trò
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        label={viewUserDetails.code}
                        color={getRoleColor(viewUserDetails.code)}
                        size="small"
                      />
                      <Typography variant="body1">
                        {getRoleName(viewUserDetails.code)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Phòng ban
                    </Typography>
                    <Typography variant="body1">
                      {viewUserDetails.department_id || "Chưa phân công"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Trạng thái
                    </Typography>
                    <Chip
                      label={viewUserDetails.is_active ? "Đang hoạt động" : "Vô hiệu hóa"}
                      color={viewUserDetails.is_active ? "success" : "error"}
                      size="small"
                      icon={viewUserDetails.is_active ? <ActiveIcon /> : <InactiveIcon />}
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* System Information */}
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
                      {viewUserDetails.created_at
                        ? format(new Date(viewUserDetails.created_at), "dd/MM/yyyy HH:mm")
                        : "Chưa cập nhật"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Cập nhật lần cuối
                    </Typography>
                    <Typography variant="body1">
                      {viewUserDetails.updated_at
                        ? format(new Date(viewUserDetails.updated_at), "dd/MM/yyyy HH:mm")
                        : "Chưa cập nhật"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Đăng nhập lần cuối
                    </Typography>
                    <Typography variant="body1">
                      {viewUserDetails.last_login
                        ? format(new Date(viewUserDetails.last_login), "dd/MM/yyyy HH:mm")
                        : "Chưa đăng nhập"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Người tạo
                    </Typography>
                    <Typography variant="body1">
                      #{viewUserDetails.created_by || "Hệ thống"}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>

              {/* Actions */}
              <Grid item xs={12}>
                <Box display="flex" gap={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={() => {
                      handleCloseViewDialog();
                      handleOpenDialog(viewUserDetails);
                    }}
                    startIcon={<EditIcon />}
                  >
                    Chỉnh sửa
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleCloseViewDialog}
                  >
                    Đóng
                  </Button>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingUser ? "Chỉnh sửa User" : "Thêm User mới"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Username *"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={!!editingUser}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email *"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={
                    editingUser
                      ? "Mật khẩu mới (để trống nếu không đổi)"
                      : "Mật khẩu *"
                  }
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Xác nhận mật khẩu"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={!!editingUser && !formData.password}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Họ tên *"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Số điện thoại"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Vai trò *</InputLabel>
                  <Select
                    name="code"
                    value={formData.code}
                    label="Vai trò *"
                    onChange={handleInputChange}
                  >
                    {roles.map((role) => (
                      <MenuItem key={role.id} value={role.code}>
                        <Chip
                          label={role.code}
                          size="small"
                          color={getRoleColor(role.code)}
                          sx={{ mr: 1 }}
                        />
                        {role.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Department ID (nếu có)"
                  name="department_id"
                  type="number"
                  value={formData.department_id}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      color="success"
                    />
                  }
                  label={
                    <Typography>
                      Trạng thái: {formData.is_active ? "Active" : "Inactive"}
                    </Typography>
                  }
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              !formData.username ||
              !formData.email ||
              !formData.full_name ||
              !formData.code
            }
          >
            {editingUser ? "Cập nhật" : "Tạo mới"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa user{" "}
            <strong>{selectedUser?.full_name}</strong> ({selectedUser?.email})?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan đến user
            này sẽ bị xóa.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Hủy</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
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

export default Users;