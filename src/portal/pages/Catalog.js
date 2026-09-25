import React, { useMemo, useState } from "react";
import { FaCubes, FaConciergeBell, FaPlus, FaEdit, FaTrash, FaSave } from "react-icons/fa";
import { api, qs, money } from "../api";
import { useAuth } from "../AuthContext";
import { Card, PageHeader, StatusBadge, DataTable, SearchBox, Segmented, useLoad, Notice, useToast } from "../ui";
import Modal from "../../commerce/Modal";

const empty = { name: "", section: "", category: "", description: "", price: "", isActive: true };

const Catalog = ({ kind }) => {
  const { user } = useAuth();
  const toast = useToast();
  const isProduct = kind === "product";
  const [search, setSearch] = useState("");
  const [section, setSection] = useState("");
  const { data, loading, error, reload } = useLoad(() => api(`/portal/catalog${qs({ kind, q: search })}`), [kind, search]);
  const [edit, setEdit] = useState(null); // item or {} for new
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [del, setDel] = useState(null);

  const rows = useMemo(() => (data?.rows || []).filter((r) => !section || r.section === section), [data, section]);
  const sections = useMemo(() => [...new Set((data?.rows || []).map((r) => r.section).filter(Boolean))], [data]);

  const open = (item) => {
    setEdit(item || {});
    setForm(item ? { ...empty, ...item, price: item.price ?? "" } : { ...empty, section: isProduct ? "Software Products" : section || "" });
  };
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      const body = { ...form, kind, price: form.price === "" ? null : Number(form.price) };
      if (edit.id) await api(`/portal/catalog/${edit.id}`, { method: "PUT", body });
      else await api("/portal/catalog", { method: "POST", body });
      toast(edit.id ? "Saved" : `${isProduct ? "Product" : "Service"} added`);
      setEdit(null);
      reload();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    try {
      await api(`/portal/catalog/${del.id}`, { method: "DELETE" });
      toast("Deleted");
      setDel(null);
      reload();
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const Icon = isProduct ? FaCubes : FaConciergeBell;
  const title = isProduct ? "Products" : "Services";

  return (
    <>
      <PageHeader
        icon={Icon}
        title={title}
        subtitle={`${isProduct ? "Software products" : "Services"} offered on the website. Set a price to fix the amount customers pay at checkout.`}
        actions={
          <button type="button" className="ix-btn ix-btn--primary" onClick={() => open(null)}>
            <FaPlus aria-hidden="true" /> Add {isProduct ? "product" : "service"}
          </button>
        }
      />
      <Notice tone="info">
        Items <strong>with a price</strong> are charged exactly that amount at checkout. Items without a price let the customer enter the amount you quoted.
      </Notice>
      <Card pad={false}>
        <div className="px-toolbar">
          <SearchBox value={search} onChange={setSearch} placeholder={`Search ${title.toLowerCase()}…`} />
          {!isProduct && sections.length > 1 && (
            <Segmented label="Section" options={[{ value: "", label: "All" }, ...sections.map((s) => ({ value: s, label: s }))]} value={section} onChange={setSection} />
          )}
        </div>
        <DataTable
          loading={loading}
          error={error}
          rows={rows}
          empty={`No ${title.toLowerCase()} yet.`}
          onRowClick={open}
          columns={[
            { key: "name", label: "Name", render: (r) => (<><strong>{r.name}</strong><div className="px-muted px-small px-clamp">{r.description}</div></>) },
            { key: "section", label: isProduct ? "Category" : "Section", render: (r) => (isProduct ? r.category : r.section) || "—" },
            { key: "price", label: "Price", align: "right", render: (r) => (r.price ? money(r.price) : <span className="px-muted">Quoted</span>) },
            { key: "isActive", label: "Status", render: (r) => <StatusBadge status={r.isActive ? "active" : "inactive"} /> },
            {
              key: "actions",
              label: "",
              align: "right",
              render: (r) => (
                <span className="px-rowactions" onClick={(e) => e.stopPropagation()} role="presentation">
                  <button type="button" className="px-iconbtn" aria-label={`Edit ${r.name}`} onClick={() => open(r)}><FaEdit /></button>
                  {user.role === "admin" && (
                    <button type="button" className="px-iconbtn px-iconbtn--danger" aria-label={`Delete ${r.name}`} onClick={() => setDel(r)}><FaTrash /></button>
                  )}
                </span>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        open={Boolean(edit)}
        onClose={() => setEdit(null)}
        icon={Icon}
        wide
        title={edit?.id ? `Edit ${edit.name}` : `Add ${isProduct ? "product" : "service"}`}
        footer={
          <>
            <button type="button" className="ix-btn ix-btn--ghost" onClick={() => setEdit(null)}>Cancel</button>
            <button type="button" className="ix-btn ix-btn--primary" onClick={save} disabled={saving || !form.name.trim()}>
              {saving ? <span className="ix-spinner" aria-hidden="true" /> : <FaSave aria-hidden="true" />} Save
            </button>
          </>
        }
      >
        <div className="ix-form">
          <div className="ix-field">
            <label htmlFor="cat-name">Name</label>
            <input id="cat-name" className="ix-input" value={form.name} onChange={set("name")} />
          </div>
          <div className="ix-form__row">
            <div className="ix-field">
              <label htmlFor="cat-section">Section</label>
              <input id="cat-section" className="ix-input" list="cat-sections" value={form.section || ""} onChange={set("section")} />
              <datalist id="cat-sections">{sections.map((s) => <option key={s} value={s} />)}</datalist>
            </div>
            <div className="ix-field">
              <label htmlFor="cat-category">Category</label>
              <input id="cat-category" className="ix-input" value={form.category || ""} onChange={set("category")} />
            </div>
          </div>
          <div className="ix-field">
            <label htmlFor="cat-desc">Description</label>
            <textarea id="cat-desc" className="ix-input" rows={3} value={form.description || ""} onChange={set("description")} />
          </div>
          <div className="ix-form__row">
            <div className="ix-field">
              <label htmlFor="cat-price">Price (KES)</label>
              <input id="cat-price" className="ix-input" type="number" min="0" step="1" value={form.price} onChange={set("price")} placeholder="Leave empty for quoted" />
            </div>
            <label className="px-switch">
              <input type="checkbox" checked={form.isActive} onChange={set("isActive")} />
              <span className="px-switch__track" aria-hidden="true" />
              Show on website / allow orders
            </label>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(del)}
        onClose={() => setDel(null)}
        icon={FaTrash}
        title={`Delete ${del?.name}?`}
        subtitle="Past orders keep their details. This can't be undone."
        footer={
          <>
            <button type="button" className="ix-btn ix-btn--ghost" onClick={() => setDel(null)}>Cancel</button>
            <button type="button" className="ix-btn px-btn-danger" onClick={remove}><FaTrash aria-hidden="true" /> Delete</button>
          </>
        }
      >
        <p className="px-muted">Tip: to hide it from customers without deleting, edit it and switch off “Show on website”.</p>
      </Modal>
    </>
  );
};

export default Catalog;
