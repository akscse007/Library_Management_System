import React, {useEffect, useState} from 'react';
import api from '../lib/api';

export default function FinesPanel(){
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [payingFineId, setPayingFineId] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    method: 'online',
    transactionId: '',
    receiptNo: '',
    amountPaid: ''
  });

  const fetch = async ()=> {
    setLoading(true);
    try {
      const res = await api.get('/student/fines/mine');
      setFines(res.data.data || []);
    } catch(e){ console.error(e); alert('Could not load fines'); } finally { setLoading(false); }
  };

  useEffect(()=> { fetch(); }, []);

  const openPay = (fine) => {
    setPayingFineId(fine._id);
    setPaymentForm({
      method: 'online',
      transactionId: '',
      receiptNo: '',
      amountPaid: fine.amount // default to full
    });
  };

  const cancelPay = () => { setPayingFineId(null); };

  const submitPayment = async () => {
    if(!payingFineId) return;
    const payload = {
      fineId: payingFineId,
      method: paymentForm.method,
      transactionId: paymentForm.transactionId || null,
      receiptNo: paymentForm.receiptNo || null,
      amountPaid: paymentForm.amountPaid ? Number(paymentForm.amountPaid) : undefined
    };
    try {
      await api.post('/student/fines/pay', payload);
      alert('Payment successful');
      setPayingFineId(null);
      fetch();
    } catch(e){
      console.error(e);
      alert('Payment failed');
    }
  };

  return (
    <div className="glass p-4 rounded">
      <h3 className="text-lg font-semibold mb-3">Fines & Membership</h3>

      <div className="mb-3">
        <button className="btn" onClick={async ()=>{
          try {
            const res = await api.post('/student/membership/renew', { paymentRef: 'demo-renew' });
            alert('Membership renewed until ' + new Date(res.data.data.membershipValidUntil).toLocaleDateString());
          } catch(e) { console.error(e); alert('Renew failed'); }
        }}>Renew Membership</button>
      </div>

      {loading ? <div>Loading fines...</div> : (
        fines.length === 0 ? <div>No fines</div> : fines.map(f => (
          <div key={f._id} className="mb-3 border-t pt-3">
            <div>Amount: <strong>{f.amount}</strong></div>
            <div>Status: {f.paid ? 'Paid' : 'Unpaid'}</div>
            <div className="text-xs text-gray-600">Created: {new Date(f.createdAt).toLocaleDateString()}</div>

            {!f.paid && (
              <div className="mt-2">
                <button className="btn" onClick={()=> openPay(f)}>Pay</button>
              </div>
            )}

            {payingFineId === f._id && (
              <div className="mt-2 p-2 bg-white/10 rounded">
                <div className="mb-2">
                  <label className="block text-sm">Method</label>
                  <select value={paymentForm.method} onChange={e=> setPaymentForm({...paymentForm, method: e.target.value})} className="border p-1 w-full">
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="online">Online</option>
                    <option value="wallet">Wallet</option>
                    <option value="transfer">Transfer</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="mb-2">
                  <label className="block text-sm">Transaction ID (or gateway ref)</label>
                  <input className="border p-1 w-full" value={paymentForm.transactionId} onChange={e=> setPaymentForm({...paymentForm, transactionId: e.target.value})} />
                </div>

                <div className="mb-2">
                  <label className="block text-sm">Receipt No (optional)</label>
                  <input className="border p-1 w-full" value={paymentForm.receiptNo} onChange={e=> setPaymentForm({...paymentForm, receiptNo: e.target.value})} />
                </div>

                <div className="mb-2">
                  <label className="block text-sm">Amount</label>
                  <input className="border p-1 w-full" type="number" value={paymentForm.amountPaid} onChange={e=> setPaymentForm({...paymentForm, amountPaid: e.target.value})} />
                </div>

                <div className="flex gap-2">
                  <button className="btn" onClick={submitPayment}>Submit Payment</button>
                  <button className="btn" onClick={cancelPay}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
