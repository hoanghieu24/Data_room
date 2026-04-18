import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeLink, setActiveLink] = useState(location.pathname);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".user-dropdown-container")) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const currentUser = useMemo(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        return user;
      }

      const token = localStorage.getItem("token");
      if (!token) return null;

      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload;
    } catch (error) {
      console.error("Không đọc được thông tin user:", error);
      return null;
    }
  }, []);

  const roleCode =
    currentUser?.role_code ||
    currentUser?.role ||
    currentUser?.position_code ||
    "USER";

  const displayName =
    currentUser?.full_name ||
    currentUser?.fullname ||
    currentUser?.username ||
    currentUser?.name ||
    currentUser?.email ||
    "Người dùng";

  const displayRole = useMemo(() => {
    const roleMap = {
      ADMIN: "Quản trị viên",
      SUPER_ADMIN: "Quản trị cấp cao",
      MANAGER: "Quản lý",
      STAFF: "Nhân viên",
      SALE: "Kinh doanh",
      SALES: "Kinh doanh",
      HR: "Nhân sự",
      ACCOUNTANT: "Kế toán",
      USER: "Người dùng",
    };

    return roleMap[roleCode] || roleCode;
  }, [roleCode]);

  const avatarText = useMemo(() => {
    const source = displayName?.trim() || "U";
    const words = source.split(" ").filter(Boolean);

    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }

    return source.slice(0, 2).toUpperCase();
  }, [displayName]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const allMenuItems = [
    {
      path: "/admin/users",
      label: "👤 Quản lý User",
      icon: "👤",
      roles: ["ADMIN", "SUPER_ADMIN"],
    },
    {
      path: "/admin/staffs",
      label: "🧑‍💼 Quản lý Nhân viên",
      icon: "🧑‍💼",
      roles: ["ADMIN", "SUPER_ADMIN", "MANAGER"],
    },
    {
      path: "/admin/customers",
      label: "🧾 Quản lý Khách hàng",
      icon: "🧾",
      roles: ["ADMIN", "SUPER_ADMIN", "MANAGER", "STAFF", "SALE", "SALES"],
    },
    {
      path: "/admin/categories",
      label: "📂 Quản lý Category",
      icon: "📂",
      roles: ["ADMIN", "SUPER_ADMIN", "MANAGER"],
    },
    {
      path: "/admin/sales",
      label: "📈 Quản lý Sales",
      icon: "📈",
      roles: ["ADMIN", "SUPER_ADMIN", "MANAGER", "SALE", "SALES"],
    },
    {
      path: "/admin/documents",
      label: "📁 DataRoom",
      icon: "📁",
      roles: ["ADMIN", "SUPER_ADMIN", "MANAGER", "STAFF", "SALE", "SALES"],
    },
    {
      path: "/admin/task",
      label: "✅ Task",
      icon: "✅",
      roles: ["ADMIN", "SUPER_ADMIN", "MANAGER", "STAFF", "SALE", "SALES"],
    },
    {
      path: "/admin/payment",
      label: "📑 Hợp đồng thanh toán",
      icon: "📑",
      roles: ["ADMIN", "SUPER_ADMIN", "ACCOUNTANT", "MANAGER"],
    },
    // {
    //   path: "/admin/reports",
    //   label: "📊 Báo cáo phân tích",
    //   icon: "📊",
    //   roles: ["ADMIN", "SUPER_ADMIN", "MANAGER"],
    // },
    // {
    //   path: "/admin/integration",
    //   label: "🔄 Tích hợp hệ thống",
    //   icon: "🔄",
    //   roles: ["ADMIN", "SUPER_ADMIN"],
    // },
    {
      path: "/admin/settings",
      label: "⚙️ Cấu hình hệ thống",
      icon: "⚙️",
      roles: ["ADMIN", "SUPER_ADMIN"],
    },
    {
      path: "/admin/positions",
      label: "👔 Position",
      icon: "👔",
      roles: ["ADMIN", "SUPER_ADMIN"],
    },
    {
      path: "/admin/game",
      label: "🎮️ Trò chơi",
      icon: "🎮️",
      roles: ["ADMIN", "SUPER_ADMIN", "MANAGER", "STAFF", "SALE", "SALES"],
    },
  ];

  const menuItems = useMemo(() => {
    return allMenuItems.filter((item) => item.roles.includes(roleCode));
  }, [roleCode]);

  const currentPage = useMemo(() => {
    return (
      menuItems.find((item) => activeLink.startsWith(item.path)) || {
        label: "Dashboard",
      }
    );
  }, [menuItems, activeLink]);

  return (
    <div style={styles.container}>
      <aside
        style={{
          ...styles.sidebar,
          width: isCollapsed ? 80 : 280,
          transition: "width 0.3s ease",
        }}
      >
        <div style={styles.sidebarHeader}>
          {!isCollapsed && <h2 style={styles.adminTitle}>ADMIN PANEL</h2>}
          {isCollapsed && <h2 style={styles.adminTitle}>A</h2>}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={styles.collapseButton}
            title={isCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
          >
            {isCollapsed ? "➡️" : "⬅️"}
          </button>
        </div>

        <div style={styles.userInfo}>
          <div style={styles.avatar}>{avatarText}</div>
          {!isCollapsed && (
            <>
              <div style={styles.userName}>{displayName}</div>
              <div style={styles.userRole}>{displayRole}</div>
            </>
          )}
        </div>

        <nav style={styles.nav}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                ...styles.link,
                ...(activeLink.startsWith(item.path) ? styles.activeLink : {}),
                justifyContent: isCollapsed ? "center" : "flex-start",
                padding: isCollapsed ? "12px" : "12px 16px",
              }}
              title={isCollapsed ? item.label : ""}
            >
              <span style={styles.icon}>{item.icon}</span>
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {!isCollapsed && (
          <div style={styles.sidebarFooter}>
            <div style={styles.stats}>
              <div style={styles.statItem}>
                <div style={styles.statValue}>24</div>
                <div style={styles.statLabel}>Tasks</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statValue}>3</div>
                <div style={styles.statLabel}>Alerts</div>
              </div>
            </div>
            <button onClick={handleLogout} style={styles.logoutButton}>
              <span>🚪</span> Logout
            </button>
          </div>
        )}
      </aside>

      <main
        style={{
          ...styles.mainContent,
          marginLeft: isCollapsed ? 80 : 280,
          transition: "margin-left 0.3s ease",
        }}
      >
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <h1 style={styles.pageTitle}>{currentPage.label || "Dashboard"}</h1>
            <div style={styles.breadcrumb}>
              <span>Admin</span>
              <span style={styles.breadcrumbSeparator}>/</span>
              <span>
                {currentPage.label?.replace(/^[^\s]+\s/, "") || "Dashboard"}
              </span>
            </div>
          </div>

          <div style={styles.headerRight}>
            <div style={styles.searchBox}>
              <span style={styles.searchIcon}>🔍</span>
              <input
                type="text"
                placeholder="Tìm kiếm..."
                style={styles.searchInput}
              />
            </div>

            <div style={styles.headerIcons}>
              <button style={styles.iconButton} title="Thông báo">
                🔔
                <span style={styles.notificationBadge}>3</span>
              </button>

              {["ADMIN", "SUPER_ADMIN"].includes(roleCode) && (
                <button style={styles.iconButton} title="Cài đặt">
                  ⚙️
                </button>
              )}

              <div
                style={styles.userDropdownContainer}
                className="user-dropdown-container"
              >
                <button
                  style={styles.userDropdownButton}
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  title="Menu người dùng"
                >
                  {avatarText} ▼
                </button>

                {showUserDropdown && (
                  <div style={styles.userDropdownMenu}>
                    <div style={styles.userDropdownHeader}>
                      <div style={styles.userDropdownName}>{displayName}</div>
                      <div style={styles.userDropdownRole}>{displayRole}</div>
                    </div>

                    <div
                      style={{
                        ...styles.userDropdownItem,
                        background:
                          hoveredItem === "profile" ? "#f1f5f9" : "transparent",
                      }}
                      onMouseEnter={() => setHoveredItem("profile")}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      👤 Profile
                    </div>

                    {["ADMIN", "SUPER_ADMIN"].includes(roleCode) && (
                      <div
                        style={{
                          ...styles.userDropdownItem,
                          background:
                            hoveredItem === "settings"
                              ? "#f1f5f9"
                              : "transparent",
                        }}
                        onMouseEnter={() => setHoveredItem("settings")}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        ⚙️ Settings
                      </div>
                    )}

                    <div
                      style={{
                        ...styles.userDropdownItem,
                        background:
                          hoveredItem === "help" ? "#f1f5f9" : "transparent",
                      }}
                      onMouseEnter={() => setHoveredItem("help")}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      ❓ Help
                    </div>

                    <div style={styles.userDropdownDivider}></div>

                    <button
                      style={{
                        ...styles.userDropdownItem,
                        background:
                          hoveredItem === "logout" ? "#fee2e2" : "transparent",
                        color:
                          hoveredItem === "logout" ? "#dc2626" : "#1e293b",
                      }}
                      onMouseEnter={() => setHoveredItem("logout")}
                      onMouseLeave={() => setHoveredItem(null)}
                      onClick={handleLogout}
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div style={styles.contentWrapper}>
          <Outlet />
        </div>

        <footer style={styles.footer}>
          <div>© 2026 CRM KTSHOLDINGS.</div>
          <div style={styles.footerLinks}>
            <Link to="/admin/help" style={styles.footerLink}>
              Help
            </Link>
            <span style={styles.footerSeparator}>|</span>
            <Link to="/admin/privacy" style={styles.footerLink}>
              Privacy
            </Link>
            <span style={styles.footerSeparator}>|</span>
            <Link to="/admin/terms" style={styles.footerLink}>
              Terms
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
  },
  sidebar: {
    background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
    color: "#fff",
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 100,
    display: "flex",
    flexDirection: "column",
    boxShadow: "4px 0 15px rgba(0, 0, 0, 0.1)",
  },
  sidebarHeader: {
    padding: "20px 16px 10px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    position: "relative",
  },
  adminTitle: {
    fontSize: "1.5rem",
    fontWeight: "700",
    background: "linear-gradient(90deg, #60a5fa, #a78bfa)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: 0,
    textAlign: "center",
  },
  collapseButton: {
    position: "absolute",
    top: "20px",
    right: "-12px",
    background: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "24px",
    height: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "12px",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
  },
  userInfo: {
    padding: "20px 16px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  avatar: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #60a5fa, #a78bfa)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  userName: {
    fontSize: "1rem",
    fontWeight: "600",
    marginBottom: "4px",
  },
  userRole: {
    fontSize: "0.8rem",
    color: "#cbd5e1",
    background: "rgba(30, 41, 59, 0.5)",
    padding: "4px 8px",
    borderRadius: "12px",
  },
  nav: {
    flex: 1,
    padding: "16px 0",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  link: {
    color: "#cbd5e1",
    textDecoration: "none",
    padding: "12px 16px",
    margin: "0 10px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "0.95rem",
    transition: "all 0.2s ease",
  },
  activeLink: {
    background: "linear-gradient(90deg, #4f46e5, #7c3aed)",
    color: "white",
    boxShadow: "0 4px 6px rgba(79, 70, 229, 0.3)",
  },
  icon: {
    fontSize: "1.2rem",
  },
  sidebarFooter: {
    padding: "16px",
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
  },
  stats: {
    display: "flex",
    justifyContent: "space-around",
    marginBottom: "16px",
  },
  statItem: {
    textAlign: "center",
  },
  statValue: {
    fontSize: "1.2rem",
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: "0.8rem",
    color: "#cbd5e1",
  },
  logoutButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    color: "#cbd5e1",
    textDecoration: "none",
    padding: "10px",
    borderRadius: "6px",
    background: "rgba(255, 255, 255, 0.05)",
    transition: "background 0.2s ease",
    border: "none",
    width: "100%",
    cursor: "pointer",
    fontSize: "0.95rem",
  },
  mainContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    transition: "margin-left 0.3s ease",
  },
  header: {
    background: "white",
    padding: "20px 30px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  headerLeft: {
    display: "flex",
    flexDirection: "column",
  },
  pageTitle: {
    fontSize: "1.8rem",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0 0 4px 0",
  },
  breadcrumb: {
    fontSize: "0.9rem",
    color: "#64748b",
  },
  breadcrumbSeparator: {
    margin: "0 8px",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    background: "#f1f5f9",
    borderRadius: "8px",
    padding: "8px 12px",
  },
  searchIcon: {
    marginRight: "8px",
    color: "#64748b",
  },
  searchInput: {
    border: "none",
    background: "transparent",
    outline: "none",
    fontSize: "0.9rem",
    minWidth: "200px",
  },
  headerIcons: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  iconButton: {
    background: "transparent",
    border: "none",
    fontSize: "1.2rem",
    cursor: "pointer",
    position: "relative",
    padding: "8px",
    borderRadius: "6px",
    transition: "background 0.2s ease",
  },
  notificationBadge: {
    position: "absolute",
    top: "0",
    right: "0",
    background: "#ef4444",
    color: "white",
    fontSize: "0.7rem",
    borderRadius: "50%",
    width: "16px",
    height: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  contentWrapper: {
    flex: 1,
    padding: "30px",
    overflowY: "auto",
  },
  footer: {
    background: "white",
    padding: "20px 30px",
    borderTop: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "0.9rem",
    color: "#64748b",
  },
  footerLinks: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  footerLink: {
    color: "#4f46e5",
    textDecoration: "none",
  },
  footerSeparator: {
    color: "#cbd5e1",
  },
  userDropdownContainer: {
    position: "relative",
  },
  userDropdownButton: {
    background: "linear-gradient(90deg, #4f46e5, #7c3aed)",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "600",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 4px rgba(79, 70, 229, 0.3)",
  },
  userDropdownMenu: {
    position: "absolute",
    top: "100%",
    right: "0",
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
    minWidth: "220px",
    zIndex: 1000,
    marginTop: "8px",
    overflow: "hidden",
  },
  userDropdownHeader: {
    padding: "12px 16px",
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
  },
  userDropdownName: {
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: "4px",
  },
  userDropdownRole: {
    fontSize: "0.8rem",
    color: "#64748b",
  },
  userDropdownItem: {
    padding: "12px 16px",
    cursor: "pointer",
    color: "#1e293b",
    fontSize: "0.9rem",
    transition: "background 0.2s ease",
    border: "none",
    background: "transparent",
    width: "100%",
    textAlign: "left",
  },
  userDropdownDivider: {
    height: "1px",
    background: "#e2e8f0",
    margin: "4px 0",
  },
};