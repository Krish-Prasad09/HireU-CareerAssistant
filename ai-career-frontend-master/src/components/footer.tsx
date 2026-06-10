import { Mail, Phone } from "lucide-react";

function Footer() {
  return (
    <footer className="border-t border-white/6 px-6 md:px-12 py-10 flex flex-col gap-6 text-white/25 text-xs">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span
            style={{ fontFamily: "'Syne', sans-serif" }}
            className="font-bold text-white/40 text-sm"
          >
            HireU
          </span>
          <p className="text-white/30 text-xs mt-2">
            Your AI-powered career assistant
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-semibold text-white/50 text-xs">
            For any queries, contact:
          </p>
          <div className="flex flex-col gap-1 text-white/40">
            <a
              href="tel:7000636377"
              className="hover:text-white/60 transition-colors flex items-center gap-2"
            >
              <Phone size={14} aria-hidden="true" /> +91 7000636377
            </a>
            <a
              href="mailto:k2enterprises@gmail.com"
              className="hover:text-white/60 transition-colors flex items-center gap-2"
            >
              <Mail size={14} aria-hidden="true" /> k2enterprises@gmail.com
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/6 pt-4">
        <span>(c) {new Date().getFullYear()} HireU. All rights reserved.</span>
      </div>
    </footer>
  );
}

export default Footer;
