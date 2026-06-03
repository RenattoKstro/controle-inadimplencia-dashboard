import { createClient } from "@supabase/supabase-js";

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

  const supabase = createClient(SUPABASE_URL, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  const file = new TextEncoder().encode(JSON.stringify(payload));

  const upload = async () => supabase.storage
    .from(STORAGE_BUCKET)
    .upload(STORAGE_PATH, file, {
      contentType: "application/json",
      cacheControl: "0",
      upsert: true,
    });

  const firstAttempt = await upload();

  if (!firstAttempt.error) {
    return json(200, { ok: true });
  }

  await supabase.storage.from(STORAGE_BUCKET).remove([STORAGE_PATH]);
  const secondAttempt = await upload();

  if (secondAttempt.error) {
    return json(500, {
      error: "Falha ao salvar arquivo de cobranças no Storage.",
      details: secondAttempt.error.message,
      firstAttempt: firstAttempt.error.message,
    });
  }

  return json(200, { ok: true });
};
