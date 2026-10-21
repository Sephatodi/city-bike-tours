"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge, Empty, Icon, Modal, PageTop, Skeleton, ago, api, niceTime, useDash, useRun } from "./ui";

const Stars = ({ n }) => <span aria-label={`${n} out of 5`} style={{ color: "#ffbe4d", letterSpacing: 2 }}>{"★".repeat(n)}<span style={{ color: "rgba(255,255,255,.18)" }}>{"★".repeat(5 - n)}</span></span>;
const LABEL = { new: "New", in_progress: "In progress", resolved: "Resolved", pending: "Waiting", approved: "Approved", rejected: "Rejected", subscribed: "Subscribed", unsubscribed: "Unsubscribed" };
const TONE = { new: "warn", in_progress: "teal", resolved: "good", pending: "warn", approved: "good", rejected: "bad", subscribed: "good", unsubscribed: "neutral" };

function EnquiryModal({ item, onClose, onSaved }) {
  const { can } = useDash();
  const [run, busy] = useRun();
  const [note, setNote] = useState(item.staffNote || "");
  const [reply, setReply] = useState("");
  const write = can("inbox:write");
  const save = (patch, msg) => run(async () => { await api(`/api/admin/enquiries/${item.id}`, { method: "PATCH", body: patch }, "Could not save."); await onSaved(); }, msg);
  const sendReply = async () => { const ok = await run(() => api(`/api/admin/enquiries/${item.id}/reply`, { method: "POST", body: { message: reply } }, "Could not send."), "Reply sent."); if (ok) { setReply(""); onSaved(); } };

  return (
    <Modal title={item.subject || `Message from ${item.name}`} lead={`${item.name} · ${niceTime(item.createdAt)}`} width="620px" onClose={onClose}
      footer={<button className="btn" onClick={onClose}>Close</button>}>
      <p style={{ whiteSpace: "pre-wrap", marginBottom: 14 }}>{item.message}</p>
      <dl className="adm-kv" style={{ marginBottom: 16 }}>
        <dt>Phone</dt><dd>{item.phone ? <>{item.phone} <a className="muted" href={`tel:${item.phone}`}>· Call</a> <a className="muted" href={`https://wa.me/${item.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">· WhatsApp</a></> : "—"}</dd>
        <dt>Email</dt><dd>{item.email ? <a href={`mailto:${item.email}`}>{item.email}</a> : "—"}</dd>
        <dt>Status</dt><dd><Badge tone={TONE[item.status]}>{LABEL[item.status]}</Badge></dd>
      </dl>
      {write && <>
        <div className="tabs" role="group" aria-label="Set status" style={{ marginBottom: 14 }}>
          {["new", "in_progress", "resolved"].map((s) => <button key={s} className="tab" aria-pressed={item.status === s} disabled={busy} onClick={() => save({ status: s }, "Status updated.")}>{LABEL[s]}</button>)}
        </div>
        <label className="field">Private note for your team
          <textarea className="textarea" rows={2} maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
        <button className="btn btn-sm" style={{ marginTop: 8 }} disabled={busy || note === (item.staffNote || "")} onClick={() => save({ staffNote: note }, "Note saved.")}>Save note</button>
        {item.phone && can("messages:send") && (
          <div style={{ marginTop: 18 }}>
            <label className="field">Reply by WhatsApp / SMS
              <textarea className="textarea" rows={3} maxLength={600} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write your reply" />
            </label>
            <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }} disabled={busy || reply.trim().length < 2} onClick={sendReply}><Icon name="send" size={13} /> Send reply</button>
          </div>
        )}
      </>}
    </Modal>
  );
}


function ReviewReplyModal({ item, onClose, onSaved }) {
  const [run, busy] = useRun();
  const [reply, setReply] = useState(item.adminReply || "");
  const save = async (text, msg) => {
    const ok = await run(() => api(`/api/admin/reviews/${item.id}/reply`, { method: "POST", body: { reply: text } }, "Could not save the reply."), msg);
    if (ok) { await onSaved(); onClose(); }
  };
  return (
    <Modal title={`Reply to ${item.name}`} lead={`${niceTime(item.createdAt)} · ${item.status === "approved" ? "Shown on the website" : "Not shown yet — approve the review so the reply is visible"}`} width="560px" onClose={onClose}
      footer={<><button className="btn" onClick={onClose}>Cancel</button>{item.adminReply && <button className="btn btn-danger" disabled={busy} onClick={() => save("", "Reply removed.")}>Remove reply</button>}<button className="btn btn-primary" disabled={busy || reply.trim().length < 2} onClick={() => save(reply, "Reply saved.")}>Save reply</button></>}>
      <p style={{ marginBottom: 6 }}><Stars n={item.rating} /></p>
      <p style={{ whiteSpace: "pre-wrap", marginBottom: 16 }}>{item.comment}</p>
      <label className="field">Your public reply
        <textarea className="textarea" rows={4} maxLength={600} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Thank them, or answer their feedback. Everyone who visits the website can read this." />
      </label>
    </Modal>
  );
}

function ChatModal({ userId, onClose, onSaved }) {
  const { can } = useDash();
  const write = can("inbox:write");
  const [run, busy] = useRun();
  const [chat, setChat] = useState(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    try { setChat(await api(`/api/admin/customer-messages/${userId}`)); setError(""); }
    catch (err) { setError(err.message || "Could not load the chat."); }
  }, [userId]);
  useEffect(() => { void load(); }, [load]);
  const send = async () => {
    const ok = await run(() => api(`/api/admin/customer-messages/${userId}`, { method: "POST", body: { body: text } }, "Could not send."), "Reply sent. The rider sees it on the website.");
    if (ok) { setText(""); await load(); onSaved(); }
  };
  const c = chat?.customer;
  return (
    <Modal title={c ? `Chat with ${c.name}` : "Chat"} lead={c ? [c.phone, c.email && !c.email.endsWith("@phone.citybiketours.invalid") ? c.email : null].filter(Boolean).join(" · ") : ""} width="620px" onClose={onClose}
      footer={<button className="btn" onClick={onClose}>Close</button>}>
      {error ? <div className="adm-alert bad" role="alert"><Icon name="alert" /><div>{error}</div></div> : !chat ? <Skeleton h={160} /> : (
        <>
          <div style={{ display: "grid", gap: 10, maxHeight: 340, overflowY: "auto", marginBottom: 16 }}>
            {chat.messages.map((m) => (
              <div key={m.id} style={{ justifySelf: m.sender === "admin" ? "end" : "start", maxWidth: "85%", padding: "9px 13px", borderRadius: 10, background: m.sender === "admin" ? "rgba(76,201,176,.16)" : "rgba(255,255,255,.07)" }}>
                <div className="muted" style={{ fontSize: 11, marginBottom: 3 }}>{m.sender === "admin" ? `${m.senderName || "Team"} (team)` : m.senderName || c.name} · {ago(m.createdAt)}</div>
                <div style={{ whiteSpace: "pre-wrap" }}>{m.body}</div>
              </div>
            ))}
          </div>
          {write && (
            <>
              <label className="field">Your reply
                <textarea className="textarea" rows={3} maxLength={1500} value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a reply. The rider reads it on the website's Connect page." />
              </label>
              <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }} disabled={busy || !text.trim()} onClick={send}><Icon name="send" size={13} /> Send reply</button>
            </>
          )}
        </>
      )}
    </Modal>
  );
}

export default function Inbox() {
  const { can, refresh } = useDash();
  const [tab, setTab] = useState("enquiries");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [chatWith, setChatWith] = useState(null);
  const [run, busy] = useRun();
  const write = can("inbox:write");

  const load = useCallback(async () => {
    try {
      const [e, r, s, t, p] = await Promise.all([
        api("/api/admin/enquiries"), api("/api/admin/reviews"), api("/api/admin/subscribers"),
        api("/api/admin/customer-messages").catch((err) => ({ threads: [], failed: err.message })),
        api("/api/admin/community").catch((err) => ({ photos: [], failed: err.message })),
      ]);
      setData({ enquiries: e.enquiries, reviews: r.reviews, subscribers: s.subscribers, threads: t.threads, photos: p.photos, chatError: t.failed || "", photoError: p.failed || "" });
      setError("");
      refresh();
    } catch (err) { setError(err.message || "Could not load the inbox."); }
  }, [refresh]);
  useEffect(() => { void load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const counts = useMemo(() => data && ({
    enquiries: data.enquiries.filter((x) => x.status === "new").length,
    reviews: data.reviews.filter((x) => x.status === "pending").length,
    subscribers: data.subscribers.filter((x) => x.status === "subscribed").length,
    chats: data.threads.filter((x) => x.awaitingReply).length,
    photos: data.photos.filter((x) => x.status === "pending").length,
  }), [data]);

  const act = (url, method, body, msg) => run(async () => { await api(url, { method, body }, "Could not save."); await load(); }, msg);
  const current = open && data?.enquiries.find((x) => x.id === open);

  return (
    <>
      <PageTop title="Inbox & reviews" actions={can("export:read") && ["enquiries", "reviews", "subscribers"].includes(tab) && <a className="btn" href={`/api/admin/export?type=${tab}`}><Icon name="download" size={16} /> Export {tab} (CSV)</a>}>
        Contact-form questions, rider chats, reviews to approve and answer, rider photos to approve, and people who asked for updates.
      </PageTop>
      <div className="adm-card">
        <div className="adm-toolbar">
          <div className="tabs" role="group" aria-label="Inbox sections">
            {[["enquiries", "Enquiries"], ["chats", "Rider chats"], ["reviews", "Reviews"], ["photos", "Rider photos"], ["subscribers", "Subscribers"]].map(([id, label]) => (
              <button key={id} className="tab" aria-pressed={tab === id} onClick={() => setTab(id)}>{label} {counts && <span className="n num">{counts[id]}</span>}</button>
            ))}
          </div>
          {tab === "subscribers" && can("messages:send") && <Link className="btn btn-sm btn-primary" href="/admin/messages"><Icon name="send" size={13} /> Message subscribers</Link>}
        </div>

        {error ? <div className="adm-alert bad" role="alert"><Icon name="alert" /><div>{error}</div></div> : !data ? <Skeleton h={220} /> : (
          <>
            {tab === "enquiries" && (data.enquiries.length ? (
              <div className="adm-table-wrap"><table>
                <thead><tr><th>From</th><th>Message</th><th>Status</th><th>Received</th></tr></thead>
                <tbody>{data.enquiries.map((x) => (
                  <tr key={x.id} className="click" onClick={() => setOpen(x.id)}>
                    <td><span className="strong">{x.name}</span><small>{x.phone || x.email}</small></td>
                    <td style={{ maxWidth: 380 }}>{x.subject && <span className="strong">{x.subject}<br /></span>}<span className="muted">{x.message.length > 110 ? `${x.message.slice(0, 110)}…` : x.message}</span></td>
                    <td><Badge tone={TONE[x.status]}>{LABEL[x.status]}</Badge></td>
                    <td className="muted">{ago(x.createdAt)}</td>
                  </tr>))}</tbody>
              </table></div>
            ) : <Empty title="No enquiries yet">Messages sent from your website's contact form appear here.</Empty>)}

            {tab === "reviews" && (data.reviews.length ? (
              <div className="adm-table-wrap"><table>
                <thead><tr><th>Rider</th><th>Review</th><th>Status</th>{write && <th aria-label="Actions" />}</tr></thead>
                <tbody>{data.reviews.map((x) => (
                  <tr key={x.id}>
                    <td><span className="strong">{x.name}</span><small>{ago(x.createdAt)}</small></td>
                    <td style={{ maxWidth: 420 }}><Stars n={x.rating} /><br /><span className="muted">{x.comment}</span>{x.adminReply && <div style={{ marginTop: 8, paddingLeft: 10, borderLeft: "2px solid rgba(76,201,176,.6)" }}><small>Your reply · {x.adminReplyBy}</small><br /><span>{x.adminReply}</span></div>}</td>
                    <td><Badge tone={TONE[x.status]}>{LABEL[x.status]}</Badge></td>
                    {write && <td><div className="row-actions">
                      <button className="btn btn-sm" disabled={busy} onClick={() => setReplyTo(x.id)}>{x.adminReply ? "Edit reply" : "Reply"}</button>
                      {x.status !== "approved" && <button className="btn btn-sm btn-primary" disabled={busy} onClick={() => act(`/api/admin/reviews/${x.id}`, "PATCH", { status: "approved" }, "Approved. It now shows on your website.")}>Approve</button>}
                      {x.status === "pending" && <button className="btn btn-sm" disabled={busy} onClick={() => act(`/api/admin/reviews/${x.id}`, "PATCH", { status: "rejected" }, "Rejected.")}>Reject</button>}
                      {x.status === "approved" && <button className="btn btn-sm" disabled={busy} onClick={() => act(`/api/admin/reviews/${x.id}`, "PATCH", { status: "pending" }, "Hidden from the website.")}>Hide</button>}
                      <button className="btn btn-sm btn-danger btn-icon" disabled={busy} aria-label={`Delete review by ${x.name}`} onClick={() => window.confirm("Delete this review for good?") && act(`/api/admin/reviews/${x.id}`, "DELETE", undefined, "Deleted.")}><Icon name="trash" size={13} /></button>
                    </div></td>}
                  </tr>))}</tbody>
              </table></div>
            ) : <Empty title="No reviews yet">Reviews sent from your website wait here until you approve them.</Empty>)}

            {tab === "chats" && (data.chatError ? <div className="adm-alert bad" role="alert"><Icon name="alert" /><div>{data.chatError} (If you just updated the site, run the database migration.)</div></div> : data.threads.length ? (
              <div className="adm-table-wrap"><table>
                <thead><tr><th>Rider</th><th>Latest message</th><th>Status</th><th>When</th></tr></thead>
                <tbody>{data.threads.map((x) => (
                  <tr key={x.userId} className="click" onClick={() => setChatWith(x.userId)}>
                    <td><span className="strong">{x.name}</span><small>{x.phone || x.email}</small></td>
                    <td style={{ maxWidth: 420 }}><span className="muted">{x.lastSender === "admin" ? "You: " : ""}{x.lastMessage.length > 120 ? `${x.lastMessage.slice(0, 120)}…` : x.lastMessage}</span></td>
                    <td>{x.awaitingReply ? <Badge tone="warn">Needs reply</Badge> : <Badge tone="good">Answered</Badge>}</td>
                    <td className="muted">{ago(x.lastAt)}</td>
                  </tr>))}</tbody>
              </table></div>
            ) : <Empty title="No rider chats yet">Messages riders send from the website's Connect page appear here.</Empty>)}

            {tab === "photos" && (data.photoError ? <div className="adm-alert bad" role="alert"><Icon name="alert" /><div>{data.photoError} (If you just updated the site, run the database migration.)</div></div> : data.photos.length ? (
              <div className="adm-table-wrap"><table>
                <thead><tr><th>Photo</th><th>Rider & story</th><th>Status</th>{write && <th aria-label="Actions" />}</tr></thead>
                <tbody>{data.photos.map((x) => (
                  <tr key={x.id}>
                    <td><a href={x.imageUrl} target="_blank" rel="noreferrer"><img src={x.imageUrl} alt={x.title} style={{ width: 96, height: 72, objectFit: "cover", borderRadius: 6 }} /></a></td>
                    <td style={{ maxWidth: 420 }}><span className="strong">{x.title}</span><small>{x.authorName} · {ago(x.createdAt)}</small>{x.story && <div className="muted" style={{ marginTop: 4 }}>{x.story.length > 160 ? `${x.story.slice(0, 160)}…` : x.story}</div>}</td>
                    <td><Badge tone={TONE[x.status]}>{LABEL[x.status]}</Badge><br /><small>{x.downloadable ? "Download allowed" : "No download"}</small></td>
                    {write && <td><div className="row-actions">
                      <button className="btn btn-sm" disabled={busy} onClick={() => act(`/api/admin/community/${x.id}`, "PATCH", { downloadable: !x.downloadable }, x.downloadable ? "Downloads turned off." : "Signed-in riders can download it.")}>{x.downloadable ? "Block download" : "Allow download"}</button>
                      {x.status !== "approved" && <button className="btn btn-sm btn-primary" disabled={busy} onClick={() => act(`/api/admin/community/${x.id}`, "PATCH", { status: "approved" }, "Approved. It now shows in the rider gallery.")}>Approve</button>}
                      {x.status === "pending" && <button className="btn btn-sm" disabled={busy} onClick={() => act(`/api/admin/community/${x.id}`, "PATCH", { status: "rejected" }, "Rejected.")}>Reject</button>}
                      {x.status === "approved" && <button className="btn btn-sm" disabled={busy} onClick={() => act(`/api/admin/community/${x.id}`, "PATCH", { status: "pending" }, "Hidden from the website.")}>Hide</button>}
                      <button className="btn btn-sm btn-danger btn-icon" disabled={busy} aria-label={`Delete photo ${x.title}`} onClick={() => window.confirm("Delete this photo for good?") && act(`/api/admin/community/${x.id}`, "DELETE", undefined, "Deleted.")}><Icon name="trash" size={13} /></button>
                    </div></td>}
                  </tr>))}</tbody>
              </table></div>
            ) : <Empty title="No rider photos yet">Photos and stories riders upload to the gallery wait here until you approve them.</Empty>)}

            {tab === "subscribers" && (data.subscribers.length ? (
              <div className="adm-table-wrap"><table>
                <thead><tr><th>Contact</th><th>Source</th><th>Status</th><th>Joined</th>{write && <th aria-label="Actions" />}</tr></thead>
                <tbody>{data.subscribers.map((x) => (
                  <tr key={x.id}>
                    <td><span className="strong">{x.email || x.phone}</span>{x.email && x.phone && <small>{x.phone}</small>}</td>
                    <td className="muted">{x.source || "website"}</td>
                    <td><Badge tone={TONE[x.status]}>{LABEL[x.status]}</Badge></td>
                    <td className="muted">{ago(x.createdAt)}</td>
                    {write && <td><div className="row-actions">
                      <button className="btn btn-sm" disabled={busy} onClick={() => act(`/api/admin/subscribers/${x.id}`, "PATCH", { status: x.status === "subscribed" ? "unsubscribed" : "subscribed" }, "Updated.")}>{x.status === "subscribed" ? "Unsubscribe" : "Resubscribe"}</button>
                      <button className="btn btn-sm btn-danger btn-icon" disabled={busy} aria-label="Delete subscriber" onClick={() => window.confirm("Remove this person from your list?") && act(`/api/admin/subscribers/${x.id}`, "DELETE", undefined, "Removed.")}><Icon name="trash" size={13} /></button>
                    </div></td>}
                  </tr>))}</tbody>
              </table></div>
            ) : <Empty title="No subscribers yet">People who sign up for updates on your website appear here.</Empty>)}
          </>
        )}
      </div>
      {current && <EnquiryModal item={current} onClose={() => setOpen(null)} onSaved={load} />}
      {replyTo && data?.reviews.find((x) => x.id === replyTo) && <ReviewReplyModal item={data.reviews.find((x) => x.id === replyTo)} onClose={() => setReplyTo(null)} onSaved={load} />}
      {chatWith && <ChatModal userId={chatWith} onClose={() => setChatWith(null)} onSaved={load} />}
    </>
  );
}
