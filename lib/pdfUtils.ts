import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Annotation } from '@/lib/annotations';

// Convert file to ArrayBuffer
export const fileToArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

// Create a download link for the PDF
export const downloadPDF = async (pdfDoc: PDFDocument, fileName: string): Promise<void> => {
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName || 'annotated-document.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Convert hex color to RGB components (0-1 range for pdf-lib)
const hexToRgb = (hex: string) => {
  // Remove the hash if it exists
  hex = hex.replace(/^#/, '');
  
  // Parse the hex values
  let r, g, b;
  if (hex.length === 3) {
    // Short notation (#RGB)
    r = parseInt(hex[0] + hex[0], 16) / 255;
    g = parseInt(hex[1] + hex[1], 16) / 255;
    b = parseInt(hex[2] + hex[2], 16) / 255;
  } else {
    // Full notation (#RRGGBB)
    r = parseInt(hex.substring(0, 2), 16) / 255;
    g = parseInt(hex.substring(2, 4), 16) / 255;
    b = parseInt(hex.substring(4, 6), 16) / 255;
  }
  
  return { r, g, b };
};

// Apply annotations to PDF
export const applyAnnotationsToPDF = async (
  pdfBytes: ArrayBuffer, 
  annotations: Annotation[],
  pageOffset: number = 0 // Default: Assumes 0-based in UI, 0-based in PDF-lib, but fixing off-by-one issue
): Promise<PDFDocument> => {
  // Load the PDF document
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  
  console.log('PDF document has', pages.length, 'pages');

  
  // Get a standard font
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  // Enhanced debugging for page numbers
  const allPageNumbers = annotations.map(a => a.pageNumber);
  console.log('Annotation page numbers:', allPageNumbers);
  console.log('Min page:', Math.min(...allPageNumbers), 'Max page:', Math.max(...allPageNumbers));
  
  // Group annotations by page
  const annotationsByPage: Record<number, Annotation[]> = {};
  annotations.forEach(annotation => {
    // Apply page offset when grouping annotations
    // const adjustedPageNum = annotation.pageNumber + pageOffset;
    const adjustedPageNum = Math.max(0, Math.min(annotation.pageNumber, pages.length - 1));

    if (!annotationsByPage[adjustedPageNum]) {
      annotationsByPage[adjustedPageNum] = [];
    }
    annotationsByPage[adjustedPageNum].push(annotation);
  });
  
  console.log('Annotations by page (after offset):', Object.keys(annotationsByPage));
  
  // Process each page's annotations
  for (const [pageNum, pageAnnotations] of Object.entries(annotationsByPage)) {
    const pageIndex = parseInt(pageNum);
    
    // Ensure page exists in the document
    if (pageIndex < 0 || pageIndex >= pages.length) {
      console.warn(`Page ${pageIndex} doesn't exist in the document (valid range: 0-${pages.length - 1})`);
      continue;
    }
    
    const page = pages[pageIndex];
    const { width, height } = page.getSize();
    
    console.log(`Processing page ${pageIndex} (dimensions: ${width} x ${height}) with ${pageAnnotations.length} annotations`);
    
    for (const annotation of pageAnnotations) {
      // Store original coordinates for debugging
      const origX = annotation.x;
      const origY = annotation.y;
      
      // Calculate the scale factor between PDF dimensions and viewer dimensions
      let scaleFactor = 1;
      if (annotation.metadata) {
        const { originalScale, pageWidth, pageHeight } = annotation.metadata;
        // Calculate scale factor based on the ratio between PDF dimensions and viewer dimensions
        const viewerWidth = pageWidth;
        // const viewerWidth = pageWidth / originalScale;
        const viewerHeight = pageHeight;
        // const viewerHeight = pageHeight / originalScale;
        
        const xScale = width / viewerWidth;
        const yScale = height / viewerHeight;
        
        // Use the average scale to handle any slight differences
        // scaleFactor = (xScale + yScale) / 2;
        scaleFactor = Math.min(xScale, yScale);
        console.log(`Scale factor calculated: ${scaleFactor} (PDF: ${width}x${height}, Viewer: ${viewerWidth}x${viewerHeight})`);
      }
      
      // Transform annotation coordinates from the viewer space to PDF space
      const pdfX = origX * scaleFactor;
      
      // Flip Y-coordinate for PDF coordinate system
      // PDF coordinates start from bottom-left, while browser coordinates start from top-left
      // const pdfY = height - (origY * scaleFactor);
      // const pdfY = height - origY;
      const pdfY = height - (origY * scaleFactor) - (annotation.height ? annotation.height * scaleFactor : 10);


      
      console.log(`Annotation: ${annotation.type} at Original(${origX}, ${origY}), PDF(${pdfX}, ${pdfY}), Page: ${pageIndex}, Scale: ${scaleFactor}`);
      console.log(`Annotation (${annotation.type}) on UI: x=${annotation.x}, y=${annotation.y}`);
      console.log(`Transformed to PDF: x=${pdfX}, y=${pdfY}`);
      console.log(`PDF page size: width=${width}, height=${height}`);
      console.log(`Scale Factor: ${scaleFactor}`);

      
      switch (annotation.type) {
        case 'highlight': {
          const color = hexToRgb(annotation.color || '#FFEB3B');
          const highlightHeight = annotation.height ? annotation.height * scaleFactor : 20;
          const highlightWidth = annotation.width ? annotation.width * scaleFactor : 100;
          
          page.drawRectangle({
            x: pdfX,
            y: pdfY - highlightHeight, // Adjust Y for the height of the highlight
            width: highlightWidth,
            height: highlightHeight,
            color: rgb(color.r, color.g, color.b),
            opacity: 0.3,
          });
          break;
        }
        
        case 'underline': {
          const color = hexToRgb(annotation.color || '#FF0000');
          const underlineWidth = annotation.width ? annotation.width * scaleFactor : 100;
          
          page.drawLine({
            start: { x: pdfX, y: pdfY },
            end: { x: pdfX + underlineWidth, y: pdfY },
            thickness: 2,
            color: rgb(color.r, color.g, color.b),
          });
          break;
        }
        
        case 'comment': {
          const iconSize = 20 * scaleFactor;
          
          // Draw comment icon
          page.drawRectangle({
            x: pdfX - (iconSize / 2),
            y: pdfY - (iconSize / 2),
            width: iconSize,
            height: iconSize,
            color: rgb(1, 0.8, 0),
            borderColor: rgb(0.8, 0.6, 0),
            borderWidth: 1,
            opacity: 0.8,
          });
          
          // Draw comment text
          const commentText = annotation.content || '';
          const textSize = 10 * scaleFactor;
          const textWidth = helveticaFont.widthOfTextAtSize(commentText, textSize);
          
          // Position text to the right of the icon
          let textX = pdfX + iconSize;
          
          // Ensure text stays within page bounds
          if (textX + textWidth > width - 10) {
            textX = width - textWidth - 10;
          }
          
          // Draw text background
          page.drawRectangle({
            x: textX - 2,
            y: pdfY - textSize - 2,
            width: textWidth + 4,
            height: textSize + 4,
            color: rgb(1, 1, 0.8),
            borderColor: rgb(0.8, 0.8, 0.6),
            borderWidth: 1,
          });
          
          // Draw text
          page.drawText(commentText, {
            x: textX,
            y: pdfY - textSize,
            size: textSize,
            font: helveticaFont,
            color: rgb(0, 0, 0),
          });
          break;
        }
        
        case 'signature': {
          try {
            if (!annotation.content) {
              console.warn('Signature has no content');
              continue;
            }
            
            console.log('Processing signature with data length:', annotation.content.length);
            
            // Handle data URL format
            let imageBytes: Uint8Array;
            let imageType: string;
            
            if (annotation.content.startsWith('data:image/')) {
              // It's a data URL, extract the base64 data
              const matches = annotation.content.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/);
              
              if (!matches || matches.length < 3) {
                console.error('Invalid signature data format:', annotation.content.substring(0, 50) + '...');
                continue;
              }
              
              imageType = matches[1];
              const base64Data = matches[2];
              
              // Convert base64 to bytes
              const binaryString = window.atob(base64Data);
              imageBytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                imageBytes[i] = binaryString.charCodeAt(i);
              }
            } else {
              console.error('Unrecognized signature format');
              continue;
            }
            
            // Embed the signature
            let signatureImage;
            if (imageType === 'png') {
              signatureImage = await pdfDoc.embedPng(imageBytes);
            } else {
              signatureImage = await pdfDoc.embedJpg(imageBytes);
            }
            
            // Scale the signature appropriately
            const originalDims = signatureImage.scale(1);
            const scaledWidth = originalDims.width * scaleFactor;
            const scaledHeight = originalDims.height * scaleFactor;
            
            console.log('Signature dimensions:', originalDims, 'Scaled:', scaledWidth, scaledHeight);
            
            // Draw the signature on the page
            page.drawImage(signatureImage, {
              x: pdfX,
              y: pdfY - scaledHeight, // Position from bottom of signature
              width: scaledWidth,
              height: scaledHeight,
            });
            
            console.log('Signature drawn successfully');
          } catch (error) {
            console.error("Error applying signature:", error, JSON.stringify(error));
          }
          break;
        }
        
        default:
          console.warn(`Unhandled annotation type: ${annotation.type}`);
      }
    }
  }
  
  return pdfDoc;
};

// Debug function to log all information about annotations
export const debugAnnotations = (annotations: Annotation[]): void => {
  console.log('--- DEBUG ANNOTATIONS ---');
  console.log(`Total annotations: ${annotations.length}`);
  
  annotations.forEach((ann, i) => {
    console.log(`Annotation ${i + 1}:`);
    console.log(`  Type: ${ann.type}`);
    console.log(`  Position: (${ann.x}, ${ann.y})`);
    console.log(`  Page: ${ann.pageNumber}`);
    
    if (ann.metadata) {
      console.log(`  Metadata: originalScale=${ann.metadata.originalScale}, pageWidth=${ann.metadata.pageWidth}, pageHeight=${ann.metadata.pageHeight}`);
    }
    
    if (ann.type === 'signature') {
      console.log(`  Signature content length: ${ann.content?.length || 0}`);
      console.log(`  Signature content starts with: ${ann.content?.substring(0, 30)}...`);
    }
    
    if (ann.type === 'comment') {
      console.log(`  Comment text: ${ann.content}`);
    }
    
    if (ann.type === 'highlight' || ann.type === 'underline') {
      console.log(`  Width: ${ann.width}, Height: ${ann.height}`);
      console.log(`  Selected text: ${ann.content}`);
    }
    
    if (ann.color) {
      console.log(`  Color: ${ann.color}`);
    }
  });
  
  console.log('------------------------');
};