import React from "react";
import {
  FaWallet,
  FaCalendarAlt,
  FaShoppingBag,
  FaUsers,
  FaSms,
  FaMoneyCheckAlt,
  FaArrowRight,
  FaThLarge,
  FaPlus,
} from "react-icons/fa";
import { api, money, dateTime } from "../api";
import { useAuth } from "../AuthContext";
import { Card, PageHeader, Stat, StatusBadge, DataTable, useLoad, Notice } from "../ui";
import RevenueChart from "../RevenueChart";

const ORDER_STATES = [
  ["paid", "Paid"],
  ["processing", "Processing"],
  ["completed", "Completed"],
  ["pending", "Awaiting payment"],
  ["failed", "Failed"],
  ["cancelled", "Cancelled"],
];

const Overview = ({ navigate }) => {
  const { user } = useAuth();
  const staff = user.role !== "customer";
  const { data, loading, error } = useLoad(() => api("/portal/overview"), []);
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <PageHeader
        icon={FaThLarge}
        title={`${greet}, ${user.fullName.split(" ")[0]}`}
        subtitle={staff ? "Here's how IKONEX is doing today." : "Here's a summary of your orders and payments."}
        actions={
          staff ? (
            <>
              <button type="button" className="ix-btn ix-btn--ghost" onClick={() => navigate("/app/sms")}>
                <FaSms aria-hidden="true" /> Send SMS
              </button>
              {user.role === "admin" && (
                <button type="button" className="ix-btn ix-btn--primary" onClick={() => navigate("/app/payouts")}>
                  <FaPlus aria-hidden="true" /> New payout
                </button>
              )}
            </>
          ) : (
            <a href="/#products" className="ix-btn ix-btn--primary">
              <FaShoppingBag aria-hidden="true" /> Browse products
            </a>
          )
        }
      />

      {error && <Notice tone="error">{error}</Notice>}

      <div className="px-stats">
        <Stat label={staff ? "Revenue today" : "Paid today"} value={loading ? "…" : money(data?.revenue.today)} icon={FaWallet} />
        <Stat label="This month" value={loading ? "…" : money(data?.revenue.month)} hint={loading ? "" : `${money(data?.revenue.allTime)} all time`} icon={FaCalendarAlt} tone="teal" />
        <Stat
          label="Orders"
          value={loading ? "…" : (data?.orders.total || 0).toLocaleString()}
          hint={loading ? "" : `${(data?.orders.paid || 0) + (data?.orders.completed || 0)} paid or completed`}
          icon={FaShoppingBag}
          tone="amber"
        />
        {staff ? (
          <Stat
            label="Customers"
            value={loading ? "…" : (data?.customers || 0).toLocaleString()}
            hint={loading ? "" : `${(data?.smsThisMonth || 0).toLocaleString()} SMS · ${money(data?.payoutsThisMonth)} paid out this month`}
            icon={FaUsers}
            tone="violet"
          />
        ) : (
          <Stat label="Awaiting payment" value={loading ? "…" : (data?.orders.pending || 0).toLocaleString()} icon={FaMoneyCheckAlt} tone="violet" />
        )}
      </div>

      <div className="px-grid-2 px-grid-2--wide">
        <Card title="Revenue — last 14 days">
          {loading ? <div className="px-skeleton px-skeleton--chart" /> : <RevenueChart series={data?.series || []} />}
        </Card>

        <Card title="Orders by status">
          <ul className="px-statuslist">
            {ORDER_STATES.map(([key, label]) => {
              const n = data?.orders[key] || 0;
              const pct = data?.orders.total ? Math.round((n / data.orders.total) * 100) : 0;
              return (
                <li key={key}>
                  <StatusBadge status={key === "pending" ? "pending" : key} />
                  <span className="px-statuslist__label">{label}</span>
                  <span className="px-statuslist__bar" aria-hidden="true">
                    <span style={{ width: `${pct}%` }} />
                  </span>
                  <strong>{loading ? "…" : n}</strong>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <Card
        title="Recent orders"
        pad={false}
        action={
          <button type="button" className="ix-link px-linkbtn" onClick={() => navigate("/app/orders")}>
            View all <FaArrowRight aria-hidden="true" />
          </button>
        }
      >
        <DataTable
          loading={loading}
          rows={data?.recentOrders || []}
          empty="No orders yet — they'll appear here as soon as someone checks out."
          onRowClick={(r) => navigate(`/app/orders?id=${r.id}`)}
          columns={[
            { key: "orderNo", label: "Order", render: (r) => <strong>{r.orderNo}</strong> },
            { key: "itemName", label: "Item" },
            ...(staff ? [{ key: "customerName", label: "Customer" }] : []),
            { key: "amount", label: "Amount", align: "right", render: (r) => money(r.amount) },
            { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
            { key: "createdAt", label: "Date", render: (r) => dateTime(r.createdAt) },
          ]}
        />
      </Card>
    </>
  );
};

export default Overview;
