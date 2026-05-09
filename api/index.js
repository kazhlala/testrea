export default async function handler(req) {
  const url = new URL(req.url);

  // فقط مسیر /morning رو قبول کن، بقیه 404
  if (url.pathname !== "/morning") {
    return new Response("Not Found", { status: 404 });
  }

  // آدرس سرور Xray خودت رو اینجا بذار (بدون / آخر)
  const targetBase = "https://your-xray-server.com";

  const targetUrl = targetBase + url.pathname + url.search;

  // هدرهای ضروری رو فوروارد کن
  const headers = new Headers();
  for (const [key, value] of req.headers) {
    if (!["host", "connection", "transfer-encoding"].includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  }

  try {
    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
      duplex: "half",
    });

    return new Response(upstream.body, {
      status: upstream.status,
      headers: upstream.headers,
    });
  } catch (e) {
    return new Response("Bad Gateway", { status: 502 });
  }
}
