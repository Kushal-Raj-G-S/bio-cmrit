import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET endpoint - Fetch stages for a specific batch
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get('batchId');

    if (!batchId) {
      return NextResponse.json(
        { error: 'Batch ID is required' },
        { status: 400 }
      );
    }

    const { data: stages, error } = await supabase
      .from('stages')
      .select('*')
      .eq('batchId', batchId)
      .order('createdAt', { ascending: true });

    if (error) {
      console.error('Error fetching stages:', error);
      return NextResponse.json(
        { error: 'Failed to fetch stages' },
        { status: 500 }
      );
    }

    return NextResponse.json(stages || []);
  } catch (error) {
    console.error('Error fetching stages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stages' },
      { status: 500 }
    );
  }
}

// POST endpoint - Create or update stage
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { batchId, farmerId, stages } = body;

    if (!batchId || !farmerId || !stages || !Array.isArray(stages)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Process each stage submission
    const results = await Promise.all(
      stages.map(async (stageData: { name: string; status: string; notes: string; images: string[] }) => {
        const { name, status, notes, images } = stageData;

        // Validate minimum image requirement (images should have AI validation completed)
        if (!images || images.length < 2) {
          throw new Error(`Stage "${name}" requires at least 2 images`);
        }
        
        // Check if stage already exists
        const { data: existingStage } = await supabase
          .from('stages')
          .select('*')
          .eq('batchId', batchId)
          .eq('name', name)
          .single();

        if (existingStage) {
          // Update existing stage
          const { data: updatedStage, error } = await supabase
            .from('stages')
            .update({
              status: status || 'PENDING',
              notes: notes || '',
              imageUrls: images,
            })
            .eq('id', existingStage.id)
            .select()
            .single();

          if (error) throw error;
          return updatedStage;
        } else {
          // Create new stage
          const { data: newStage, error } = await supabase
            .from('stages')
            .insert({
              name,
              status: status || 'PENDING',
              notes: notes || '',
              imageUrls: images,
              batchId,
              farmerId
            })
            .select()
            .single();

          if (error) throw error;
          return newStage;
        }
      })
    );

    return NextResponse.json(results, { status: 201 });
  } catch (error) {
    console.error('Error creating/updating stages:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process stages' },
      { status: 500 }
    );
  }
}

// PATCH endpoint - Add images to existing stage (for AI validation flow)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { stageId, imageUrls } = body;

    if (!stageId) {
      return NextResponse.json(
        { error: 'Stage ID is required' },
        { status: 400 }
      );
    }

    if (!imageUrls || !Array.isArray(imageUrls)) {
      return NextResponse.json(
        { error: 'imageUrls array is required' },
        { status: 400 }
      );
    }

    // Get existing stage to merge images
    const { data: existingStage, error: fetchError } = await supabase
      .from('stages')
      .select('imageUrls')
      .eq('id', stageId)
      .single();

    if (fetchError) {
      console.error('Error fetching stage:', fetchError);
      return NextResponse.json(
        { error: 'Stage not found' },
        { status: 404 }
      );
    }

    // Merge existing and new images
    const existingImages = existingStage.imageUrls || [];
    const updatedImages = [...existingImages, ...imageUrls];

    // Update stage with merged images
    const { data: updatedStage, error: updateError } = await supabase
      .from('stages')
      .update({ 
        imageUrls: updatedImages,
        status: 'COMPLETED' // Mark as completed once images are added
      })
      .eq('id', stageId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating stage:', updateError);
      return NextResponse.json(
        { error: 'Failed to update stage with images' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedStage);
  } catch (error) {
    console.error('Error in PATCH /api/stages:', error);
    return NextResponse.json(
      { error: 'Failed to update stage' },
      { status: 500 }
    );
  }
}

// PUT endpoint - Update specific stage
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { stageId, status, notes, images } = body;

    if (!stageId) {
      return NextResponse.json(
        { error: 'Stage ID is required' },
        { status: 400 }
      );
    }

    // Validate minimum image requirement if images are provided
    if (images && images.length < 2) {
      return NextResponse.json(
        { error: 'Minimum 2 images required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, any> = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (images) updateData.imageUrls = images;

    const { data: updatedStage, error } = await supabase
      .from('stages')
      .update(updateData)
      .eq('id', stageId)
      .select()
      .single();

    if (error) {
      console.error('Error updating stage:', error);
      return NextResponse.json(
        { error: 'Failed to update stage' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedStage);
  } catch (error) {
    console.error('Error updating stage:', error);
    return NextResponse.json(
      { error: 'Failed to update stage' },
      { status: 500 }
    );
  }
}
