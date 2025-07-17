import { BeaverLogo } from '@/components/ui/beaver-logo'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link 
            href="/register" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mr-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Register
          </Link>
          <div className="flex items-center">
            <BeaverLogo size={32} className="mr-3" />
            <span className="text-xl font-semibold text-foreground">Beaver Task</span>
          </div>
        </div>

        <Card className="p-8">
          <div className="prose prose-gray max-w-none">
            <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
            <p className="text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString()}</p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="mb-4">
                Beaver Task ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our productivity and task management application.
              </p>
              <p className="mb-4">
                By using Beaver Task, you consent to the data practices described in this policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold mb-3">2.1 Personal Information</h3>
              <p className="mb-4">We may collect the following personal information:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Name and email address when you create an account</li>
                <li>Profile information you choose to provide</li>
                <li>Account preferences and settings</li>
                <li>Communication preferences</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">2.2 Usage Data</h3>
              <p className="mb-4">We automatically collect certain information about your use of the Service:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Log data (IP address, browser type, access times, pages viewed)</li>
                <li>Device information (device type, operating system, browser version)</li>
                <li>Usage patterns and feature interactions</li>
                <li>Performance data and error reports</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">2.3 User Content</h3>
              <p className="mb-4">
                We store the content you create using our Service, including tasks, projects, notes, habits, and other data you input. This content is stored securely and is only accessible to you and authorized personnel.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p className="mb-4">We use the collected information for the following purposes:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Provide, maintain, and improve our Service</li>
                <li>Process and manage your account</li>
                <li>Send you important service updates and notifications</li>
                <li>Respond to your questions and support requests</li>
                <li>Analyze usage patterns to improve user experience</li>
                <li>Detect and prevent fraud, abuse, and security threats</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Data Sharing and Disclosure</h2>
              <p className="mb-4">We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:</p>
              
              <h3 className="text-xl font-semibold mb-3">4.1 Service Providers</h3>
              <p className="mb-4">
                We may share information with trusted third-party service providers who assist us in operating our Service, such as hosting providers, analytics services, and customer support tools.
              </p>

              <h3 className="text-xl font-semibold mb-3">4.2 Legal Requirements</h3>
              <p className="mb-4">
                We may disclose your information if required by law or in response to valid legal requests, such as subpoenas or court orders.
              </p>

              <h3 className="text-xl font-semibold mb-3">4.3 Business Transfers</h3>
              <p className="mb-4">
                In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the transaction.
              </p>

              <h3 className="text-xl font-semibold mb-3">4.4 With Your Consent</h3>
              <p className="mb-4">
                We may share your information with third parties when you explicitly consent to such sharing.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
              <p className="mb-4">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Secure data centers and infrastructure</li>
                <li>Employee training on data protection</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
              <p className="mb-4">
                We retain your personal information for as long as necessary to provide our Service and fulfill the purposes outlined in this Privacy Policy. We will delete or anonymize your information when:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>You delete your account</li>
                <li>The information is no longer needed for the purposes for which it was collected</li>
                <li>We are required to do so by law</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Your Rights and Choices</h2>
              <p className="mb-4">You have the following rights regarding your personal information:</p>
              
              <h3 className="text-xl font-semibold mb-3">7.1 Access and Update</h3>
              <p className="mb-4">
                You can access and update your personal information through your account settings or by contacting us.
              </p>

              <h3 className="text-xl font-semibold mb-3">7.2 Deletion</h3>
              <p className="mb-4">
                You can delete your account and associated data at any time through your account settings.
              </p>

              <h3 className="text-xl font-semibold mb-3">7.3 Data Portability</h3>
              <p className="mb-4">
                You can export your data in a machine-readable format upon request.
              </p>

              <h3 className="text-xl font-semibold mb-3">7.4 Opt-out</h3>
              <p className="mb-4">
                You can opt out of certain communications and data collection practices through your account settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Cookies and Tracking Technologies</h2>
              <p className="mb-4">
                We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, and provide personalized content. You can control cookie settings through your browser preferences.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. International Data Transfers</h2>
              <p className="mb-4">
                Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
              <p className="mb-4">
                Our Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Changes to This Privacy Policy</h2>
              <p className="mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
              <p className="mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <p className="mb-4">
                Email: <a href="mailto:privacy@beaver.foundation" className="text-primary hover:underline">privacy@beaver.foundation</a><br />
                Website: <a href="https://beaver.foundation" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">beaver.foundation</a><br />
                Data Protection Officer: <a href="mailto:dpo@beaver.foundation" className="text-primary hover:underline">dpo@beaver.foundation</a>
              </p>
            </section>

            <div className="mt-12 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground">
                By using Beaver Task, you acknowledge that you have read and understood this Privacy Policy and consent to the collection and use of your information as described herein.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
} 