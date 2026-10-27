import { OutpassRequest } from '../types';
import { format } from 'date-fns';

export const downloadPassAsPDF = (pass: OutpassRequest) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');

    if (!printWindow) {
        alert('Please allow popups to download the PDF');
        return;
    }

    // Get QR code as data URL
    const qrCanvas = document.querySelector('canvas');
    const qrDataUrl = qrCanvas?.toDataURL() || '';

    // Generate the HTML content for the PDF
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Outpass - ${pass.fullName}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          padding: 20px;
          background: white;
        }
        
        .outpass-document {
          max-width: 800px;
          margin: 0 auto;
          border: 3px solid #2563eb;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .header {
          background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        
        .logo {
          height: 80px;
          margin-bottom: 15px;
        }
        
        .header h1 {
          font-size: 32px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 5px;
        }
        
        .header p {
          font-size: 14px;
          opacity: 0.9;
        }
        
        .status-badge {
          display: inline-block;
          background: #10b981;
          color: white;
          padding: 8px 20px;
          border-radius: 20px;
          font-weight: bold;
          font-size: 14px;
          margin: 15px 0;
        }
        
        .content {
          padding: 30px;
        }
        
        .qr-section {
          text-align: center;
          margin: 20px 0;
          padding: 20px;
          background: #f9fafb;
          border-radius: 8px;
        }
        
        .qr-section img {
          width: 180px;
          height: 180px;
          border: 2px dashed #d1d5db;
          padding: 10px;
          background: white;
        }
        
        .qr-code-text {
          font-size: 11px;
          color: #6b7280;
          margin-top: 8px;
          font-family: monospace;
          font-weight: bold;
        }
        
        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin: 20px 0;
        }
        
        .detail-item {
          padding: 15px;
          background: #f9fafb;
          border-radius: 8px;
          border-left: 4px solid #2563eb;
        }
        
        .detail-item.full-width {
          grid-column: 1 / -1;
        }
        
        .detail-label {
          font-size: 11px;
          color: #6b7280;
          text-transform: uppercase;
          font-weight: bold;
          letter-spacing: 1px;
          margin-bottom: 5px;
        }
        
        .detail-value {
          font-size: 16px;
          color: #111827;
          font-weight: bold;
        }
        
        .footer {
          border-top: 2px solid #e5e7eb;
          padding: 20px 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f9fafb;
          font-size: 12px;
          color: #6b7280;
        }
        
        .security-badge {
          display: flex;
          align-items: center;
          gap: 5px;
          font-weight: bold;
        }
        
        @media print {
          body {
            padding: 0;
          }
          
          .outpass-document {
            border: 2px solid #2563eb;
            box-shadow: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="outpass-document">
        <!-- Header -->
        <div class="header">
          <img src="/alvas_logo.png" alt="Alva's Logo" class="logo" onerror="this.style.display='none'">
          <h1>OUTPASS</h1>
          <p>Official Outpass Document</p>
          <div class="status-badge">${pass.status}</div>
        </div>
        
        <!-- Content -->
        <div class="content">
          <!-- QR Code Section -->
          ${qrDataUrl ? `
          <div class="qr-section">
            <img src="${qrDataUrl}" alt="QR Code">
            <div class="qr-code-text">Scan to verify • ID: ${pass.id.split('-')[0]}</div>
          </div>
          ` : ''}
          
          <!-- Details -->
          <div class="details-grid">
            <div class="detail-item full-width">
              <div class="detail-label">Reason for Outpass</div>
              <div class="detail-value">${pass.reason}</div>
            </div>
            
            <div class="detail-item">
              <div class="detail-label">Student Name</div>
              <div class="detail-value">${pass.fullName}</div>
            </div>
            
            <div class="detail-item">
              <div class="detail-label">Student ID</div>
              <div class="detail-value">${pass.studentId}</div>
            </div>
            
            <div class="detail-item">
              <div class="detail-label">Department</div>
              <div class="detail-value">${pass.department || 'N/A'}</div>
            </div>
            
            <div class="detail-item full-width">
              <div class="detail-label">Destination</div>
              <div class="detail-value">${pass.destination}</div>
            </div>
            
            <div class="detail-item">
              <div class="detail-label">Departure</div>
              <div class="detail-value">${format(new Date(pass.departureTime), 'MMM dd, yyyy • h:mm a')}</div>
            </div>
            
            <div class="detail-item">
              <div class="detail-label">Return</div>
              <div class="detail-value">${format(new Date(pass.returnTime), 'MMM dd, yyyy • h:mm a')}</div>
            </div>
            
            ${pass.parentMobile ? `
            <div class="detail-item">
              <div class="detail-label">Parent Contact</div>
              <div class="detail-value">${pass.parentMobile}</div>
            </div>
            
            <div class="detail-item">
              <div class="detail-label">Parent Verification</div>
              <div class="detail-value">
                ${pass.verificationStatus === 'VERIFIED' ? '✓ Verified' : 'Not Verified'}
              </div>
            </div>
            ` : ''}
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <div class="security-badge">
            🛡️ Secure System
          </div>
          <div>
            Applied: ${format(new Date(pass.createdAt), 'dd/MM/yyyy')}
          </div>
        </div>
      </div>
      
      <script>
        // Auto-print when loaded
        window.onload = function() {
          window.print();
          // Close the window after printing/canceling
          window.onafterprint = function() {
            window.close();
          };
        };
      </script>
    </body>
    </html>
  `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
};
