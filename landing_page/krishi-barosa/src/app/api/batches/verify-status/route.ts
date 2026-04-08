import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Check batch verification status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get('batchId');

    if (!batchId) {
      return NextResponse.json(
        { error: 'batchId is required' },
        { status: 400 }
      );
    }

    // 1. Get all stages for this batch
    const { data: stages, error: stagesError } = await supabase
      .from('stages')
      .select('*')
      .eq('batchId', batchId);

    if (stagesError) {
      console.error('Error fetching stages:', stagesError);
      return NextResponse.json(
        { error: 'Failed to fetch stages' },
        { status: 500 }
      );
    }

    if (!stages || stages.length === 0) {
      return NextResponse.json({
        batchId,
        totalStages: 0,
        completedStages: 0,
        totalImages: 0,
        verifiedImages: 0,
        flaggedImages: 0,
        pendingImages: 0,
        allImagesVerified: false,
        readyForBlockchain: false,
        verificationPercentage: 0,
        message: 'No stages found for this batch'
      });
    }

    // 2. Get all image URLs from stages
    const allImageUrls: string[] = [];
    stages.forEach(stage => {
      if (stage.imageUrls && Array.isArray(stage.imageUrls)) {
        allImageUrls.push(...stage.imageUrls);
      }
    });

    const totalImages = allImageUrls.length;

    if (totalImages === 0) {
      return NextResponse.json({
        batchId,
        totalStages: stages.length,
        completedStages: stages.length,
        totalImages: 0,
        verifiedImages: 0,
        flaggedImages: 0,
        pendingImages: 0,
        allImagesVerified: false,
        readyForBlockchain: false,
        verificationPercentage: 0,
        message: 'No images uploaded yet'
      });
    }

    // 3. Get verification status for all images
    const { data: verifications, error: verificationsError } = await supabase
      .from('image_verifications')
      .select('*')
      .eq('batchId', batchId);

    if (verificationsError) {
      console.error('Error fetching verifications:', verificationsError);
      return NextResponse.json(
        { error: 'Failed to fetch verifications' },
        { status: 500 }
      );
    }

    // 4. Count verification statuses
    const verifiedImages = verifications?.filter(v => v.verificationStatus === 'REAL').length || 0;
    const flaggedImages = verifications?.filter(v => v.verificationStatus === 'FAKE').length || 0;
    const pendingImages = totalImages - verifiedImages - flaggedImages;

    // 5. Check if all images are verified as REAL
    const allImagesVerified = totalImages > 0 && verifiedImages === totalImages && flaggedImages === 0;

    // 6. Calculate verification percentage
    const verificationPercentage = totalImages > 0 ? Math.round((verifiedImages / totalImages) * 100) : 0;

    // 7. Determine if ready for blockchain
    // Criteria: All stages complete AND all images verified as REAL
    const readyForBlockchain = allImagesVerified && stages.length === 7; // Assuming 7 farming stages

    // 8. Get batch details
    const { data: batch } = await supabase
      .from('batches')
      .select('*')
      .eq('id', batchId)
      .single();

    // 9. Build detailed stage verification status
    const stageVerifications = stages.map(stage => {
      const stageImageUrls = stage.imageUrls || [];
      const stageVerificationData = stageImageUrls.map((imageUrl: string) => {
        const verification = verifications?.find(v => v.imageUrl === imageUrl && v.stageId === stage.id);
        return {
          imageUrl,
          status: verification?.verificationStatus || 'PENDING',
          rejectionReason: verification?.rejectionReason || null
        };
      });

      const stageVerified = stageVerificationData.every((img: any) => img.status === 'REAL');
      const stageFlagged = stageVerificationData.some((img: any) => img.status === 'FAKE');

      return {
        stageId: stage.id,
        stageName: stage.name,
        imageCount: stageImageUrls.length,
        verified: stageVerified && stageImageUrls.length > 0,
        flagged: stageFlagged,
        images: stageVerificationData
      };
    });

    return NextResponse.json({
      batchId,
      batchCode: batch?.batchCode || null,
      batchName: batch?.name || null,
      totalStages: stages.length,
      completedStages: stages.length,
      totalImages,
      verifiedImages,
      flaggedImages,
      pendingImages,
      allImagesVerified,
      readyForBlockchain,
      verificationPercentage,
      stageVerifications,
      message: readyForBlockchain 
        ? '✅ Batch ready for blockchain sync!' 
        : allImagesVerified 
        ? '⏳ All images verified, but not all stages completed'
        : flaggedImages > 0
        ? `⚠️ ${flaggedImages} image(s) flagged - needs correction`
        : `⏳ ${pendingImages} image(s) pending admin review`
    });

  } catch (error) {
    console.error('Error checking batch verification status:', error);
    return NextResponse.json(
      { error: 'Failed to check batch verification status' },
      { status: 500 }
    );
  }
}
