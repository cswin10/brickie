"use client";

import { useState, useEffect, useRef } from "react";
import { Save, Upload, X, Building2, Phone, MapPin, CheckCircle2, Mail, Sparkles, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useStore } from "@/lib/store";
import { updateProfile } from "@brickie/lib";

export default function SettingsPage() {
  const { user, profile, setProfile } = useStore();
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [dayRate, setDayRate] = useState("");
  const [disclaimerText, setDisclaimerText] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setCompanyName(profile.company_name || "");
      setPhone(profile.phone || "");
      setEmail(user?.email || "");
      setAddress(profile.address || "");
      setDayRate(profile.day_rate?.toString() || "220");
      setLogoUrl(profile.logo_url || null);
      setLogoPreview(profile.logo_url || null);
      setDisclaimerText(
        profile.disclaimer_text ||
          "This is an estimate only and is subject to site survey. Prices may vary based on actual conditions, material availability, and scope changes."
      );
    }
  }, [profile, user]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingLogo(true);

    try {
      const supabase = createClient();
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/logo.${fileExt}`;

      // Delete old logo if exists
      if (logoUrl) {
        const oldPath = logoUrl.split("/").pop();
        if (oldPath) {
          await supabase.storage.from("logos").remove([`${user.id}/${oldPath}`]);
        }
      }

      // Upload new logo
      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage.from("logos").getPublicUrl(fileName);
      const newLogoUrl = data.publicUrl;

      setLogoUrl(newLogoUrl);
      setLogoPreview(URL.createObjectURL(file));

      // Update profile with new logo URL
      await updateProfile(supabase, user.id, { logo_url: newLogoUrl });
    } catch (err) {
      console.error("Failed to upload logo:", err);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!user || !logoUrl) return;

    try {
      const supabase = createClient();
      const fileName = logoUrl.split("/").pop();
      if (fileName) {
        await supabase.storage.from("logos").remove([`${user.id}/${fileName}`]);
      }

      await updateProfile(supabase, user.id, { logo_url: null });
      setLogoUrl(null);
      setLogoPreview(null);
    } catch (err) {
      console.error("Failed to remove logo:", err);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setSaved(false);

    try {
      const supabase = createClient();
      const updated = await updateProfile(supabase, user.id, {
        company_name: companyName || null,
        phone: phone || null,
        address: address || null,
        day_rate: parseFloat(dayRate) || 220,
        disclaimer_text: disclaimerText || null,
      });

      if (updated) {
        setProfile(updated);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh bg-grid pb-8">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-brick-600/10" />
        <div className="relative px-4 pt-8 pb-16 sm:pt-12">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Settings</h1>
            </div>
            <p className="text-slate-400 text-sm sm:text-base ml-13">
              Customise your quotes and branding
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-8 space-y-4">
        {/* Logo Upload */}
        <div className="glass-card rounded-2xl p-6 animate-scale-in">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Company Logo</h3>

          <div className="flex items-center gap-4">
            {/* Logo Preview */}
            <div className="relative">
              {logoPreview ? (
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-white/10 border border-white/10">
                  <img
                    src={logoPreview}
                    alt="Company logo"
                    className="w-full h-full object-contain"
                  />
                  <button
                    onClick={handleRemoveLogo}
                    className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-slate-500" />
                </div>
              )}
            </div>

            {/* Upload Button */}
            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingLogo}
                className="w-full py-3 px-4 btn-glass text-white rounded-xl font-semibold flex items-center justify-center gap-2 tap-highlight"
              >
                {uploadingLogo ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    {logoPreview ? "Change Logo" : "Upload Logo"}
                  </>
                )}
              </button>
              <p className="text-xs text-slate-500 mt-2 text-center">
                PNG, JPG or WebP. Max 2MB.
              </p>
            </div>
          </div>
        </div>

        {/* Company Info */}
        <div className="glass-card rounded-2xl p-6 space-y-4 animate-slide-up" style={{ animationDelay: '0.05s' }}>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Company Details</h3>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Company Name</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Your Company Ltd"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full input-modern py-3.5 pl-12 pr-4 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="tel"
                placeholder="07123 456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full input-modern py-3.5 pl-12 pr-4 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full input-modern py-3.5 pl-12 pr-4 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Address</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
              <textarea
                placeholder="123 Builder Street&#10;London, SW1 1AA"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                className="w-full input-modern py-3.5 pl-12 pr-4 resize-none rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="glass-card rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Default Day Rate</h3>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">£</span>
            <input
              type="number"
              placeholder="220"
              value={dayRate}
              onChange={(e) => setDayRate(e.target.value)}
              className="w-full input-modern py-4 pl-10 pr-16 text-2xl font-bold rounded-xl"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">/day</span>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="glass-card rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quote Disclaimer</h3>
          </div>
          <textarea
            placeholder="Terms and conditions for your quotes..."
            value={disclaimerText}
            onChange={(e) => setDisclaimerText(e.target.value)}
            rows={4}
            className="w-full input-modern py-3.5 px-4 resize-none text-sm rounded-xl"
          />
          <p className="text-xs text-slate-500 mt-2">
            This text appears at the bottom of your PDF quotes.
          </p>
        </div>

        {/* Account Info */}
        <div className="glass-card rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Account</h3>
          <p className="text-white font-medium">{user?.email}</p>
          <p className="text-xs text-slate-500 mt-1">Signed in via email</p>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full py-4 px-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all animate-slide-up ${
            saved
              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
              : saving
              ? "bg-white/10 text-slate-500"
              : "btn-gradient text-white"
          }`}
          style={{ animationDelay: '0.25s' }}
        >
          {saving ? (
            <>
              <div className="w-5 h-5 border-2 border-slate-500 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Settings
            </>
          )}
        </button>

        {/* Bottom padding */}
        <div className="h-4" />
      </div>
    </div>
  );
}
