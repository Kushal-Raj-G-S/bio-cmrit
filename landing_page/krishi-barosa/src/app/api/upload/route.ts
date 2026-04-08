import { NextRequest, NextResponse } from 'next/server';
import { supabase, STORAGE_BUCKET, UPLOAD_CONFIG, generateFileName, getPublicUrl } from '@/lib/supabase-config';
import { imageValidationAgent, type ImageValidationResult } from '@/lib/ai-validation-agent';

// File validation helper
function validateFile(file: File): { valid: boolean; error?: string } {
  if (!UPLOAD_CONFIG.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${UPLOAD_CONFIG.allowedTypes.join(', ')}`
    };
  }

  if (file.size > UPLOAD_CONFIG.maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${UPLOAD_CONFIG.maxSize / 1024 / 1024}MB`
    };
  }

  return { valid: true };
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated (add your auth logic here)
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const farmerName = formData.get('farmerName') as string;
    const batchName = formData.get('batchName') as string;
    const stageName = formData.get('stageName') as string;
    const batchId = formData.get('batchId') as string; // For AI validation
    const stageId = formData.get('stageId') as string; // For AI validation
    const farmerId = formData.get('farmerId') as string; // For AI validation

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Generate organized file path with folder structure
    const fileExtension = file.name.split('.').pop();
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    
    // Create organized folder structure: farmer-name/batch-name/stage-name/filename
    const sanitizeFolderName = (name: string) => 
      name?.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase() || 'unknown';
    
    const organizedPath = [
      sanitizeFolderName(farmerName),
      sanitizeFolderName(batchName),
      sanitizeFolderName(stageName),
      `${timestamp}-${randomString}.${fileExtension}`
    ].join('/');

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Supabase Storage with organized path
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(organizedPath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json(
        { error: 'Failed to upload image to storage' },
        { status: 500 }
      );
    }

    // Generate public URL
    const imageUrl = getPublicUrl(data.path);

    // 🤖 AI VALIDATION - Automatically validate uploaded image
    let aiValidationResult: ImageValidationResult | null = null;
    if (batchId && stageId && farmerId) {
      try {
        console.log('🤖 Running AI validation for uploaded image...');
        
        // Run AI validation agent (pass buffer and file type, NOT URL)
        aiValidationResult = await imageValidationAgent(buffer, file.type);
        
        console.log('✅ AI Validation completed:', {
          deepfakeScore: aiValidationResult.deepfakeScore,
          aiAction: aiValidationResult.aiAction,
          formatValid: aiValidationResult.formatValid,
          integrityValid: aiValidationResult.integrityValid
        });

        // Log to raw_uploads table (upsert to handle duplicate image hashes)
        const { data: rawUpload, error: rawUploadError } = await supabase
          .from('raw_uploads')
          .upsert({
            batchId,
            stageId,
            farmerId,
            imageUrl,
            imageHash: aiValidationResult.imageHash,
            fileSize: file.size,
            uploadedAt: new Date().toISOString()
          }, {
            onConflict: 'imageHash',
            ignoreDuplicates: false
          })
          .select()
          .single();

        if (rawUploadError) {
          console.error('Error logging raw upload:', rawUploadError);
          // Continue even if raw upload logging fails
        }

        // Store AI validation results (only if rawUpload succeeded)
        let aiValidation = null;
        if (rawUpload?.id) {
          const { data, error: aiValidationError } = await supabase
            .from('ai_validations')
            .insert({
              rawUploadId: rawUpload.id,
              batchId,
              stageId,
              imageUrl,
              imageHash: aiValidationResult.imageHash,
              formatValid: aiValidationResult.formatValid,
              integrityValid: aiValidationResult.integrityValid,
              deepfakeScore: aiValidationResult.deepfakeScore,
              visualSenseScore: aiValidationResult.visualSenseScore,
              aiAction: aiValidationResult.aiAction,
              aiReason: aiValidationResult.aiReason,
              aiRequiresHumanReview: aiValidationResult.aiRequiresHumanReview,
              aiModel: 'prithivMLmods/Deep-Fake-Detector-v2-Model',
              validatedAt: new Date().toISOString()
            })
            .select()
            .single();

          if (aiValidationError) {
            console.error('Error storing AI validation:', aiValidationError);
          } else {
            aiValidation = data;
          }
        } else {
          console.warn('⚠️ Skipping AI validation insert - no rawUploadId available');
        }

        // Handle AI decision
        if (aiValidationResult.aiAction === 'AUTO_REJECT') {
          // Notify farmer about rejection
          await supabase.from('notifications').insert({
            userId: farmerId,
            type: 'IMAGE_FLAGGED',
            message: `AI detected potential deepfake/fake image. Reason: ${aiValidationResult.aiReason}`,
            metadata: {
              batchId,
              stageId,
              imageUrl,
              deepfakeScore: aiValidationResult.deepfakeScore,
              aiAction: 'AUTO_REJECT'
            },
            read: false,
            createdAt: new Date().toISOString()
          });

          console.log('🚫 Image AUTO-REJECTED by AI - Deepfake detected');

        } else if (aiValidationResult.aiAction === 'AUTO_APPROVE') {
          // Create verified stage record
          await supabase.from('verified_stages').insert({
            batchId,
            stageId,
            imageUrl,
            aiValidationId: aiValidation?.id,
            verifiedMethod: 'AUTO_APPROVE',
            verifiedAt: new Date().toISOString()
          });

          // Notify farmer about approval
          await supabase.from('notifications').insert({
            userId: farmerId,
            type: 'IMAGE_VERIFIED',
            message: `Your image has been automatically verified by AI as authentic.`,
            metadata: {
              batchId,
              stageId,
              imageUrl,
              deepfakeScore: aiValidationResult.deepfakeScore,
              aiAction: 'AUTO_APPROVE'
            },
            read: false,
            createdAt: new Date().toISOString()
          });

          console.log('✅ Image AUTO-APPROVED by AI - Real image');

        } else if (aiValidationResult.aiAction === 'FLAG_FOR_HUMAN') {
          // Create expert review request
          await supabase.from('expert_reviews').insert({
            aiValidationId: aiValidation?.id,
            batchId,
            stageId,
            imageUrl,
            decision: 'PENDING',
            assignedAt: new Date().toISOString()
          });

          // Notify admins for review
          const { data: admins } = await supabase
            .from('users')
            .select('id')
            .eq('role', 'ADMIN');

          if (admins && aiValidationResult) {
            const adminNotifications = admins.map(admin => ({
              userId: admin.id,
              type: 'IMAGE_FLAGGED',
              message: `Image requires expert review. AI confidence: ${(aiValidationResult!.deepfakeScore * 100).toFixed(1)}%`,
              metadata: {
                batchId,
                stageId,
                farmerId,
                imageUrl,
                deepfakeScore: aiValidationResult!.deepfakeScore,
                aiAction: 'FLAG_FOR_HUMAN',
                requiresReview: true
              },
              read: false,
              createdAt: new Date().toISOString()
            }));

            await supabase.from('notifications').insert(adminNotifications);
          }

          console.log('⚠️ Image FLAGGED for human review - Uncertain AI confidence');
        }

      } catch (aiError) {
        console.error('❌ AI validation error (non-fatal):', aiError);
        // Continue with upload even if AI fails
      }
    } else {
      console.log('⚠️ Skipping AI validation - missing batchId, stageId, or farmerId');
    }

    return NextResponse.json({
      success: true,
      url: imageUrl,
      fileName: data.path,
      size: file.size,
      type: file.type,
      folderStructure: {
        farmer: farmerName,
        batch: batchName,
        stage: stageName,
        path: organizedPath
      },
      aiValidation: aiValidationResult ? {
        deepfakeScore: aiValidationResult.deepfakeScore,
        aiAction: aiValidationResult.aiAction,
        visualSenseScore: aiValidationResult.visualSenseScore,
        aiReason: aiValidationResult.aiReason
      } : null
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

// Optional: DELETE endpoint to remove uploaded files
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName');

    if (!fileName) {
      return NextResponse.json(
        { error: 'fileName is required' },
        { status: 400 }
      );
    }

    // Delete from Supabase Storage
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([fileName]);

    if (error) {
      console.error('Supabase delete error:', error);
      return NextResponse.json(
        { error: 'Failed to delete image' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}
