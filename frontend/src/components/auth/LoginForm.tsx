/**
 * Login form component
 */

import { useState, type FormEvent, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ApiError } from "../../services/api";

interface LoginFormProps {
  onSuccess?: () => void;
}

interface FieldErrors {
  username?: string;
  password?: string;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Basic validation
  const validateForm = (): boolean => {
    const errors: FieldErrors = {};

    if (!username.trim()) {
      errors.username = "Tên đăng nhập là bắt buộc";
    }
    if (!password) {
      errors.password = "Mật khẩu là bắt buộc";
    }

    setFieldErrors(errors);
    return !errors.username && !errors.password;
  };

  const handleBlur = (field: keyof FieldErrors) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    const errors = { ...fieldErrors };
    if (field === "username" && !username.trim()) {
      errors.username = "Tên đăng nhập là bắt buộc";
    } else if (field === "username") {
      delete errors.username;
    }
    if (field === "password" && !password) {
      errors.password = "Mật khẩu là bắt buộc";
    } else if (field === "password") {
      delete errors.password;
    }
    setFieldErrors(errors);
  };

  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    if (touched.username) {
      if (!value.trim()) {
        setFieldErrors((prev) => ({
          ...prev,
          username: "Tên đăng nhập là bắt buộc",
        }));
      } else {
        setFieldErrors((prev) => ({ ...prev, username: undefined }));
      }
    }
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (touched.password) {
      if (!value) {
        setFieldErrors((prev) => ({
          ...prev,
          password: "Mật khẩu là bắt buộc",
        }));
      } else {
        setFieldErrors((prev) => ({ ...prev, password: undefined }));
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Mark all fields as touched
    setTouched({ username: true, password: true });

    // Validate
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await login({ username: username.trim(), password });
      onSuccess?.();
    } catch (err) {
      if (err instanceof ApiError) {
        // Customize message for common errors
        if (err.status === 401) {
          setError("Tên đăng nhập hoặc mật khẩu không chính xác");
        } else if (err.status === 400) {
          setError(err.detail);
        } else if (err.status >= 500) {
          setError("Lỗi máy chủ. Vui lòng thử lại sau.");
        } else {
          setError(err.detail);
        }
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
        setError("Lỗi bất ngờ. Vui lòng thử lại.");
      }
    } finally {
      setIsLoading(false);
    }
  };

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
          className="block text-sm font-medium text-gray-800 mb-1.5"
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
          placeholder="Nhập tên đăng nhập"
          aria-invalid={touched.username && !!fieldErrors.username}
          aria-describedby={fieldErrors.username ? "username-error" : undefined}
        />
        {touched.username && fieldErrors.username && (
          <p id="username-error" className="mt-1 text-xs text-red-500">
            {fieldErrors.username}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-800 mb-1.5"
        >
          Mật khẩu
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={handlePasswordChange}
          onBlur={() => handleBlur("password")}
          autoComplete="current-password"
          className={getInputClass("password")}
          placeholder="Nhập mật khẩu của bạn"
          aria-invalid={touched.password && !!fieldErrors.password}
          aria-describedby={fieldErrors.password ? "password-error" : undefined}
        />
        {touched.password && fieldErrors.password && (
          <p id="password-error" className="mt-1 text-xs text-red-500">
            {fieldErrors.password}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>

      <p className="text-center text-sm text-gray-600">
        Bạn chưa có tài khoản?{" "}
        <Link
          to="/register"
          className="text-blue-600 hover:underline font-medium"
        >
          Đăng ký
        </Link>
      </p>
    </form>
  );
}
