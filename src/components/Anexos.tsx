import { File, Video } from "lucide-react";

interface Anexo {
  id: number;
  name: string;
  url: string;
}

const pdfList = [
  { id: 1, name: "CARTILHA - LIBERAÇÃO GERENCIAL", url: "https://xzssmnosumznfruppxsh.supabase.co/storage/v1/object/sign/pdfs/Cartilha%20-%20Liberacao%20Gerencial.pdf?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jYmFjZTM2ZS03ZDk1LTRhZjUtYTJlZC01YTE2NzJkOGM3MjkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwZGZzL0NhcnRpbGhhIC0gTGliZXJhY2FvIEdlcmVuY2lhbC5wZGYiLCJpYXQiOjE3NTE2NTc1ODgsImV4cCI6MTc4MzE5MzU4OH0.Kyhu4erX_TsbmcaZ-8-fVNlEH21MAFIYD2v5neSjgEs" },
  { id: 2, name: "C.I. 006 2025 COMPROVANTE DE ENDEREÇO", url: "https://xzssmnosumznfruppxsh.supabase.co/storage/v1/object/sign/pdfs/CI%20006%2025%20Revogacao%20da%20obrigatoriedade%20do%20comprovante%20de%20endereco.pdf?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jYmFjZTM2ZS03ZDk1LTRhZjUtYTJlZC01YTE2NzJkOGM3MjkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwZGZzL0NJIDAwNiAyNSBSZXZvZ2FjYW8gZGEgb2JyaWdhdG9yaWVkYWRlIGRvIGNvbXByb3ZhbnRlIGRlIGVuZGVyZWNvLnBkZiIsImlhdCI6MTc1MTY1NzYxOSwiZXhwIjoxNzgzMTkzNjE5fQ.Lz-wz8OzqkS_fPPF2AumohU8phWJbgOHfaRu3uGTBKg" },
  { id: 3, name: "C.I. 002 2025 RENDA CLIENTES AUTONOMOS", url: "https://xzssmnosumznfruppxsh.supabase.co/storage/v1/object/sign/pdfs/CI%202%202025%20Renda%20clientes%20autonomos.pdf?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jYmFjZTM2ZS03ZDk1LTRhZjUtYTJlZC01YTE2NzJkOGM3MjkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwZGZzL0NJIDIgMjAyNSBSZW5kYSBjbGllbnRlcyBhdXRvbm9tb3MucGRmIiwiaWF0IjoxNzUxNjU3NjMwLCJleHAiOjE3ODMxOTM2MzB9.U-kHPl8ib_KfxG8Q6-PJ99ku-rBUne7QMel5F1Zfr78" },
  { id: 4, name: "C.I. 007 2025 CADASTRO NÃO AUTENTICADO", url: "https://xzssmnosumznfruppxsh.supabase.co/storage/v1/object/sign/pdfs/CI%20cadastro%20nao%20autenticado.pdf?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jYmFjZTM2ZS03ZDk1LTRhZjUtYTJlZC01YTE2NzJkOGM3MjkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwZGZzL0NJIGNhZGFzdHJvIG5hbyBhdXRlbnRpY2Fkby5wZGYiLCJpYXQiOjE3NTE2NTc2NDEsImV4cCI6MTc4MzE5MzY0MX0.cOfIUD8sR9f_yyI9qOKH93cTf6F3PNLXcERAYJV0kgQ" },
  { id: 5, name: "ENDEREÇO RURAL", url: "https://xzssmnosumznfruppxsh.supabase.co/storage/v1/object/sign/pdfs/ENDERECO%20RURAL.pdf?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jYmFjZTM2ZS03ZDk1LTRhZjUtYTJlZC01YTE2NzJkOGM3MjkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwZGZzL0VOREVSRUNPIFJVUkFMLnBkZiIsImlhdCI6MTc1MTY1NzY1NSwiZXhwIjoxNzgzMTkzNjU1fQ.b7pHjnqufaYGz3k5259sWSL-YWWvwnr8tFClYXy_r9A" },
  { id: 6, name: "ESTORNO PIX", url: "https://xzssmnosumznfruppxsh.supabase.co/storage/v1/object/sign/pdfs/ESTORNO%20PIX.pdf?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jYmFjZTM2ZS03ZDk1LTRhZjUtYTJlZC01YTE2NzJkOGM3MjkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwZGZzL0VTVE9STn20%20PIX.pdf?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jYmFjZTM2ZS03ZDk1LTRhZjUtYTJlZC01YTE2NzJkOGM3MjkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwZGZzL0VTVE9STk8gUElYLnBkZiIsImlhdCI6MTc1MTY1NzY3MCwiZXhwIjoxNzgzMTkzNjcwfQ.kb6dKCz0smc8C1MoOQV_Vn_OM6LgXf7kR2myERYjGJQ" },
  { id: 7, name: "MANUAL ACIONA VENDEDOR", url: "https://xzssmnosumznfruppxsh.supabase.co/storage/v1/object/sign/pdfs/Manual%20Aciona%20Vendedor.pdf?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jYmFjZTM2ZS03ZDk1LTRhZjUtYTJlZC01YTE2NzJkOGM3MjkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwZGZzL01hbnVhbCBBY2lvbmEgVmVuZGVkb3IucGRmIiwiaWF0IjoxNzUxNjU3NjgxLCJleHAiOjE3ODMxOTM2ODF9.KAg0YI2s8ZzTMqF1TkKNTR6I5WrJxbZaesEFh_06a0U" },
  { id: 8, name: "MANUAL DO PATRIMONIO", url: "https://xzssmnosumznfruppxsh.supabase.co/storage/v1/object/sign/pdfs/Manual%20do%20Patrimonio.pdf?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jYmFjZTM2ZS03ZDk1LTRhZjUtYTJlZC01YTE2NzJkOGM3MjkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwZGZzL01hbnVhbCBkbyBQYXRyaW1vbmlvLnBkZiIsImlhdCI6MTc1MTY1NzkxMiwiZXhwIjoxNzgzMTkzOTEyfQ.nHLabdtztWNLKtiD8iJ1sEwcUFW2_JpkaTK7jWPOZTA" },
  { id: 9, name: "C.I. SIGA - TELA DE RENEGOCIAÇÃO", url: "https://xzssmnosumznfruppxsh.supabase.co/storage/v1/object/sign/pdfs/COMUNICADO%20INTERNO%20%20SIGA%20TELA%20DE%20RENEGOCIACAO.pdf?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jYmFjZTM2ZS03ZDk1LTRhZjUtYTJlZC01YTE2NzJkOGM3MjkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwZGZzL0NPTVVOSUNBRE8gSU5URVJOTyAgU0lHQSBURUxBIERFIFJFTkVHT0NJQUNBTy5wZGYiLCJpYXQiOjE3NTIwNjg3NjUsImV4cCI6MTc4MzYwNDc2NX0.SuF1pAb_Fz3W6lvtwzuEf_6oCM5QkuIKkfoqB1djmxg" },
  { id: 10, name: "TEMPLATE DE COBRANÇA", url: "https://xzssmnosumznfruppxsh.supabase.co/storage/v1/object/sign/pdfs/Template%20Cobrancas.xlsx?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jYmFjZTM2ZS03ZDk1LTRhZjUtYTJlZC01YTE2NzJkOGM3MjkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwZGZzL1RlbXBsYXRlIENvYnJhbmNhcy54bHN4IiwiaWF0IjoxNzUyNzgxODIzLCJleHAiOjE3ODQzMTc4MjN9.r5VeppFW_ZlW1nSOysSmEnQ7JxK68BO4IOdXlJAvr4Y" },
  { id: 11, name: "TEMPLATE DE COBRANÇA 2", url: "https://xzssmnosumznfruppxsh.supabase.co/storage/v1/object/sign/pdfs/Template%20Cobrancas%203.xlsx?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jYmFjZTM2ZS03ZDk1LTRhZjUtYTJlZC01YTE2NzJkOGM3MjkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwZGZzL1RlbXBsYXRlIENvYnJhbmNhcyAzLnhsc3giLCJpYXQiOjE3NTI4NDQ5ODUsImV4cCI6MTc4NDM4MDk4NX0.vUHF3pHMkPc2njoAmHygKDObu-vGNY0DDlRDaE2NRp4" },
  { id: 12, name: "TEMPLATE DE RENEGOCIAÇÃO", url: "https://xzssmnosumznfruppxsh.supabase.co/storage/v1/object/sign/pdfs/Template%20Renegociacao%20.xlsx?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jYmFjZTM2ZS03ZDk1LTRhZjUtYTJlZC01YTE2NzJkOGM3MjkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwZGZzL1RlbXBsYXRlIFJlbmVnb2NpYWNhbyAueGxzeCIsImlhdCI6MTc1Mjg0NTE4NSwiZXhwIjoxNzg0MzgxMTg1fQ.EzrIi3rgp2VfNbSjK4yoW9EOgHNA7qBAZZ39fmRMdNk" },
];

const Anexos = () => {
  return (
    <>
      <h3 className="text-lg font-semibold text-foreground mb-4">Lista de Anexos</h3>
      <ul className="space-y-2">
        {pdfList.map((pdf) => (
          <li key={pdf.id} className="flex items-center gap-2">
            <File className="h-4 w-4 text-gray-500" />
            <a
              href={pdf.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {pdf.name}
            </a>
          </li>
        ))}
        <li className="flex items-center gap-2">
          <Video className="h-4 w-4 text-gray-500" />
          <a
            href="https://archive.org/embed/tuto-cobranca-com-nome"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            TUTO DE COBRANÇA COM O NOME DO CLIENTE
          </a>
        </li>
      </ul>
    </>
  );
};

export default Anexos;
