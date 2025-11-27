"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Camera,
  FolderOpen,
  Settings,
  Ruler,
  ChevronRight,
  Zap,
  Shield,
  Smartphone,
  Sparkles,
  ArrowRight,
  Play,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
  FileText,
  Star,
  ChevronDown,
  MousePointer,
} from "lucide-react";

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="min-h-screen bg-mesh bg-grid dark-theme overflow-x-hidden">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brick-500/20 rounded-full blur-[100px] animate-orb" />
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-purple-500/15 rounded-full blur-[100px] animate-orb-delay" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px] animate-orb-delay-2" />
      </div>

      {/* Floating Particles */}
      <div className="particles-container">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${15 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-brick-500 to-brick-600 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative w-10 h-10 bg-gradient-to-br from-brick-500 to-brick-600 rounded-xl flex items-center justify-center shadow-lg animate-pulse-glow">
                <span className="text-xl">🧱</span>
              </div>
            </div>
            <span className="text-xl font-extrabold text-gradient">Brickie</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-slate-300 hover:text-white font-medium transition-colors link-underline"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2.5 btn-gradient rounded-xl font-bold text-white text-sm"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-20 pb-32 px-4">
        <div
          className="max-w-5xl mx-auto text-center relative z-10"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-8 animate-slide-up">
            <Sparkles className="w-4 h-4 text-brick-400" />
            <span className="text-sm font-medium text-slate-300">AI-Powered Estimating for UK Tradespeople</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 animate-slide-up stagger-1">
            <span className="text-white">Estimate Jobs in</span>
            <br />
            <span className="hero-text-gradient">Seconds, Not Hours</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl sm:text-2xl text-slate-300 mb-10 max-w-2xl mx-auto animate-slide-up stagger-2 leading-relaxed">
            Snap a photo, enter one dimension, get instant{" "}
            <span className="text-white font-semibold">material counts</span>,{" "}
            <span className="text-white font-semibold">labour estimates</span>, and{" "}
            <span className="text-brick-400 font-semibold">professional quotes</span>.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up stagger-3">
            <Link
              href="/signup"
              className="group relative px-8 py-4 btn-gradient rounded-2xl font-bold text-white text-lg flex items-center gap-3 hover-lift"
            >
              <Camera className="w-5 h-5 icon-hover-rotate" />
              <span>Start Estimating Free</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/login"
              className="group px-8 py-4 btn-glass rounded-2xl font-semibold text-white text-lg flex items-center gap-3"
            >
              <span>I have an account</span>
              <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Social Proof */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 animate-slide-up stagger-4">
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-slate-900 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center"
                >
                  <span className="text-sm">🧱</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <p className="text-slate-400 text-sm">
              Trusted by <span className="text-white font-bold">500+</span> bricklayers
            </p>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-subtle">
          <div className="flex flex-col items-center gap-2 text-slate-500">
            <span className="text-xs uppercase tracking-widest">Scroll</span>
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-1/4 left-10 hidden lg:block animate-float">
          <div className="w-20 h-20 glass rounded-2xl flex items-center justify-center rotate-12">
            <Camera className="w-8 h-8 text-brick-400" />
          </div>
        </div>
        <div className="absolute bottom-1/3 right-10 hidden lg:block animate-float" style={{ animationDelay: "1s" }}>
          <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center -rotate-12">
            <FileText className="w-7 h-7 text-purple-400" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { value: "10K+", label: "Estimates Generated", icon: Zap },
              { value: "500+", label: "Active Brickies", icon: Users },
              { value: "< 30s", label: "Average Time", icon: Clock },
              { value: "95%", label: "Accuracy Rate", icon: TrendingUp },
            ].map((stat, i) => (
              <div
                key={i}
                className="glass-card rounded-2xl p-6 text-center hover-lift group"
              >
                <stat.icon className="w-8 h-8 text-brick-400 mx-auto mb-3 icon-hover-rotate" />
                <p className="text-3xl sm:text-4xl font-black text-white mb-1 counter-number">
                  {stat.value}
                </p>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 relative">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-6">
              <Play className="w-4 h-4 text-brick-400" />
              <span className="text-sm font-medium text-slate-300">How It Works</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
              Three Steps to Your <span className="text-gradient">Perfect Quote</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              From photo to professional estimate in under a minute
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Camera,
                title: "Snap the Job",
                description: "Take or upload a photo of the wall, space, or existing structure you need to estimate.",
                gradient: "from-brick-500 to-orange-500",
              },
              {
                step: "02",
                icon: Ruler,
                title: "Add One Dimension",
                description: "Enter a single reference measurement - length or height - to calibrate the AI analysis.",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                step: "03",
                icon: Sparkles,
                title: "Get Your Quote",
                description: "Receive instant estimates for materials, labour hours, and total job pricing with PDF export.",
                gradient: "from-blue-500 to-cyan-500",
              },
            ].map((item, i) => (
              <div key={i} className="group relative">
                {/* Connection Line */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-px bg-gradient-to-r from-white/20 to-transparent" />
                )}

                <div className="glass-card rounded-3xl p-8 h-full hover-lift spotlight">
                  {/* Step Number */}
                  <div className="text-6xl font-black text-white/5 absolute top-4 right-6">
                    {item.step}
                  </div>

                  {/* Icon */}
                  <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    <item.icon className="w-8 h-8 text-white" />
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.gradient} blur-xl opacity-50 group-hover:opacity-75 transition-opacity`} />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-24 px-4 relative">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-6">
              <Shield className="w-4 h-4 text-brick-400" />
              <span className="text-sm font-medium text-slate-300">Built for Real Builders</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
              Everything You Need to <span className="text-gradient">Quote Faster</span>
            </h2>
          </div>

          {/* Features Bento Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Large Feature Card */}
            <div className="md:col-span-2 lg:col-span-2 glass-card rounded-3xl p-8 hover-lift group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brick-500/20 to-transparent rounded-full blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brick-500 to-brick-600 flex items-center justify-center shadow-lg glow-brick-sm">
                    <Zap className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">AI-Powered Analysis</h3>
                    <p className="text-slate-400">GPT-4 Vision technology</p>
                  </div>
                </div>
                <p className="text-lg text-slate-300 leading-relaxed mb-6">
                  Our advanced AI analyzes your job photos to understand scope, complexity, and materials needed.
                  It sees what you see - and calculates what you need.
                </p>
                <div className="flex flex-wrap gap-3">
                  {["Image Recognition", "Dimension Analysis", "Material Detection", "Cost Estimation"].map((tag, i) => (
                    <span key={i} className="px-3 py-1.5 glass rounded-full text-sm text-slate-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Small Feature Cards */}
            <FeatureCard
              icon={FolderOpen}
              title="Save & Organize"
              description="Keep all your estimates organized. Access past jobs anytime, anywhere."
              gradient="from-purple-500 to-pink-500"
            />
            <FeatureCard
              icon={FileText}
              title="PDF Quotes"
              description="Generate professional PDF quotes ready to send to customers."
              gradient="from-blue-500 to-cyan-500"
            />
            <FeatureCard
              icon={Smartphone}
              title="Works Everywhere"
              description="Desktop, tablet, or phone - estimate on site or in the office."
              gradient="from-emerald-500 to-teal-500"
            />
            <FeatureCard
              icon={Settings}
              title="Your Rates"
              description="Set your day rate, per-1000 rate, or per m². Add VAT and markup."
              gradient="from-amber-500 to-orange-500"
            />
          </div>
        </div>
      </section>

      {/* Job Types Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-6">
                <span className="text-lg">🧱</span>
                <span className="text-sm font-medium text-slate-300">Versatile Estimating</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
                Every Type of <span className="text-gradient">Bricklaying Job</span>
              </h2>
              <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                Whether you're building new walls, pointing old ones, or tearing down and rebuilding -
                Brickie handles it all with job-specific calculations.
              </p>

              <Link
                href="/signup"
                className="inline-flex items-center gap-2 text-brick-400 font-bold hover:text-brick-300 transition-colors group"
              >
                <span>Start estimating now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Right - Job Types Grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { type: "Brickwork", icon: "🧱", desc: "New walls & structures", color: "brick" },
                { type: "Blockwork", icon: "⬜", desc: "Block wall construction", color: "slate" },
                { type: "Repointing", icon: "🔧", desc: "Mortar joint restoration", color: "amber" },
                { type: "Demo+Rebuild", icon: "🔨", desc: "Full tear-down & rebuild", color: "red" },
              ].map((job, i) => (
                <div
                  key={i}
                  className="glass-card rounded-2xl p-6 hover-lift group cursor-pointer"
                >
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                    {job.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{job.type}</h3>
                  <p className="text-sm text-slate-400">{job.desc}</p>
                  <div className="mt-4 flex items-center gap-1 text-brick-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Learn more</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial/Quote Section */}
      <section className="py-24 px-4 relative">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 left-1/4 w-32 h-32 bg-brick-500 rounded-full blur-[80px]" />
              <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-purple-500 rounded-full blur-[80px]" />
            </div>

            <div className="relative">
              {/* Quote Marks */}
              <div className="text-8xl text-white/10 font-serif leading-none">"</div>

              <blockquote className="text-2xl md:text-3xl font-medium text-white mb-8 -mt-8">
                Brickie has completely changed how I quote jobs.
                What used to take me 30 minutes now takes 30 seconds.
                <span className="text-brick-400"> More time on the tools, less on paperwork.</span>
              </blockquote>

              <div className="flex items-center justify-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brick-500 to-brick-600 flex items-center justify-center">
                  <span className="text-2xl">👷</span>
                </div>
                <div className="text-left">
                  <p className="font-bold text-white">Dave Mitchell</p>
                  <p className="text-sm text-slate-400">Bricklayer, Manchester</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-brick-600 via-brick-500 to-orange-500">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')] opacity-[0.15]" />
            </div>

            {/* Floating Elements */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-2xl rotate-12 animate-float" />
            <div className="absolute bottom-10 right-10 w-16 h-16 bg-white/10 rounded-full animate-float" style={{ animationDelay: "1s" }} />
            <div className="absolute top-1/2 right-20 w-12 h-12 bg-white/10 rounded-xl -rotate-12 animate-float" style={{ animationDelay: "2s" }} />

            {/* Content */}
            <div className="relative px-8 py-16 md:py-20 text-center">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                Ready to Estimate Smarter?
              </h2>
              <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                Join hundreds of UK bricklayers who are saving hours every week with AI-powered estimates.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/signup"
                  className="group px-8 py-4 bg-white text-brick-600 rounded-2xl font-bold text-lg flex items-center gap-3 hover:bg-slate-100 transition-colors shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Get Started Free</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-4 bg-white/10 backdrop-blur text-white rounded-2xl font-semibold text-lg border border-white/20 hover:bg-white/20 transition-all"
                >
                  Sign In
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-white/70 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Free tier available</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-brick-500 to-brick-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-xl">🧱</span>
                </div>
              </div>
              <span className="text-xl font-extrabold text-gradient">Brickie</span>
            </Link>

            {/* Links */}
            <nav className="flex items-center gap-6">
              <Link href="/login" className="text-slate-400 hover:text-white transition-colors text-sm">
                Log In
              </Link>
              <Link href="/signup" className="text-slate-400 hover:text-white transition-colors text-sm">
                Sign Up
              </Link>
            </nav>

            {/* Copyright */}
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} Brickie. Built for the trades.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  gradient,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-6 hover-lift group spotlight">
      <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg`}>
        <Icon className="w-6 h-6 text-white" />
        <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${gradient} blur-lg opacity-40 group-hover:opacity-60 transition-opacity`} />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}
