// =============================================================
// Utility: Invoice & Quotation Calculations
// =============================================================

/**
 * Calculate total amount with tax
 * @param {number} price - Unit price
 * @param {number} quantity - Quantity
 * @param {number} taxPercent - Tax percentage (e.g., 18 for 18%)
 * @returns {{ subtotal, taxAmount, total }}
 */
export const calculateTotal = (price, quantity, taxPercent) => {
  const subtotal = parseFloat(price || 0) * parseInt(quantity || 1);
  const taxAmount = (subtotal * parseFloat(taxPercent || 0)) / 100;
  const total = subtotal + taxAmount;
  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    taxAmount: parseFloat(taxAmount.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
  };
};

/**
 * Format currency in INR
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Generate unique invoice number
 */
export const generateInvoiceNumber = (existingInvoices) => {
  const num = (existingInvoices.length + 1).toString().padStart(3, '0');
  const year = new Date().getFullYear();
  return `INV-${year}-${num}`;
};

/**
 * Generate unique quotation number
 */
export const generateQuotationNumber = (existingQuotations) => {
  const num = (existingQuotations.length + 1).toString().padStart(3, '0');
  const year = new Date().getFullYear();
  return `QT-${year}-${num}`;
};
