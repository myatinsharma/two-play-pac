import React from 'react';

function PrivacyPolicyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Privacy Policy</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6 text-sm">
            <section>
              <h3 className="text-lg font-semibold mb-2">Overview</h3>
              <p>
                This Privacy Policy describes how we handle information on our website. We are committed to protecting your privacy and being transparent about our practices.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">Data Collection</h3>
              <p className="mb-2">
                We do not collect any personal information from our visitors. Our website:
              </p>
              <ul className="list-disc ml-6">
                <li>Does not use cookies</li>
                <li>Does not track user behavior</li>
                <li>Does not use any analytics tools</li>
                <li>Does not store any personal information</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">Contact</h3>
              <p>
                If you have any questions about this Privacy Policy, please contact us at{' '}
                <a 
                  href="mailto:hyphenfeedback@gmail.com"
                  className="text-blue-600 hover:text-blue-800"
                >
                  hyphenfeedback@gmail.com
                </a>.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">Changes to This Policy</h3>
              <p>
                We may update this Privacy Policy from time to time. Any changes will be posted here.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicyModal; 