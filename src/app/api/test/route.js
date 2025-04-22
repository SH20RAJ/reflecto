import { NextResponse } from 'next/server';
import { db } from '@/db/index';
import { fooTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * GET /api/test
 * Get all records from the foo table
 */
export async function GET() {
  try {
    const items = await db.select().from(fooTable);
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error in GET /api/test:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/test
 * Create a new record in the foo table
 */
export async function POST(request) {
  try {
    const data = await request.json();

    // Validate the request body
    if (!data.bar) {
      return NextResponse.json({ error: 'Bar field is required' }, { status: 400 });
    }

    // Insert the record
    const result = await db.insert(fooTable).values({
      bar: data.bar
    }).returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/test:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PUT /api/test
 * Update a record in the foo table
 */
export async function PUT(request) {
  try {
    const data = await request.json();

    // Validate the request body
    if (!data.oldBar || !data.newBar) {
      return NextResponse.json({ error: 'oldBar and newBar fields are required' }, { status: 400 });
    }

    // Update the record
    const result = await db.update(fooTable)
      .set({ bar: data.newBar })
      .where(eq(fooTable.bar, data.oldBar))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error in PUT /api/test:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * DELETE /api/test
 * Delete a record from the foo table
 */
export async function DELETE(request) {
  try {
    const data = await request.json();

    // Validate the request body
    if (!data.bar) {
      return NextResponse.json({ error: 'Bar field is required' }, { status: 400 });
    }

    // Delete the record
    const result = await db.delete(fooTable)
      .where(eq(fooTable.bar, data.bar))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/test:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
