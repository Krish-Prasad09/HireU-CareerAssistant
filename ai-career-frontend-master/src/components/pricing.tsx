import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { plans } from "../utils";
import { CheckCircle, CreditCard, Loader2, Shield } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { server } from "../main";
import CreditGate from "./CreditGate";

declare global {
  interface Window {
    Razorpay: any;
  }
}

function StatusBadge() {
  const { isAuth, user } = useAppData();
  if (!isAuth) return null;

  const isPro = user?.subscription && new Date() < new Date(user.subscription);
  const FREE_LIMIT = 10;

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border mb-8 ${
        isPro
          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
          : "bg-white/5 border-white/10 text-white/50"
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          isPro ? "bg-emerald-400" : "bg-white/30"
        }`}
      />
      {isPro
        ? `Pro active · expires ${new Date(
            user!.subscription!
          ).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}`
        : `Free Plan · ${Math.max(
            0,
            FREE_LIMIT - (user?.freeRequestsUsed ?? 0)
          )} of ${FREE_LIMIT} free requests left`}
    </div>
  );
}

function PlanCTA({
  plan,
  highlight,
}: {
  plan: (typeof plans)[0];
  highlight: boolean;
}) {
  const { isAuth, user, fetchUser } = useAppData();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const isPro =
    isAuth && user?.subscription && new Date() < new Date(user.subscription);

  if (plan.name === "Free") {
    return (
      <p className="mt-auto text-center text-xs text-white/30 py-3">
        ✔️ Free access — no payment needed
      </p>
    );
  }

  if (!isAuth) {
    return (
      <button
        className={`mt-auto text-center text-sm font-semibold py-3 rounded-xl transition-all duration-200 ${
          highlight
            ? "btn-primary"
            : "bg-white/6 hover:bg-white/10 border border-white/10 text-white"
        }`}
        onClick={() => navigate("/login")}
      >
        {plan.cta}
      </button>
    );
  }

  if (isPro) {
    return (
      <p className="mt-auto text-center text-xs text-white/30 py-3">
        ✔️ Already subscribed
      </p>
    );
  }

  async function handleSubscribe() {
    const token = localStorage.getItem("token");
    setLoading(true);

    try {
      // Determine duration from plan price
      const duration = plan.price === "₹299" ? 1 : 6;

      const { data } = await axios.post(
        `${server}/api/payment/checkout`,
        { duration },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: "INR",
        name: "HireU",
        description: plan.name,
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
            await fetchUser();
            navigate("/account");
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
    <button
      className={`mt-auto text-center text-sm font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
        highlight
          ? "btn-primary"
          : "bg-white/6 hover:bg-white/10 border border-white/10 text-white"
      }`}
      onClick={handleSubscribe}
      disabled={loading}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <CreditCard size={14} />
      )}
      {loading ? "Please wait…" : plan.cta}
    </button>
  );
}

// ── Credit-pack section (₹1 for 10 requests) ─────────────────────────────────
function CreditPackSection() {
  const { isAuth } = useAppData();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="mt-10 max-w-sm mx-auto glass-card p-8 flex flex-col gap-5 border-amber-500/15">
        <div>
          <p className="text-xs text-white/35 uppercase tracking-widest mb-1">
            Pay-as-you-go
          </p>
          <div className="flex items-end gap-1">
            <span
              className="text-4xl font-black"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              ₹1
            </span>
            <span className="text-white/35 text-sm mb-1">/ 10 requests</span>
          </div>
          <p className="text-white/40 text-sm mt-1">
            No subscription needed · Buy whenever you run out
          </p>
        </div>

        <div className="divider-subtle" />

        <ul className="flex flex-col gap-2">
          {[
            "10 AI credits per pack",
            "Works for all features",
            "Never expires",
            "Instant activation",
          ].map((f) => (
            <li
              key={f}
              className="flex items-center gap-2 text-sm text-white/60"
            >
              <CheckCircle size={13} className="text-amber-400 shrink-0" />
              {f}
            </li>
          ))}
        </ul>

        <button
          className="btn-primary flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
          onClick={() => (isAuth ? setShowModal(true) : null)}
          disabled={!isAuth}
          title={!isAuth ? "Login first" : ""}
        >
          <CreditCard size={14} />
          Buy 10 Credits — ₹1
        </button>
        {!isAuth && (
          <p className="text-center text-xs text-white/25">
            Login to purchase credits
          </p>
        )}
      </div>

      {showModal && <CreditGate onClose={() => setShowModal(false)} />}
    </>
  );
}

const Pricing = () => {
  return (
    <section id="pricing" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <span className="feature-pill inline-flex mb-4">
          <Shield size={11} className="text-emerald-400" /> Simple pricing
        </span>
        <h2
          className="text-3xl md:text-5xl font-extrabold tracking-tight"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Start free. Upgrade{" "}
          <span className="text-gradient">when ready.</span>
        </h2>
        <p className="text-white/40 mt-4 max-w-md mx-auto">
          Your first 10 requests are completely free — no card needed.
        </p>
        <div className="flex justify-center mt-6">
          <StatusBadge />
        </div>
      </div>

      {/* Subscription plans */}
      <div className="grid md:grid-cols-3 gap-6 items-center">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`glass-card p-8 flex flex-col gap-6 relative transition-all duration-300 ${
              plan.highlight
                ? "border-indigo-500/10 shadow-2xl shadow-indigo-500/10 scale-[1.02]"
                : "hover:border-white/14"
            }`}
          >
            {plan.badge && (
              <span
                className={`absolute -top-2 left-1/2 -translate-x-1/2 text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                  plan.highlight
                    ? "bg-linear-to-r from-indigo-500 to-emerald-400 text-white"
                    : "bg-white/10 text-white/60"
                }`}
              >
                {plan.badge}
              </span>
            )}

            <div>
              <p className="text-xs text-white/35 uppercase tracking-widest mb-1">
                {plan.name}
              </p>
              <div className="flex items-end gap-1">
                <span
                  className="text-4xl font-black"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-white/35 text-sm mb-1">
                    {plan.period}
                  </span>
                )}
              </div>
              <p className="text-white/40 text-sm mt-1">{plan.desc}</p>
            </div>
            <div className="divider-subtle" />

            <ul className="flex flex-col gap-3">
              {plan.features.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-white/60"
                >
                  <CheckCircle
                    size={14}
                    className="text-emerald-400 shrink-0 mt-0.5"
                  />
                  {item}
                </li>
              ))}
            </ul>

            <PlanCTA plan={plan} highlight={plan.highlight} />
          </div>
        ))}
      </div>

      {/* Pay-as-you-go credit pack */}
      <CreditPackSection />
    </section>
  );
};

export default Pricing;
