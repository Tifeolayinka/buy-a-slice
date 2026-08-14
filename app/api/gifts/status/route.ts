import { getPaymentStatusByReference } from "@/lib/db/queries";

export async function GET(request: Request) {
  const reference = new URL(request.url).searchParams.get("reference");
  if (!reference) {
    return Response.json({ error: "missing_reference" }, { status: 400 });
  }

  const status = await getPaymentStatusByReference(reference);
  if (!status) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }

  return Response.json(status);
}
