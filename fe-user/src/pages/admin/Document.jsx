import React, { useState, useEffect, useMemo, useCallback } from "react";
import mammoth from "mammoth";
import {
  getDocuments,
  updateDocument,
  deleteDocument,
  downloadDocument,
  uploadDocumentFile,
  uploadLargeFile,
  toggleDocumentStatus,
  getDocumentStatistics,
  getFolders,
  getDocumentHistory,
  getAllLogs,
  getLogStatistics,
} from "../../services/documentService";
import axiosClient from "../../services/axiosClient";
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
  Avatar,
  Pagination,
  Tabs,
  Tab,
  LinearProgress,
  Badge,
  Zoom,
  Fade,
  Grow,
  Slide,
  Stack,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DeleteSweep as DeleteSweepIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Folder as FolderIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Description as DocIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  CloudUpload as UploadIcon,
  CloudDownload as CloudDownloadIcon,
  Cancel as CancelIcon,
  InsertDriveFile as FileIcon,
  Lock as LockIcon,
  Close as CloseIcon,
  Image as ImageIcon,
  TextSnippet as TextIcon,
  History as HistoryIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon,
} from "@mui/icons-material";

function DocumentManagement() {
  const isDocumentActive = (value) => {
    return value === true || value === 1 || value === "1" || value === "true";
  };
  const [passwordError, setPasswordError] = useState("");
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
const showSnackbar = useCallback((message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  }, []);
  const [documents, setDocuments] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    pdfCount: 0,
    excelCount: 0,
    totalSize: 0,
    totalDownloads: 0,
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const [viewDialog, setViewDialog] = useState(false);
  const [viewingDocument, setViewingDocument] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [loadingView, setLoadingView] = useState(false);

  const [logsDialog, setLogsDialog] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logStatistics, setLogStatistics] = useState(null);
  const [selectedLogDocument, setSelectedLogDocument] = useState(null);
  const [allLogs, setAllLogs] = useState([]);
  const [openAllLogsDialog, setOpenAllLogsDialog] = useState(false);

  const [filterUser, setFilterUser] = useState("all");
  const [users, setUsers] = useState([]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    folder_id: "",
    access_level: "restricted",
    access_password: "",
    allowed_roles: ["ADMIN"],
    is_encrypted: false,
    expiry_date: "",
  });

  const [passwordDialog, setPasswordDialog] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [pendingPasswordAction, setPendingPasswordAction] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterAccess, setFilterAccess] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [folders, setFolders] = useState([]);
  const [loadingFolders, setLoadingFolders] = useState(false);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [currentChunk, setCurrentChunk] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);
  const [uploadId, setUploadId] = useState(null);
  const [abortController, setAbortController] = useState(null);

  const [deletingId, setDeletingId] = useState(null);

  const CHUNK_SIZE = 5 * 1024 * 1024;
  const LARGE_FILE_THRESHOLD = 10 * 1024 * 1024;

  const currentUser = useMemo(() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      const payload = JSON.parse(atob(token.split(".")[1]));
      return {
        id: payload.id,
        role_code: payload.role_code,
      };
    } catch {
      return null;
    }
  }, []);

  const isLoggedIn = !!currentUser;

  const canEditDocument = useCallback(
    (doc) => {
      if (!currentUser) return false;
      const isOwner = Number(doc.uploaded_by) === Number(currentUser.id);
      const isAdmin = currentUser.role_code === "ADMIN";
      return isOwner || isAdmin;
    },
    [currentUser],
  );

  const askForPassword = useCallback((action) => {
    setPendingPasswordAction(() => action);
    setPasswordInput("");
    setPasswordError("");
    setPasswordSubmitting(false);
    setPasswordDialog(true);
  }, []);

  const handleSubmitPassword = useCallback(async () => {
    if (!pendingPasswordAction) return;

    try {
      setPasswordSubmitting(true);
      setPasswordError("");

      await pendingPasswordAction(passwordInput);

      // đúng mật mã -> đóng modal
      setPasswordDialog(false);
      setPasswordInput("");
      setPendingPasswordAction(null);
    } catch (err) {
      if (err.code === "PASSWORD_REQUIRED") {
        setPasswordError(err.message || "Mật mã tài liệu không đúng");
        return;
      }

      setPasswordDialog(false);
      showSnackbar(err.message || "Không thể mở tài liệu", "error");
    } finally {
      setPasswordSubmitting(false);
    }
  }, [pendingPasswordAction, passwordInput, showSnackbar]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await axiosClient.get("/users");
      setUsers(res.data.users || []);
    } catch (err) {
      console.error("Lỗi lấy users:", err);
    }
  }, []);

  

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [docsData, statsData] = await Promise.all([
        getDocuments(),
        getDocumentStatistics(),
      ]);
      setDocuments(docsData);
      setStatistics(statsData);
      setError("");
    } catch (err) {
      setError(err.message || "Không thể tải dữ liệu");
      showSnackbar(err.message || "Lỗi khi tải dữ liệu", "error");
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  const fetchFolders = useCallback(async () => {
    try {
      setLoadingFolders(true);
      const foldersData = await getFolders();
      setFolders(foldersData || []);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách thư mục:", err);
      showSnackbar("Không thể lấy danh sách thư mục", "error");
    } finally {
      setLoadingFolders(false);
    }
  }, [showSnackbar]);

  const fetchLogStatistics = useCallback(async () => {
    try {
      const stats = await getLogStatistics();
      setLogStatistics(stats);
    } catch (err) {
      console.error("Lỗi khi lấy thống kê logs:", err);
    }
  }, []);

  const fetchAllLogs = useCallback(async () => {
    try {
      const result = await getAllLogs(200);
      setAllLogs(result.logs || []);
    } catch (err) {
      console.error("Lỗi lấy all logs:", err);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchFolders();
    fetchLogStatistics();
    fetchUsers();
  }, [fetchData, fetchFolders, fetchLogStatistics, fetchUsers]);

  const cancelUpload = useCallback(() => {
    if (abortController) {
      abortController.abort();
    }
    setIsPaused(false);
    setUploading(false);
    setUploadProgress(0);
    setCurrentChunk(0);
    setTotalChunks(0);
    setUploadSpeed(0);
    if (uploadId) {
      localStorage.removeItem(`upload_${uploadId}`);
    }
    showSnackbar("Đã hủy upload", "info");
  }, [abortController, uploadId, showSnackbar]);

  const handleOpenDialog = useCallback((doc = null) => {
    if (doc) {
      setEditingDocument(doc);
      setFormData({
        name: doc.name || "",
        description: doc.description || "",
        folder_id: doc.folder_id || "",
        access_level: doc.access_level || "restricted",
        access_password: "",
        allowed_roles: doc.allowed_roles || ["ADMIN"],
        is_encrypted: doc.is_encrypted || false,
        expiry_date: doc.expiry_date || "",
      });
      setSelectedFile(null);
    } else {
      setEditingDocument(null);
      setFormData({
        name: "",
        description: "",
        folder_id: "",
        access_level: "restricted",
        access_password: "",
        allowed_roles: ["ADMIN"],
        is_encrypted: false,
        expiry_date: "",
      });
      setSelectedFile(null);
    }

    setUploadProgress(0);
    setIsPaused(false);
    setUploadSpeed(0);
    setCurrentChunk(0);
    setTotalChunks(0);
    setOpenDialog(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    if (uploading) {
      cancelUpload();
    }
    setOpenDialog(false);
    setEditingDocument(null);
    setSelectedFile(null);
    setUploadProgress(0);
    setIsPaused(false);
    setUploadSpeed(0);
    setCurrentChunk(0);
    setTotalChunks(0);
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
  }, [uploading, cancelUpload, abortController]);

  const handleOpenDeleteDialog = useCallback((doc) => {
    setEditingDocument(doc);
    setDeleteReason("");
    setDeleteConfirmText("");
    setOpenDeleteDialog(true);
  }, []);

  const handleCloseDeleteDialog = useCallback(() => {
    setOpenDeleteDialog(false);
    setEditingDocument(null);
    setDeleteReason("");
    setDeleteConfirmText("");
  }, []);

  const handleOpenHistoryDialog = useCallback(
    async (doc) => {
      try {
        setLoadingLogs(true);
        setSelectedLogDocument(doc);
        const result = await getDocumentHistory(doc.id);
        setLogs(result.logs || []);
        setLogsDialog(true);
      } catch (err) {
        showSnackbar(err.message || "Không thể tải lịch sử", "error");
      } finally {
        setLoadingLogs(false);
      }
    },
    [showSnackbar],
  );

  const handleCloseHistoryDialog = useCallback(() => {
    setLogsDialog(false);
    setLogs([]);
    setSelectedLogDocument(null);
  }, []);

  const handleOpenViewDialog = useCallback(
    async (doc, password = "") => {
      try {
        setLoadingView(true);
        setViewingDocument(doc);

        const fileType = doc.file_type?.toLowerCase();
        const blob = await downloadDocument(doc.id, password);

        if (fileType === "pdf") {
          const url = URL.createObjectURL(blob);
          setFileContent(url);
        } else if (["jpg", "jpeg", "png", "gif"].includes(fileType)) {
          const url = URL.createObjectURL(blob);
          setFileContent(url);
        } else if (["txt", "csv"].includes(fileType)) {
          const text = await blob.text();
          setFileContent(text);
        } else if (fileType === "docx" || fileType === "doc") {
          try {
            const result = await mammoth.convertToHtml({
              arrayBuffer: await blob.arrayBuffer(),
            });
            setFileContent(result.value);
          } catch {
            const text = await blob.text();
            setFileContent(text);
          }
        } else {
          const url = URL.createObjectURL(blob);
          setFileContent(url);
        }

        setViewDialog(true);
      } catch (err) {
        if (err.code === "PASSWORD_REQUIRED") {
          askForPassword((pwd) => handleOpenViewDialog(doc, pwd));
          throw err;
        }
        console.error("Error opening view dialog:", err);
        showSnackbar(err.message || "Không thể mở tài liệu", "error");
        throw err;
      } finally {
        setLoadingView(false);
      }
    },
    [showSnackbar, askForPassword],
  );

  const handleCloseViewDialog = useCallback(() => {
    setViewDialog(false);
    setViewingDocument(null);
    setFileContent(null);
    if (
      fileContent &&
      typeof fileContent === "string" &&
      fileContent.startsWith("blob:")
    ) {
      URL.revokeObjectURL(fileContent);
    }
  }, [fileContent]);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  const handleFileSelect = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (file) {
        const maxSize = 1024 * 1024 * 1024;
        if (file.size > maxSize) {
          showSnackbar("File quá lớn. Kích thước tối đa là 1GB", "error");
          e.target.value = "";
          return;
        }

        const allowedTypes = [
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/msword",
          "text/plain",
          "image/jpeg",
          "image/png",
          "image/gif",
        ];

        if (!allowedTypes.includes(file.type)) {
          showSnackbar("Loại file không được hỗ trợ", "error");
          e.target.value = "";
          return;
        }

        setSelectedFile(file);
        if (!formData.name) {
          setFormData((prev) => ({
            ...prev,
            name: file.name.replace(/\.[^/.]+$/, ""),
          }));
        }
        setUploadProgress(0);
        setCurrentChunk(0);
        setTotalChunks(0);
        setUploadSpeed(0);
      }
    },
    [formData.name, showSnackbar],
  );

  const handleDownload = useCallback(
    async (id, name, password = "") => {
      try {
        const blob = await downloadDocument(id, password);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          if (a.parentNode) a.parentNode.removeChild(a);
        }, 1000);

        setDocuments((prev) =>
          prev.map((doc) =>
            doc.id === id
              ? { ...doc, download_count: (doc.download_count || 0) + 1 }
              : doc,
          ),
        );

        showSnackbar(`Đã tải xuống: ${name}`, "success");
      } catch (err) {
        if (err.code === "PASSWORD_REQUIRED") {
          askForPassword((pwd) => handleDownload(id, name, pwd));
          throw err;
        }
        showSnackbar(err.message || "Lỗi khi tải xuống", "error");
        throw err;
      }
    },
    [showSnackbar, askForPassword],
  );

  const handleView = useCallback(
    async (id) => {
      try {
        const doc = documents.find((d) => d.id === id);
        if (doc) {
          await handleOpenViewDialog(doc);
          setDocuments((prev) =>
            prev.map((d) =>
              d.id === id ? { ...d, view_count: (d.view_count || 0) + 1 } : d,
            ),
          );
        }
      } catch (err) {
        showSnackbar(err.message || "Lỗi khi mở tài liệu", "error");
      }
    },
    [documents, handleOpenViewDialog, showSnackbar],
  );

  const handleStatusToggle = useCallback(
    async (id, currentStatus) => {
      try {
        const response = await toggleDocumentStatus(
          id,
          !isDocumentActive(currentStatus),
        );
        const newStatus =
          response?.is_active !== undefined
            ? response.is_active
            : !isDocumentActive(currentStatus);

        setDocuments((prev) =>
          prev.map((doc) =>
            doc.id === id ? { ...doc, is_active: newStatus } : doc,
          ),
        );

        showSnackbar(
          `Tài liệu đã được ${isDocumentActive(newStatus) ? "bật" : "tắt"}`,
          "success",
        );
      } catch (err) {
        showSnackbar(err.message || "Có lỗi xảy ra", "error");
      }
    },
    [showSnackbar],
  );

  const handleCreateDocument = useCallback(async () => {
    try {
      if (!formData.name.trim()) {
        showSnackbar("Vui lòng nhập tên tài liệu", "error");
        return;
      }

      if (!formData.folder_id) {
        showSnackbar("Vui lòng chọn thư mục", "error");
        return;
      }

      if (!selectedFile) {
        showSnackbar("Vui lòng chọn file để tải lên", "error");
        return;
      }

      setUploading(true);
      setUploadProgress(0);
      setIsPaused(false);

      const controller = new AbortController();
      setAbortController(controller);

      let uploadedDoc;

      if (selectedFile.size > LARGE_FILE_THRESHOLD) {
        uploadedDoc = await uploadLargeFile(
          selectedFile,
          formData.folder_id,
          {
            ...formData,
            access_password: formData.access_password,
          },
          (percent, speed, chunkIndex, totalChunkCount) => {
            setUploadProgress(percent);
            setCurrentChunk(chunkIndex || 0);
            setTotalChunks(totalChunkCount || 0);
            if (speed) {
              setUploadSpeed(speed);
            }
          },
          controller.signal,
        );
      } else {
        uploadedDoc = await uploadDocumentFile(
          selectedFile,
          formData.folder_id,
          formData.access_level,
          formData.access_password,
        );
        setUploadProgress(100);
      }

      await updateDocument(uploadedDoc.id, {
        ...formData,
        name: formData.name || uploadedDoc.name,
        access_password: formData.access_password,
        is_active: true,
      });

      showSnackbar(
        `Tạo tài liệu mới thành công! (${(
          selectedFile.size /
          1024 /
          1024
        ).toFixed(2)} MB)`,
        "success",
      );

      handleCloseDialog();
      setFormData({
        name: "",
        description: "",
        folder_id: "",
        access_level: "restricted",
        access_password: "",
        allowed_roles: ["ADMIN"],
        is_encrypted: false,
        expiry_date: "",
      });
      setSelectedFile(null);
      fetchData();
      fetchLogStatistics();
    } catch (err) {
      if (err.message === "Upload cancelled") {
        showSnackbar("Đã hủy upload", "info");
      } else {
        showSnackbar(err.message || "Có lỗi xảy ra khi upload", "error");
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setUploadSpeed(0);
      setIsPaused(false);
      setCurrentChunk(0);
      setTotalChunks(0);
      setAbortController(null);
      setUploadId(null);
    }
  }, [
    formData,
    selectedFile,
    showSnackbar,
    handleCloseDialog,
    fetchData,
    fetchLogStatistics,
  ]);

  const handleUpdateDocument = useCallback(async () => {
    try {
      if (!formData.name.trim()) {
        showSnackbar("Vui lòng nhập tên tài liệu", "error");
        return;
      }

      if (!formData.folder_id) {
        showSnackbar("Vui lòng chọn thư mục", "error");
        return;
      }

      setUpdating(true);

      await updateDocument(editingDocument.id, {
        name: formData.name,
        description: formData.description,
        folder_id: formData.folder_id,
        access_level: formData.access_level,
        access_password: formData.access_password,
        allowed_roles: formData.allowed_roles,
        is_encrypted: formData.is_encrypted,
        expiry_date: formData.expiry_date,
      });

      showSnackbar("Cập nhật tài liệu thành công!", "success");
      handleCloseDialog();
      fetchData();
      fetchLogStatistics();
    } catch (err) {
      showSnackbar(err.message || "Có lỗi xảy ra khi cập nhật", "error");
    } finally {
      setUpdating(false);
    }
  }, [
    formData,
    editingDocument,
    showSnackbar,
    handleCloseDialog,
    fetchData,
    fetchLogStatistics,
  ]);

  const handleDelete = useCallback(async () => {
    if (!editingDocument) return;

    if (deleteConfirmText !== "DELETE") {
      showSnackbar('Vui lòng gõ "DELETE" để xác nhận xóa', "error");
      return;
    }

    try {
      setDeletingId(editingDocument.id);
      await deleteDocument(editingDocument.id);

      showSnackbar(
        `Đã xóa tài liệu "${editingDocument.name}"${
          deleteReason ? ` với lý do: ${deleteReason}` : ""
        }`,
        "success",
      );

      fetchData();
      fetchLogStatistics();
      handleCloseDeleteDialog();
    } catch (err) {
      showSnackbar(err.message || "Có lỗi xảy ra khi xóa", "error");
    } finally {
      setDeletingId(null);
    }
  }, [
    editingDocument,
    deleteConfirmText,
    deleteReason,
    showSnackbar,
    fetchData,
    fetchLogStatistics,
    handleCloseDeleteDialog,
  ]);

  const getFileIcon = useCallback((fileType) => {
    switch (fileType) {
      case "pdf":
        return <PdfIcon color="error" />;
      case "xlsx":
      case "xls":
        return <ExcelIcon color="success" />;
      case "docx":
      case "doc":
        return <DocIcon color="primary" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <ImageIcon color="secondary" />;
      case "txt":
      case "csv":
        return <TextIcon color="info" />;
      default:
        return <FileIcon />;
    }
  }, []);

  const getAccessColor = useCallback((accessLevel) => {
    switch (accessLevel) {
      case "restricted":
        return "warning";
      case "private":
        return "error";
      case "public":
        return "success";
      default:
        return "default";
    }
  }, []);

  const getAccessLabel = useCallback((accessLevel) => {
    switch (accessLevel) {
      case "restricted":
        return "Hạn chế";
      case "private":
        return "Riêng tư";
      case "public":
        return "Công khai";
      default:
        return accessLevel;
    }
  }, []);

  const getActionLabel = useCallback((action) => {
    const actions = {
      CREATE: "Tạo mới",
      UPDATE: "Cập nhật",
      DELETE: "Xóa",
      DOWNLOAD: "Tải xuống",
      VIEW: "Xem",
      ACTIVATE: "Kích hoạt",
      DEACTIVATE: "Vô hiệu hóa",
    };
    return actions[action] || action;
  }, []);

  const getActionColor = useCallback((action) => {
    const colors = {
      CREATE: "success",
      UPDATE: "info",
      DELETE: "error",
      DOWNLOAD: "primary",
      VIEW: "default",
      ACTIVATE: "success",
      DEACTIVATE: "warning",
    };
    return colors[action] || "default";
  }, []);

  const formatFileSize = useCallback((bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }, []);

  const formatDate = useCallback((dateString) => {
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

  const getFolderName = useCallback(
    (folderId) => {
      const folder = folders.find((f) => f.id === folderId);
      return folder ? folder.name : "—";
    },
    [folders],
  );

  const filteredAndSortedDocuments = useMemo(() => {
    let filtered = [...documents];

    if (activeTab === 1)
      filtered = filtered.filter((doc) => doc.file_type === "pdf");
    if (activeTab === 2)
      filtered = filtered.filter(
        (doc) => doc.file_type === "xlsx" || doc.file_type === "xls",
      );
    if (activeTab === 3)
      filtered = filtered.filter((doc) => doc.access_level === "restricted");

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          (doc.name && doc.name.toLowerCase().includes(term)) ||
          (doc.document_code &&
            doc.document_code.toLowerCase().includes(term)) ||
          (doc.description && doc.description.toLowerCase().includes(term)),
      );
    }

    if (filterType !== "all") {
      filtered = filtered.filter((doc) => doc.file_type === filterType);
    }

    if (filterAccess !== "all") {
      filtered = filtered.filter((doc) => doc.access_level === filterAccess);
    }

    if (filterUser !== "all") {
      filtered = filtered.filter(
        (doc) => doc.uploaded_by === parseInt(filterUser),
      );
    }

    switch (sortBy) {
      case "newest":
        filtered.sort(
          (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
        );
        break;
      case "oldest":
        filtered.sort(
          (a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0),
        );
        break;
      case "name_asc":
        filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "name_desc":
        filtered.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
        break;
      case "size_asc":
        filtered.sort((a, b) => (a.file_size || 0) - (b.file_size || 0));
        break;
      case "size_desc":
        filtered.sort((a, b) => (b.file_size || 0) - (a.file_size || 0));
        break;
      case "downloads_desc":
        filtered.sort(
          (a, b) => (b.download_count || 0) - (a.download_count || 0),
        );
        break;
      default:
        break;
    }

    return filtered;
  }, [
    documents,
    activeTab,
    searchTerm,
    filterType,
    filterAccess,
    filterUser,
    sortBy,
  ]);

  const paginatedDocuments = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    return filteredAndSortedDocuments.slice(
      startIndex,
      startIndex + rowsPerPage,
    );
  }, [filteredAndSortedDocuments, page, rowsPerPage]);

  const renderFilePreview = useCallback(
    (doc, content) => {
      const fileType = doc.file_type?.toLowerCase();

      if (fileType === "pdf") {
        return (
          <Box sx={{ width: "100%", height: "700px" }}>
            <iframe
              src={content}
              title={doc.name}
              width="100%"
              height="100%"
              style={{ border: "none" }}
            />
          </Box>
        );
      } else if (["jpg", "jpeg", "png", "gif"].includes(fileType)) {
        return (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "400px",
            }}
          >
            <img
              src={content}
              alt={doc.name}
              style={{
                maxWidth: "100%",
                maxHeight: "600px",
                objectFit: "contain",
              }}
            />
          </Box>
        );
      } else if (["txt", "csv"].includes(fileType)) {
        return (
          <Box
            sx={{
              bgcolor: "grey.100",
              p: 2,
              borderRadius: 1,
              fontFamily: "monospace",
              whiteSpace: "pre-wrap",
              maxHeight: "600px",
              overflow: "auto",
              fontSize: "0.875rem",
            }}
          >
            {content}
          </Box>
        );
      } else if (fileType === "docx" || fileType === "doc") {
        return (
          <Box
            sx={{
              bg: "white",
              p: 3,
              maxHeight: "700px",
              overflow: "auto",
              border: "1px solid #e0e0e0",
              borderRadius: 1,
              backgroundColor: "#f5f5f5",
            }}
          >
            <Box
              component="div"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </Box>
        );
      } else {
        return (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <FileIcon sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Không thể xem trực tiếp
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Loại tệp <strong>{fileType || "không xác định"}</strong> cần được
              tải xuống để xem
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<DownloadIcon />}
              onClick={() => {
                handleCloseViewDialog();
                handleDownload(doc.id, doc.name);
              }}
            >
              Tải xuống để xem
            </Button>
          </Box>
        );
      }
    },
    [handleCloseViewDialog, handleDownload],
  );

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
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            <FolderIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            Quản Lý Tài Liệu
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý tất cả tài liệu trong hệ thống
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Tooltip title="Tải lại">
            <IconButton
              onClick={() => {
                fetchData();
                fetchFolders();
                fetchLogStatistics();
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xem tất cả logs">
            <IconButton
              onClick={() => {
                fetchAllLogs();
                setOpenAllLogsDialog(true);
              }}
            >
              <HistoryIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Thêm Tài Liệu
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Zoom in={true}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    <FolderIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4">
                      {statistics.total || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tổng tài liệu
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Zoom in={true}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: "error.main" }}>
                    <PdfIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4">
                      {statistics.pdfCount || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      PDF
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Zoom in={true}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: "success.main" }}>
                    <ExcelIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4">
                      {statistics.excelCount || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Excel
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Zoom in={true}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: "warning.main" }}>
                    <CloudDownloadIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4">
                      {statistics.totalDownloads || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Lượt tải
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Zoom in={true}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: "info.main" }}>
                    <HistoryIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4">
                      {logStatistics?.total_logs || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Lượt logs
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
      </Grid>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="📄 Tất cả" />
          <Tab label="📑 PDF" />
          <Tab label="📊 Excel" />
          <Tab label="🔒 Hạn chế" />
        </Tabs>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="🔍 Tìm kiếm tài liệu..."
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Grid>
            <Grid item xs={6} md={1.5}>
              <FormControl fullWidth size="small">
                <InputLabel>Loại file</InputLabel>
                <Select
                  value={filterType}
                  label="Loại file"
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="pdf">PDF</MenuItem>
                  <MenuItem value="xlsx">Excel</MenuItem>
                  <MenuItem value="docx">Word</MenuItem>
                  <MenuItem value="jpg">Hình ảnh</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={1.5}>
              <FormControl fullWidth size="small">
                <InputLabel>Phân quyền</InputLabel>
                <Select
                  value={filterAccess}
                  label="Phân quyền"
                  onChange={(e) => setFilterAccess(e.target.value)}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="public">Công khai</MenuItem>
                  <MenuItem value="restricted">Hạn chế</MenuItem>
                  <MenuItem value="private">Riêng tư</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={1.5}>
              <FormControl fullWidth size="small">
                <InputLabel>Người upload</InputLabel>
                <Select
                  value={filterUser}
                  label="Người upload"
                  onChange={(e) => setFilterUser(e.target.value)}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.username || user.email}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={1.5}>
              <FormControl fullWidth size="small">
                <InputLabel>Sắp xếp</InputLabel>
                <Select
                  value={sortBy}
                  label="Sắp xếp"
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="newest">🆕 Mới nhất</MenuItem>
                  <MenuItem value="oldest">📅 Cũ nhất</MenuItem>
                  <MenuItem value="name_asc">🔤 Tên A-Z</MenuItem>
                  <MenuItem value="name_desc">🔤 Tên Z-A</MenuItem>
                  <MenuItem value="downloads_desc">📥 Tải nhiều nhất</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={1.5}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setSearchTerm("");
                  setFilterType("all");
                  setFilterAccess("all");
                  setFilterUser("all");
                  setSortBy("newest");
                  setPage(1);
                }}
                startIcon={<FilterIcon />}
              >
                Xóa lọc
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && (
        <Fade in={true}>
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        </Fade>
      )}

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "primary.main" }}>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                📄 Tài liệu
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                👤 Người upload
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                ℹ️ Thông tin
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                📁 Thư mục
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                🔐 Phân quyền
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                📊 Thống kê
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                ⚡ Hành động
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedDocuments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <FileIcon
                    sx={{ fontSize: 80, color: "text.secondary", mb: 2 }}
                  />
                  <Typography color="text.secondary" variant="h6">
                    {searchTerm
                      ? "Không tìm thấy tài liệu phù hợp"
                      : "Chưa có tài liệu nào"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedDocuments.map((doc, index) => (
                <Grow
                  in={true}
                  style={{ transitionDelay: `${index * 50}ms` }}
                  key={doc.id}
                >
                  <TableRow
                    hover
                    sx={{ opacity: deletingId === doc.id ? 0.5 : 1 }}
                  >
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ width: 48, height: 48 }}>
                          {getFileIcon(doc.file_type)}
                        </Avatar>
                        <Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography fontWeight="bold" variant="subtitle1">
                              {doc.name}
                            </Typography>
                            {doc.is_encrypted && (
                              <Tooltip title="Đã mã hóa">
                                <LockIcon fontSize="small" color="warning" />
                              </Tooltip>
                            )}
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {doc.document_code} •{" "}
                            {formatFileSize(doc.file_size)}
                          </Typography>
                          {doc.description && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                            >
                              {doc.description}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {doc.uploaded_by_name || `ID: ${doc.uploaded_by}`}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        {doc.uploaded_by_email || ""}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(doc.created_at)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        <strong>Loại:</strong>{" "}
                        <Chip
                          label={doc.file_type?.toUpperCase() || "—"}
                          size="small"
                          variant="outlined"
                        />
                      </Typography>
                      <Typography variant="body2">
                        <strong>Phiên bản:</strong> v{doc.version || "1"}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <FolderIcon fontSize="small" color="primary" />
                        <Typography variant="body2">
                          {getFolderName(doc.folder_id)}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={getAccessLabel(doc.access_level)}
                        color={getAccessColor(doc.access_level)}
                        size="small"
                      />
                    </TableCell>

                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography variant="body2">
                          Tải: {doc.download_count || 0}
                        </Typography>
                        <Typography variant="body2">
                          Xem: {doc.view_count || 0}
                        </Typography>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={isDocumentActive(doc.is_active)}
                              onChange={() =>
                                handleStatusToggle(doc.id, doc.is_active)
                              }
                              size="small"
                              color="success"
                              disabled={!canEditDocument(doc)}
                            />
                          }
                          label={
                            <Typography variant="caption">
                              {isDocumentActive(doc.is_active)
                                ? "Hoạt động"
                                : "Đã tắt"}
                            </Typography>
                          }
                          sx={{ m: 0 }}
                        />
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Lịch sử">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenHistoryDialog(doc)}
                          >
                            <HistoryIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip
                          title={
                            !isLoggedIn ? "Bạn cần đăng nhập" : "Xem trước"
                          }
                        >
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => handleView(doc.id)}
                              disabled={
                                !isLoggedIn || !isDocumentActive(doc.is_active)
                              }
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip
                          title={
                            !isLoggedIn ? "Bạn cần đăng nhập" : "Tải xuống"
                          }
                        >
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => handleDownload(doc.id, doc.name)}
                              disabled={
                                !isLoggedIn || !isDocumentActive(doc.is_active)
                              }
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        {canEditDocument(doc) && (
                          <>
                            <Tooltip title="Chỉnh sửa">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDialog(doc)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Xóa">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleOpenDeleteDialog(doc)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                </Grow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredAndSortedDocuments.length > rowsPerPage && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={Math.ceil(filteredAndSortedDocuments.length / rowsPerPage)}
            page={page}
            onChange={(e, v) => setPage(v)}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            {editingDocument ? (
              <EditIcon color="primary" />
            ) : (
              <AddIcon color="success" />
            )}
            <Typography variant="h6">
              {editingDocument ? "Chỉnh sửa tài liệu" : "Thêm tài liệu mới"}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {(uploading || updating) && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress
                variant={uploadProgress > 0 ? "determinate" : "indeterminate"}
                value={uploadProgress}
                sx={{ borderRadius: 2, height: 8 }}
              />
              {uploading && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" sx={{ display: "block" }}>
                    📤 Đang tải lên: {uploadProgress.toFixed(1)}%
                    {uploadSpeed > 0 && ` • ⚡ ${uploadSpeed.toFixed(0)} KB/s`}
                  </Typography>
                  {totalChunks > 0 && (
                    <Typography variant="caption" color="text.secondary">
                      📦 Chunk: {currentChunk}/{totalChunks}
                    </Typography>
                  )}
                </Box>
              )}
              {uploading && selectedFile?.size > LARGE_FILE_THRESHOLD && (
                <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setIsPaused(!isPaused)}
                    startIcon={isPaused ? <PlayArrowIcon /> : <PauseIcon />}
                  >
                    {isPaused ? "Tiếp tục" : "Tạm dừng"}
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={cancelUpload}
                    startIcon={<CancelIcon />}
                  >
                    Hủy
                  </Button>
                </Box>
              )}
            </Box>
          )}

          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="📝 Tên tài liệu *"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={uploading || updating}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="📄 Mô tả"
                  name="description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={uploading || updating}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>📁 Thư mục *</InputLabel>
                  <Select
                    name="folder_id"
                    value={formData.folder_id}
                    label="📁 Thư mục *"
                    onChange={handleInputChange}
                    disabled={uploading || updating || loadingFolders}
                  >
                    {folders.map((folder) => (
                      <MenuItem key={folder.id} value={folder.id}>
                        {folder.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {!editingDocument && (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      border: "2px dashed",
                      borderColor: "primary.main",
                      borderRadius: 2,
                      p: 3,
                      textAlign: "center",
                      bgcolor: "action.hover",
                    }}
                  >
                    <input
                      type="file"
                      id="file-upload"
                      hidden
                      onChange={handleFileSelect}
                      accept=".pdf,.xlsx,.xls,.docx,.doc,.txt,.jpg,.jpeg,.png,.gif"
                      disabled={uploading || updating}
                    />
                    <label htmlFor="file-upload">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<UploadIcon />}
                        disabled={uploading || updating}
                      >
                        📂 Chọn file để tải lên *
                      </Button>
                    </label>

                    {selectedFile && (
                      <Alert severity="success" sx={{ mt: 2 }}>
                        {selectedFile.name} •{" "}
                        {formatFileSize(selectedFile.size)}
                      </Alert>
                    )}
                  </Box>
                </Grid>
              )}

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>🔐 Mức độ truy cập</InputLabel>
                  <Select
                    name="access_level"
                    value={formData.access_level}
                    label="🔐 Mức độ truy cập"
                    onChange={handleInputChange}
                    disabled={uploading || updating}
                  >
                    <MenuItem value="public">🌍 Công khai</MenuItem>
                    <MenuItem value="restricted">⚠️ Hạn chế</MenuItem>
                    <MenuItem value="private">🔒 Riêng tư</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {(formData.access_level === "private" ||
                formData.access_level === "restricted") && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="🔑 Mật mã tài liệu"
                    name="access_password"
                    value={formData.access_password}
                    onChange={handleInputChange}
                    disabled={uploading || updating}
                    placeholder="Để trống nếu không dùng mật mã"
                    helperText="Người có quyền truy cập sẽ phải nhập mật mã này để mở hoặc tải file"
                  />
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      name="is_encrypted"
                      checked={formData.is_encrypted}
                      onChange={handleInputChange}
                      disabled={uploading || updating}
                    />
                  }
                  label="🔒 Mã hóa tài liệu"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="📅 Ngày hết hạn"
                  name="expiry_date"
                  type="date"
                  value={formData.expiry_date}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  disabled={uploading || updating}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={uploading || updating}>
            Hủy
          </Button>
          <Button
            onClick={
              editingDocument ? handleUpdateDocument : handleCreateDocument
            }
            variant="contained"
            disabled={
              uploading ||
              updating ||
              !formData.name.trim() ||
              !formData.folder_id ||
              (!editingDocument && !selectedFile)
            }
          >
            {uploading
              ? `📤 Đang tải lên... ${uploadProgress.toFixed(0)}%`
              : updating
                ? "🔄 Đang cập nhật..."
                : editingDocument
                  ? "💾 Cập nhật"
                  : "✨ Tạo mới"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={passwordDialog}
        onClose={() => {
          if (passwordSubmitting) return;
          setPasswordDialog(false);
          setPasswordError("");
          setPasswordInput("");
          setPendingPasswordAction(null);
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Nhập mật mã tài liệu</DialogTitle>

        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            type="password"
            label="Mật mã"
            value={passwordInput}
            onChange={(e) => {
              setPasswordInput(e.target.value);
              if (passwordError) setPasswordError("");
            }}
            error={!!passwordError}
            helperText={passwordError || "Nhập mật mã để mở tài liệu"}
            sx={{ mt: 1 }}
            disabled={passwordSubmitting}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmitPassword();
              }
            }}
          />
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              if (passwordSubmitting) return;
              setPasswordDialog(false);
              setPasswordError("");
              setPasswordInput("");
              setPendingPasswordAction(null);
            }}
            disabled={passwordSubmitting}
          >
            Hủy
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmitPassword}
            disabled={!passwordInput.trim() || passwordSubmitting}
          >
            {passwordSubmitting ? "Đang kiểm tra..." : "Xác nhận"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: "error.main", color: "white" }}>
          Xác nhận xóa tài liệu
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="📝 Lý do xóa (tùy chọn)"
            multiline
            rows={2}
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            sx={{ mb: 3 }}
          />
          <TextField
            fullWidth
            label='🔑 Gõ "DELETE" để xác nhận'
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Hủy bỏ</Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            disabled={deleteConfirmText !== "DELETE"}
          >
            Xóa vĩnh viễn
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={logsDialog}
        onClose={handleCloseHistoryDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Lịch sử tài liệu: {selectedLogDocument?.name}</DialogTitle>
        <DialogContent>
          {loadingLogs ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : logs.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography color="text.secondary">
                Chưa có hoạt động nào
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>⏰ Thời gian</TableCell>
                    <TableCell>🎯 Hành động</TableCell>
                    <TableCell>👤 Người dùng</TableCell>
                    <TableCell>🌐 IP</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{formatDate(log.accessed_at)}</TableCell>
                      <TableCell>
                        <Chip
                          label={getActionLabel(log.action)}
                          color={getActionColor(log.action)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {log.user_name ||
                          log.user_email ||
                          `ID: ${log.user_id}`}
                      </TableCell>
                      <TableCell>{log.ip_address || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHistoryDialog} variant="contained">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openAllLogsDialog}
        onClose={() => setOpenAllLogsDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>📋 Lịch sử hoạt động hệ thống</DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>⏰ Thời gian</TableCell>
                  <TableCell>🎯 Hành động</TableCell>
                  <TableCell>👤 Người dùng</TableCell>
                  <TableCell>📄 Tài liệu</TableCell>
                  <TableCell>🌐 IP</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allLogs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>{formatDate(log.accessed_at)}</TableCell>
                    <TableCell>
                      <Chip
                        label={getActionLabel(log.action)}
                        color={getActionColor(log.action)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{log.user_name || log.user_email}</TableCell>
                    <TableCell>
                      {log.document_name || `ID: ${log.document_id}`}
                    </TableCell>
                    <TableCell>{log.ip_address || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => setOpenAllLogsDialog(false)}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={viewDialog}
        onClose={handleCloseViewDialog}
        maxWidth="lg"
        fullWidth
        fullScreen={viewingDocument?.file_type === "pdf"}
      >
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box display="flex" alignItems="center" gap={1}>
              {getFileIcon(viewingDocument?.file_type)}
              <Typography variant="h6">{viewingDocument?.name}</Typography>
              {viewingDocument?.is_encrypted && (
                <LockIcon fontSize="small" color="warning" />
              )}
            </Box>
            <IconButton onClick={handleCloseViewDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {loadingView ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : viewingDocument && fileContent ? (
            renderFilePreview(viewingDocument, fileContent)
          ) : (
            <Box textAlign="center" py={8}>
              <Typography color="text.secondary">
                Không thể tải nội dung tài liệu
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => {
              if (viewingDocument) {
                handleCloseViewDialog();
                handleDownload(viewingDocument.id, viewingDocument.name);
              }
            }}
          >
            Tải xuống
          </Button>
        </DialogActions>
      </Dialog>

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

export default DocumentManagement;
