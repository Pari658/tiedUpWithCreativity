import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchApi, ApiError, setAccessToken } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import "../assets/css/styles.css";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const { refetchUser } = useAuth();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [resendMsg, setResendMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef([]);

  // Redirect if no email provided
  useEffect(() => {
    if (!email) navigate("/login");
  }, [email, navigate]);

  // Cooldown timer for resend button
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || "";
    }
    setOtp(newOtp);

    // Focus the next empty field, or the last one
    const nextEmpty = newOtp.findIndex((d) => !d);
    inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter the full 6-digit code");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await fetchApi("/api/auth/verify-email", {
        method: "POST",
        body: JSON.stringify({ email, code }),
      });
      setAccessToken(data.accessToken);
      await refetchUser();
      navigate("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setResendMsg("");
    setError("");
    try {
      await fetchApi("/api/auth/resend-otp", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setResendMsg("A new code has been sent to your email!");
      setCooldown(60);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Could not resend code. Please try again.");
      }
    }
  };

  return (
    <div className="tuc-root">
      <div className="tuc-card" style={{ maxWidth: 440 }}>
        {/* Logo */}
        <div className="tuc-logo">
          <div className="tuc-logo-blob">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="9" stroke="white" strokeWidth="2.5" fill="none" />
              <circle cx="16" cy="7" r="2" fill="white" />
              <circle cx="23.2" cy="20.6" r="1.5" fill="white" />
              <circle cx="8.8" cy="20.6" r="1.5" fill="white" />
            </svg>
          </div>
          <div className="tuc-brand">
            TIED UP <span>with</span> CREATIVITY
          </div>
        </div>

        <h2 className="tuc-form-title">
          Verify your <em>email</em>
        </h2>

        <p style={{ textAlign: "center", color: "var(--ink-mid)", fontSize: 14, margin: "0 0 24px" }}>
          We sent a 6-digit code to<br />
          <strong style={{ color: "var(--ink)" }}>{email}</strong>
        </p>

        {/* OTP inputs */}
        <div style={{
          display: "flex",
          gap: 10,
          justifyContent: "center",
          marginBottom: 20,
        }}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              className="tuc-input"
              style={{
                width: 48,
                height: 56,
                textAlign: "center",
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: 0,
                padding: 0,
                borderRadius: 12,
                caretColor: "var(--accent)",
              }}
            />
          ))}
        </div>

        {error && <p className="tuc-error" style={{ textAlign: "center", marginBottom: 12 }}>{error}</p>}
        {resendMsg && (
          <p style={{ textAlign: "center", color: "#4caf50", fontSize: 13, marginBottom: 12 }}>
            {resendMsg}
          </p>
        )}

        <button className="tuc-btn" onClick={handleVerify} disabled={loading}>
          {loading ? "Verifying…" : "Verify Email"}
        </button>

        <p style={{ textAlign: "center", fontSize: 13, color: "var(--ink-mid)", marginTop: 20 }}>
          Didn't receive the code?{" "}
          <button
            className="tuc-link"
            onClick={handleResend}
            disabled={cooldown > 0}
            style={cooldown > 0 ? { opacity: 0.5, cursor: "default" } : {}}
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
          </button>
        </p>

        <button
          className="tuc-back-btn"
          onClick={() => navigate("/login")}
          style={{ marginTop: 12 }}
        >
          ← Back to Sign In
        </button>
      </div>
    </div>
  );
}
