import Link from "next/link";
import { Camera, FolderOpen, Settings, Ruler, ChevronRight, Zap, Shield, Smartphone } from "lucide-react";
import { Button } from "@brickie/ui";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-warm-50">
      {/* Header */}
      <header className="bg-white border-b border-warm-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-brick-500 rounded-xl flex items-center justify-center shadow-lg">
              <Ruler className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-warm-900">Brickie</span>
          </div>
          <nav className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-warm-600 hover:text-warm-900 font-medium"
            >
              Log In
            </Link>
            <Link href="/signup">
              <Button size="sm">Sign Up</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-warm-900 mb-6">
            Quick Estimates for{" "}
            <span className="text-brick-500">Bricklayers</span>
          </h1>
          <p className="text-xl text-warm-600 mb-10 max-w-2xl mx-auto">
            Snap a photo, enter one dimension, and get AI-powered material and
            labour estimates in seconds. Built for UK tradespeople.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                <Camera className="w-5 h-5 mr-2" />
                Start Estimating Free
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Already have an account?
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-warm-900 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Camera className="w-8 h-8" />}
              title="1. Snap a Photo"
              description="Take or upload a photo of the job site. Our AI analyses the image to understand the scope of work."
            />
            <FeatureCard
              icon={<Ruler className="w-8 h-8" />}
              title="2. Enter Dimensions"
              description="Provide one anchor dimension (length or height) to help calibrate the estimate."
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="3. Get Estimate"
              description="Receive instant estimates for bricks, materials, labour hours, and recommended pricing."
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-warm-900 mb-6">
                Built for Real Builders
              </h2>
              <ul className="space-y-4">
                <BenefitItem
                  icon={<Shield className="w-5 h-5" />}
                  text="Practical estimates based on UK standards"
                />
                <BenefitItem
                  icon={<FolderOpen className="w-5 h-5" />}
                  text="Save jobs and generate PDF quotes"
                />
                <BenefitItem
                  icon={<Smartphone className="w-5 h-5" />}
                  text="Works on phone, tablet, and desktop"
                />
              </ul>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-lg font-semibold text-warm-800 mb-4">
                Supports All Job Types
              </h3>
              <div className="space-y-3">
                <JobTypeItem type="Brickwork" description="New brick walls and structures" />
                <JobTypeItem type="Blockwork" description="Block wall construction" />
                <JobTypeItem type="Repointing" description="Mortar joint restoration" />
                <JobTypeItem type="Demo+Rebuild" description="Full demolition and rebuild" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-brick-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Speed Up Your Estimates?
          </h2>
          <p className="text-brick-100 mb-8 text-lg">
            Join hundreds of bricklayers using AI to quote faster and more
            accurately.
          </p>
          <Link href="/signup">
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-brick-600 hover:bg-warm-100"
            >
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-warm-900 text-warm-400 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-brick-500 rounded-lg flex items-center justify-center">
                <Ruler className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-semibold">Brickie</span>
            </div>
            <p className="text-sm">
              © {new Date().getFullYear()} Brickie. Built for the trades.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center p-6">
      <div className="w-16 h-16 bg-brick-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-brick-500">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-warm-900 mb-2">{title}</h3>
      <p className="text-warm-600">{description}</p>
    </div>
  );
}

function BenefitItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <li className="flex items-center space-x-3">
      <div className="w-10 h-10 bg-brick-50 rounded-xl flex items-center justify-center text-brick-500">
        {icon}
      </div>
      <span className="text-warm-700">{text}</span>
    </li>
  );
}

function JobTypeItem({ type, description }: { type: string; description: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-warm-50 rounded-xl">
      <div>
        <p className="font-medium text-warm-900">{type}</p>
        <p className="text-sm text-warm-600">{description}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-warm-400" />
    </div>
  );
}
