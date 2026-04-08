/**
 * 🔗 BLOCKCHAIN RECORD VERIFICATION API
 * 
 * PRODUCTION WORKFLOW:
 * 1. Farmer uploads image
 * 2. AI agent reviews and flags
 * 3. Admin verifies (human approval) ← THIS ENDPOINT IS CALLED
 * 4. Blockchain records image with complete data
 * 5. ONLY if Stage 7: Check if all stages have ≥2 images → Generate QR
 * 
 * POST /api/blockchain/record-verification
 * Body: { verifiedStageId, farmerId, batchId, adminId, adminName }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      verifiedStageId,  // ID of the verified_stages record
      farmerId,
      batchId,
      adminId,
      adminName
    } = body;

    console.log(`\n� Blockchain verification request received for stage ${verifiedStageId}`);

    // Step 1: Get the verified stage details
    const { data: verifiedStage, error: stageError } = await supabase
      .from('verified_stages')
      .select(`
        *,
        batches (
          id,
          crop_type,
          quantity,
          harvest_date,
          variety_name,
          farmer_id
        )
      `)
      .eq('id', verifiedStageId)
      .single();

    if (stageError || !verifiedStage) {
      return NextResponse.json(
        { error: 'Verified stage not found' },
        { status: 404 }
      );
    }

    // Step 2: Get farmer details
    const { data: farmer, error: farmerError } = await supabase
      .from('users')
      .select('id, full_name, location, phone')
      .eq('id', farmerId)
      .single();

    if (farmerError || !farmer) {
      return NextResponse.json(
        { error: 'Farmer not found' },
        { status: 404 }
      );
    }

    // Step 3: Get stage name mapping
    const stageNames = {
      1: 'LAND_PREPARATION',
      2: 'SOWING',
      3: 'IRRIGATION',
      4: 'FERTILIZATION',
      5: 'PEST_CONTROL',
      6: 'HARVESTING',
      7: 'PACKAGING'
    };

    // Step 4: Build complete data structure for blockchain
    const completeData = {
      farmer: {
        id: farmer.id,
        name: farmer.full_name,
        location: farmer.location,
        phone: farmer.phone
      },
      batch: {
        id: verifiedStage.batches.id,
        cropType: verifiedStage.batches.crop_type,
        quantity: verifiedStage.batches.quantity,
        harvestDate: verifiedStage.batches.harvest_date,
        varietyName: verifiedStage.batches.variety_name
      },
      stage: {
        stageName: stageNames[verifiedStage.stage_number as keyof typeof stageNames],
        stageNumber: verifiedStage.stage_number,
        uploadedAt: verifiedStage.uploaded_at
      },
      image: {
        id: verifiedStage.id,
        hash: verifiedStage.image_hash || 'N/A',
        url: verifiedStage.image_url
      },
      aiValidation: {
        score: verifiedStage.ai_score,
        action: verifiedStage.ai_action,
        fakeImageScore: verifiedStage.fake_image_score
      },
      adminVerification: {
        adminId,
        adminName,
        verifiedAt: new Date().toISOString()
      }
    };

    console.log(`📦 Complete data prepared for blockchain:`);
    console.log(`   Farmer: ${farmer.full_name}`);
    console.log(`   Batch: ${verifiedStage.batches.crop_type} - ${verifiedStage.batches.quantity}kg`);
    console.log(`   Stage: ${completeData.stage.stageName} (#${verifiedStage.stage_number})`);

    // Step 5: Import blockchain agent (dynamic import for Node.js module)
    const { handleImageVerification } = await import('@/lib/blockchain-agent');

    // Step 6: Get ALL verified images for this batch (for QR check)
    const { data: allVerifications, error: verificationsError } = await supabase
      .from('verified_stages')
      .select('id, stage_number, image_hash, verified_at, blockchain_tx_id')
      .eq('batch_id', batchId)
      .eq('status', 'verified')
      .order('verified_at', { ascending: true });

    if (verificationsError) {
      console.error('Error fetching verifications:', verificationsError);
    }

    // Format verifications for blockchain agent
    const formattedVerifications = (allVerifications || []).map(v => ({
      imageId: v.id,
      stageNumber: v.stage_number,
      imageHash: v.image_hash || '',
      verifiedAt: v.verified_at,
      transactionId: v.blockchain_tx_id || '',
      blockHash: '' // Will be filled by blockchain
    }));

    console.log(`📊 Total verified images for batch: ${formattedVerifications.length}`);

    // Step 7: Call blockchain agent workflow
    const blockchainResult = await handleImageVerification(
      completeData,
      formattedVerifications
    );

    if (!blockchainResult.success) {
      return NextResponse.json(
        { error: blockchainResult.error },
        { status: 500 }
      );
    }

    // Step 8: Update verified_stages with blockchain transaction ID
    const { error: updateError } = await supabase
      .from('verified_stages')
      .update({
        blockchain_tx_id: blockchainResult.blockchainRecord.transactionId,
        blockchain_hash: blockchainResult.blockchainRecord.blockHash
      })
      .eq('id', verifiedStageId);

    if (updateError) {
      console.error('Failed to update blockchain TX ID:', updateError);
    }

    // Step 9: If QR certificate was generated (Stage 7 complete), update batch
    if (blockchainResult.certification?.success) {
      const { certificate, qrCode } = blockchainResult.certification;
      
      const { error: batchUpdateError } = await supabase
        .from('batches')
        .update({
          certificate_id: certificate.certificateId,
          qr_code: qrCode.url,
          certificate_hash: certificate.certificateHash,
          certificate_generated_at: new Date().toISOString(),
          status: 'certified'
        })
        .eq('id', batchId);

      if (batchUpdateError) {
        console.error('Failed to update batch with certificate:', batchUpdateError);
      }

      console.log('🎓 QR Certificate saved to database!');
    }

    // Step 10: Return response
    return NextResponse.json({
      success: true,
      blockchain: {
        transactionId: blockchainResult.blockchainRecord.transactionId,
        blockHash: blockchainResult.blockchainRecord.blockHash
      },
      certification: blockchainResult.certification?.success ? {
        certificateId: blockchainResult.certification.certificate.certificateId,
        qrUrl: blockchainResult.certification.qrCode.url,
        totalImages: blockchainResult.certification.certificate.totalImages
      } : null,
      message: blockchainResult.certification?.success 
        ? 'Image verified and QR certificate generated!'
        : `Image verified and recorded on blockchain (Stage ${verifiedStage.stage_number})`
    });

  } catch (error: any) {
    console.error('❌ Blockchain verification API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check blockchain status of a batch
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get('batchId');

    if (!batchId) {
      return NextResponse.json(
        { success: false, error: 'batchId required' },
        { status: 400 }
      );
    }

    // Get all blockchain records for this batch
    const { data: verifications, error } = await supabase
      .from('verified_stages')
      .select('id, stage_number, blockchain_tx_id, blockchain_hash, verified_at, status')
      .eq('batch_id', batchId)
      .eq('status', 'verified')
      .order('verified_at', { ascending: true });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Get batch certificate info
    const { data: batch } = await supabase
      .from('batches')
      .select('certificate_id, qr_code, certificate_hash, certificate_generated_at, status')
      .eq('id', batchId)
      .single();

    return NextResponse.json({
      success: true,
      batchId,
      verifications: verifications || [],
      certificate: batch || null,
      totalVerifiedImages: verifications?.length || 0
    });

  } catch (error: any) {
    console.error('❌ Failed to get blockchain history:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
