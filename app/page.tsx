import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { ArrowRight, Trophy, Users, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-12">
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Logo className="scale-150 mb-12 mx-auto" />
        <h1 className="text-5xl md:text-7xl font-outfit font-bold tracking-tight">
          Your Cricket IQ, <br />
          <span className="text-primary italic">Rewarding</span> Results.
        </h1>
        <p className="text-muted text-lg max-w-2xl mx-auto">
          Predict match outcomes, dominate private leagues, and prove your cricket expertise to the world.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <Link 
          href="/dashboard" 
          className="px-8 py-4 rounded-full bg-primary text-background font-bold text-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group shadow-xl shadow-primary/20"
        >
          Enter NextPick
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link 
          href="/api-doc" 
          className="px-8 py-4 rounded-full glass border border-white/10 hover:bg-white/5 transition-all font-medium text-lg"
        >
          View API Docs
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full pt-12">
        <Feature 
          icon={Trophy} 
          title="Predict & Win" 
          desc="Submit your picks for PSL, IPL, and more." 
        />
        <Feature 
          icon={Users} 
          title="Private Groups" 
          desc="Compete with friends in exclusive leagues." 
        />
        <Feature 
          icon={ShieldCheck} 
          title="Verified Stats" 
          desc="Real-time points powered by CricketData.org" 
        />
      </div>
    </div>
  );
}

function Feature({ icon: Icon, title, desc }: any) {
  return (
    <div className="glass-card p-8 flex flex-col items-center space-y-3">
      <div className="p-3 rounded-2xl bg-primary/10 mb-2">
        <Icon className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-xl font-outfit font-bold">{title}</h3>
      <p className="text-sm text-muted leading-relaxed text-center">{desc}</p>
    </div>
  );
}
