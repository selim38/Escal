import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { execute } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const leadId = formData.get("leadId");
    if (!leadId || typeof leadId !== "string") {
      return NextResponse.json({ error: "leadId manquant" }, { status: 400 });
    }

    const files = formData.getAll("photos") as File[];
    if (files.length === 0) {
      return NextResponse.json({ ok: true, paths: [] });
    }

    const uploadDir = path.join(process.cwd(), "uploads", "leads", leadId);
    await mkdir(uploadDir, { recursive: true });

    const savedPaths: string[] = [];
    for (const file of files) {
      const ext = file.name.split(".").pop() ?? "jpg";
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const filePath = path.join(uploadDir, filename);
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);
      savedPaths.push(`uploads/leads/${leadId}/${filename}`);
    }

    await execute(
      "UPDATE leads SET photos_json = ? WHERE id = ?",
      [JSON.stringify(savedPaths), leadId.replace("L-", "")],
    );

    return NextResponse.json({ ok: true, paths: savedPaths });
  } catch (err) {
    console.error("[POST /api/photos]", err);
    return NextResponse.json({ error: "Erreur upload photos" }, { status: 500 });
  }
}
