import React, { useState } from "react";
import { FaReceipt } from "react-icons/fa";
import { api, qs, money, dateTime, phoneFmt } from "../api";
import { useAuth } from "../AuthContext";
import { Card, PageHeader, StatusBadge, DataTable, Pager, SearchBox, Segmented, useLoad } from "../ui";

const FILTERS = [
  { value: "", label: "All" },
  { value: "success", label: "Successful" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
];

const Payments = ({ navigate }) => {
  const { user } = useAuth();
  const staff = user.role !== "customer";
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const { data, loading, error } = useLoad(() => api(`/portal/payments${qs({ q: search, status, page, pageSize })}`), [search, status, page]);

  return (
    <>
      <PageHeader icon={FaReceipt} title="Payments" subtitle="M-Pesa Express payments recorded from checkout, with receipts." />
      <Card pad={false}>
        <div className="px-toolbar">
          <SearchBox value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search receipt, phone, order no…" />
          <Segmented label="Filter by status" options={FILTERS} value={status} onChange={(v) => { setStatus(v); setPage(1); }} />
        </div>
        <DataTable
          loading={loading}
          error={error}
          rows={data?.rows || []}
          empty="No payments recorded yet."
          onRowClick={(r) => r.orderId && navigate(`/app/orders?id=${r.orderId}`)}
          columns={[
            { key: "mpesaReceipt", label: "Receipt", render: (r) => (r.mpesaReceipt ? <strong className="px-mono">{r.mpesaReceipt}</strong> : <span className="px-muted">—</span>) },
            { key: "orderNo", label: "Order", render: (r) => (<><div>{r.orderNo || "—"}</div><div className="px-muted px-small">{r.itemName}</div></>) },
            ...(staff ? [{ key: "phone", label: "Phone", render: (r) => (<><div>{phoneFmt(r.phone)}</div><div className="px-muted px-small">{r.customerName}</div></>) }] : []),
            { key: "amount", label: "Amount", align: "right", render: (r) => money(r.amount) },
            { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
            { key: "resultDesc", label: "Result", render: (r) => <span className="px-muted px-small">{r.resultDesc || "Awaiting PIN"}</span> },
            { key: "createdAt", label: "Date", render: (r) => dateTime(r.createdAt) },
          ]}
        />
        <Pager page={page} pageSize={pageSize} total={data?.total || 0} onPage={setPage} />
      </Card>
    </>
  );
};

export default Payments;
