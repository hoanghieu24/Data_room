import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import {
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaSpinner,
} from "react-icons/fa";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const savedRememberMe = localStorage.getItem("rememberMe");
    const savedUser = localStorage.getItem("savedUsername");

    if (savedRememberMe === "true") {
      setRememberMe(true);
      if (savedUser) {
        setForm((prev) => ({
          ...prev,
          username: savedUser,
        }));
      }
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.username.trim() || !form.password.trim()) {
      setError("Vui lòng nhập đầy đủ thông tin đăng nhập");
      return;
    }

    setLoading(true);

    try {
      const response = await login(form);

      // Hỗ trợ cả 2 kiểu:
      // 1) login() trả thẳng data
      // 2) login() trả response có .data
      const data = response?.data || response;

      console.log("LOGIN RESPONSE:", data);

      if (!data?.token || !data?.user) {
        throw new Error("Dữ liệu đăng nhập trả về không hợp lệ");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
        localStorage.setItem("savedUsername", form.username);
      } else {
        localStorage.removeItem("rememberMe");
        localStorage.removeItem("savedUsername");
      }

      // Chuyển hướng ngay sau khi đăng nhập thành công
      navigate("/admin", { replace: true });
    } catch (err) {
      console.error("LOGIN ERROR:", err);

      setError(
        err?.response?.data?.msg ||
          err?.message ||
          "Đăng nhập thất bại. Vui lòng kiểm tra lại tên đăng nhập hoặc mật khẩu."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Chào mừng trở lại</h2>
          <p style={styles.subtitle}>Đăng nhập để tiếp tục quản trị</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.errorMessage}>{error}</div>}

          <div style={styles.inputGroup}>
            <FaUser style={styles.inputIcon} />
            <input
              type="text"
              name="username"
              placeholder="Tên đăng nhập"
              value={form.username}
              onChange={handleChange}
              style={styles.input}
              autoComplete="username"
            />
          </div>

          <div style={styles.inputGroup}>
            <FaLock style={styles.inputIcon} />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Mật khẩu"
              value={form.password}
              onChange={handleChange}
              style={styles.input}
              autoComplete="current-password"
            />
            <span
              style={styles.eyeIcon}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
              style={styles.checkbox}
            />
            <span>Ghi nhớ đăng nhập</span>
          </label>

          <button
            type="submit"
            style={
              loading
                ? { ...styles.button, ...styles.buttonDisabled }
                : styles.button
            }
            disabled={loading}
          >
            {loading ? (
              <>
                <FaSpinner style={styles.spinner} />
                Đang xử lý...
              </>
            ) : (
              "Đăng nhập"
            )}
          </button>
        </form>

        <div style={styles.footer}>
          <a href="#" style={styles.footerLink}>
            Quên mật khẩu?
          </a>
          <a href="#" style={styles.footerLink}>
            Liên hệ hỗ trợ
          </a>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #00ff37 0%, #329fde 100%)",
    padding: "1.5rem",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
  },

  card: {
    maxWidth: "440px",
    width: "100%",
    background: "#ffffff",
    borderRadius: "24px",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.06)",
    padding: "2rem 1.75rem",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },

  header: {
    textAlign: "center",
    marginBottom: "2rem",
  },

  title: {
    fontSize: "1.75rem",
    fontWeight: "700",
    color: "#1a202c",
    margin: "0 0 0.5rem 0",
    letterSpacing: "-0.3px",
  },

  subtitle: {
    fontSize: "0.9rem",
    color: "#718096",
    margin: 0,
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },

  inputGroup: {
    position: "relative",
    width: "100%",
  },

  inputIcon: {
    position: "absolute",
    left: "1rem",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#a0aec0",
    fontSize: "1rem",
    pointerEvents: "none",
  },

  input: {
    width: "100%",
    padding: "0.875rem 1rem 0.875rem 2.75rem",
    fontSize: "0.95rem",
    border: "1.5px solid #e2e8f0",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    transition: "all 0.2s ease",
    outline: "none",
    color: "#2d3748",
    boxSizing: "border-box",
  },

  eyeIcon: {
    position: "absolute",
    right: "1rem",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#a0aec0",
    cursor: "pointer",
    transition: "color 0.2s ease",
    display: "flex",
    alignItems: "center",
  },

  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    fontSize: "0.9rem",
    color: "#4a5568",
    cursor: "pointer",
    width: "fit-content",
  },

  checkbox: {
    width: "1rem",
    height: "1rem",
    cursor: "pointer",
    accentColor: "#667eea",
  },

  button: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    padding: "0.875rem",
    fontSize: "1rem",
    fontWeight: "600",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    marginTop: "0.5rem",
  },

  buttonDisabled: {
    opacity: 0.7,
    cursor: "not-allowed",
  },

  spinner: {
    animation: "spin 1s linear infinite",
  },

  errorMessage: {
    background: "#fed7d7",
    borderLeft: "4px solid #e53e3e",
    color: "#c53030",
    padding: "0.75rem 1rem",
    fontSize: "0.85rem",
    borderRadius: "10px",
    marginBottom: "0.25rem",
  },

  footer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "2rem",
    paddingTop: "0.5rem",
    borderTop: "1px solid #edf2f7",
  },

  footerLink: {
    fontSize: "0.8rem",
    color: "#718096",
    textDecoration: "none",
    transition: "color 0.2s ease",
  },
};

const cardHoverEffect = `
  .login-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }
  
  input:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
  
  .eye-icon:hover {
    color: #4a5568;
  }
  
  a:hover {
    color: #4a5568;
    text-decoration: underline;
  }
`;

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = cardHoverEffect;
  document.head.appendChild(styleSheet);
}

export default Login;
