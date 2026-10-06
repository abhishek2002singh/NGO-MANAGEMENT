import { APP_NAME, APP_VERSION } from "../constants";

export interface InfoRow {
  label: string;
  value: string;
  status?: "ok" | "error";
}

const renderRow = (r: InfoRow): string => `
  <div class="row">
    <span class="label">${r.label}</span>
    <span class="value ${r.status ?? ""}">${r.status ? '<span class="pip"></span>' : ""}${r.value}</span>
  </div>`;

export const renderPage = (title: string, subtitle: string, rows: InfoRow[], ok = true): string => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title} · ${APP_NAME}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet" />
<style>
  :root {
    --bg:#f5f7fb; --card:#ffffff; --text:#111827; --muted:#6b7280; --line:#eceff4; --row:#f9fafb;
    --ok:#059669; --ok-bg:#ecfdf5; --err:#dc2626; --err-bg:#fef2f2;
    --brand1:#4f46e5; --brand2:#0ea5e9; --shadow:0 1px 2px rgba(16,24,40,.04), 0 12px 32px rgba(16,24,40,.08);
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg:#0b1020; --card:#121a2c; --text:#e5e9f2; --muted:#8b95ab; --line:#1f2a40; --row:#0f1627;
      --ok:#34d399; --ok-bg:rgba(52,211,153,.1); --err:#f87171; --err-bg:rgba(248,113,113,.1);
      --brand1:#818cf8; --brand2:#38bdf8; --shadow:0 12px 32px rgba(0,0,0,.4);
    }
  }
  * { box-sizing:border-box; margin:0; padding:0; }
  body {
    font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif; color:var(--text); background:var(--bg);
    background-image:radial-gradient(circle at 15% 0%, color-mix(in srgb, var(--brand1) 14%, transparent), transparent 45%),
                     radial-gradient(circle at 85% 100%, color-mix(in srgb, var(--brand2) 12%, transparent), transparent 45%);
    min-height:100vh; display:grid; place-items:center; padding:24px 16px;
  }
  .card { width:100%; max-width:560px; background:var(--card); border:1px solid var(--line); border-radius:20px;
          box-shadow:var(--shadow); overflow:hidden; animation:rise .4s ease-out; }
  @keyframes rise { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
  .hero { padding:28px 28px 22px; position:relative; }
  .hero::before { content:""; position:absolute; inset:0 0 auto 0; height:4px;
                  background:linear-gradient(90deg, var(--brand1), var(--brand2)); }
  .top { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:20px; }
  .brand { display:flex; align-items:center; gap:10px; font-weight:600; font-size:14px; }
  .logo { width:34px; height:34px; border-radius:10px; display:grid; place-items:center; color:#fff;
          background:linear-gradient(135deg, var(--brand1), var(--brand2)); }
  .badge { display:inline-flex; align-items:center; gap:8px; font-size:12px; font-weight:600; padding:6px 12px;
           border-radius:999px; color:${ok ? "var(--ok)" : "var(--err)"}; background:${ok ? "var(--ok-bg)" : "var(--err-bg)"}; }
  .dot { width:8px; height:8px; border-radius:50%; background:currentColor; position:relative; }
  .dot::after { content:""; position:absolute; inset:0; border-radius:50%; background:currentColor; animation:pulse 1.8s infinite; }
  @keyframes pulse { 0% { transform:scale(1); opacity:.6; } 100% { transform:scale(2.8); opacity:0; } }
  h1 { font-size:26px; font-weight:700; letter-spacing:-.02em; margin-bottom:6px; }
  .sub { color:var(--muted); font-size:15px; }
  .rows { padding:6px 16px 16px; }
  .row { display:flex; justify-content:space-between; align-items:center; gap:16px; padding:13px 12px;
         border-radius:10px; font-size:14px; }
  .row:nth-child(odd) { background:var(--row); }
  .label { color:var(--muted); }
  .value { font-family:"JetBrains Mono",ui-monospace,Consolas,monospace; font-size:13px; font-weight:500;
           text-align:right; display:inline-flex; align-items:center; gap:8px; }
  .value.ok { color:var(--ok); } .value.error { color:var(--err); }
  .pip { width:7px; height:7px; border-radius:50%; background:currentColor; }
  a { color:var(--brand1); text-decoration:none; font-weight:600; } a:hover { text-decoration:underline; }
  footer { display:flex; justify-content:space-between; padding:14px 28px; border-top:1px solid var(--line);
           font-size:12px; color:var(--muted); }
  @media (max-width:420px) { .hero { padding:24px 20px 18px; } h1 { font-size:22px; } footer { padding:14px 20px; } }
</style>
</head>
<body>
  <main class="card">
    <section class="hero">
      <div class="top">
        <div class="brand">
          <span class="logo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/></svg>
          </span>
          ${APP_NAME}
        </div>
        <span class="badge"><span class="dot"></span>${ok ? "All systems operational" : "Service degraded"}</span>
      </div>
      <h1>${title}</h1>
      <p class="sub">${subtitle}</p>
    </section>
    <section class="rows">${rows.map(renderRow).join("")}</section>
    <footer><span>&copy; ${new Date().getFullYear()} ${APP_NAME}</span><span>v${APP_VERSION}</span></footer>
  </main>
</body>
</html>`;
