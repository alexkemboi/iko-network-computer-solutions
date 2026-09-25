import React, { useEffect, useState } from "react";
import { FaShoppingBag, FaSave } from "react-icons/fa";
import { api, qs, money, dateTime, phoneFmt } from "../api";
import { useAuth } from "../AuthContext";
import { Card, PageHeader, StatusBadge, DataTable, Pager, SearchBox, Segmented, useLoad, Drawer, DL, useToast } from "../ui";

const FILTERS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
];

const OrderDrawer = ({ id, onClose, onChanged }) => {
  const { user } = useAuth();
  const toast = useToast();
  const staff = user.role !== "customer";
  const { data, loading, error } = useLoad(() => (id ? api(`/portal/orders/${id}`) : Promise.resolve(null)), [id]);
  const order = data?.order;
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (order) {
      setStatus(order.status);
      setNotes(order.notes || "");
    }
  }, [order]);

  const save = async () => {
    setSaving(true);
    try {
      await api(`/portal/orders/${id}`, { method: "PATCH", body: { status, notes } });
      toast("Order updated");
      onChanged();
      onClose();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      open={Boolean(id)}
      onClose={onClose}
      title={order ? order.orderNo : "Order"}
      subtitle={order ? dateTime(order.createdAt) : ""}
      footer={
        staff && order ? (
          <button type="button" className="ix-btn ix-btn--primary" onClick={save} disabled={saving}>
            {saving ? <span className="ix-spinner" aria-hidden="true" /> : <FaSave aria-hidden="true" />} Save changes
          </button>
        ) : null
      }
    >
      {loading && <div className="px-skeleton px-skeleton--block" />}
      {error && <p className="ix-field__error">{error}</p>}
      {order && (
        <>
          <div className="px-drawer__hero">
            <span className="px-drawer__amount">{money(order.amount)}</span>
            <StatusBadge status={order.status} />
          </div>
          <DL
            items={[
              ["Item", order.itemName],
              ["Section", order.section],
              ["Category", order.category],
              ["Customer", order.customerName],
              ["Phone", phoneFmt(order.phone)],
              !staff && ["Notes", order.notes],
            ]}
          />

          <h3 className="px-subhead">Payments</h3>
          {order.payments.length === 0 ? (
            <p className="px-muted">No payment attempts recorded.</p>
          ) : (
            <ul className="px-timeline">
              {order.payments.map((p) => (
                <li key={p.id}>
                  <StatusBadge status={p.status} />
                  <div>
                    <strong>{money(p.amount)}</strong> · {phoneFmt(p.phone)}
                    <div className="px-muted">
                      {p.mpesaReceipt ? `Receipt ${p.mpesaReceipt} · ` : ""}
                      {p.resultDesc || "Waiting for the customer to enter their PIN"} · {dateTime(p.createdAt)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {staff && (
            <div className="ix-form px-drawer__form">
              <div className="ix-field">
                <label htmlFor="ord-status">Status</label>
                <select id="ord-status" className="ix-input" value={status} onChange={(e) => setStatus(e.target.value)}>
                  {FILTERS.filter((f) => f.value).map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ix-field">
                <label htmlFor="ord-notes">Internal notes</label>
                <textarea id="ord-notes" className="ix-input" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </div>
          )}
        </>
      )}
    </Drawer>
  );
};

const Orders = ({ query, navigate }) => {
  const { user } = useAuth();
  const staff = user.role !== "customer";
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const { data, loading, error, reload } = useLoad(
    () => api(`/portal/orders${qs({ q: search, status, page, pageSize })}`),
    [search, status, page]
  );
  const openId = query.get("id");

  return (
    <>
      <PageHeader icon={FaShoppingBag} title="Orders" subtitle={staff ? "Every order placed on the website, with its payment status." : "Your orders and their payment status."} />
      <Card pad={false}>
        <div className="px-toolbar">
          <SearchBox value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search order no, customer, phone, item…" />
          <Segmented label="Filter by status" options={FILTERS} value={status} onChange={(v) => { setStatus(v); setPage(1); }} />
        </div>
        <DataTable
          loading={loading}
          error={error}
          rows={data?.rows || []}
          empty={search || status ? "No orders match your filters." : "No orders yet."}
          onRowClick={(r) => navigate(`/app/orders?id=${r.id}`)}
          columns={[
            { key: "orderNo", label: "Order", render: (r) => <strong>{r.orderNo}</strong> },
            { key: "itemName", label: "Item", render: (r) => (<><div>{r.itemName}</div><div className="px-muted px-small">{r.section}</div></>) },
            ...(staff ? [{ key: "customerName", label: "Customer", render: (r) => (<><div>{r.customerName}</div><div className="px-muted px-small">{phoneFmt(r.phone)}</div></>) }] : []),
            { key: "amount", label: "Amount", align: "right", render: (r) => money(r.amount) },
            { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
            { key: "createdAt", label: "Date", render: (r) => dateTime(r.createdAt) },
          ]}
        />
        <Pager page={page} pageSize={pageSize} total={data?.total || 0} onPage={setPage} />
      </Card>
      <OrderDrawer id={openId} onClose={() => navigate("/app/orders", { replace: true })} onChanged={reload} />
    </>
  );
};

export default Orders;
