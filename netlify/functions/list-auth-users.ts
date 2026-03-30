const SUPABASE_URL = "https://xzssmnosumznfruppxsh.supabase.co";

const json = (statusCode: number, body: unknown) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  },
  body: JSON.stringify(body),
});

export default async () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    return json(500, {
      error: "SUPABASE_SERVICE_ROLE_KEY não configurada no ambiente da função.",
    });
  }

  const collectedUsers: Array<{ id: string; email: string | null }> = [];
  let page = 1;
  const perPage = 200;

  while (true) {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=${page}&per_page=${perPage}`, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return json(response.status, {
        error: "Falha ao consultar usuários do Auth no Supabase.",
        details: errorText,
      });
    }

    const payload = await response.json() as {
      users?: Array<{ id: string; email?: string | null }>;
    };

    const users = payload.users || [];
    collectedUsers.push(...users.map((user) => ({
      id: user.id,
      email: user.email ?? null,
    })));

    if (users.length < perPage) break;
    page += 1;
  }

  return json(200, {
    users: collectedUsers,
  });
};
