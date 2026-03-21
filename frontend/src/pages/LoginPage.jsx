import { useState } from "react";
import "../assets/css/styles.css";
import { supabase } from "../supabase/supabaseClient";
import { useNavigate } from "react-router-dom";

// ── SVG Icons ────────────────────────────────────────────────────────────────
const Icon = {
  Bracelet: () => (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="9" stroke="white" strokeWidth="2.5" fill="none" />
      <circle cx="16" cy="7" r="2" fill="white" />
      <circle cx="23.2" cy="20.6" r="1.5" fill="white" />
      <circle cx="8.8" cy="20.6" r="1.5" fill="white" />
    </svg>
  ),
  Email: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
  Lock: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  User: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Phone: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.07 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  Check: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f4a89a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
};

// ── Gold speckle positions (static decorative dots) ──────────────────────────
const SPECKLES = [
  { top: "8%",  left: "6%",  w: 5, h: 5 },
  { top: "14%", left: "88%", w: 4, h: 4 },
  { top: "4%",  left: "72%", w: 3, h: 3 },
  { top: "82%", left: "4%",  w: 4, h: 4 },
  { top: "90%", left: "91%", w: 6, h: 6 },
  { top: "76%", left: "80%", w: 3, h: 3 },
  { top: "55%", left: "96%", w: 4, h: 4 },
  { top: "38%", left: "2%",  w: 3, h: 3 },
];

// ── Reusable Field Component ─────────────────────────────────────────────────
const Field = ({ label, icon, id, type = "text", placeholder, value, onChange, error }) => (
  <div className="tuc-field">
    <label className="tuc-label" htmlFor={id}>{label}</label>
    <div className="tuc-input-wrap">
      <span className="tuc-input-icon">{icon}</span>
      <input
        id={id}
        className="tuc-input"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
      />
    </div>
    {error && <p className="tuc-error">{error}</p>}
  </div>
);

// ── Main Component ───────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate()
  const [view, setView] = useState("login"); // login | signup | forgot | forgotSent

  // Login state
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginErrors, setLoginErrors] = useState({});

  // Signup state
  const [signupData, setSignupData] = useState({
    name: "", email: "", password: "", confirmPassword: "", phone: "",
  });
  const [signupErrors, setSignupErrors] = useState({});

  // Forgot state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotError, setForgotError] = useState("");

  // ── Validators ────────────────────────────────────────────────────────────
  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const validatePhone  = (p) => /^[6-9]\d{9}$/.test(p.replace(/\D/g, ""));

  const validateLogin = () => {
    const errs = {};
    if (!loginData.email) errs.email = "Email is required";
    else if (!validateEmail(loginData.email)) errs.email = "Enter a valid email";
    if (!loginData.password) errs.password = "Password is required";
    else if (loginData.password.length < 6) errs.password = "Min 6 characters";
    setLoginErrors(errs);
    return !Object.keys(errs).length;
  };

  const validateSignup = () => {
    const errs = {};
    if (!signupData.name.trim()) errs.name = "Name is required";
    if (!signupData.email) errs.email = "Email is required";
    else if (!validateEmail(signupData.email)) errs.email = "Enter a valid email";
    if (!signupData.password) errs.password = "Password is required";
    else if (signupData.password.length < 6) errs.password = "Min 6 characters";
    if (!signupData.confirmPassword) errs.confirmPassword = "Please confirm password";
    else if (signupData.password !== signupData.confirmPassword) errs.confirmPassword = "Passwords don't match";
    if (!signupData.phone) errs.phone = "Phone is required";
    else if (!validatePhone(signupData.phone)) errs.phone = "Enter a valid 10-digit mobile number";
    setSignupErrors(errs);
    return !Object.keys(errs).length;
  };

// backend connection for login
const handleLoginSubmit = async () => {
  if (validateLogin()) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginData.email,
      password: loginData.password
    });

    if (error) {
      alert(error.message);
    } else {
      // Fetch user profile from public users table
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (profileError) {
        alert(profileError.message);
        return;
      }

      // Check if blocked
      if (profile.is_blocked) {
        alert("You are blocked by admin");
        await supabase.auth.signOut();
        return;
      }
      navigate("/dashboard");
    }
  }
};

// backend connection for signup
 const handleSignupSubmit = async () => {
  if (validateSignup()) {
    const { data, error } = await supabase.auth.signUp({
      email: signupData.email,
      password: signupData.password
    });

    if (error) {
      alert(error.message);
    } else {
      const user = data.user;

      // Insert into public users table
      const { error: insertError } = await supabase
        .from("users")
        .insert([
          {
            user_id: user.id,
            name: signupData.name,
            email: signupData.email,
            phone: signupData.phone,
            role: "customer",
            avatar_url: "",
            is_blocked: false,
          }
        ]);

      if (insertError) {
        alert(insertError.message);
      } else {
        navigate("/login");
      }
    }
  }
};
// backend connection to forgot password...
  const handleForgot = () => {
    if (!forgotEmail) { setForgotError("Please enter your email"); return; }
    if (!validateEmail(forgotEmail)) { setForgotError("Enter a valid email"); return; }
    setForgotError("");
    setView("forgotSent");
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="tuc-root">
      <div className="tuc-card">

        {/* Gold speckle decoration */}
        <div className="tuc-speckles">
          {SPECKLES.map((s, i) => (
            <div
              key={i}
              className="speck"
              style={{ top: s.top, left: s.left, width: s.w, height: s.h }}
            />
          ))}
        </div>

        {/* ── Logo ── */}
        <div className="tuc-logo">
          <div className="tuc-logo-blob">
            <Icon.Bracelet />
          </div>
          <div className="tuc-brand">TIED UP <span>with</span> CREATIVITY</div>
          <div className="tuc-tagline">Made to make you smile</div>
        </div>

        {/* ── FORGOT PASSWORD SENT ─────────────────────────────────────────── */}
        {view === "forgotSent" && (
          <div className="tuc-success">
            <div className="tuc-success-icon"><Icon.Check /></div>
            <h2 className="tuc-form-title">Check your <em>inbox</em></h2>
            <p>We've sent a password reset link to<br /><strong>{forgotEmail}</strong></p>
            <button
              className="tuc-btn"
              style={{ marginTop: 24 }}
              onClick={() => setView("login")}
            >
              Back to Sign In
            </button>
          </div>
        )}

        {/* ── FORGOT PASSWORD ──────────────────────────────────────────────── */}
        {view === "forgot" && (
          <div className="tuc-forgot-panel">
            <h2 className="tuc-form-title">Forgot <em>Password?</em></h2>
            <p>Enter your email and we'll send you a link to reset your password.</p>
            <Field
              label="Email Address"
              icon={<Icon.Email />}
              id="forgot-email"
              type="email"
              placeholder="you@example.com"
              value={forgotEmail}
              onChange={setForgotEmail}
              error={forgotError}
            />
            <button className="tuc-btn" onClick={handleForgot}>Send Reset Link</button>
            <br />
            <button className="tuc-back-btn" onClick={() => setView("login")}>← Back to Sign In</button>
          </div>
        )}

        {/* ── LOGIN / SIGNUP TABS ──────────────────────────────────────────── */}
        {(view === "login" || view === "signup") && (
          <>
            <div className="tuc-tabs">
              <button
                className={`tuc-tab${view === "login" ? " active" : ""}`}
                onClick={() => setView("login")}
              >
                Sign In
              </button>
              <button
                className={`tuc-tab${view === "signup" ? " active" : ""}`}
                onClick={() => setView("signup")}
              >
                Create Account
              </button>
            </div>

            {/* ── LOGIN FORM ── */}
            {view === "login" && (
              <>
                <h2 className="tuc-form-title">Welcome <em>back</em></h2>

                <Field
                  label="Email Address"
                  icon={<Icon.Email />}
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={loginData.email}
                  onChange={(v) => setLoginData({ ...loginData, email: v })}
                  error={loginErrors.email}
                />

                <Field
                  label="Password"
                  icon={<Icon.Lock />}
                  id="login-pwd"
                  type="password"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={(v) => setLoginData({ ...loginData, password: v })}
                  error={loginErrors.password}
                />

                <div className="tuc-forgot">
                  <button className="tuc-link" onClick={() => setView("forgot")}>
                    Forgot password?
                  </button>
                </div>

                <button className="tuc-btn" onClick={handleLoginSubmit}>Sign In</button>

                <div className="tuc-divider">or</div>

                <p style={{ textAlign: "center", fontSize: 13, color: "var(--ink-mid)" }}>
                  New here?&nbsp;
                  <button className="tuc-link" onClick={() => setView("signup")}>
                    Create a free account →
                  </button>
                </p>
              </>
            )}

            {/* ── SIGNUP FORM ── */}
            {view === "signup" && (
              <>
                <h2 className="tuc-form-title">Join the <em>family</em></h2>

                <Field
                  label="Full Name"
                  icon={<Icon.User />}
                  id="su-name"
                  placeholder="Priya Sharma"
                  value={signupData.name}
                  onChange={(v) => setSignupData({ ...signupData, name: v })}
                  error={signupErrors.name}
                />

                <Field
                  label="Email Address"
                  icon={<Icon.Email />}
                  id="su-email"
                  type="email"
                  placeholder="you@example.com"
                  value={signupData.email}
                  onChange={(v) => setSignupData({ ...signupData, email: v })}
                  error={signupErrors.email}
                />

                <Field
                  label="Phone Number"
                  icon={<Icon.Phone />}
                  id="su-phone"
                  type="tel"
                  placeholder="98765 43210"
                  value={signupData.phone}
                  onChange={(v) => setSignupData({ ...signupData, phone: v })}
                  error={signupErrors.phone}
                />

                <div className="tuc-row">
                  <Field
                    label="Password"
                    icon={<Icon.Lock />}
                    id="su-pwd"
                    type="password"
                    placeholder="Min 6 chars"
                    value={signupData.password}
                    onChange={(v) => setSignupData({ ...signupData, password: v })}
                    error={signupErrors.password}
                  />
                  <Field
                    label="Confirm Password"
                    icon={<Icon.Lock />}
                    id="su-cpwd"
                    type="password"
                    placeholder="Repeat"
                    value={signupData.confirmPassword}
                    onChange={(v) => setSignupData({ ...signupData, confirmPassword: v })}
                    error={signupErrors.confirmPassword}
                  />
                </div>

                <button className="tuc-btn" onClick={handleSignupSubmit}>
                  Create My Account
                </button>

                <div className="tuc-divider">or</div>

                <p style={{ textAlign: "center", fontSize: 13, color: "var(--ink-mid)" }}>
                  Already have an account?&nbsp;
                  <button className="tuc-link" onClick={() => setView("login")}>
                    Sign in →
                  </button>
                </p>
              </>
            )}
          </>
        )}

      </div>
    </div>
  );
}