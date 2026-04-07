/**
 * Registration form component
 */

import { useState, type FormEvent, type ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ApiError } from "../../services/api";

// Validation constants (must match backend)
const MIN_USERNAME_LENGTH = 3;
const MAX_USERNAME_LENGTH = 50;
const MIN_PASSWORD_LENGTH = 6;
const MAX_PASSWORD_BYTES = 72;
const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;

interface FieldErrors {
  username?: string;
  password?: string;
  confirmPassword?: string;
}

// Calculate UTF-8 byte length
function getByteLength(str: string): number {
  return new TextEncoder().encode(str).length;
}

// Validation functions
function validateUsername(username: string): string | undefined {
  if (!username) {
    return "Tên đăng nhập là bắt buộc";
  }
  if (username.length < MIN_USERNAME_LENGTH) {
    return `Tên đăng nhập phải có ít nhất ${MIN_USERNAME_LENGTH} ký tự`;
  }
  if (username.length > MAX_USERNAME_LENGTH) {
    return `Tên đăng nhập tối đa ${MAX_USERNAME_LENGTH} ký tự`;
  }
  if (!USERNAME_PATTERN.test(username)) {
    return "Tên đăng nhập chỉ chứa chữ cái, số, và dấu gạch dưới";
  }
  return undefined;
}

function validatePassword(password: string): string | undefined {
  if (!password) {
    return "Mật khẩu là bắt buộc";
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự`;
  }
  const byteLength = getByteLength(password);
  if (byteLength > MAX_PASSWORD_BYTES) {
    return `Mật khẩu quá dài (${byteLength}/${MAX_PASSWORD_BYTES} bytes). Vui lòng sử dụng mật khẩu ngắn hơn.`;
  }
  return undefined;
}

function validateConfirmPassword(
  password: string,
  confirmPassword: string,
): string | undefined {
  if (!confirmPassword) {
    return "Vui lòng xác nhận mật khẩu của bạn";
  }
  if (password !== confirmPassword) {
    return "Mật khẩu không khớp";
  }
  return undefined;
}

export function RegisterForm() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Validate all fields and return true if valid
  const validateForm = (): boolean => {
    const errors: FieldErrors = {
      username: validateUsername(username),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(password, confirmPassword),
    };
    setFieldErrors(errors);
    return !errors.username && !errors.password && !errors.confirmPassword;
  };

  // Handle field blur (validate on blur)
  const handleBlur = (field: keyof FieldErrors) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    const errors: FieldErrors = { ...fieldErrors };
    if (field === "username") {
      errors.username = validateUsername(username);
    } else if (field === "password") {
      errors.password = validatePassword(password);
      // Also revalidate confirm password if it was touched
      if (touched.confirmPassword) {
        errors.confirmPassword = validateConfirmPassword(
          password,
          confirmPassword,
        );
      }
    } else if (field === "confirmPassword") {
      errors.confirmPassword = validateConfirmPassword(
        password,
        confirmPassword,
      );
    }
    setFieldErrors(errors);
  };

  // Handle username change
  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    if (touched.username) {
      setFieldErrors((prev) => ({
        ...prev,
        username: validateUsername(value),
      }));
    }
  };

  // Handle password change
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (touched.password) {
      setFieldErrors((prev) => ({
        ...prev,
        password: validatePassword(value),
      }));
    }
    if (touched.confirmPassword && confirmPassword) {
      setFieldErrors((prev) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(value, confirmPassword),
      }));
    }
  };

  // Handle confirm password change
  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (touched.confirmPassword) {
      setFieldErrors((prev) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(password, value),
      }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Mark all fields as touched
    setTouched({ username: true, password: true, confirmPassword: true });

    // Validate all fields
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await register({ username, password });
      // Redirect to login with success message
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail);
      } else if (err instanceof Error) {
        if (
          err.message.includes("Failed to fetch") ||
          err.message.includes("NetworkError")
        ) {
          setError(
            "Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối của bạn.",
          );
        } else {
          setError("Lỗi bất ngờ. Vui lòng thử lại.");
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to get input class based on error state
  const getInputClass = (field: keyof FieldErrors) => {
    const hasError = touched[field] && fieldErrors[field];
    return `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-shadow ${
      hasError
        ? "border-red-300 focus:ring-red-200 focus:border-red-500"
        : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
    }`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start gap-2">
          <svg
            className="w-5 h-5 shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div>
        <label
          htmlFor="username"
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          Tên đăng nhập
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={handleUsernameChange}
          onBlur={() => handleBlur("username")}
          autoComplete="username"
          className={getInputClass("username")}
          placeholder="Chọn tên đăng nhập"
          aria-invalid={touched.username && !!fieldErrors.username}
          aria-describedby="username-error"
        />
        {touched.username && fieldErrors.username ? (
          <p id="username-error" className="mt-1 text-xs text-red-500">
            {fieldErrors.username}
          </p>
        ) : (
          <p className="mt-1 text-xs text-gray-500">
            3-50 ký tự, chữ cái, số, và dấu gạch dưới thôi
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          Mật khẩu
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={handlePasswordChange}
          onBlur={() => handleBlur("password")}
          autoComplete="new-password"
          className={getInputClass("password")}
          placeholder="Tạo mật khẩu"
          aria-invalid={touched.password && !!fieldErrors.password}
          aria-describedby="password-error"
        />
        {touched.password && fieldErrors.password ? (
          <p id="password-error" className="mt-1 text-xs text-red-500">
            {fieldErrors.password}
          </p>
        ) : (
          <p className="mt-1 text-xs text-gray-500">Tối thiểu 6 ký tự</p>
        )}
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          Xác nhận mật khẩu
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          onBlur={() => handleBlur("confirmPassword")}
          autoComplete="new-password"
          className={getInputClass("confirmPassword")}
          placeholder="Xác nhận mật khẩu của bạn"
          aria-invalid={
            touched.confirmPassword && !!fieldErrors.confirmPassword
          }
          aria-describedby="confirm-password-error"
        />
        {touched.confirmPassword && fieldErrors.confirmPassword && (
          <p id="confirm-password-error" className="mt-1 text-xs text-red-500">
            {fieldErrors.confirmPassword}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
      </button>

      <p className="text-center text-sm text-gray-600">
        Đã có tài khoản?{" "}
        <Link to="/login" className="text-blue-600 hover:underline font-medium">
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}
