import { View, Text, StyleSheet, ScrollView, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ruler, ExternalLink } from "lucide-react-native";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";

export default function AboutScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo & Title */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <Ruler size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>Brickie</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        {/* Description */}
        <Card style={styles.section}>
          <Text style={styles.description}>
            Brickie is a mobile-first quick-estimate tool designed for UK
            bricklayers. Snap a photo, enter basic dimensions, and get
            AI-powered estimates for materials, labour, and pricing in seconds.
          </Text>
        </Card>

        {/* Pricing */}
        <Card title="Pricing" style={styles.section}>
          <View style={styles.pricingBadge}>
            <Text style={styles.pricingAmount}>£9.99</Text>
            <Text style={styles.pricingPeriod}>/month</Text>
          </View>
          <Text style={styles.pricingNote}>
            Subscription coming soon. Currently free during beta.
          </Text>
        </Card>

        {/* Features */}
        <Card title="Features" style={styles.section}>
          <View style={styles.featureList}>
            <FeatureItem text="AI-powered photo analysis" />
            <FeatureItem text="Material & labour estimates" />
            <FeatureItem text="PDF quote generation" />
            <FeatureItem text="Save & review past jobs" />
            <FeatureItem text="Works offline (after initial load)" />
            <FeatureItem text="iOS, Android & Web support" />
          </View>
        </Card>

        {/* How It Works */}
        <Card title="How It Works" style={styles.section}>
          <View style={styles.stepList}>
            <StepItem number={1} text="Take or upload a photo of the job" />
            <StepItem number={2} text="Enter one anchor dimension (length or height)" />
            <StepItem number={3} text="Select job type and difficulty" />
            <StepItem number={4} text="Get instant AI estimate" />
            <StepItem number={5} text="Save job or generate PDF quote" />
          </View>
        </Card>

        {/* Disclaimer */}
        <Card style={styles.section}>
          <Text style={styles.disclaimerTitle}>Important</Text>
          <Text style={styles.disclaimer}>
            All estimates are provided for guidance only. Actual costs may vary
            based on site conditions, material prices, access requirements, and
            scope changes. Always conduct a proper site survey before providing
            final quotes.
          </Text>
        </Card>

        {/* API Credit */}
        <View style={styles.apiCredit}>
          <Text style={styles.apiCreditText}>
            Powered by OpenAI GPT-4 Vision
          </Text>
          <Button
            title="Get API Key"
            variant="ghost"
            size="sm"
            icon={<ExternalLink size={14} color="#C75B3B" />}
            onPress={() => Linking.openURL("https://platform.openai.com/api-keys")}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Built for the trades. Made in the UK.
          </Text>
          <Text style={styles.copyright}>
            © {new Date().getFullYear()} Brickie App
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureBullet} />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

function StepItem({ number, text }: { number: number; text: string }) {
  return (
    <View style={styles.stepItem}>
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>{number}</Text>
      </View>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFCFB",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
    marginTop: 8,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "#C75B3B",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#C75B3B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#544740",
  },
  version: {
    fontSize: 14,
    color: "#B8A393",
    marginTop: 4,
  },
  section: {
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    color: "#655549",
    lineHeight: 22,
  },
  pricingBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 8,
  },
  pricingAmount: {
    fontSize: 32,
    fontWeight: "700",
    color: "#C75B3B",
  },
  pricingPeriod: {
    fontSize: 16,
    color: "#998272",
    marginLeft: 4,
  },
  pricingNote: {
    fontSize: 13,
    color: "#998272",
  },
  featureList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#C75B3B",
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: "#655549",
  },
  stepList: {
    gap: 12,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FDF6F3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#C75B3B",
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: "#655549",
  },
  disclaimerTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#544740",
    marginBottom: 8,
  },
  disclaimer: {
    fontSize: 13,
    color: "#998272",
    lineHeight: 18,
  },
  apiCredit: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
    marginBottom: 24,
  },
  apiCreditText: {
    fontSize: 12,
    color: "#B8A393",
  },
  footer: {
    alignItems: "center",
  },
  footerText: {
    fontSize: 13,
    color: "#998272",
    marginBottom: 4,
  },
  copyright: {
    fontSize: 12,
    color: "#B8A393",
  },
});
