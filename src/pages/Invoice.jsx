import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLead } from '../context/LeadContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { calculateTotal, formatCurrency } from '../utils/calculations';
import { formatDateTime, todayISO } from '../utils/dateHelpers';
import { FileText, Printer, Send, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Invoice() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const leadId = searchParams.get('leadId');
  const { getLeadById, addInvoice, invoices } = useLead();
  const { currentUser } = useAuth();
  const { addNotification } = useNotification();

  const lead = leadId ? getLeadById(leadId) : null;
  const existingInvoice = leadId ? invoices.find((inv) => inv.leadId === leadId) : null;

  const [form, setForm] = useState({
    customerName: lead?.customerName || '',
    companyName: lead?.companyName || '',
    serviceName: '',
    quantity: 1,
    price: '',
    tax: 18,
  });
  const [saved, setSaved] = useState(existingInvoice || null);
  const [preview, setPreview] = useState(false);

  const { subtotal, taxAmount, total } = calculateTotal(form.price, form.quantity, form.tax);

  const handleSave = () => {
    if (!form.serviceName || !form.price) { toast.error('Fill all fields.'); return; }
    const inv = addInvoice({
      leadId: leadId || '',
      serviceName: form.serviceName,
      quantity: form.quantity,
      price: parseFloat(form.price),
      tax: parseFloat(form.tax),
      total,
    });
    setSaved(inv);
    addNotification({
      id: `n_inv_${Date.now()}`,
      userId: 'u1',
      title: 'Invoice Created',
      message: `Invoice ${inv.invoiceNumber} created for ${lead?.customerName || form.customerName}.`,
      type: 'invoice_created',
      isRead: false,
      createdAt: todayISO(),
    });
    toast.success('Invoice saved!');
    setPreview(true);
  };

  return (
    <div className="p-6 space-y-5 max-w-3xl">
      <h1 className="text-xl font-bold text-gray-800">Invoice</h1>

      {/* Existing invoices */}
      {invoices.length > 0 && !leadId && (
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">All Invoices</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="px-4 py-3 text-left">Invoice No</th>
                  <th className="px-4 py-3 text-left">Service</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="table-row">
                    <td className="px-4 py-3 font-mono text-xs text-primary-700">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3">{inv.serviceName}</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatCurrency(inv.total)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDateTime(inv.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice Form */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <FileText size={15} className="text-primary-600" />
          Create Invoice {saved && <span className="badge bg-green-100 text-green-700 ml-2">{saved.invoiceNumber}</span>}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Customer Name</label>
            <input className="input-field" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Company Name</label>
            <input className="input-field" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Service Name</label>
            <input
              id="inv-service"
              className="input-field"
              placeholder="e.g. AI Voice Bot — Enterprise Plan"
              value={form.serviceName}
              onChange={(e) => setForm({ ...form, serviceName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Quantity</label>
            <input
              id="inv-qty"
              type="number"
              min="1"
              className="input-field"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Price (₹)</label>
            <input
              id="inv-price"
              type="number"
              className="input-field"
              placeholder="0.00"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tax (%)</label>
            <input
              id="inv-tax"
              type="number"
              className="input-field"
              value={form.tax}
              onChange={(e) => setForm({ ...form, tax: e.target.value })}
            />
          </div>
        </div>

        {/* Calculated totals */}
        {form.price && (
          <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm">
            <div className="flex justify-between mb-1"><span className="text-gray-500">Subtotal</span><span className="font-medium">{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between mb-1"><span className="text-gray-500">Tax ({form.tax}%)</span><span className="font-medium">{formatCurrency(taxAmount)}</span></div>
            <div className="flex justify-between border-t border-gray-200 pt-2 mt-2 font-bold text-gray-800">
              <span>Total</span><span className="text-primary-600 text-base">{formatCurrency(total)}</span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button id="save-invoice-btn" onClick={handleSave} className="btn-primary flex items-center gap-2">
            <FileText size={14} />
            Save Invoice
          </button>
          {saved && (
            <button onClick={() => setPreview(!preview)} className="btn-outline flex items-center gap-2">
              <Printer size={14} />
              {preview ? 'Hide Preview' : 'Preview Invoice'}
            </button>
          )}
          <button
            className="btn-secondary flex items-center gap-2"
            onClick={() => toast('PDF download coming soon!', { icon: '📄' })}
          >
            <Download size={14} />
            Download PDF
          </button>
          <button
            className="btn-secondary flex items-center gap-2"
            onClick={() => toast('Email send coming soon!', { icon: '📧' })}
          >
            <Send size={14} />
            Send Invoice
          </button>
        </div>
      </div>

      {/* Preview */}
      {preview && saved && (
        <div className="card border border-primary-200 print:shadow-none" id="invoice-preview">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-xl font-bold text-primary-600">AI Telecalling</p>
              <p className="text-xs text-gray-400">Lead Management System</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-800">{saved.invoiceNumber}</p>
              <p className="text-xs text-gray-500">{formatDateTime(saved.createdAt)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs text-gray-400 mb-1">Bill To</p>
              <p className="font-semibold text-gray-800">{form.customerName}</p>
              <p className="text-sm text-gray-600">{form.companyName}</p>
            </div>
          </div>

          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="bg-primary-600 text-white">
                <th className="px-4 py-2 text-left rounded-l">Service</th>
                <th className="px-4 py-2 text-center">Qty</th>
                <th className="px-4 py-2 text-right">Price</th>
                <th className="px-4 py-2 text-right rounded-r">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="px-4 py-3">{saved.serviceName}</td>
                <td className="px-4 py-3 text-center">{saved.quantity}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(saved.price)}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(saved.price * saved.quantity)}</td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-56">
              <div className="flex justify-between text-sm mb-1"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(saved.price * saved.quantity)}</span></div>
              <div className="flex justify-between text-sm mb-1"><span className="text-gray-500">Tax ({saved.tax}%)</span><span>{formatCurrency(saved.price * saved.quantity * saved.tax / 100)}</span></div>
              <div className="flex justify-between font-bold border-t border-gray-200 pt-2 text-primary-700">
                <span>Total</span><span>{formatCurrency(saved.total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
