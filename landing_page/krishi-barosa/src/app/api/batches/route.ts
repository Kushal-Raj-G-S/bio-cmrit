import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cache for 10 seconds
export const revalidate = 10;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST endpoint - Create a new batch
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await request.json();
    const { name, category, area, location, description, farmerId, sowingDate } = body;

    if (!name || !category || !area || !farmerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get batch count to generate batch code
    const { count } = await supabase
      .from('batches')
      .select('*', { count: 'exact', head: true });

    const batchCode = 'FB' + String((count || 0) + 1).padStart(3, '0');

    // Create new batch
    const { data: newBatch, error } = await supabase
      .from('batches')
      .insert({
        batchCode,
        name,
        category,
        area: parseFloat(area),
        sowingDate: sowingDate || new Date().toISOString(),
        description: description || '',
        status: 'ACTIVE',
        verified: false,
        verificationStatus: 'PENDING',
        farmerId: farmerId,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${batchCode}`,
        imageUrls: [],
        location: {
          lat: 28.6139 + (Math.random() - 0.5) * 0.1,
          lng: 77.2090 + (Math.random() - 0.5) * 0.1,
          address: location || 'Farm Location, India' // Use location from form or default
        }
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating batch:', error);
      return NextResponse.json(
        { error: 'Failed to create batch' },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Created batch ${newBatch.batchCode} in ${duration}ms`);

    return NextResponse.json(newBatch, { status: 201 });
  } catch (error) {
    console.error('Error creating batch:', error);
    return NextResponse.json(
      { error: 'Failed to create batch' },
      { status: 500 }
    );
  }
}

// GET endpoint - Fetch batches
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  try {
    const { searchParams } = new URL(request.url);
    const farmerId = searchParams.get('farmerId');
    const limit = parseInt(searchParams.get('limit') || '100'); // Add limit

    let query = supabase
      .from('batches')
      .select('*')
      .order('createdAt', { ascending: false })
      .limit(limit); // Limit results

    if (farmerId) {
      query = query.eq('farmerId', farmerId);
    }

    const { data: batches, error } = await query;

    if (error) {
      console.error('Error fetching batches:', error);
      return NextResponse.json(
        { error: 'Failed to fetch batches' },
        { status: 500 }
      );
    }

    // Integration fallback:
    // If no batches are found for current farmer (common after port change/localStorage reset),
    // return recent batches so dashboard is not empty.
    let resultBatches = batches || [];
    if (farmerId && resultBatches.length === 0) {
      const { data: fallbackBatches, error: fallbackError } = await supabase
        .from('batches')
        .select('*')
        .order('createdAt', { ascending: false })
        .limit(limit);

      if (!fallbackError && fallbackBatches) {
        resultBatches = fallbackBatches;
      }
    }

    const duration = Date.now() - startTime;
    console.log(`📦 Fetched ${resultBatches.length} batches in ${duration}ms`);

    return NextResponse.json(resultBatches, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30'
      }
    });
  } catch (error) {
    console.error('Error fetching batches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch batches' },
      { status: 500 }
    );
  }
}

// PATCH endpoint - Update batch verification
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { batchId, verified, adminId } = body;

    if (!batchId || verified === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data: updatedBatch, error } = await supabase
      .from('batches')
      .update({
        verified: verified,
        verificationStatus: verified ? 'VERIFIED' : 'REJECTED',
        verifiedAt: new Date().toISOString(),
        verifiedBy: adminId,
      })
      .eq('id', batchId)
      .select('*, farmerId') // Select all columns including farmerId
      .single();

    if (error) {
      console.error('Error updating batch verification:', error);
      return NextResponse.json(
        { error: 'Failed to update batch verification', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Batch verification updated:', {
      batchId,
      verified,
      verificationStatus: verified ? 'VERIFIED' : 'REJECTED'
    });

    return NextResponse.json(updatedBatch);
  } catch (error) {
    console.error('Error updating batch verification:', error);
    return NextResponse.json(
      { error: 'Failed to update batch verification' },
      { status: 500 }
    );
  }
}
