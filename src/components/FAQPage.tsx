import { FaQuestionCircle, FaChevronDown } from 'react-icons/fa';
import { useState } from 'react';

export default function FAQPage() {
  const [expandedSections, setExpandedSections] = useState({
    overtrading: false,
    lossAversion: false,
    revengeTrading: false,
    personalized: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="backdrop-blur-xl bg-white/30 border-2 border-gray-300 rounded-2xl p-8 shadow-xl text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/40 border-2 border-red-700">
          <FaQuestionCircle className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
        <p className="text-gray-700 text-lg font-medium">
          Learn more about National Bank Bias Detector and how it can help improve your trading
        </p>
      </div>

      <div className="backdrop-blur-xl bg-white/30 border-2 border-gray-300 rounded-2xl shadow-xl overflow-hidden">
        {/* Overtrading Bias Section */}
        <div className="border-b-2 border-gray-300">
          <button
            onClick={() => toggleSection('overtrading')}
            className="w-full p-8 text-left hover:bg-white/10 transition-colors flex items-center justify-between"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-900">1. Overtrading Bias</h2>
              <p className="text-gray-700 font-semibold mt-2">Understanding Excessive Trading Behaviors</p>
            </div>
            <FaChevronDown
              className={`text-gray-900 transition-transform ${expandedSections.overtrading ? 'rotate-180' : ''}`}
            />
          </button>

          {expandedSections.overtrading && (
            <div className="border-t-2 border-gray-300 px-8 py-6">
              <div className="space-y-6">
                <div className="pb-6 border-b-2 border-gray-300">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Definition</h3>
                  <p className="text-gray-800 leading-relaxed font-medium">
                    Overtrading occurs when traders execute an excessive number of trades relative to their account balance, often leading to increased transaction costs and diminished overall profitability.
                  </p>
                </div>

                <div className="pb-6 border-b-2 border-gray-300">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Frequent Position Changes</h3>
                  <p className="text-gray-800 leading-relaxed font-medium">
                    Traders may frequently switch positions, often influenced by emotional reactions rather than strategic planning, which can disrupt their trading strategy and lead to financial losses.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Impact on Strategy</h3>
                  <p className="text-gray-800 leading-relaxed font-medium">
                    Overtrading undermines a trader's strategy by prioritizing activity over analysis, making it challenging to stick with well-researched plans and potentially leading to impulsive decision-making.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loss Aversion Section */}
        <div className="border-b-2 border-gray-300">
          <button
            onClick={() => toggleSection('lossAversion')}
            className="w-full p-8 text-left hover:bg-white/10 transition-colors flex items-center justify-between"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-900">2. Loss Aversion</h2>
              <p className="text-gray-700 font-semibold mt-2">Understanding trader decision-making flaws</p>
            </div>
            <FaChevronDown
              className={`text-gray-900 transition-transform ${expandedSections.lossAversion ? 'rotate-180' : ''}`}
            />
          </button>

          {expandedSections.lossAversion && (
            <div className="border-t-2 border-gray-300 px-8 py-6">
              <div className="space-y-6">
                <div className="pb-6 border-b-2 border-gray-300">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Definition</h3>
                  <p className="text-gray-800 leading-relaxed font-medium">
                    Loss aversion refers to the tendency of traders to prioritize avoiding losses over acquiring gains, leading to poor decision-making and irrational trading behaviors.
                  </p>
                </div>

                <div className="pb-6 border-b-2 border-gray-300">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Holding Losses</h3>
                  <p className="text-gray-800 leading-relaxed font-medium">
                    Many traders allow losing positions to linger too long, hoping for a turnaround, which often results in greater financial loss rather than accepting smaller, more manageable losses.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Closing Winners</h3>
                  <p className="text-gray-800 leading-relaxed font-medium">
                    Conversely, traders frequently close winning trades prematurely, fearing a reversal, which prevents them from fully realizing potential profits and undermines their overall trading performance.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Revenge Trading Section */}
        <div>
          <button
            onClick={() => toggleSection('revengeTrading')}
            className="w-full p-8 text-left hover:bg-white/10 transition-colors flex items-center justify-between"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-900">3. Revenge Trading</h2>
              <p className="text-gray-700 font-semibold mt-2">Understanding impulsive trading behaviors</p>
            </div>
            <FaChevronDown
              className={`text-gray-900 transition-transform ${expandedSections.revengeTrading ? 'rotate-180' : ''}`}
            />
          </button>

          {expandedSections.revengeTrading && (
            <div className="border-t-2 border-gray-300 px-8 py-6">
              <div className="space-y-6">
                <div className="pb-6 border-b-2 border-gray-300">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Definition</h3>
                  <p className="text-gray-800 leading-relaxed font-medium">
                    Revenge trading occurs when traders make larger trades immediately after experiencing losses, driven by an emotional impulse to recover their lost capital and regain confidence.
                  </p>
                </div>

                <div className="pb-6 border-b-2 border-gray-300">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Risk-Taking</h3>
                  <p className="text-gray-800 leading-relaxed font-medium">
                    This behavior often leads to increased risk-taking, where traders abandon their strategies, making impulsive decisions based on emotions rather than sound analysis and planning.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Recognizing Patterns</h3>
                  <p className="text-gray-800 leading-relaxed font-medium">
                    By identifying revenge trading patterns, the tool can help users become aware of these risky tendencies, allowing them to make more rational and informed trading decisions.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Personalized Suggestions Section */}
        <div className="border-t-2 border-gray-300">
          <button
            onClick={() => toggleSection('personalized')}
            className="w-full p-8 text-left hover:bg-white/10 transition-colors flex items-center justify-between"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-900">4. Recommendations</h2>
              <p className="text-gray-700 font-semibold mt-2">Actionable, personalized tips to improve your trading</p>
            </div>
            <FaChevronDown
              className={`text-gray-900 transition-transform ${expandedSections.personalized ? 'rotate-180' : ''}`}
            />
          </button>

          {expandedSections.personalized && (
            <div className="border-t-2 border-gray-300 px-8 py-6">
              <div className="space-y-4">
                <p className="text-gray-800 leading-relaxed font-medium">
                  These suggestions are designed to be practical and easy to apply. Consider adopting one or two at a time and tracking their impact.
                </p>

                <ul className="list-disc list-inside space-y-2 text-gray-800 font-medium">
                  <li>
                    <strong>Daily trade limits:</strong> Set a maximum number of trades per day to prevent overtrading and reduce impulsive decisions.
                  </li>
                  <li>
                    <strong>Setting stop-loss discipline:</strong> Define stop-loss rules before entering trades to manage risk and avoid holding large, uncontrolled losses.
                  </li>
                  <li>
                    <strong>Cooling-off periods:</strong> After a string of losses or emotionally charged trades, take a scheduled break to regain objectivity.
                  </li>
                  <li>
                    <strong>Journaling prompts for trading psychology:</strong> Record short notes after each trade (e.g., motive, emotion, takeaway) to identify behavioral patterns over time.
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
