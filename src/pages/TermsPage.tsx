
import React from 'react';
import { Link } from 'react-router-dom';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Terms of Service</h1>
          <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using Route Aura's bus booking services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Service Description</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Route Aura provides online bus ticket booking services, allowing customers to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Search and book bus tickets for various routes</li>
                <li>Manage bookings and view travel history</li>
                <li>Access customer support services</li>
                <li>Receive digital receipts and confirmations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                To use our booking services, you must create an account and provide accurate, complete information. You are responsible for:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
                <li>Ensuring your account information remains current and accurate</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Booking and Payment Terms</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Booking Confirmation</h3>
                  <p className="text-gray-700 leading-relaxed">
                    All bookings are subject to availability. A booking is confirmed only when you receive a confirmation email with your ticket details.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Payment</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Payment must be made in full at the time of booking. We accept major credit cards, debit cards, and other approved payment methods.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Pricing</h3>
                  <p className="text-gray-700 leading-relaxed">
                    All prices are displayed in local currency and include applicable taxes. Prices may vary based on demand, route, and travel dates.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Cancellation and Refund Policy</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Cancellation by Customer</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Cancellations made 24+ hours before departure: 90% refund</li>
                    <li>Cancellations made 6-24 hours before departure: 50% refund</li>
                    <li>Cancellations made less than 6 hours before departure: No refund</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Cancellation by Route Aura</h3>
                  <p className="text-gray-700 leading-relaxed">
                    If we cancel a trip due to operational reasons, you will receive a full refund or the option to reschedule at no additional cost.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Travel Requirements</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Passengers must arrive at the departure point at least 15 minutes before scheduled departure</li>
                <li>Valid government-issued ID is required for travel</li>
                <li>Luggage restrictions apply as per our baggage policy</li>
                <li>Passengers must comply with all safety regulations and driver instructions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                Route Aura's liability is limited to the cost of your ticket. We are not responsible for indirect, incidental, or consequential damages including but not limited to lost profits, missed connections, or travel delays beyond our control.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                Your privacy is important to us. Please review our <Link to="/privacy" className="text-blue-600 hover:text-blue-800 underline">Privacy Policy</Link> to understand how we collect, use, and protect your information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Prohibited Activities</h2>
              <p className="text-gray-700 leading-relaxed mb-4">You agree not to:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Use the service for any unlawful purpose</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with the proper functioning of the service</li>
                <li>Provide false or misleading information</li>
                <li>Resell tickets without authorization</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Modifications to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of the service constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700"><strong>Email:</strong> support@routeaura.com</p>
                <p className="text-gray-700"><strong>Phone:</strong> +1 (555) 123-4567</p>
                <p className="text-gray-700"><strong>Address:</strong> 123 Bus Terminal, Highway Road, Transport City, TC 54321</p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-center text-gray-600">
              By using Route Aura's services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
