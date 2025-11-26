"use client";

import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { Button, Card, Input, Textarea } from "@brickie/ui";
import { createClient } from "@/lib/supabase/client";
import { useStore } from "@/lib/store";
import { updateProfile } from "@brickie/lib";

export default function SettingsPage() {
  const { user, profile, setProfile } = useStore();
  const [companyName, setCompanyName] = useState("");
  const [dayRate, setDayRate] = useState("");
  const [disclaimerText, setDisclaimerText] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setCompanyName(profile.company_name || "");
      setDayRate(profile.day_rate?.toString() || "220");
      setDisclaimerText(
        profile.disclaimer_text ||
          "This is an estimate only and is subject to site survey. Prices may vary based on actual conditions, material availability, and scope changes."
      );
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setSaved(false);

    try {
      const supabase = createClient();
      const updated = await updateProfile(supabase, user.id, {
        company_name: companyName || null,
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
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-warm-900 mb-6">Settings</h1>

      <div className="space-y-6">
        {/* Account */}
        <Card title="Account">
          <div className="space-y-2">
            <p className="text-sm text-warm-600">Email</p>
            <p className="font-medium text-warm-900">{user?.email}</p>
          </div>
        </Card>

        {/* Company Info */}
        <Card title="Company Information">
          <Input
            label="Company Name"
            placeholder="Your Company Ltd"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <Input
            label="Default Day Rate"
            type="number"
            placeholder="220"
            value={dayRate}
            onChange={(e) => setDayRate(e.target.value)}
            suffix="GBP/day"
          />
        </Card>

        {/* PDF Settings */}
        <Card title="PDF Quote Settings">
          <Textarea
            label="Disclaimer Text"
            placeholder="Enter disclaimer text for PDF quotes..."
            value={disclaimerText}
            onChange={(e) => setDisclaimerText(e.target.value)}
            rows={4}
          />
        </Card>

        {/* Save Button */}
        <Button onClick={handleSave} loading={saving} fullWidth size="lg">
          <Save className="w-5 h-5 mr-2" />
          {saved ? "Saved!" : "Save Settings"}
        </Button>

        {/* Info */}
        <p className="text-xs text-warm-500 text-center">
          Your settings are stored securely and used to personalize your
          estimates and PDF quotes.
        </p>
      </div>
    </div>
  );
}
