import { useEffect, useState } from "react";
import { Star, MessageSquare, Loader2, Send } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { server } from "../main";
import { useAppData } from "../context/AppContext";
import type { Review } from "../types";

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange?: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={20}
          className={`transition-colors ${
            i <= (hover || value) ? "text-amber-400 fill-amber-400" : "text-white/20"
          } ${onChange ? "cursor-pointer" : ""}`}
          onMouseEnter={() => onChange && setHover(i)}
          onMouseLeave={() => onChange && setHover(0)}
          onClick={() => onChange?.(i)}
        />
      ))}
    </div>
  );
}

export default function Reviews() {
  const { isAuth } = useAppData();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function loadReviews() {
    try {
      const { data } = await axios.get(`${server}/api/review`);
      setReviews(data);
    } catch {
      /* ignore */
    } finally {
      setLoadingReviews(false);
    }
  }

  useEffect(() => {
    loadReviews();
  }, []);

  async function handleSubmit() {
    if (!comment.trim()) return toast.error("Please write something!");
    setSubmitting(true);
    try {
      await axios.post(
        `${server}/api/review`,
        { rating, comment },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast.success("Review submitted! Thank you 🙏");
      setComment("");
      setRating(5);
      setShowForm(false);
      await loadReviews();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto" id="reviews">
      <div className="text-center mb-16">
        <span className="feature-pill inline-flex mb-4">
          <MessageSquare size={11} className="text-amber-400" /> What users say
        </span>
        <h2
          className="text-3xl md:text-5xl font-extrabold tracking-tight"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Loved by job seekers{" "}
          <span className="text-gradient">across India</span>
        </h2>
      </div>

      {/* Submit review */}
      {isAuth && (
        <div className="max-w-xl mx-auto mb-12">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full glass-card p-4 flex items-center justify-center gap-2 text-sm text-white/50 hover:text-white/80 hover:border-indigo-500/30 transition-all"
            >
              <Star size={15} className="text-amber-400" />
              Share your experience with HireU
            </button>
          ) : (
            <div className="glass-card p-6 flex flex-col gap-4">
              <p className="text-sm font-semibold text-white/70">Write a review</p>
              <StarRating value={rating} onChange={setRating} />
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How has HireU helped your job search?"
                maxLength={500}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white/80 placeholder-white/25 resize-none focus:outline-none focus:border-indigo-500/50"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2 rounded-lg text-sm text-white/40 hover:text-white/60 border border-white/8 hover:border-white/15 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 py-2 rounded-lg text-sm"
                >
                  {submitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                  {submitting ? "Submitting…" : "Submit"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reviews grid */}
      {loadingReviews ? (
        <div className="flex justify-center py-12">
          <Loader2 size={28} className="text-indigo-400 animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-center text-white/30 text-sm py-12">
          No reviews yet — be the first!
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((r) => (
            <div key={r._id} className="glass-card p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={r.userImage || "/user.png"}
                  alt={r.userName}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/user.png";
                  }}
                />
                <div>
                  <p className="text-sm font-semibold text-white/80">
                    {r.userName}
                  </p>
                  <p className="text-xs text-white/30">
                    {new Date(r.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="ml-auto">
                  <StarRating value={r.rating} />
                </div>
              </div>
              <p className="text-sm text-white/55 leading-relaxed line-clamp-4">
                "{r.comment}"
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
