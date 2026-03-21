import { useState , useEffect } from "react";
import "../../assets/css/Admin.css";
import { supabase } from "../../supabase/supabaseClient";

// ── Max lengths ──────────────────────────────────────────────────────────────
const NAME_MAX = 40;
const DESC_MAX = 200;

// ── Slug generator ───────────────────────────────────────────────────────────
const toSlug = (str) =>
  str.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

// ── Icons ────────────────────────────────────────────────────────────────────
const Icons = {
  Folder: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Tag: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  ),
  AlignLeft: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="17" y1="10" x2="3" y2="10" />
      <line x1="21" y1="6"  x2="3" y2="6"  />
      <line x1="21" y1="14" x2="3" y2="14" />
      <line x1="17" y1="18" x2="3" y2="18" />
    </svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  RotateCcw: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 .49-4.95" />
    </svg>
  ),
  AlertCircle: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Trash: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  ),
  Eye: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  List: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6"  x2="21" y2="6"  />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6"  x2="3.01" y2="6"  />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
};

// ── AddCategory Component ────────────────────────────────────────────────────
export default function AddCategory() {
  // Form state
  const [name, setName]         = useState("");
  const [desc, setDesc]         = useState("");
  const [active, setActive]     = useState(true);
  const [errors, setErrors]     = useState({});
  const [showToast, setShowToast] = useState(false);

  // Saved categories list
  const [categories, setCategories] = useState([]);

  // fetch categories function... backend...
  const fetchCategories = async () => {
  const { data, error } = await supabase
    .from("category")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.log("Error fetching:", error.message);
  } else {
    setCategories(data);
  }
};

useEffect(() => {
  fetchCategories();
}, []);


  // ── Validate ───────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!name.trim()) {
      errs.name = "Category name is required";
    } else if (name.trim().length < 2) {
      errs.name = "Name must be at least 2 characters";
    } else if (categories.some((c) => c.name.toLowerCase() === name.trim().toLowerCase())) {
      errs.name = "A category with this name already exists";
    }
    if (desc.trim() && desc.trim().length < 10) {
      errs.desc = "Description should be at least 10 characters";
    }
    setErrors(errs);
    return !Object.keys(errs).length;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
const handleSubmit = async () => {
  if (!validate()) return;

  const { data, error } = await supabase
    .from("category")
    .insert([
      {
        name: name.trim(),
        description: desc.trim(),
      },
    ]);

  if (error) {
    alert("Error: " + error.message);
    return;
  }

  fetchCategories();   // reload list from DB
  handleReset();

  setShowToast(true);
  setTimeout(() => setShowToast(false), 3200);
};

  // ── Reset ──────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setName("");
    setDesc("");
    setActive(true);
    setErrors({});
  };

  // ── Delete category ────────────────────────────────────────────────────────
 const handleDelete = async (id) => {
  const { error } = await supabase
    .from("category")
    .delete()
    .eq("category_id", id);

  if (error) {
    alert("Delete failed");
  } else {
    fetchCategories();
  }
};

  // ── Derived ───────────────────────────────────────────────────────────────
  const slug        = name.trim() ? toSlug(name) : "category-slug";
  const descWarn    = desc.length > DESC_MAX * 0.85;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="cat-page">
      <div className="cat-grid">

        {/* ══ LEFT: Form ══════════════════════════════════════════════════════ */}
        <div className="cat-card">
          <div className="cat-card-header">
            <div className="cat-card-icon">
              <Icons.Folder />
            </div>
            <div>
              <div className="cat-card-heading">Add <em>Category</em></div>
              <div className="cat-card-sub">Organise your jewellery into collections</div>
            </div>
          </div>

          <div className="cat-card-body">

            {/* ── Category Name ── */}
            <div className="cat-field">
              <label className="cat-label" htmlFor="cat-name">
                Category Name <span className="cat-label-required">*</span>
              </label>
              <div className="cat-input-wrap">
                <span className="cat-input-icon"><Icons.Tag /></span>
                <input
                  id="cat-name"
                  className="cat-input"
                  type="text"
                  placeholder="e.g. Bracelets, Anklets, Gift Sets…"
                  value={name}
                  maxLength={NAME_MAX}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((p) => ({ ...p, name: "" }));
                  }}
                />
                <span className="cat-char-count">{name.length}/{NAME_MAX}</span>
              </div>
              {errors.name && (
                <p className="cat-error">
                  <Icons.AlertCircle /> {errors.name}
                </p>
              )}
            </div>

            {/* ── Description ── */}
            <div className="cat-field">
              <label className="cat-label" htmlFor="cat-desc">
                Description
              </label>
              <div className="cat-textarea-wrap">
                <span className="cat-textarea-icon"><Icons.AlignLeft /></span>
                <textarea
                  id="cat-desc"
                  className="cat-textarea"
                  placeholder="Describe this category in a few words — shown to shoppers browsing your store…"
                  value={desc}
                  maxLength={DESC_MAX}
                  onChange={(e) => {
                    setDesc(e.target.value);
                    if (errors.desc) setErrors((p) => ({ ...p, desc: "" }));
                  }}
                />
              </div>
              <div className="cat-textarea-footer">
                <span className={`cat-textarea-count${descWarn ? " warn" : ""}`}>
                  {desc.length} / {DESC_MAX}
                </span>
              </div>
              {errors.desc && (
                <p className="cat-error">
                  <Icons.AlertCircle /> {errors.desc}
                </p>
              )}
            </div>

            {/* ── Status toggle ── */}
            <div className="cat-status-row">
              <div className="cat-status-info">
                <span className="cat-status-label">Publish Category</span>
                <span className="cat-status-desc">
                  {active ? "Visible to customers in your store" : "Hidden — not shown to customers"}
                </span>
              </div>
              <label className="cat-toggle">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                />
                <span className="cat-toggle-track" />
                <span className="cat-toggle-thumb" />
              </label>
            </div>

            {/* ── Actions ── */}
            <div className="cat-actions">
              <button className="cat-btn-primary" onClick={handleSubmit}>
                <Icons.Plus /> Save Category
              </button>
              <button className="cat-btn-reset" onClick={handleReset}>
                <Icons.RotateCcw /> Reset
              </button>
            </div>

          </div>
        </div>

        {/* ══ RIGHT: Preview + List ════════════════════════════════════════════ */}
        <div>

         
          {/* Saved categories list */}
          <div className="cat-card cat-list-card">
            <div className="cat-card-header">
              <div className="cat-card-icon">
                <Icons.List />
              </div>
              <div>
                <div className="cat-card-heading">
                  All <em>Categories</em>
                </div>
                <div className="cat-card-sub">{categories.length} total</div>
              </div>
            </div>

            {categories.length === 0 ? (
              <div className="cat-list-empty">
                <div className="cat-list-empty-icon"><Icons.Folder /></div>
                <p>No categories yet — add your first one!</p>
              </div>
            ) : (
              <ul className="cat-list">
                {categories.map((cat) => (
                  <li key={cat.category_id} className="cat-list-item">
                    <div className="cat-list-avatar">
                      {cat.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="cat-list-info">
                      <div className="cat-list-name">{cat.name}</div>
                      <div className="cat-list-desc">
                        {cat.desc || <em>No description</em>}
                      </div>
                    </div>
                    <span className={`cat-list-status ${cat.active ? "active" : "inactive"}`} />
                    <button
                      className="cat-list-delete"
                      onClick={() => handleDelete(cat.category_id)}
                      aria-label={`Delete ${cat.name}`}
                    >
                      <Icons.Trash />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>
      </div>

      {/* ── Success toast ── */}
      {showToast && (
        <div className="cat-toast">
          <div className="cat-toast-icon"><Icons.Check /></div>
          <div>
            <div className="cat-toast-title">Category saved!</div>
            <div className="cat-toast-sub">"{name || "New category"}" was added successfully.</div>
          </div>
        </div>
      )}
    </div>
  );
}