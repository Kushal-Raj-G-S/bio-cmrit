/**
 * AI VALIDATION AGENT
 * Detects AI-generated/fake images, validates image integrity, and routes images
 * Uses Hugging Face AI Image Detector to prevent fraud with fake crop photos
 */

import { HfInference } from '@huggingface/inference';
import crypto from 'crypto';

// Initialize Hugging Face client with token validation
const HUGGING_FACE_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
if (!HUGGING_FACE_TOKEN) {
  console.error('⚠️ HUGGINGFACE_API_TOKEN is not set in environment variables!');
}
const hf = new HfInference(HUGGING_FACE_TOKEN || '');

// Validation thresholds
const THRESHOLDS = {
  FAKE_IMAGE_AUTO_REJECT: 0.85,     // > 85% = AI-generated/fake, auto-reject
  FAKE_IMAGE_AUTO_APPROVE: 0.30,    // < 30% = authentic real photo, auto-approve
  VISUAL_SENSE_HIGH: 85,             // > 85% = high quality image
  VISUAL_SENSE_LOW: 60,              // < 60% = poor quality
  MAX_FILE_SIZE: 10 * 1024 * 1024,   // 10MB
  MIN_FILE_SIZE: 10 * 1024,          // 10KB
};

// Supported image formats
const SUPPORTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export interface ImageValidationResult {
  // Validation checks
  formatValid: boolean;
  integrityValid: boolean;
  imageHash: string;
  fakeImageScore: number;          // 0.0 to 1.0 (AI-generated/fake probability)
  deepfakeScore: number;           // Alias for fakeImageScore (backwards compatibility)
  visualSenseScore: number;       // 0 to 100
  
  // AI Decision
  aiAction: 'AUTO_APPROVE' | 'AUTO_REJECT' | 'FLAG_FOR_HUMAN';
  aiReason: string;
  aiRequiresHumanReview: boolean;
  
  // Metadata
  aiModel: string;
  fileSize: number;
  detectedIssues: string[];
}

/**
 * Generate SHA256 hash of image buffer
 */
export function generateImageHash(imageBuffer: Buffer): string {
  return crypto.createHash('sha256').update(imageBuffer).digest('hex');
}

/**
 * Validate image format and size
 */
export function validateImageFormat(imageBuffer: Buffer, mimeType?: string): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  // Check file size
  if (imageBuffer.length > THRESHOLDS.MAX_FILE_SIZE) {
    issues.push(`File too large: ${(imageBuffer.length / 1024 / 1024).toFixed(2)}MB (max 10MB)`);
  }
  
  if (imageBuffer.length < THRESHOLDS.MIN_FILE_SIZE) {
    issues.push(`File too small: ${(imageBuffer.length / 1024).toFixed(2)}KB (min 10KB)`);
  }
  
  // Check mime type if provided
  if (mimeType && !SUPPORTED_FORMATS.includes(mimeType.toLowerCase())) {
    issues.push(`Unsupported format: ${mimeType}. Allowed: JPEG, PNG, WebP`);
  }
  
  // Check file signature (magic numbers)
  const signature = imageBuffer.slice(0, 4).toString('hex');
  const validSignatures = [
    'ffd8ff',   // JPEG
    '89504e47', // PNG
    '52494646', // WebP (RIFF)
  ];
  
  const hasValidSignature = validSignatures.some(sig => signature.startsWith(sig));
  if (!hasValidSignature) {
    issues.push('Invalid file signature - may be corrupted or not a real image');
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * Check image integrity (not corrupted)
 */
export async function checkImageIntegrity(imageBuffer: Buffer): Promise<{
  valid: boolean;
  issues: string[];
}> {
  const issues: string[] = [];
  
  try {
    // Basic integrity checks
    if (imageBuffer.length === 0) {
      issues.push('Empty file');
      return { valid: false, issues };
    }
    
    // Check for null bytes (corruption indicator)
    const nullByteCount = imageBuffer.filter(byte => byte === 0).length;
    const nullByteRatio = nullByteCount / imageBuffer.length;
    
    if (nullByteRatio > 0.5) {
      issues.push('High ratio of null bytes - possible corruption');
    }
    
    // TODO: Can add more sophisticated integrity checks here
    // e.g., using sharp library to attempt image decoding
    
    return {
      valid: issues.length === 0,
      issues
    };
  } catch (error) {
    issues.push('Failed to validate image integrity');
    return { valid: false, issues };
  }
}

/**
 * Detect AI-generated/fake images using multiple Hugging Face models
 * Prevents farmers from uploading stock photos or AI-generated crop images
 */
async function detectFakeImage(imageBuffer: Buffer): Promise<{
  isFake: boolean;
  confidence: number;
  rawScores: any;
}> {
  try {
    // Use Hugging Face Inference API
    // Convert Buffer to proper Blob for Hugging Face API
    const blob = new Blob([new Uint8Array(imageBuffer)], { type: 'image/jpeg' });
    
    // Try multiple models for better accuracy
    let result;
    try {
      // Primary model: AI Image Detector (best for general AI-generated content)
      result = await hf.imageClassification({
        data: blob,
        model: 'umm-maybe/AI-image-detector',
      });
      console.log('🤖 AI Image detection result (umm-maybe):', result);
    } catch (error) {
      console.warn('⚠️ Primary model failed, trying fallback...');
      // Fallback model: DeepFake Detector (detects synthetic content)
      result = await hf.imageClassification({
        data: blob,
        model: 'prithivMLmods/Deep-Fake-Detector-v2-Model',
      });
      console.log('🤖 Fake detection result (prithivMLmods):', result);
    }
    
    // Find AI-generated/fake score
    const fakeResult = result.find((r: any) => 
      r.label.toLowerCase().includes('artificial') ||
      r.label.toLowerCase().includes('ai') ||
      r.label.toLowerCase().includes('fake') ||
      r.label.toLowerCase().includes('deepfake')
    );
    
    const fakeScore = fakeResult?.score || 0;
    
    return {
      isFake: fakeScore > THRESHOLDS.FAKE_IMAGE_AUTO_REJECT,
      confidence: fakeScore,
      rawScores: result
    };
  } catch (error) {
    console.error('❌ AI image detection error:', error);
    // If API fails, flag for human review (safe default)
    return {
      isFake: false,
      confidence: 0.5, // Uncertain
      rawScores: { error: 'API failed, flagged for human review' }
    };
  }
}

/**
 * Calculate visual sense score (image quality assessment)
 * TODO: Can be enhanced with more sophisticated computer vision
 */
export function calculateVisualSenseScore(imageBuffer: Buffer): number {
  let score = 100;
  
  // Penalize very small files (likely low quality)
  if (imageBuffer.length < 50 * 1024) { // < 50KB
    score -= 30;
  }
  
  // Penalize very large files (unnecessarily large)
  if (imageBuffer.length > 5 * 1024 * 1024) { // > 5MB
    score -= 10;
  }
  
  // Check image dimensions would require decoding
  // For now, use file size as a proxy for quality
  const sizeInKB = imageBuffer.length / 1024;
  if (sizeInKB >= 100 && sizeInKB <= 2000) {
    score += 0; // Ideal size range
  } else if (sizeInKB < 100) {
    score -= 20; // Too small, likely low quality
  }
  
  return Math.max(0, Math.min(100, score));
}

/**
 * MAIN AI VALIDATION AGENT
 * Runs all validation checks and determines routing
 */
export async function imageValidationAgent(
  imageBuffer: Buffer,
  mimeType?: string
): Promise<ImageValidationResult> {
  console.log('🤖 Starting AI validation agent...');
  
  const detectedIssues: string[] = [];
  
  // 1. Format validation
  const formatCheck = validateImageFormat(imageBuffer, mimeType);
  if (!formatCheck.valid) {
    detectedIssues.push(...formatCheck.issues);
  }
  
  // 2. Integrity check
  const integrityCheck = await checkImageIntegrity(imageBuffer);
  if (!integrityCheck.valid) {
    detectedIssues.push(...integrityCheck.issues);
  }
  
  // 3. Generate image hash
  const imageHash = generateImageHash(imageBuffer);
  
  // 4. Fake image detection (only if format/integrity passed)
  let fakeImageResult = { isFake: false, confidence: 0, rawScores: {} };
  if (formatCheck.valid && integrityCheck.valid) {
    fakeImageResult = await detectFakeImage(imageBuffer);
    if (fakeImageResult.isFake) {
      detectedIssues.push(`AI-generated/fake image detected with ${(fakeImageResult.confidence * 100).toFixed(1)}% confidence`);
    }
  } else {
    // Skip fake detection if basic validation failed
    detectedIssues.push('Skipped AI detection due to format/integrity issues');
  }
  
  // 5. Visual sense score
  const visualSenseScore = calculateVisualSenseScore(imageBuffer);
  if (visualSenseScore < THRESHOLDS.VISUAL_SENSE_LOW) {
    detectedIssues.push(`Low visual quality score: ${visualSenseScore}/100`);
  }
  
  // 6. Determine AI action based on validation results
  let aiAction: 'AUTO_APPROVE' | 'AUTO_REJECT' | 'FLAG_FOR_HUMAN';
  let aiReason: string;
  let aiRequiresHumanReview: boolean;
  
  // AUTO-REJECT conditions (clear failures)
  if (!formatCheck.valid || !integrityCheck.valid) {
    aiAction = 'AUTO_REJECT';
    aiReason = `Failed basic validation: ${detectedIssues.join(', ')}`;
    aiRequiresHumanReview = false;
  }
  else if (fakeImageResult.confidence > THRESHOLDS.FAKE_IMAGE_AUTO_REJECT) {
    aiAction = 'AUTO_REJECT';
    aiReason = `AI-GENERATED/FAKE IMAGE DETECTED (${(fakeImageResult.confidence * 100).toFixed(1)}% confidence) - Likely stock photo or synthetic content`;
    aiRequiresHumanReview = false;
  }
  // AUTO-APPROVE conditions (clear passes)
  else if (
    formatCheck.valid &&
    integrityCheck.valid &&
    fakeImageResult.confidence < THRESHOLDS.FAKE_IMAGE_AUTO_APPROVE &&
    visualSenseScore > THRESHOLDS.VISUAL_SENSE_HIGH
  ) {
    aiAction = 'AUTO_APPROVE';
    aiReason = `All checks passed: Fake image score ${(fakeImageResult.confidence * 100).toFixed(1)}%, Visual quality ${visualSenseScore}/100`;
    aiRequiresHumanReview = false;
  }
  // FLAG_FOR_HUMAN (uncertain cases)
  else {
    aiAction = 'FLAG_FOR_HUMAN';
    aiReason = `Uncertain results - requires human review: Fake image ${(fakeImageResult.confidence * 100).toFixed(1)}%, Visual ${visualSenseScore}/100`;
    aiRequiresHumanReview = true;
  }
  
  const result: ImageValidationResult = {
    formatValid: formatCheck.valid,
    integrityValid: integrityCheck.valid,
    imageHash,
    fakeImageScore: fakeImageResult.confidence,
    deepfakeScore: fakeImageResult.confidence, // Backwards compatibility
    visualSenseScore,
    aiAction,
    aiReason,
    aiRequiresHumanReview,
    aiModel: 'HuggingFace-AI-Image-Detector',
    fileSize: imageBuffer.length,
    detectedIssues
  };
  
  console.log('✅ AI validation complete:', {
    action: aiAction,
    reason: aiReason,
    fakeImageScore: fakeImageResult.confidence,
    visualScore: visualSenseScore
  });
  
  return result;
}
