const crypto = require('crypto');

class BlockchainAgent {
  constructor() {
    this.connected = false;
    this.peerEndpoint = 'localhost:7051';
    this.peerHost = 'peer0.farmer.krishibarosa.com';
  }

  /**
   * Simulate blockchain connection (mock for now, replace with real Fabric SDK)
   */
  async connect() {
    try {
      console.log(`🔗 Connecting to Hyperledger Fabric ${this.peerHost}:7051...`);
      
      // TODO: Replace with real Fabric Gateway connection
      // For now, simulate successful connection
      this.connected = true;
      
      console.log('✅ Connected to blockchain successfully!');
      return true;
    } catch (error) {
      console.error('❌ Blockchain connection failed:', error.message);
      return false;
    }
  }

  /**
   * Record verified image to blockchain with COMPLETE farmer & batch data
   */
  async recordVerifiedImage(completeData) {
    try {
      const {
        // Farmer details
        farmer: {
          id: farmerId,
          name: farmerName,
          location: farmerLocation,
          phone: farmerPhone,
        },
        // Batch details
        batch: {
          id: batchId,
          cropType,
          quantity,
          harvestDate,
          varietyName,
        },
        // Stage details
        stage: {
          name: stageName,
          stageNumber,
          uploadedAt: stageTimestamp,
        },
        // Image details
        image: {
          id: imageId,
          hash: imageHash,
          url: imageUrl,
        },
        // AI Validation
        aiValidation: {
          score: aiScore,
          action: aiAction,
          fakeImageScore,
        },
        // Admin Verification
        adminVerification: {
          adminId,
          adminName,
          verifiedAt,
        },
      } = completeData;

      console.log(`📝 Recording COMPLETE data for image ${imageId} to blockchain...`);
      console.log(`   👨‍🌾 Farmer: ${farmerName} (${farmerId})`);
      console.log(`   📦 Batch: ${cropType} - ${quantity}kg (${batchId})`);
      console.log(`   🌱 Stage: ${stageName} (#${stageNumber})`);
      console.log(`   🖼️  Image: ${imageId}`);

      // Create complete blockchain record
      const blockchainRecord = {
        // Farmer Information
        farmerId,
        farmerName,
        farmerLocation,
        farmerPhone,
        
        // Batch Information
        batchId,
        cropType,
        quantity,
        harvestDate,
        varietyName,
        
        // Stage Information
        stageName,
        stageNumber,
        stageTimestamp,
        
        // Image Information
        imageId,
        imageHash,
        imageUrl,
        
        // Validation Information
        aiScore,
        aiAction,
        fakeImageScore,
        
        // Verification Information
        verifiedBy: adminId,
        verifierName: adminName,
        verifiedAt,
        
        // Metadata
        recordedAt: new Date().toISOString(),
        recordType: 'STAGE_VERIFICATION',
      };

      // TODO: Send to Hyperledger Fabric peer0:7051
      // await fabricClient.submitTransaction('RecordStageVerification', JSON.stringify(blockchainRecord));
      
      // Simulate blockchain transaction
      const txId = `TX-${crypto.randomBytes(16).toString('hex')}`;
      const blockHash = `BLOCK-${crypto.randomBytes(8).toString('hex')}`;
      
      console.log(`✅ Complete data recorded on blockchain!`);
      console.log(`   📋 Transaction ID: ${txId}`);
      console.log(`   🔗 Block Hash: ${blockHash}`);

      return {
        success: true,
        transactionId: txId,
        blockHash,
        blockchainHash: imageHash,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Failed to record image:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Auto-generate QR code certificate - CORRECT CRITERIA
   * ✅ All 7 stages MUST have at least 2 verified images each
   * ❌ NOT just 14 total images - prevents someone uploading 10 images in stage 1!
   */
  async checkAndGenerateCertificate(batchData, allVerifications) {
    try {
      const { batchId, farmerId, cropType, quantity } = batchData;
      
      console.log(`🔍 Checking batch ${batchId} for QR certificate eligibility...`);
      
      // CORRECT VALIDATION: Check each stage has minimum 2 images
      const stageRequirements = {
        1: { name: 'LAND_PREPARATION', count: 0 },
        2: { name: 'SOWING', count: 0 },
        3: { name: 'IRRIGATION', count: 0 },
        4: { name: 'FERTILIZATION', count: 0 },
        5: { name: 'PEST_CONTROL', count: 0 },
        6: { name: 'HARVESTING', count: 0 },
        7: { name: 'PACKAGING', count: 0 }
      };

      // Count verified images per stage
      allVerifications.forEach(verification => {
        const stageNum = verification.stageNumber;
        if (stageRequirements[stageNum]) {
          stageRequirements[stageNum].count++;
        }
      });

      // Check if ALL stages have at least 2 images
      const stagesReady = [];
      const stagesNotReady = [];
      
      for (let i = 1; i <= 7; i++) {
        const stage = stageRequirements[i];
        if (stage.count >= 2) {
          stagesReady.push(`Stage ${i}: ${stage.name} (${stage.count} images) ✅`);
        } else {
          stagesNotReady.push(`Stage ${i}: ${stage.name} (${stage.count}/2 images) ❌`);
        }
      }

      console.log(`   📊 Stage Status:`);
      console.log(`      Ready: ${stagesReady.length}/7 stages`);
      stagesNotReady.forEach(msg => console.log(`      ${msg}`));

      // ✅ ALL 7 STAGES HAVE AT LEAST 2 IMAGES - GENERATE QR!
      if (stagesNotReady.length === 0) {
        console.log(`\n✅ ALL 7 STAGES COMPLETE! Generating QR certificate...`);

        // Aggregate ALL blockchain transaction IDs
        const blockchainTransactions = allVerifications.map(v => v.transactionId);
        const allBlockHashes = allVerifications.map(v => v.blockHash);

        // Generate certificate with COMPLETE supply chain data
        const certificateId = `CERT-${batchId}-${Date.now()}`;
        
        // Create comprehensive certificate data
        const certificateData = {
          certificateId,
          batchId,
          farmerId,
          cropType,
          quantity,
          
          // All stages with blockchain proof
          stages: Object.keys(stageRequirements).map(num => {
            const stageVerifications = allVerifications.filter(v => v.stageNumber === parseInt(num));
            return {
              stageNumber: parseInt(num),
              stageName: stageRequirements[num].name,
              imageCount: stageRequirements[num].count,
              verifications: stageVerifications.map(v => ({
                imageId: v.imageId,
                transactionId: v.transactionId,
                blockHash: v.blockHash,
                imageHash: v.imageHash,
                verifiedAt: v.verifiedAt,
                verifiedBy: v.verifiedBy
              }))
            };
          }),
          
          // Blockchain proof
          totalImages: allVerifications.length,
          totalTransactions: blockchainTransactions.length,
          blockchainTransactions,
          blockHashes: allBlockHashes,
          
          // Certificate metadata
          generatedAt: new Date().toISOString(),
          status: 'VERIFIED',
          certificateHash: crypto.createHash('sha256')
            .update(JSON.stringify({ batchId, blockchainTransactions }))
            .digest('hex'),
        };

        // Generate QR code data (URL to verify certificate)
        const qrCodeData = {
          url: `https://krishibarosa.com/verify/${certificateId}`,
          certificateId,
          batchId,
          farmerId,
          certificateHash: certificateData.certificateHash,
        };

        // TODO: Send to blockchain to CREATE QR code record
        // await fabricClient.submitTransaction('GenerateQRCertificate', JSON.stringify(certificateData));

        console.log(`\n🎓 QR CERTIFICATE GENERATED!`);
        console.log(`   📋 Certificate ID: ${certificateId}`);
        console.log(`   🔗 QR URL: ${qrCodeData.url}`);
        console.log(`   🔐 Certificate Hash: ${certificateData.certificateHash}`);
        console.log(`   📊 Total Images: ${allVerifications.length} across 7 stages`);
        console.log(`   📝 Blockchain Transactions: ${blockchainTransactions.length}`);

        // Auto-list on marketplace
        await this.autoListOnMarketplace(batchId, certificateData);

        return {
          success: true,
          certificate: certificateData,
          qrCode: qrCodeData,
        };
      } else {
        // ❌ NOT ALL STAGES READY
        console.log(`\n⏳ NOT READY FOR CERTIFICATION`);
        console.log(`   Missing stages: ${stagesNotReady.length}`);
        return {
          success: false,
          reason: 'incomplete_stages',
          stagesReady: stagesReady.length,
          stagesNotReady: stagesNotReady,
          totalStages: 7,
        };
      }
    } catch (error) {
      console.error('❌ Certificate generation failed:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Auto-list verified batch on marketplace
   */
  async autoListOnMarketplace(batchId, certificate) {
    try {
      console.log(`🛒 Auto-listing batch ${batchId} on marketplace...`);

      const listingId = `LIST-${batchId}-${Date.now()}`;

      // TODO: Replace with real chaincode invocation
      // await contract.submitTransaction('ListBatchOnMarketplace', batchId, certificate.certificateId);

      const listing = {
        listingId,
        batchId,
        certificateId: certificate.certificateId,
        status: 'VERIFIED',
        listedAt: new Date().toISOString(),
      };

      console.log(`✅ Batch listed on marketplace! Listing ID: ${listingId}`);

      return {
        success: true,
        listing,
      };
    } catch (error) {
      console.error('❌ Marketplace listing failed:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get blockchain transaction history for batch
   */
  async getBatchHistory(batchId) {
    try {
      // TODO: Query blockchain for actual history
      // const result = await contract.evaluateTransaction('GetBatchHistory', batchId);
      
      return {
        success: true,
        history: [
          {
            type: 'IMAGE_VERIFIED',
            timestamp: new Date().toISOString(),
            txId: 'TX-sample-123',
          },
        ],
      };
    } catch (error) {
      console.error('❌ Failed to get batch history:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// Singleton instance
let blockchainAgent = null;

/**
 * Get or create blockchain agent instance
 */
async function getBlockchainAgent() {
  if (!blockchainAgent) {
    blockchainAgent = new BlockchainAgent();
    await blockchainAgent.connect();
  }
  return blockchainAgent;
}

async function handleImageVerification(completeData, allVerifications) {
  try {
    console.log('\n🤖 BLOCKCHAIN WORKFLOW TRIGGERED (AFTER ADMIN VERIFICATION)');
    console.log('============================================');

    const agent = await getBlockchainAgent();
    const { stage } = completeData;

    // Step 1: Record image to blockchain (happens for EVERY verified image)
    console.log(`📝 Recording ${stage.stageName} image to blockchain...`);
    const recordResult = await agent.recordVerifiedImage(completeData);

    if (!recordResult.success) {
      throw new Error(`Failed to record image: ${recordResult.error}`);
    }

    console.log(`✅ Image recorded on blockchain!`);
    console.log(`   Transaction ID: ${recordResult.transactionId}`);

    // Step 2: ONLY check for QR certificate if this is a STAGE 7 image
    if (stage.stageNumber === 7) {
      console.log('\n🎯 STAGE 7 IMAGE DETECTED - Checking for QR certificate eligibility...');
      
      const certResult = await agent.checkAndGenerateCertificate(
        completeData.batch,
        allVerifications
      );

      if (certResult.success) {
        console.log('✅ FULL SUPPLY CHAIN COMPLETE!');
        console.log('   🎓 QR Certificate generated!');
        console.log(`   📱 Scan QR: ${certResult.qrCode.url}`);
      } else {
        if (certResult.reason === 'incomplete_stages') {
          console.log(`⏳ Stage 7 image recorded, but need more images in other stages:`);
          certResult.stagesNotReady.forEach(msg => console.log(`      ${msg}`));
        }
      }

      return {
        success: true,
        blockchainRecord: recordResult,
        certification: certResult,
      };
    } else {
      // Images 1-6: Just record, don't check for certificate
      console.log(`⏳ Stage ${stage.stageNumber} image recorded. Waiting for Stage 7 to check certificate eligibility.`);
      
      return {
        success: true,
        blockchainRecord: recordResult,
        certification: {
          success: false,
          reason: 'not_final_stage',
          message: `Stage ${stage.stageNumber} recorded. QR check happens at Stage 7.`
        }
      };
    }
  } catch (error) {
    console.error('❌ Blockchain workflow failed:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

module.exports = {
  BlockchainAgent,
  getBlockchainAgent,
  handleImageVerification,
};
