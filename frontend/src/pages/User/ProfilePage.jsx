import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/supabaseClient";
import "../../assets/css/profile.css";

// ── Icons ────────────────────────────────────────────────────────────────────
const Icons = {
  ArrowLeft: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Mail: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  Phone: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.07 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  MapPin: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Edit: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Save: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  LogOut: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Shield: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Hash: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" />
    </svg>
  ),
  City: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="9" height="15" /><rect x="11" y="2" width="11" height="20" /><line x1="7" y1="12" x2="7" y2="12.01" /><line x1="7" y1="16" x2="7" y2="16.01" />
    </svg>
  ),
  Flag: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  ),
};

// ── Reusable Field Component ──────────────────────────────────────────────────
function Field({ label, icon, id, type = "text", placeholder, value, onChange, error, required, disabled }) {
  return (
    <div className="pp-field">
      <label className="pp-label" htmlFor={id}>
        {label}{required && <span className="pp-label-required">*</span>}
      </label>
      <div className={`pp-input-wrap ${disabled ? "disabled" : ""}`}>
        <span className="pp-input-icon">{icon}</span>
        <input
          id={id}
          className={`pp-input${error ? " pp-input-error" : ""}`}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      </div>
      {error && <p className="pp-error">{error}</p>}
    </div>
  );
}

// ── Main Page Component ───────────────────────────────────────────────────────
export default function ProfilePage() {
  const navigate = useNavigate();

  // ── States ──
  const [personal, setPersonal] = useState({ name: "", email: "", phone: "" });
  const [address, setAddress] = useState({ addressLine: "", city: "", state: "", pincode: "" });
  const [editPersonal, setEditPersonal] = useState(false);
  const [editAddress, setEditAddress] = useState(false);
  const [draftPersonal, setDraftPersonal] = useState({});
  const [draftAddress, setDraftAddress] = useState({});
  const [errorsP, setErrorsP] = useState({});
  const [errorsA, setErrorsA] = useState({});
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);

  // ── Fetch Data ──
  const fetchProfileData = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  try {
    // Fetch Personal Info using your 'name' field
    const { data: pData } = await supabase
      .from("users")
      .select("name, email, phone")
      .eq("user_id", user.id)
      .single();

    if (pData) {
      setPersonal({ name: pData.name, email: pData.email, phone: pData.phone });
    }

    // Fetch Address Info using your specific line 1 and line 2
    const { data: aData } = await supabase
      .from("address")
      .select("address_line1, address_line2, city, state, pincode, country")
      .eq("user_id", user.id)
      .single();

    if (aData) {
      setAddress({
        addressLine: aData.address_line1,
        addressLine2: aData.address_line2, // Added line 2
        city: aData.city,
        state: aData.state,
        pincode: aData.pincode,
        country: aData.country
      });
    }
  } catch (err) {
    console.error("Fetch Error:", err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchProfileData();
  }, []);

  // ── Helpers ──
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2700);
  };

  const initials = personal.name
    ? personal.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "??";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // ── Validation & Save Logic ──
  const validatePersonal = () => {
    const e = {};
    if (!draftPersonal.name?.trim()) e.name = "Name is required";
    if (!draftPersonal.phone?.trim()) e.phone = "Phone is required";
    else if (!/^\d{10}$/.test(draftPersonal.phone.replace(/\D/g, ""))) e.phone = "Valid 10-digit number required";
    setErrorsP(e);
    return !Object.keys(e).length;
  };

const savePersonal = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("users")
    .update({ 
      name: draftPersonal.name, // Matches your 'name' field
      phone: draftPersonal.phone 
    })
    .eq("user_id", user.id);

  if (!error) {
    setPersonal({ ...draftPersonal });
    setEditPersonal(false);
    showToast("Saved!");
  }
};

  const validateAddress = () => {
    const e = {};
    if (!draftAddress.addressLine?.trim()) e.addressLine = "Address is required";
    if (!draftAddress.city?.trim()) e.city = "City is required";
    if (!draftAddress.state?.trim()) e.state = "State is required";
    if (!/^\d{6}$/.test(draftAddress.pincode)) e.pincode = "6-digit pincode required";
    setErrorsA(e);
    return !Object.keys(e).length;
  };
const saveAddress = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("address")
    .upsert({
      user_id: user.id,
      address_line1: draftAddress.addressLine,
      address_line2: draftAddress.addressLine2,
      city: draftAddress.city,
      state: draftAddress.state,
      pincode: draftAddress.pincode,
      country: "India" // Or draftAddress.country
    });

  if (!error) {
    setAddress({ ...draftAddress });
    setEditAddress(false);
    showToast("Address saved!");
  }
};
  if (loading) return <div className="pp-loader">Loading profile...</div>;

  return (
    <div className="pp-page">
      {/* Hero strip */}
      <div className="pp-hero">
        <button className="pp-back" onClick={() => navigate(-1)}>
          <Icons.ArrowLeft /> Back
        </button>

        <div className="pp-avatar-wrap">
          <div className="pp-avatar-ring" />
          <div className="pp-avatar">{initials}</div>
        </div>

        <div className="pp-hero-name">
          <h2>{personal.name || "Set your name"}</h2>
          <p>{personal.email}</p>
          <div className="pp-member-badge">
            <Icons.Shield /> Member
          </div>
        </div>
      </div>

      <div className="pp-card">
        {/* Personal Info */}
        <div className="pp-section">
          <div className="pp-section-header">
            <div className="pp-section-title-row">
              <div className="pp-section-icon"><Icons.User /></div>
              <span className="pp-section-title">Personal <em>Info</em></span>
            </div>
            {!editPersonal ? (
              <button className="pp-edit-btn" onClick={() => { setDraftPersonal(personal); setEditPersonal(true); }}>
                <Icons.Edit /> Edit
              </button>
            ) : (
              <div className="pp-action-row">
                <button className="pp-cancel-btn" onClick={() => setEditPersonal(false)}><Icons.X /> Cancel</button>
                <button className="pp-save-btn" onClick={savePersonal}><Icons.Save /> Save</button>
              </div>
            )}
          </div>

          {!editPersonal ? (
            <div className="pp-info-grid">
              <div className="pp-info-item"><span className="pp-info-label">Full Name</span><span className="pp-info-value">{personal.name || "Not set"}</span></div>
              <div className="pp-info-item"><span className="pp-info-label">Phone</span><span className="pp-info-value">{personal.phone || "Not set"}</span></div>
              <div className="pp-info-item" style={{ gridColumn: "1 / -1" }}><span className="pp-info-label">Email</span><span className="pp-info-value">{personal.email}</span></div>
            </div>
          ) : (
            <div className="pp-form-grid">
              <Field label="Full Name" required icon={<Icons.User />} id="p-name" value={draftPersonal.name} onChange={(v) => setDraftPersonal({ ...draftPersonal, name: v })} error={errorsP.name} />
              <Field label="Phone" required icon={<Icons.Phone />} id="p-phone" value={draftPersonal.phone} onChange={(v) => setDraftPersonal({ ...draftPersonal, phone: v })} error={errorsP.phone} />
              <Field label="Email" icon={<Icons.Mail />} id="p-email" value={personal.email} disabled />
            </div>
          )}
        </div>

        {/* Delivery Address */}
        <div className="pp-section">
          <div className="pp-section-header">
            <div className="pp-section-title-row">
              <div className="pp-section-icon"><Icons.MapPin /></div>
              <span className="pp-section-title">Delivery <em>Address</em></span>
            </div>
            {!editAddress ? (
              <button className="pp-edit-btn" onClick={() => { setDraftAddress(address); setEditAddress(true); }}>
                <Icons.Edit /> Edit
              </button>
            ) : (
              <div className="pp-action-row">
                <button className="pp-cancel-btn" onClick={() => setEditAddress(false)}><Icons.X /> Cancel</button>
                <button className="pp-save-btn" onClick={saveAddress}><Icons.Save /> Save</button>
              </div>
            )}
          </div>

          {!editAddress ? (
            <div className="pp-info-grid single">
              <div className="pp-info-item"><span className="pp-info-label">Address</span><span className="pp-info-value">{address.addressLine || "Not set"}</span></div>
              <div className="pp-info-grid" style={{ marginTop: 12 }}>
                <div className="pp-info-item"><span className="pp-info-label">City</span><span className="pp-info-value">{address.city || "Not set"}</span></div>
                <div className="pp-info-item"><span className="pp-info-label">State</span><span className="pp-info-value">{address.state || "Not set"}</span></div>
                <div className="pp-info-item"><span className="pp-info-label">Pincode</span><span className="pp-info-value">{address.pincode || "Not set"}</span></div>
              </div>
            </div>
          ) : (
            <div className="pp-form-grid single">
              <Field label="Address Line" required icon={<Icons.MapPin />} id="a-line" value={draftAddress.addressLine} onChange={(v) => setDraftAddress({ ...draftAddress, addressLine: v })} error={errorsA.addressLine} />
              <div className="pp-form-grid">
                <Field label="City" required icon={<Icons.City />} id="a-city" value={draftAddress.city} onChange={(v) => setDraftAddress({ ...draftAddress, city: v })} error={errorsA.city} />
                <Field label="State" required icon={<Icons.Flag />} id="a-state" value={draftAddress.state} onChange={(v) => setDraftAddress({ ...draftAddress, state: v })} error={errorsA.state} />
                <Field label="Pincode" required icon={<Icons.Hash />} id="a-pin" value={draftAddress.pincode} onChange={(v) => setDraftAddress({ ...draftAddress, pincode: v })} error={errorsA.pincode} />
              </div>
            </div>
          )}
        </div>
      </div>

      <button className="pp-logout" onClick={handleLogout}>
        <Icons.LogOut /> Sign Out
      </button>

      {toast && <div className="pp-toast"><Icons.Save /> {toast}</div>}
    </div>
  );
}