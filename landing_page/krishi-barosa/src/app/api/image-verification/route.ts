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
      imageUrl, 
      verificationStatus, 
      rejectionReason, // Admin's reason when marking as FAKE
      stageId, 
      batchId, 
      farmerId, 
      verifiedBy 
    } = body;

    if (!imageUrl || !verificationStatus || !stageId || !batchId || !farmerId || !verifiedBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // If marking as FAKE, rejectionReason is required
    if (verificationStatus === 'FAKE' && !rejectionReason) {
      return NextResponse.json(
        { error: 'Rejection reason is required when marking image as FAKE' },
        { status: 400 }
      );
    }

    // Validate verification status
    if (!['REAL', 'FAKE'].includes(verificationStatus)) {
      return NextResponse.json(
        { error: 'Invalid verification status. Must be REAL or FAKE' },
        { status: 400 }
      );
    }

    // If marking as FAKE, delete the image from Supabase Storage
    if (verificationStatus === 'FAKE') {
      try {
        // Extract file path from Supabase URL
        const urlParts = imageUrl.split('/storage/v1/object/public/');
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          const { error: deleteError } = await supabase.storage
            .from('batch-images')
            .remove([filePath]);
          
          if (deleteError) {
            console.error('Error deleting fake image from storage:', deleteError);
          } else {
            console.log('Successfully deleted fake image from storage:', filePath);
          }
        }
      } catch (deleteErr) {
        console.error('Error parsing/deleting image URL:', deleteErr);
      }
    }

    // Check if verification record already exists
    const { data: existing } = await supabase
      .from('image_verifications')
      .select('*')
      .eq('imageUrl', imageUrl)
      .eq('stageId', stageId)
      .single();

    let imageVerification;
    
    if (existing) {
      // Update existing record
      const updateData: any = {
        verificationStatus,
        verifiedBy,
        verifiedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Add rejection reason if marking as FAKE
      if (verificationStatus === 'FAKE') {
        updateData.rejectionReason = rejectionReason;
      } else {
        // Clear rejection reason if marking as REAL
        updateData.rejectionReason = null;
      }

      const { data, error } = await supabase
        .from('image_verifications')
        .update(updateData)
        .eq('imageUrl', imageUrl)
        .eq('stageId', stageId)
        .select()
        .single();

      if (error) throw error;
      imageVerification = data;
    } else {
      // Insert new record
      const insertData: any = {
        imageUrl,
        verificationStatus,
        verifiedBy,
        verifiedAt: new Date().toISOString(),
        stageId,
        batchId,
        farmerId
      };

      // Add rejection reason if marking as FAKE
      if (verificationStatus === 'FAKE') {
        insertData.rejectionReason = rejectionReason;
      }

      const { data, error } = await supabase
        .from('image_verifications')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      imageVerification = data;
    }

    // Create notification for farmer (async, non-blocking)
    createNotificationForFarmer(imageVerification, farmerId, verificationStatus, rejectionReason)
      .then(() => {
        console.log('✅ Notification created successfully for farmer:', farmerId);
      })
      .catch(err => {
        console.error('❌ Error creating notification:', err);
      });

    // 🔗 BLOCKCHAIN INTEGRATION: Record verified image to blockchain
    let blockchainResponse = null;
    if (verificationStatus === 'REAL') {
      try {
        console.log('📸 Recording verified image to blockchain...');
        blockchainResponse = await recordImageToBlockchain({
          imageVerification,
          batchId,
          farmerId,
          stageId
        });
        console.log('✅ Image recorded to blockchain:', blockchainResponse?.transactionId);
      } catch (error) {
        console.error('❌ Blockchain recording failed (non-blocking):', error);
        // Don't fail verification if blockchain fails
      }

      // 🎯 Check if Stage 7 is complete and trigger QR generation
      if (blockchainResponse) {
        try {
          await checkAndGenerateQRIfComplete(batchId, stageId);
        } catch (error) {
          console.error('❌ QR generation check failed:', error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      verification: imageVerification,
      notificationCreated: true, // Let frontend know notification was triggered
      blockchain: blockchainResponse ? {
        recorded: true,
        transactionId: blockchainResponse.transactionId,
        blockNumber: blockchainResponse.blockNumber,
        // 🎉 PASS THROUGH QR CODE DATA IF GENERATED
        qrGenerated: blockchainResponse.qrGenerated || false,
        qrCode: blockchainResponse.qrCode || null
      } : null
    });

  } catch (error) {
    console.error('Error updating image verification:', error);
    return NextResponse.json(
      { error: 'Failed to update image verification' },
      { status: 500 }
    );
  }
}

/**
 * Record verified image to blockchain
 * First image: includes farmer + batch details
 * Subsequent images: image data only
 */
async function recordImageToBlockchain({
  imageVerification,
  batchId,
  farmerId,
  stageId
}: {
  imageVerification: any;
  batchId: string;
  farmerId: string;
  stageId: string;
}) {
  try {
    // Check if this is the first verified image for the batch
    const { data: existingVerifications, error: countError } = await supabase
      .from('image_verifications')
      .select('id, blockchainTxId')
      .eq('batchId', batchId)
      .eq('verificationStatus', 'REAL')
      .not('blockchainTxId', 'is', null);

    if (countError) {
      console.error('Error checking existing verifications:', countError);
      throw countError;
    }

    const isFirstImage = !existingVerifications || existingVerifications.length === 0;

    console.log(`📊 First image in batch: ${isFirstImage}`);

    // Fetch stage details to get stage name
    const { data: stageData, error: stageError } = await supabase
      .from('stages')
      .select('name')
      .eq('id', stageId)
      .single();

    if (stageError || !stageData) {
      console.error('Error fetching stage:', stageError);
      throw new Error('Could not fetch stage details');
    }

    // Fetch farmer details (always needed)
    const { data: farmerData, error: farmerError } = await supabase
      .from('users')
      .select('name, location')
      .eq('id', farmerId)
      .single();

    if (farmerError) {
      console.error('Error fetching farmer:', farmerError);
      throw farmerError;
    }

    // Build request body in new format for frontend bridge
    let requestBody: any = {
      batchId,
      isFirstImage,
      stageName: stageData.name,
      farmerDetails: {
        name: farmerData.name || 'Unknown Farmer',
        location: farmerData.location || 'Unknown Location'
      },
      imageUrl: imageVerification.imageUrl
    };

    // If first image, add batch details
    if (isFirstImage) {
      // Fetch batch details
      const { data: batchData, error: batchError } = await supabase
        .from('batches')
        .select('name, category, area')
        .eq('id', batchId)
        .single();

      if (batchError) {
        console.error('Error fetching batch:', batchError);
        throw batchError;
      }

      requestBody.batchDetails = {
        cropType: batchData.name || batchData.category || 'Unknown Crop',
        quantity: batchData.area || 0,
        unit: 'hectares'
      };
    }

    // Call FRONTEND BRIDGE (port 8080) which forwards to blockchain bridge (port 9000)
    const frontendBridgeUrl = 'http://localhost:8080/record-image';

    console.log(`🔗 Calling frontend bridge: ${frontendBridgeUrl}`);
    console.log('📦 Request:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(frontendBridgeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: requestBody })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Blockchain API error: ${errorText}`);
    }

    const blockchainResult = await response.json();

    console.log('✅ Blockchain response:', {
      success: blockchainResult.success,
      transactionId: blockchainResult.transactionId,
      blockNumber: blockchainResult.blockNumber,
      stage: blockchainResult.stage,
      qrGenerated: blockchainResult.qrGenerated
    });

    // 🎉 CHECK IF QR WAS AUTO-GENERATED BY BLOCKCHAIN
    if (blockchainResult.qrGenerated && blockchainResult.qrCode) {
      console.log('\n╔════════════════════════════════════════════════════════╗');
      console.log('║  🎉 QR AUTO-GENERATED BY BLOCKCHAIN!                  ║');
      console.log('╚════════════════════════════════════════════════════════╝');
      console.log('   QR URL:', blockchainResult.qrCode.qrUrl);
      console.log('   Certificate ID:', blockchainResult.qrCode.batchId);
      console.log('   Stages:', blockchainResult.qrCode.stages);
      console.log('   Images:', blockchainResult.qrCode.images);
      console.log('');
      
      // Save QR code to batches table
      console.log('💾 Saving QR to database...');
      const { data: updatedBatch, error: qrUpdateError } = await supabase
        .from('batches')
        .update({
          qrCode: blockchainResult.qrCode.qrUrl,
          certificate_id: blockchainResult.qrCode.batchId,
          status: 'CERTIFIED'
        })
        .eq('id', batchId)
        .select()
        .single();
        
      if (qrUpdateError) {
        console.error('❌ Failed to save QR code:', qrUpdateError);
      } else {
        console.log('✅ QR code saved to database!');
        console.log('   Batch status:', updatedBatch.status);
        console.log('   QR URL:', updatedBatch.qrCode);
        
        // Notify farmer about certificate generation
        await supabase.from('notifications').insert({
          userId: farmerId,
          type: 'CERTIFICATE_GENERATED',
          message: `🎉 Congratulations! Your batch certificate has been generated. All 7 farming stages completed!`,
          metadata: {
            batchId,
            certificateId: blockchainResult.qrCode.batchId,
            qrUrl: blockchainResult.qrCode.qrUrl,
            stages: blockchainResult.qrCode.stages,
            totalImages: blockchainResult.qrCode.images
          },
          read: false,
          createdAt: new Date().toISOString()
        });
        console.log('📧 Certificate notification sent to farmer');
      }
    }

    // Update image_verifications with blockchain details
    const { error: updateError } = await supabase
      .from('image_verifications')
      .update({
        blockchainTxId: blockchainResult.transactionId,
        blockchainHash: blockchainResult.imageHash,
        blockchainRecordedAt: new Date().toISOString(),
        blockNumber: blockchainResult.blockNumber,
        isFirstImageInBatch: isFirstImage
      })
      .eq('id', imageVerification.id);

    if (updateError) {
      console.error('Error updating blockchain details:', updateError);
      // Don't throw - blockchain recording succeeded
    }

    // Log batch data from blockchain
    if (blockchainResult.batchData) {
      console.log('📦 Batch Data:', {
        batchId: blockchainResult.batchData.batchId,
        currentStage: blockchainResult.batchData.currentStage,
        totalStages: blockchainResult.batchData.stages?.length || 0
      });
    }

    return blockchainResult;

  } catch (error) {
    console.error('❌ Blockchain recording error:', error);
    throw error;
  }
}

/**
 * Check if all stages are complete and generate QR if ready
 */
async function checkAndGenerateQRIfComplete(batchId: string, currentStageId: string) {
  try {
    // Fetch stage details to get stage name
    const { data: stageData, error: stageError } = await supabase
      .from('stages')
      .select('name')
      .eq('id', currentStageId)
      .single();

    if (stageError || !stageData) {
      console.log('⚠️  Could not fetch stage details');
      return;
    }

    const stageName = stageData.name.toLowerCase();
    
    // Check if this is the Storage stage (Stage 7)
    const isStorageStage = stageName.includes('storage') || stageName.includes('stage 7');

    // Only check after Storage stage (Stage 7) verification
    if (!isStorageStage) {
      console.log(`⏭️  ${stageData.name} verified - waiting for Storage stage`);
      return;
    }

    console.log('🎯 Storage stage verified - checking if all stages complete...');

    // Count verified images per stage
    const { data: verifications, error } = await supabase
      .from('image_verifications')
      .select('stageId, stages!inner(name)')
      .eq('batchId', batchId)
      .eq('verificationStatus', 'REAL');

    if (error) {
      console.error('Error fetching stage counts:', error);
      throw error;
    }

    // Count images per stage name
    const stageImageCounts: { [key: string]: number } = {};
    verifications?.forEach((record: any) => {
      const stageName = record.stages.name;
      stageImageCounts[stageName] = (stageImageCounts[stageName] || 0) + 1;
    });

    console.log('📊 Stage counts:', stageImageCounts);

    // Define the 7 required stages (match your database)
    const requiredStages = [
      'Land Preparation',
      'Sowing',
      'Growth',
      'Maintenance', 
      'Harvesting',
      'Processing',
      'Storage'
    ];

    // Check if all 7 stages have at least 2 images
    const allStagesComplete = requiredStages.every(
      stageName => (stageImageCounts[stageName] || 0) >= 2
    );

    if (!allStagesComplete) {
      const incompleteStages = requiredStages
        .filter(stageName => (stageImageCounts[stageName] || 0) < 2);
      
      console.log(`⏳ Not ready for QR - incomplete stages: ${incompleteStages.join(', ')}`);
      return;
    }

    console.log('✅ All 7 stages complete! Generating QR certificate...');

    // Trigger QR generation
    const qrResponse = await fetch(`http://localhost:3000/api/blockchain/generate-qr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ batchId })
    });

    if (!qrResponse.ok) {
      const errorText = await qrResponse.text();
      throw new Error(`QR generation failed: ${errorText}`);
    }

    const qrResult = await qrResponse.json();
    console.log('🎉 QR certificate generated!', qrResult.certificateId);

  } catch (error) {
    console.error('❌ Error checking/generating QR:', error);
    throw error;
  }
}

// Helper function to create farmer notification
async function createNotificationForFarmer(
  verification: any,
  farmerId: string,
  status: string,
  rejectionReason?: string
) {
  try {
    console.log('📧 Creating notification for farmer:', farmerId, 'Status:', status);
    
    const notificationData: any = {
      userId: farmerId,
      metadata: {
        imageUrl: verification.imageUrl,
        stageId: verification.stageId,
        batchId: verification.batchId,
        verificationId: verification.id
      }
    };

    if (status === 'REAL') {
      notificationData.type = 'IMAGE_VERIFIED';
      notificationData.title = '✅ Image Verified';
      notificationData.message = 'Your uploaded image has been verified as authentic by admin.';
    } else if (status === 'FAKE') {
      notificationData.type = 'IMAGE_FLAGGED';
      notificationData.title = '❌ Image Flagged';
      notificationData.message = rejectionReason 
        ? `Your image was flagged as fake. Reason: ${rejectionReason}`
        : 'Your image was flagged as fake. Please review and reupload.';
      notificationData.metadata.rejectionReason = rejectionReason;
    }

    console.log('📧 Notification data:', JSON.stringify(notificationData, null, 2));

    const { data, error } = await supabase
      .from('notifications')
      .insert(notificationData)
      .select();

    if (error) {
      console.error('❌ Supabase error creating notification:', error);
      throw error;
    }

    console.log('✅ Notification created in database:', data);

  } catch (error) {
    console.error('❌ Failed to create notification:', error);
    throw error; // Throw so we can see the error in logs
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stageId = searchParams.get('stageId');
    const batchId = searchParams.get('batchId');

    if (!stageId && !batchId) {
      return NextResponse.json(
        { error: 'Either stageId or batchId is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('image_verifications')
      .select('*');

    if (stageId) {
      query = query.eq('stageId', stageId);
    } else if (batchId) {
      query = query.eq('batchId', batchId);
    }

    const { data: verifications, error } = await query;

    if (error) {
      console.error('Error fetching verifications:', error);
      return NextResponse.json(
        { error: 'Failed to fetch verifications' },
        { status: 500 }
      );
    }

    // Optionally fetch verifier details separately if needed
    const verificationsWithDetails = verifications || [];

    return NextResponse.json({ verifications: verificationsWithDetails });

  } catch (error) {
    console.error('Error fetching image verifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch image verifications' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('imageUrl');
    const stageId = searchParams.get('stageId');

    if (!imageUrl || !stageId) {
      return NextResponse.json(
        { error: 'imageUrl and stageId are required' },
        { status: 400 }
      );
    }

    // Delete the verification record
    const { error } = await supabase
      .from('image_verifications')
      .delete()
      .eq('imageUrl', imageUrl)
      .eq('stageId', stageId);

    if (error) {
      console.error('Error deleting verification:', error);
      return NextResponse.json(
        { error: 'Failed to delete verification' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification status reset'
    });

  } catch (error) {
    console.error('Error resetting image verification:', error);
    return NextResponse.json(
      { error: 'Failed to reset image verification' },
      { status: 500 }
    );
  }
}
