import jsPDF from 'jspdf';

interface BatchData {
  id: string;
  batchCode?: string;
  name: string;
  category: string;
  area?: number;
  location?: string | { lat: number; lng: number; address: string };
  sowingDate?: Date;
  verifiedAt?: Date;
  qrCode?: string;
  farmerName?: string;
}

export async function generateCertificate(batch: BatchData): Promise<void> {
  try {
    // Check if this is FB003 batch (only batch with 7 stages completed)
    if (batch.batchCode !== 'FB003') {
      throw new Error('Certificate is only available for batches with all 7 farming stages completed');
    }

    // Create new PDF document with exact dimensions
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Background - Light green gradient effect
    doc.setFillColor(240, 255, 240);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Decorative border - Golden/Green
    doc.setDrawColor(34, 139, 34);
    doc.setLineWidth(2);
    doc.rect(8, 8, pageWidth - 16, pageHeight - 16, 'S');
    
    doc.setDrawColor(218, 165, 32);
    doc.setLineWidth(0.5);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20, 'S');

    // Header Section
    doc.setFillColor(34, 139, 34);
    doc.rect(0, 0, pageWidth, 35, 'F');

    // Logo/Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.text('KRISHIBAROSA', pageWidth / 2, 18, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Trust Every Grain - Blockchain Verified', pageWidth / 2, 28, { align: 'center' });

    // Certificate Title
    doc.setTextColor(34, 139, 34);
    doc.setFontSize(36);
    doc.setFont('times', 'bold');
    doc.text('CERTIFICATE', pageWidth / 2, 55, { align: 'center' });
    
    doc.setFontSize(20);
    doc.setFont('times', 'italic');
    doc.text('of Verification', pageWidth / 2, 65, { align: 'center' });

    // Decorative line
    doc.setDrawColor(218, 165, 32);
    doc.setLineWidth(1);
    doc.line(40, 70, pageWidth - 40, 70);

    // Main Content
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'normal');
    doc.text('This is to certify that', pageWidth / 2, 85, { align: 'center' });

    // Farmer Name - Highlighted
    doc.setFontSize(22);
    doc.setFont('times', 'bold');
    doc.setTextColor(34, 139, 34);
    doc.text(batch.farmerName || 'Verified Farmer', pageWidth / 2, 97, { align: 'center' });

    // Line under name
    const nameWidth = doc.getTextWidth(batch.farmerName || 'Verified Farmer');
    doc.setDrawColor(34, 139, 34);
    doc.setLineWidth(0.5);
    doc.line((pageWidth - nameWidth) / 2, 100, (pageWidth + nameWidth) / 2, 100);

    // Description text
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const text1 = 'has successfully completed all seven farming stages for the agricultural batch';
    doc.text(text1, pageWidth / 2, 110, { align: 'center' });
    
    const text2 = 'and has been verified on the blockchain network, ensuring complete';
    doc.text(text2, pageWidth / 2, 118, { align: 'center' });
    
    const text3 = 'transparency and traceability throughout the supply chain.';
    doc.text(text3, pageWidth / 2, 126, { align: 'center' });

    // Batch Details Box
    doc.setDrawColor(34, 139, 34);
    doc.setLineWidth(0.5);
    doc.setFillColor(248, 255, 248);
    doc.roundedRect(25, 135, pageWidth - 50, 55, 3, 3, 'FD');

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    let yPos = 145;
    const leftX = 35;
    const rightX = 110;

    // Batch Information
    doc.setTextColor(34, 139, 34);
    doc.text('Batch Code:', leftX, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(batch.batchCode || 'N/A', rightX, yPos);

    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 139, 34);
    doc.text('Crop Name:', leftX, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(batch.name, rightX, yPos);

    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 139, 34);
    doc.text('Category:', leftX, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(batch.category, rightX, yPos);

    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 139, 34);
    doc.text('Farm Area:', leftX, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(`${batch.area || 0} acres`, rightX, yPos);

    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 139, 34);
    doc.text('Sowing Date:', leftX, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(batch.sowingDate ? new Date(batch.sowingDate).toLocaleDateString() : 'N/A', rightX, yPos);

    // Add QR Code from public/fb003.jpg
    try {
      // Load the QR code image
      const qrImagePath = '/fb003.jpg';
      const response = await fetch(qrImagePath);
      const blob = await response.blob();
      const reader = new FileReader();
      
      await new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const qrImageData = reader.result as string;
      
      // Add QR code to the certificate
      const qrSize = 45;
      const qrX = pageWidth - 60;
      const qrY = 140;
      
      doc.addImage(qrImageData, 'JPEG', qrX, qrY, qrSize, qrSize);
      
      // QR code border
      doc.setDrawColor(34, 139, 34);
      doc.setLineWidth(0.5);
      doc.rect(qrX - 1, qrY - 1, qrSize + 2, qrSize + 2, 'S');
      
      // QR code label
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(34, 139, 34);
      doc.text('Scan to Verify', qrX + qrSize / 2, qrY + qrSize + 5, { align: 'center' });
    } catch (qrError) {
      console.error('Error loading QR code:', qrError);
      // Fallback: show text instead
      doc.setFontSize(8);
      doc.text('QR Code', pageWidth - 45, 165, { align: 'center' });
      doc.text('Unavailable', pageWidth - 45, 170, { align: 'center' });
    }

    // Verification Statement
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 139, 34);
    doc.text('Blockchain Verification Status: VERIFIED', pageWidth / 2, 205, { align: 'center' });

    // Seven Stages Completion Badge
    doc.setFillColor(34, 139, 34);
    doc.setDrawColor(34, 139, 34);
    doc.roundedRect(50, 215, pageWidth - 100, 15, 2, 2, 'FD');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('✓ All 7 Farming Stages Completed & Documented', pageWidth / 2, 224, { align: 'center' });

    // Farming Stages List
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const stages = [
      '1. Land Preparation',
      '2. Sowing',
      '3. Germination',
      '4. Vegetative Growth',
      '5. Flowering & Pollination',
      '6. Harvesting',
      '7. Post-Harvest Processing'
    ];

    let stageY = 238;
    const stageX1 = 40;
    const stageX2 = pageWidth / 2 + 10;
    
    stages.forEach((stage, index) => {
      const x = index < 4 ? stageX1 : stageX2;
      const y = index < 4 ? stageY + (index * 6) : stageY + ((index - 4) * 6);
      
      doc.setTextColor(34, 139, 34);
      doc.text('✓', x, y);
      doc.setTextColor(0, 0, 0);
      doc.text(stage, x + 5, y);
    });

    // Footer section with signatures
    const footerY = pageHeight - 45;

    // Verification Date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Date of Verification:', 30, footerY);
    doc.setFont('helvetica', 'normal');
    const verifiedDate = batch.verifiedAt ? new Date(batch.verifiedAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN');
    doc.text(verifiedDate, 30, footerY + 6);

    // Signature lines
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.line(30, footerY + 18, 85, footerY + 18);
    doc.line(pageWidth - 85, footerY + 18, pageWidth - 30, footerY + 18);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('Authorized Signature', 57.5, footerY + 23, { align: 'center' });
    doc.text('KrishiBarosa Official', 57.5, footerY + 28, { align: 'center' });
    
    doc.text('Farmer Signature', pageWidth - 57.5, footerY + 23, { align: 'center' });
    doc.text(batch.farmerName || 'Verified Farmer', pageWidth - 57.5, footerY + 28, { align: 'center' });

    // Bottom footer
    doc.setFillColor(34, 139, 34);
    doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');
    
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.text('KrishiBarosa - Blockchain-Powered Agricultural Transparency', pageWidth / 2, pageHeight - 7, { align: 'center' });
    doc.text(`Certificate ID: ${batch.batchCode}-${Date.now()} | Issued: ${new Date().toLocaleDateString('en-IN')}`, pageWidth / 2, pageHeight - 3, { align: 'center' });

    // Save the PDF
    const fileName = `KrishiBarosa_Certificate_${batch.batchCode}_${batch.name.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);

  } catch (error) {
    console.error('Error generating certificate:', error);
    throw error;
  }
}
