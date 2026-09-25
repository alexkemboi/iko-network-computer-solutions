import React, { useState } from "react";
import { FaInbox, FaEnvelope, FaPhoneAlt } from "react-icons/fa";
import { api, qs, dateTime, phoneFmt } from "../api";
import { Card, PageHeader, DataTable, Pager, useLoad, Drawer, DL } from "../ui";

const Enquiries = () => {
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(null);
  const pageSize = 15;
  const { data, loading, error } = useLoad(() => api(`/portal/messages${qs({ page, pageSize })}`), [page]);

  return (
    <>
      <PageHeader icon={FaInbox} title="Enquiries" subtitle="Messages sent through the contact form on the website." />
      <Card pad={false}>
        <DataTable
          loading={loading}
          error={error}
          rows={data?.rows || []}
          empty="No enquiries yet."
          onRowClick={setOpen}
          columns={[
            { key: "name", label: "From", render: (m) => (<><strong>{m.name}</strong><div className="px-muted px-small">{m.email || phoneFmt(m.phone)}</div></>) },
            { key: "service", label: "Interested in", render: (m) => m.service || <span className="px-muted">General</span> },
            { key: "message", label: "Message", render: (m) => <span className="px-clamp">{m.message}</span> },
            { key: "createdAt", label: "Received", render: (m) => dateTime(m.createdAt) },
          ]}
        />
        <Pager page={page} pageSize={pageSize} total={data?.total || 0} onPage={setPage} />
      </Card>

      <Drawer
        open={Boolean(open)}
        onClose={() => setOpen(null)}
        title={open?.name || "Enquiry"}
        subtitle={open ? dateTime(open.createdAt) : ""}
        footer={
          open && (
            <>
              {open.phone && (
                <a className="ix-btn ix-btn--ghost" href={`tel:+${open.phone.replace(/\D/g, "")}`}>
                  <FaPhoneAlt aria-hidden="true" /> Call
                </a>
              )}
              {open.email && (
                <a className="ix-btn ix-btn--primary" href={`mailto:${open.email}?subject=${encodeURIComponent(`Re: ${open.service || "your enquiry"}`)}`}>
                  <FaEnvelope aria-hidden="true" /> Reply by email
                </a>
              )}
            </>
          )
        }
      >
        {open && (
          <>
            <DL items={[["Email", open.email], ["Phone", open.phone ? phoneFmt(open.phone) : null], ["Interested in", open.service]]} />
            <blockquote className="px-quote px-prewrap">{open.message}</blockquote>
          </>
        )}
      </Drawer>
    </>
  );
};

export default Enquiries;
