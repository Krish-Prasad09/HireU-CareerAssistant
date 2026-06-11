import { useState } from "react";
import { X, Zap, CreditCard, Loader2 } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { server } from "../main";
import { useAppData } from "../context/AppContext";

interface Props {
  onClose: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CreditGate({ onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const { fetchUser } = useAppData();

  async function handleBuy() {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        `${server}/api/payment/checkout`,
        { planId: "credits_40" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: "INR",
        name: "HireU",
        description: "40 AI Credits — ₹29",
        order_id: data.order.id,
        handler: async function (response: any) {
          try {
            const { data: verifyData } = await axios.post(
              `${server}/api/payment/verify`,
              {
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(verifyData.message);
            await fetchUser(); // refresh credits in context
            onClose();
          } catch (err: any) {
            toast.error(err?.response?.data?.message || "Verification failed");
          } finally {
            setLoading(false);
          }
        },
        modal: { ondismiss: () => setLoading(false) },
        theme: { color: "#6366f1" },
      };

      const rz = new window.Razorpay(options);
      rz.open();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Could not initiate payment");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-card w-full max-w-sm p-8 flex flex-col gap-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/30 hover:text-white/70 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 flex items-center justify-center">
            <Zap size={28} className="text-indigo-400" />
          </div>
          <h2 className="text-xl font-extrabold">Out of free requests</h2>
          <p className="text-white/45 text-sm leading-relaxed">
            You've used all <span className="text-white/70 font-semibold">10 free requests</span>.
            Buy a credit pack to keep going.
          </p>
        </div>

        <div className="glass-card p-5 flex flex-col gap-2 border-indigo-500/20">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white/80">40 AI Credits</span>
            <span className="text-2xl font-black text-indigo-400">₹29</span>
          </div>
          <p className="text-xs text-white/35">
            One-time purchase · No subscription · Never expires
          </p>
        </div>

        <button
          className="btn-primary flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold"
          onClick={handleBuy}
          disabled={loading}
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <CreditCard size={16} />
          )}
          {loading ? "Processing…" : "Buy 40 Credits for ₹29"}
        </button>

        <p className="text-center text-xs text-white/25">
          Powered by Razorpay · Secure payment
        </p>
      </div>
    </div>
  );
}
