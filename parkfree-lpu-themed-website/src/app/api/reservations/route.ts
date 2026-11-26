import { and, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { parkingReservations } from "@/db/schema";
import { PARKING_LOTS } from "@/lib/parking";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const username = new URL(request.url).searchParams.get("username")?.trim();
  if (!username) {
    return Response.json({ error: "A username is required." }, { status: 400 });
  }

  try {
    const [reservations, counts] = await Promise.all([
      db
        .select({
          id: parkingReservations.id,
          lotId: parkingReservations.lotId,
          lotName: parkingReservations.lotName,
          spotCode: parkingReservations.spotCode,
          createdAt: parkingReservations.createdAt,
        })
        .from(parkingReservations)
        .where(and(eq(parkingReservations.username, username), eq(parkingReservations.status, "active")))
        .orderBy(parkingReservations.createdAt),
      db
        .select({ lotId: parkingReservations.lotId, total: count() })
        .from(parkingReservations)
        .where(eq(parkingReservations.status, "active"))
        .groupBy(parkingReservations.lotId),
    ]);

    return Response.json({
      reservations,
      reservedCounts: Object.fromEntries(counts.map((row) => [row.lotId, Number(row.total)])),
    });
  } catch (error) {
    console.error("Could not load parking reservations", error);
    return Response.json({ error: "Reservations are temporarily unavailable." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let body: { username?: unknown; lotId?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Please send valid reservation details." }, { status: 400 });
  }

  const username = typeof body.username === "string" ? body.username.trim().slice(0, 80) : "";
  const lotId = typeof body.lotId === "string" ? body.lotId : "";
  const lot = PARKING_LOTS.find((candidate) => candidate.id === lotId);

  if (!username || !lot) {
    return Response.json({ error: "A username and a valid parking area are required." }, { status: 400 });
  }

  try {
    const duplicate = await db
      .select({ id: parkingReservations.id })
      .from(parkingReservations)
      .where(
        and(
          eq(parkingReservations.username, username),
          eq(parkingReservations.lotId, lot.id),
          eq(parkingReservations.status, "active"),
        ),
      )
      .limit(1);

    if (duplicate.length > 0) {
      return Response.json({ error: "You already have a spot reserved in this area." }, { status: 409 });
    }

    const existingSpots = await db
      .select({ spotCode: parkingReservations.spotCode })
      .from(parkingReservations)
      .where(and(eq(parkingReservations.lotId, lot.id), eq(parkingReservations.status, "active")));

    if (existingSpots.length >= lot.available) {
      return Response.json({ error: "This parking area has just filled up. Choose another spot." }, { status: 409 });
    }

    const occupiedSpotNumbers = new Set(
      existingSpots
        .map((reservation) => Number(reservation.spotCode.slice(lot.spotPrefix.length + 1)))
        .filter(Number.isFinite),
    );
    const firstAvailableNumber = Array.from({ length: lot.available }, (_, index) => lot.total - lot.available + index + 1)
      .find((spotNumber) => !occupiedSpotNumbers.has(spotNumber));

    if (!firstAvailableNumber) {
      return Response.json({ error: "This parking area has just filled up. Choose another spot." }, { status: 409 });
    }

    const [reservation] = await db
      .insert(parkingReservations)
      .values({
        username,
        lotId: lot.id,
        lotName: lot.name,
        spotCode: `${lot.spotPrefix}-${String(firstAvailableNumber).padStart(2, "0")}`,
      })
      .returning({
        id: parkingReservations.id,
        lotId: parkingReservations.lotId,
        lotName: parkingReservations.lotName,
        spotCode: parkingReservations.spotCode,
        createdAt: parkingReservations.createdAt,
      });

    return Response.json({ reservation }, { status: 201 });
  } catch (error) {
    console.error("Could not create parking reservation", error);
    return Response.json({ error: "Your spot could not be reserved right now." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  let body: { username?: unknown; id?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Please send valid cancellation details." }, { status: 400 });
  }

  const username = typeof body.username === "string" ? body.username.trim().slice(0, 80) : "";
  const id = typeof body.id === "string" ? body.id : "";

  if (!username || !/^[0-9a-f-]{36}$/i.test(id)) {
    return Response.json({ error: "A username and valid reservation ID are required." }, { status: 400 });
  }

  try {
    const cancelled = await db
      .update(parkingReservations)
      .set({ status: "cancelled" })
      .where(
        and(
          eq(parkingReservations.id, id),
          eq(parkingReservations.username, username),
          eq(parkingReservations.status, "active"),
        ),
      )
      .returning({ id: parkingReservations.id });

    if (cancelled.length === 0) {
      return Response.json({ error: "That active reservation could not be found." }, { status: 404 });
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Could not cancel parking reservation", error);
    return Response.json({ error: "Your reservation could not be cancelled right now." }, { status: 500 });
  }
}
