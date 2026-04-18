import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function MaintenancePage() {
  const [countdown, setCountdown] = useState(48); // 48 hours
  const [progress, setProgress] = useState(65); // Progress percentage

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 0.0002778; // Decrease by 1 second (1/3600 hours)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Simulate progress updates
  useEffect(() => {
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + (Math.random() * 0.5); // Slow random progress
      });
    }, 3000);

    return () => clearInterval(progressTimer);
  }, []);

  const formatTime = (hours) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    const s = Math.floor(((hours - h) * 60 - m) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Styles với CSS inline cho animation
  const floatingShapeStyle = (index) => ({
    position: "absolute",
    background: "rgba(255, 255, 255, 0.1)",
    borderRadius: "50%",
    width: `${Math.random() * 100 + 50}px`,
    height: `${Math.random() * 100 + 50}px`,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    animation: `float ${15 + Math.random() * 20}s infinite ease-in-out`,
    animationDelay: `${Math.random() * 5}s`,
  });

  return (
    <div style={styles.container}>
      {/* Thêm style tag cho animation keyframes */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
          }
          
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}
      </style>

      {/* Animated Background */}
      <div style={styles.background}>
        {[...Array(20)].map((_, i) => (
          <div key={i} style={floatingShapeStyle(i)}></div>
        ))}
      </div>

      <div style={styles.content}>
        {/* Logo/Header */}
        <div style={styles.header}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>⚙️</span>
            <span style={styles.logoText}>ADMIN PANEL</span>
          </div>
          <Link to="/" style={styles.homeLink}>
            ← Về trang chủ
          </Link>
        </div>

        {/* Main Content */}
        <div style={styles.main}>
          <div style={styles.iconContainer}>
            <div style={{
              position: "relative",
              width: "120px",
              height: "120px",
            }}>
              <span style={{
                position: "absolute",
                fontSize: "4rem",
                animation: "bounce 2s infinite ease-in-out",
              }}>🔧</span>
              <span style={{
                position: "absolute",
                fontSize: "3rem",
                top: "10px",
                left: "60px",
                animation: "spin 4s infinite linear",
              }}>⚙️</span>
              <span style={{
                position: "absolute",
                fontSize: "3.5rem",
                top: "60px",
                left: "10px",
                animation: "pulse 3s infinite ease-in-out",
              }}>🖥️</span>
            </div>
          </div>

          <h1 style={styles.title}>
            Hệ Thống Đang Được <span style={styles.highlight}>Bảo Trì & Nâng Cấp</span>
          </h1>

          <p style={styles.description}>
            Chúng tôi đang thực hiện các cải tiến quan trọng để mang đến trải nghiệm tốt hơn cho bạn.
            Hệ thống sẽ trở lại trong thời gian sớm nhất.
          </p>

          {/* Progress Section */}
          <div style={styles.progressSection}>
            <div style={styles.progressHeader}>
              <span>Tiến độ nâng cấp</span>
              <span style={styles.percentage}>{progress.toFixed(1)}%</span>
            </div>
            <div style={styles.progressBar}>
              <div 
                style={{
                  ...styles.progressFill,
                  width: `${progress}%`,
                }}
              >
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                  animation: "shimmer 2s infinite",
                }}></div>
              </div>
            </div>
            <div style={styles.progressLabels}>
              <span>Bắt đầu</span>
              <span>Hoàn thành</span>
            </div>
          </div>

          {/* Countdown Timer */}
          <div style={styles.countdownSection}>
            <div style={styles.countdownTitle}>
              ⏱️ Thời gian dự kiến hoàn thành
            </div>
            <div style={styles.countdownTimer}>
              {formatTime(countdown)}
            </div>
            <div style={styles.countdownLabel}>
              Giờ : Phút : Giây
            </div>
          </div>

          {/* Status Cards */}
          <div style={styles.statusGrid}>
            <div style={styles.statusCard}>
              <div style={styles.statusIcon}>✅</div>
              <h3 style={styles.statusTitle}>Database</h3>
              <p style={styles.statusText}>Đang di chuyển dữ liệu</p>
              <div style={styles.statusBadgeActive}>Đang thực hiện</div>
            </div>

            <div style={styles.statusCard}>
              <div style={styles.statusIcon}>⚡</div>
              <h3 style={styles.statusTitle}>Backend API</h3>
              <p style={styles.statusText}>Nâng cấp phiên bản mới</p>
              <div style={styles.statusBadgeCompleted}>Hoàn thành</div>
            </div>

            <div style={styles.statusCard}>
              <div style={styles.statusIcon}>🎨</div>
              <h3 style={styles.statusTitle}>Giao diện</h3>
              <p style={styles.statusText}>Tối ưu hóa trải nghiệm</p>
              <div style={styles.statusBadgeActive}>Đang thực hiện</div>
            </div>

            <div style={styles.statusCard}>
              <div style={styles.statusIcon}>🔒</div>
              <h3 style={styles.statusTitle}>Bảo mật</h3>
              <p style={styles.statusText}>Cập nhật hệ thống bảo mật</p>
              <div style={styles.statusBadgePending}>Sắp bắt đầu</div>
            </div>
          </div>

          {/* Contact Information */}
          <div style={styles.contactSection}>
            <h3 style={styles.contactTitle}>📞 Cần hỗ trợ khẩn cấp?</h3>
            <div style={styles.contactInfo}>
              <div style={styles.contactItem}>
                <span style={styles.contactIcon}>📧</span>
                <span>support@company.com</span>
              </div>
              <div style={styles.contactItem}>
                <span style={styles.contactIcon}>📱</span>
                <span>Hotline: 1900 1234</span>
              </div>
              <div style={styles.contactItem}>
                <span style={styles.contactIcon}>🕒</span>
                <span>Hỗ trợ 24/7 trong quá trình bảo trì</span>
              </div>
            </div>
          </div>

          {/* Updates */}
          <div style={styles.updatesSection}>
            <h3 style={styles.updatesTitle}>📢 Cập nhật mới nhất</h3>
            <div style={styles.updatesList}>
              <div style={styles.updateItem}>
                <div style={styles.updateTime}>10:30 AM</div>
                <div style={styles.updateText}>Đã hoàn thành di chuyển cơ sở dữ liệu người dùng</div>
              </div>
              <div style={styles.updateItem}>
                <div style={styles.updateTime}>09:15 AM</div>
                <div style={styles.updateText}>Bắt đầu tối ưu hóa hệ thống lưu trữ</div>
              </div>
              <div style={styles.updateItem}>
                <div style={styles.updateTime}>08:00 AM</div>
                <div style={styles.updateText}>Bắt đầu quá trình bảo trì hệ thống</div>
              </div>
            </div>
            <button style={styles.refreshButton}>
              🔄 Cập nhật trạng thái
            </button>
          </div>

          {/* Social/Notification */}
          <div style={styles.notification}>
            <p style={styles.notificationText}>
              Chúng tôi sẽ thông báo ngay khi hệ thống hoạt động trở lại.
              Cảm ơn sự kiên nhẫn của bạn!
            </p>
            <div style={styles.socialLinks}>
              <button style={styles.socialButton}>📱 Nhận thông báo</button>
              <button style={styles.socialButton}>📧 Theo dõi qua email</button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer style={styles.footer}>
          <p>© 2023 Admin Panel. All rights reserved.</p>
          <p style={styles.footerNote}>
            Hệ thống đang trong quá trình bảo trì theo kế hoạch định kỳ
          </p>
        </footer>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
  content: {
    position: "relative",
    zIndex: 10,
    minHeight: "100vh",
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 40px",
    borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  logoIcon: {
    fontSize: "2rem",
  },
  logoText: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    background: "linear-gradient(90deg, #667eea, #764ba2)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  homeLink: {
    color: "#667eea",
    textDecoration: "none",
    fontWeight: "500",
    padding: "8px 16px",
    borderRadius: "6px",
    border: "2px solid #667eea",
    transition: "all 0.3s ease",
    '&:hover': {
      background: "#667eea",
      color: "white",
    },
  },
  main: {
    flex: 1,
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "40px 20px",
    width: "100%",
  },
  iconContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "40px",
  },
  title: {
    fontSize: "3rem",
    fontWeight: "800",
    textAlign: "center",
    color: "#1a202c",
    marginBottom: "20px",
    lineHeight: "1.2",
  },
  highlight: {
    background: "linear-gradient(90deg, #667eea, #764ba2)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  description: {
    fontSize: "1.2rem",
    textAlign: "center",
    color: "#4a5568",
    maxWidth: "800px",
    margin: "0 auto 50px",
    lineHeight: "1.6",
  },
  progressSection: {
    background: "white",
    padding: "30px",
    borderRadius: "20px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
    marginBottom: "40px",
    maxWidth: "600px",
    margin: "0 auto 40px",
  },
  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#2d3748",
  },
  percentage: {
    color: "#667eea",
    fontWeight: "700",
    fontSize: "1.3rem",
  },
  progressBar: {
    height: "12px",
    background: "#e2e8f0",
    borderRadius: "6px",
    overflow: "hidden",
    marginBottom: "10px",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #667eea, #764ba2)",
    borderRadius: "6px",
    position: "relative",
    transition: "width 1s ease",
  },
  progressLabels: {
    display: "flex",
    justifyContent: "space-between",
    color: "#718096",
    fontSize: "0.9rem",
  },
  countdownSection: {
    textAlign: "center",
    marginBottom: "50px",
  },
  countdownTitle: {
    fontSize: "1.2rem",
    color: "#4a5568",
    marginBottom: "15px",
  },
  countdownTimer: {
    fontSize: "3.5rem",
    fontWeight: "bold",
    fontFamily: "'Courier New', monospace",
    background: "linear-gradient(90deg, #667eea, #764ba2)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "10px",
  },
  countdownLabel: {
    color: "#718096",
    fontSize: "0.9rem",
  },
  statusGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "25px",
    marginBottom: "50px",
  },
  statusCard: {
    background: "white",
    padding: "25px",
    borderRadius: "15px",
    boxShadow: "0 5px 20px rgba(0, 0, 0, 0.08)",
    textAlign: "center",
    transition: "transform 0.3s ease",
    '&:hover': {
      transform: "translateY(-5px)",
    },
  },
  statusIcon: {
    fontSize: "2.5rem",
    marginBottom: "15px",
  },
  statusTitle: {
    fontSize: "1.3rem",
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: "10px",
  },
  statusText: {
    color: "#718096",
    fontSize: "0.95rem",
    marginBottom: "15px",
  },
  statusBadgeActive: {
    display: "inline-block",
    padding: "6px 15px",
    background: "#bee3f8",
    color: "#2c5282",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: "600",
  },
  statusBadgeCompleted: {
    display: "inline-block",
    padding: "6px 15px",
    background: "#c6f6d5",
    color: "#276749",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: "600",
  },
  statusBadgePending: {
    display: "inline-block",
    padding: "6px 15px",
    background: "#fed7d7",
    color: "#c53030",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: "600",
  },
  contactSection: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    padding: "30px",
    borderRadius: "20px",
    marginBottom: "40px",
  },
  contactTitle: {
    fontSize: "1.5rem",
    marginBottom: "20px",
    textAlign: "center",
  },
  contactInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    maxWidth: "500px",
    margin: "0 auto",
  },
  contactItem: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    fontSize: "1.1rem",
  },
  contactIcon: {
    fontSize: "1.5rem",
  },
  updatesSection: {
    background: "white",
    padding: "30px",
    borderRadius: "20px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
    marginBottom: "40px",
  },
  updatesTitle: {
    fontSize: "1.5rem",
    marginBottom: "20px",
    color: "#2d3748",
  },
  updatesList: {
    marginBottom: "25px",
  },
  updateItem: {
    display: "flex",
    gap: "20px",
    padding: "15px 0",
    borderBottom: "1px solid #e2e8f0",
  },
  updateTime: {
    color: "#667eea",
    fontWeight: "600",
    minWidth: "80px",
  },
  updateText: {
    color: "#4a5568",
    flex: 1,
  },
  refreshButton: {
    background: "linear-gradient(90deg, #667eea, #764ba2)",
    color: "white",
    border: "none",
    padding: "12px 25px",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    display: "block",
    margin: "0 auto",
    transition: "transform 0.3s ease",
    '&:hover': {
      transform: "scale(1.05)",
    },
  },
  notification: {
    textAlign: "center",
    padding: "40px 20px",
  },
  notificationText: {
    fontSize: "1.1rem",
    color: "#4a5568",
    maxWidth: "600px",
    margin: "0 auto 30px",
    lineHeight: "1.6",
  },
  socialLinks: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    flexWrap: "wrap",
  },
  socialButton: {
    background: "white",
    color: "#667eea",
    border: "2px solid #667eea",
    padding: "12px 25px",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    '&:hover': {
      background: "#667eea",
      color: "white",
    },
  },
  footer: {
    textAlign: "center",
    padding: "30px 20px",
    borderTop: "1px solid #e2e8f0",
    color: "#718096",
    fontSize: "0.9rem",
  },
  footerNote: {
    marginTop: "10px",
    fontSize: "0.85rem",
    color: "#a0aec0",
  },
};