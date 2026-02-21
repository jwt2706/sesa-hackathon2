import { FaQuestionCircle } from 'react-icons/fa';

export default function FAQPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="backdrop-blur-xl bg-white/30 border-2 border-gray-300 rounded-2xl p-8 shadow-xl text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/40 border-2 border-red-700">
          <FaQuestionCircle className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
        <p className="text-gray-700 text-lg font-medium">
          Learn more about the Bias Detector and how it can help improve your trading
        </p>
      </div>

      <div className="backdrop-blur-xl bg-white/30 border-2 border-gray-300 rounded-2xl p-8 shadow-xl">
        <div className="space-y-6">
          <div className="pb-6 border-b-2 border-gray-300">
            <h3 className="text-xl font-bold text-gray-900 mb-3">What is the Bias Detector?</h3>
            <p className="text-gray-800 leading-relaxed font-medium">
              The Bias Detector is a tool designed to help traders identify behavioral biases in their trading
              patterns. By analyzing your trading history, it can detect harmful patterns and provide
              personalized insights to improve your future performance.
            </p>
          </div>

          <div className="pb-6 border-b-2 border-gray-300">
            <h3 className="text-xl font-bold text-gray-900 mb-3">How does it work?</h3>
            <p className="text-gray-800 leading-relaxed font-medium">
              Simply upload your trading history via CSV file or add trades manually. The system will analyze
              your trades for common behavioral biases such as overtrading, loss aversion, and revenge trading.
              You'll receive detailed insights and recommendations based on your specific trading patterns.
            </p>
          </div>

          <div className="pb-6 border-b-2 border-gray-300">
            <h3 className="text-xl font-bold text-gray-900 mb-3">What biases does it detect?</h3>
            <p className="text-gray-800 leading-relaxed mb-3 font-medium">
              Currently, the Bias Detector identifies three main behavioral biases:
            </p>
            <ul className="list-disc list-inside text-gray-800 space-y-2 ml-4 font-medium">
              <li>Overtrading - Excessive trading frequency or impulsive trades</li>
              <li>Loss Aversion - Holding losing positions too long while cutting winners too early</li>
              <li>Revenge Trading - Emotional trading patterns after experiencing losses</li>
            </ul>
          </div>

          <div className="pb-6 border-b-2 border-gray-300">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Is my data secure?</h3>
            <p className="text-gray-800 leading-relaxed font-medium">
              Yes, your trading data is stored securely and is only accessible to you. We use industry-standard
              encryption and security practices to protect your information.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">How can I get started?</h3>
            <p className="text-gray-800 leading-relaxed font-medium">
              Getting started is easy! Simply navigate to the Dashboard, upload your trading history CSV file
              or manually add your trades. Once your data is uploaded, the analysis will automatically run and
              provide you with insights into your trading behavior.
            </p>
          </div>
        </div>
      </div>

      <div className="backdrop-blur-xl bg-white/30 border-2 border-red-400 rounded-2xl p-6 shadow-xl">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/40 border-2 border-red-700">
            <FaQuestionCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Need More Help?</h3>
            <p className="text-gray-800 font-medium">
              This FAQ section is currently being populated with more information. Check back soon for updates!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
