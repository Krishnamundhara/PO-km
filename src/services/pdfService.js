import jsPDF from 'jspdf'
import { formatDate } from '../lib/utils'

export const generatePDF = async (po, companyDetails) => {
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = 210
  const pageHeight = 297
  const margin = 15
  let yPos = margin

  // Render Devanagari header as image (to support special characters)
  try {
    const headerImg = await renderTextAsImage('|| श्री:गणेशाय नमः: ||', {
      fontSize: 14,
      fontFamily: 'serif',
      width: 180,
      height: 25
    })
    pdf.addImage(headerImg, 'PNG', (pageWidth - 60) / 2, yPos - 3, 60, 8)
    yPos += 6
  } catch (error) {
    console.error('Error rendering header:', error)
    yPos += 6
  }

  // Company Details Section (Logo + Info)
  const logoSize = 22
  const logoX = margin
  const contentX = margin + logoSize + 5

  // Add logo if available
  if (companyDetails?.logo) {
    try {
      await addImageToPDF(pdf, companyDetails.logo, logoX, yPos, logoSize, logoSize)
    } catch (error) {
      console.error('Error adding logo:', error)
    }
  }

  // Company Name and Address (to the right of logo)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(14)
  const companyName = companyDetails?.name || 'RAJU INDUSTRIES'
  pdf.text(companyName, contentX, yPos + 4)

  if (companyDetails?.address) {
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    const addressLines = pdf.splitTextToSize(companyDetails.address, pageWidth - contentX - margin)
    let addrY = yPos + 10
    addressLines.forEach(line => {
      pdf.text(line, contentX, addrY)
      addrY += 3.5
    })
  }
  
  yPos += logoSize + 5

  // Order Number and Date
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(11)
  pdf.text(`Order number: ${po.po_number}`, margin, yPos)
  const dateText = `Date: ${formatDate(po.date)}`
  const dateWidth = pdf.getTextWidth(dateText)
  pdf.text(dateText, pageWidth - margin - dateWidth, yPos)
  yPos += 7

  // Order Details Table
  const tableData = [
    ['PARTY NAME:', po.party_name || ''],
    ...(po.broker ? [['BROKER:', po.broker]] : []),
    ['MILL:', po.mill || ''],
    ['QUALITY:', po.product || ''],
    ['RATE:', po.rate || ''],
    ['WEIGHT:', `${po.weight || ''} ${po.weight_unit || ''}`],
    ['BAGS:', po.quantity || '']
  ]

  drawTable(pdf, tableData, margin, yPos, pageWidth - 2 * margin)
  yPos += (tableData.length * 10) + 3

  // Terms & Conditions
  if (po.terms_conditions) {
    yPos += 3
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(11)
    pdf.text('Terms & Conditions:', margin, yPos)
    yPos += 5
    
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    const termsLines = pdf.splitTextToSize(po.terms_conditions, pageWidth - 2 * margin)
    termsLines.forEach(line => {
      pdf.text(line, margin, yPos)
      yPos += 4
    })
  }

  // Bank Details
  if (companyDetails?.bank_name) {
    yPos += 5
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(10)
    pdf.text('BANK DETAILS', margin, yPos)
    yPos += 4
    
    let bankDetails = companyDetails.bank_name
    if (companyDetails.account_number) bankDetails += `, ACCOUNT NO ${companyDetails.account_number}`
    if (companyDetails.ifsc_code) bankDetails += `, IFSC: ${companyDetails.ifsc_code}`
    if (companyDetails.branch) bankDetails += `, BRANCH: ${companyDetails.branch}`
    
    const bankLines = pdf.splitTextToSize(bankDetails, pageWidth - 2 * margin)
    bankLines.forEach(line => {
      pdf.text(line, margin, yPos)
      yPos += 4
    })
  }

  return pdf
}

// Helper function to draw table
const drawTable = (pdf, data, x, y, width) => {
  const colWidths = [width * 0.4, width * 0.6]
  const rowHeight = 10
  
  pdf.setDrawColor(0, 0, 0)
  pdf.setLineWidth(0.3)
  
  data.forEach((row, index) => {
    const rowY = y + (index * rowHeight)
    
    // Draw cell borders
    pdf.rect(x, rowY, colWidths[0], rowHeight)
    pdf.rect(x + colWidths[0], rowY, colWidths[1], rowHeight)
    
    // Draw text
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(10)
    pdf.text(row[0], x + 3, rowY + 6.5)
    
    pdf.setFont('helvetica', 'normal')
    pdf.text(row[1], x + colWidths[0] + 3, rowY + 6.5)
  })
}

// Helper function to render text as image (for special characters like Devanagari)
const renderTextAsImage = (text, options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      fontSize = 14,
      fontFamily = 'serif',
      width = 200,
      height = 30,
      textAlign = 'center'
    } = options

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')

    // Set background to transparent
    ctx.clearRect(0, 0, width, height)

    // Set text properties
    ctx.font = `${fontSize}px ${fontFamily}`
    ctx.fillStyle = '#000000'
    ctx.textAlign = textAlign
    ctx.textBaseline = 'middle'

    // Draw text
    const x = textAlign === 'center' ? width / 2 : 0
    ctx.fillText(text, x, height / 2)

    resolve(canvas.toDataURL('image/png'))
  })
}

// Helper function to add image to PDF
const addImageToPDF = (pdf, imageSrc, x, y, width, height) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      try {
        // Calculate aspect ratio
        const imgRatio = img.width / img.height
        const targetRatio = width / height
        
        let finalWidth = width
        let finalHeight = height
        
        if (imgRatio > targetRatio) {
          finalHeight = width / imgRatio
        } else {
          finalWidth = height * imgRatio
        }
        
        pdf.addImage(img, 'PNG', x, y, finalWidth, finalHeight)
        resolve()
      } catch (error) {
        reject(error)
      }
    }
    
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = imageSrc
  })
}

export const downloadPDF = async (po, companyDetails) => {
  try {
    const pdf = await generatePDF(po, companyDetails)
    pdf.save(`PO-${po.po_number}.pdf`)
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw error
  }
}

export const sharePDF = async (po, companyDetails) => {
  try {
    const pdf = await generatePDF(po, companyDetails)
    const blob = pdf.output('blob')
    
    if (navigator.share && navigator.canShare({ files: [new File([blob], `PO-${po.po_number}.pdf`, { type: 'application/pdf' })] })) {
      const file = new File([blob], `PO-${po.po_number}.pdf`, { type: 'application/pdf' })
      await navigator.share({
        files: [file],
        title: `Purchase Order ${po.po_number}`,
        text: `Purchase Order for ${po.party_name}`
      })
    } else {
      // Fallback to download
      await downloadPDF(po, companyDetails)
    }
  } catch (error) {
    console.error('Error sharing PDF:', error)
    throw error
  }
}

// Quality Record PDF Generation
export const generateQualityPDF = async (quality, companyDetails) => {
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = 210
  const pageHeight = 297
  const margin = 15
  let yPos = margin

  // Render Devanagari header as image
  try {
    const headerImg = await renderTextAsImage('|| श्री:गणेशाय नमः: ||', {
      fontSize: 14,
      fontFamily: 'serif',
      width: 180,
      height: 25
    })
    pdf.addImage(headerImg, 'PNG', (pageWidth - 60) / 2, yPos - 3, 60, 8)
    yPos += 6
  } catch (error) {
    console.error('Error rendering header:', error)
    yPos += 6
  }

  // Company Details Section (Logo + Info)
  const logoSize = 22
  const logoX = margin
  const contentX = margin + logoSize + 5

  // Add logo if available
  if (companyDetails?.logo) {
    try {
      await addImageToPDF(pdf, companyDetails.logo, logoX, yPos, logoSize, logoSize)
    } catch (error) {
      console.error('Error adding logo:', error)
    }
  }

  // Company Name and Address
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(14)
  const companyName = companyDetails?.name || 'RAJU INDUSTRIES'
  pdf.text(companyName, contentX, yPos + 4)

  if (companyDetails?.address) {
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    const addressLines = pdf.splitTextToSize(companyDetails.address, pageWidth - contentX - margin)
    let addrY = yPos + 10
    addressLines.forEach(line => {
      pdf.text(line, contentX, addrY)
      addrY += 3.5
    })
  }
  
  yPos += logoSize + 5

  // Title
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(13)
  const title = 'Quality Record'
  const titleWidth = pdf.getTextWidth(title)
  pdf.text(title, (pageWidth - titleWidth) / 2, yPos)
  yPos += 6
  pdf.text(title, (pageWidth - titleWidth) / 2, yPos)
  yPos += 10

  // Quality Details Table
  const tableData = [
    ['SR No:', quality.sr_no || ''],
    ['Width:', quality.width || ''],
    ['Quality:', quality.quality || ''],
    ['Reed on Loom:', quality.reed_on_loom || ''],
    ['Peek on Loom:', quality.peek_on_loom || ''],
    ['Weight:', quality.weight || ''],
    ['Rate:', `₹${quality.rate || ''}`],
    ...(quality.remark ? [['Remark:', quality.remark]] : [])
  ]

  drawTable(pdf, tableData, margin, yPos, pageWidth - 2 * margin)
  yPos += (tableData.length * 10) + 5

  // Bank Details
  if (companyDetails?.bank_name) {
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(10)
    pdf.text('BANK DETAILS', margin, yPos)
    yPos += 4
    
    let bankDetails = companyDetails.bank_name
    if (companyDetails.account_number) bankDetails += `, ACCOUNT NO ${companyDetails.account_number}`
    if (companyDetails.ifsc_code) bankDetails += `, IFSC: ${companyDetails.ifsc_code}`
    if (companyDetails.branch) bankDetails += `, BRANCH: ${companyDetails.branch}`
    
    const bankLines = pdf.splitTextToSize(bankDetails, pageWidth - 2 * margin)
    bankLines.forEach(line => {
      pdf.text(line, margin, yPos)
      yPos += 4
    })
  }

  return pdf
}

export const downloadQualityPDF = async (quality, companyDetails) => {
  try {
    const pdf = await generateQualityPDF(quality, companyDetails)
    pdf.save(`Quality-${quality.sr_no}.pdf`)
  } catch (error) {
    console.error('Error generating quality PDF:', error)
    throw error
  }
}

export const shareQualityPDF = async (quality, companyDetails) => {
  try {
    const pdf = await generateQualityPDF(quality, companyDetails)
    const blob = pdf.output('blob')
    
    if (navigator.share && navigator.canShare({ files: [new File([blob], `Quality-${quality.sr_no}.pdf`, { type: 'application/pdf' })] })) {
      const file = new File([blob], `Quality-${quality.sr_no}.pdf`, { type: 'application/pdf' })
      await navigator.share({
        files: [file],
        title: `Quality Record ${quality.sr_no}`,
        text: `Quality Record for SR No ${quality.sr_no}`
      })
    } else {
      // Fallback to download
      await downloadQualityPDF(quality, companyDetails)
    }
  } catch (error) {
    console.error('Error sharing quality PDF:', error)
    throw error
  }
}
