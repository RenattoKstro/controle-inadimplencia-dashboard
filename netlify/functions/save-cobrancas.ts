const SUPABASE_URL = "https://xzssmnosumznfruppxsh.supabase.co";
const STORAGE_BUCKET = "perfis";
const STORAGE_PATH = "cobrancas-vendedor-atual.json";

const json = (statusCode: number, body: unknown) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  },
  body: JSON.stringify(body),
});

export default async (request: Request) => {
  if (request.method !== "POST") {
    return json(405, { error: "Método não permitido." });
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    return json(500, {
      error: "SUPABASE_SERVICE_ROLE_KEY não configurada no ambiente da função.",
    });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json(400, { error: "Payload JSON inválido." });
  }

  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${STORAGE_PATH}`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "x-upsert": "true",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const details = await response.text();
    return json(response.status, {
      error: "Falha ao salvar arquivo de cobranças no Storage.",
      details,
    });
  }

  return json(200, { ok: true });
};
