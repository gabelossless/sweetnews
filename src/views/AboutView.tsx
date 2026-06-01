import { motion } from 'motion/react';
import { ArrowLeft, Mail, MapPin, Shield } from 'lucide-react';
import { OwlMascot } from '../components/atoms/OwlMascot';

interface AboutViewProps {
  onBack: () => void;
}

export function AboutView({ onBack }: AboutViewProps) {
  return (
    <motion.div
      key="about-tab"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
      className="mt-4 min-h-[70vh] px-2 pb-8"
    >
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-on-surface-variant hover:text-on-background text-[11px] uppercase tracking-widest font-black mb-8 transition-colors"
      >
        <ArrowLeft size={14} /> Back to Shop
      </button>

      {/* Hero */}
      <section className="mb-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <OwlMascot size={140} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.45 }}
          className="text-[48px] uppercase font-black leading-[0.88] tracking-tighter mb-3 text-on-background"
        >
          <span style={{ background: 'linear-gradient(135deg,#e60023,#ff2060)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            SWEET
          </span>
          <br />
          <span className="text-on-surface-variant">NEWS.</span>
        </motion.h1>

        <p className="text-[11px] uppercase tracking-[0.25em] text-on-surface-variant font-black">
          Denver, CO · Est. 2023
        </p>
      </section>

      {/* Story */}
      <section className="mb-6">
        <div className="glass-panel rounded-[28px] p-6 space-y-4">
          <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-on-surface-variant border-b border-on-background/[0.07] pb-3">
            Our Story
          </h2>
          <p className="text-[13px] text-on-background/75 leading-relaxed font-medium">
            Sweet News started as a late-night idea between friends in{' '}
            <span className="text-on-background font-black">Denver, Colorado</span> in 2023.
            We noticed something: the best food is usually found after midnight — but
            delivery options were always an afterthought.
          </p>
          <p className="text-[13px] text-on-background/75 leading-relaxed font-medium">
            We built Sweet News to change that. Premium snacks, exotic finds, and
            curated flavors — delivered with{' '}
            <span className="text-on-background font-black">zero compromise</span>. Our owl
            stays up so you don't have to.
          </p>
          <p className="text-[13px] text-on-background/75 leading-relaxed font-medium">
            We're powered by passionate local drivers and obsessed with quality.
            Every drop in our vault is hand-selected. Every delivery is tracked in
            real time. This is midnight, done right.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="mb-6">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Founded', value: '2023', sub: 'Denver, CO' },
            { label: 'Mission', value: 'Premium', sub: 'After Dark Delivery' },
            { label: 'Drivers', value: 'Local', sub: 'Vetted Partners' },
            { label: 'Quality', value: '100%', sub: 'Hand-Selected' },
          ].map((item) => (
            <div
              key={item.label}
              className="glass-panel rounded-[20px] p-4 text-center"
            >
              <p className="text-[8px] uppercase tracking-[0.25em] text-on-surface-variant font-black mb-1">
                {item.label}
              </p>
              <p className="text-[18px] font-black text-on-background leading-none mb-0.5">
                {item.value}
              </p>
              <p className="text-[9px] text-on-surface-variant font-medium">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="mb-6">
        <div className="glass-panel rounded-[28px] p-6 space-y-4">
          <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-on-surface-variant border-b border-on-background/[0.07] pb-3">
            Get in Touch
          </h2>

          <a
            href="mailto:sweetnewsowl@gmail.com"
            className="flex items-center gap-4 py-2 group"
          >
            <div className="w-10 h-10 rounded-2xl btn-brand flex items-center justify-center flex-shrink-0 shadow-[0_4px_16px_rgba(230,0,35,0.4)]">
              <Mail size={16} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-black mb-0.5">
                Email Us
              </p>
              <p className="text-[13px] text-on-background font-black group-hover:text-[#ff2060] transition-colors">
                sweetnewsowl@gmail.com
              </p>
            </div>
          </a>

          <div className="flex items-center gap-4 py-2">
            <div className="w-10 h-10 rounded-2xl bg-on-background/[0.05] border border-on-background/[0.09] flex items-center justify-center flex-shrink-0">
              <MapPin size={16} className="text-on-surface-variant" />
            </div>
            <div>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-black mb-0.5">
                Headquarters
              </p>
              <p className="text-[13px] text-on-background font-black">
                Denver, Colorado
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Legal */}
      <section className="mb-4">
        <div className="rounded-[24px] border border-on-background/[0.07] bg-on-background/[0.03] p-5 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Shield size={12} className="text-on-background/30" />
            <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-on-surface-variant">
              Legal Disclaimer
            </h2>
          </div>
          <p className="text-[10px] text-on-surface-variant leading-relaxed font-medium">
            Sweet News is a food delivery platform connecting customers with local
            vendors and independent delivery partners. All products are subject to
            availability. Delivery times may vary based on location and demand.
            Sweet News LLC is registered in the State of Colorado. Menu items and
            prices are subject to change without notice. Sweet News LLC is not
            responsible for allergic reactions or dietary concerns — please review
            all product descriptions carefully. For support or inquiries, contact{' '}
            <a href="mailto:sweetnewsowl@gmail.com" className="text-on-surface-variant underline">
              sweetnewsowl@gmail.com
            </a>
            .
          </p>
          <p className="text-[10px] text-on-background/30 font-medium">
            © 2023–{new Date().getFullYear()} Sweet News LLC. All rights reserved.
          </p>
        </div>
      </section>

      {/* Mascot sign-off */}
      <div className="flex flex-col items-center py-6 gap-2">
        <OwlMascot size={48} />
        <p className="text-[10px] text-on-background/30 uppercase tracking-[0.25em] font-black">
          The Owl Stays Up
        </p>
      </div>
    </motion.div>
  );
}

export default AboutView;
