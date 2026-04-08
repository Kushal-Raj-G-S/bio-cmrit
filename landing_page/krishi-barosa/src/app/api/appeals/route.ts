import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST - create an appeal and notify admins
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { verificationId, imageUrl, farmerId, appealReason, stageId, batchId } = body;

    console.log('📢 APPEAL REQUEST RECEIVED:', { imageUrl, farmerId, stageId, batchId });

    if (!imageUrl || !farmerId) {
      return NextResponse.json({ error: 'imageUrl and farmerId are required' }, { status: 400 });
    }

    // Ensure we have a verificationId (try to find by imageUrl)
    if (!verificationId) {
      const { data: found, error: findErr } = await supabase
        .from('image_verifications')
        .select('id')
        .eq('imageUrl', imageUrl)
        .limit(1)
        .maybeSingle();

      if (findErr) {
        console.error('Error finding verification by imageUrl:', findErr);
      }

      if (found && (found as any).id) {
        verificationId = (found as any).id;
        console.log('✅ Found verificationId:', verificationId);
      } else {
        console.error('❌ No verification found for imageUrl:', imageUrl);
        return NextResponse.json({ error: 'Could not determine verificationId for this image. Please include verificationId.' }, { status: 400 });
      }
    }

    console.log('📝 About to insert appeal with data:', {
      verificationId,
      imageUrl: imageUrl.substring(0, 50) + '...',
      farmerId,
      appealReason: appealReason || 'Farmer disputes the decision',
      appealStatus: 'PENDING'
    });

    // Try to insert appeal - if table doesn't exist, we'll store in notifications only
    let appeal: any = null;
    let appealId = `appeal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      const { data, error: insertErr } = await supabase
        .from('image_appeals')
        .insert({
          verificationId,
          imageUrl,
          farmerId,
          appealReason: appealReason || 'Farmer disputes the decision',
          appealStatus: 'PENDING'
        })
        .select()
        .single();

      if (insertErr) {
        console.warn('⚠️ image_appeals table may not exist:', insertErr.message);
        console.log('📌 Will store appeal info in notifications metadata instead');
        // Create a pseudo-appeal object
        appeal = {
          id: appealId,
          verificationId,
          imageUrl,
          farmerId,
          appealReason: appealReason || 'Farmer disputes the decision',
          appealStatus: 'PENDING',
          createdAt: new Date().toISOString()
        };
      } else {
        appeal = data;
        appealId = data.id;
        console.log('✅ Appeal created successfully:', appeal.id);
      }
    } catch (err) {
      console.error('❌ Error with appeals table:', err);
      // Create a pseudo-appeal object
      appeal = {
        id: appealId,
        verificationId,
        imageUrl,
        farmerId,
        appealReason: appealReason || 'Farmer disputes the decision',
        appealStatus: 'PENDING',
        createdAt: new Date().toISOString()
      };
    }

    // Find admin users
    const { data: admins, error: adminErr } = await supabase
      .from('users')
      .select('id, name')
      .eq('role', 'ADMIN');

    if (adminErr) {
      console.error('❌ Error querying admins:', adminErr);
    }

    console.log('👥 Found admins:', admins?.length || 0, admins?.map((a: any) => a.name));

    // Get farmer details to show proper name in notification
    const { data: farmerData, error: farmerErr } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', farmerId)
      .maybeSingle();

    if (farmerErr) {
      console.error('❌ Error fetching farmer details:', farmerErr);
    }

    const farmerName = farmerData?.name || farmerData?.email || farmerId;
    console.log('👨‍🌾 Farmer:', farmerName);

    // Create notifications for admins (if any)
    let notificationsCreated = 0;
    if (admins && admins.length > 0) {
      const notifications = admins.map((a: any) => ({
        userId: a.id,
        type: 'IMAGE_APPEAL',
        title: 'New image appeal',
        message: `${farmerName} appealed a flagged image${appealReason ? `: "${appealReason}"` : ''}`,
        actionUrl: `/admin/image-verification`,
        actionText: 'Review appeal',
        metadata: {
          imageUrl,
          verificationId,
          appealId: appealId,
          farmerId,
          farmerName,
          appealReason: appealReason || 'Farmer disputes the decision',
          appealStatus: 'PENDING',
          stageId: stageId || null,
          batchId: batchId || null,
          createdAt: new Date().toISOString()
        },
        read: false
      }));

      const { error: notifErr } = await supabase.from('notifications').insert(notifications);
      if (notifErr) {
        console.error('❌ Error creating admin notifications for appeal:', notifErr);
      } else {
        notificationsCreated = notifications.length;
        console.log('✅ Created', notificationsCreated, 'admin notifications');
      }
    } else {
      console.warn('⚠️ No admin users found - no notifications created');
    }

    console.log('🎉 APPEAL COMPLETED - Response:', { appealId: appealId, notificationsCreated });
    return NextResponse.json({ appeal, notificationsCreated }, { status: 201 });
  } catch (error) {
    console.error('Error in appeals POST:', error);
    return NextResponse.json({ error: 'Failed to create appeal' }, { status: 500 });
  }
}
