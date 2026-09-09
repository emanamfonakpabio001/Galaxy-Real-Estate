import React, { useState } from 'react';
import { Calculator, DollarSign, Percent, Calendar, Sparkles, TrendingUp } from 'lucide-react';
import { formatNaira } from '../utils/formatters';

export const MortgageCalculator: React.FC = () => {
  const [propertyPrice, setPropertyPrice] = useState<number>(85000000);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [loanTenureYears, setLoanTenureYears] = useState<number>(15);
  const [interestRate, setInterestRate] = useState<number>(18); // Typical Nigerian mortgage rate

  const downPaymentAmount = (propertyPrice * downPaymentPercent) / 100;
  const principalLoan = propertyPrice - downPaymentAmount;
  
  // Monthly interest
  const monthlyRate = interestRate / 100 / 12;
  const totalMonths = loanTenureYears * 12;
  
  const monthlyRepayment = monthlyRate > 0
    ? (principalLoan * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1)
    : principalLoan / totalMonths;

  const totalPayment = monthlyRepayment * totalMonths;
  const totalInterest = totalPayment - principalLoan;

  return (
    <section id="calculator" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0B1F3A]/5 border border-[#0B1F3A]/10 text-[#0B1F3A] text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#D4A84F]" />
            <span>Financial Planning Tool</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0B1F3A] tracking-tight">
            Mortgage & Investment Calculator
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#667085] leading-relaxed">
            Estimate your monthly financing commitments, down payments, and total investment repayment schedule.
          </p>
        </div>

        <div className="bg-[#F5F7FA] rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            
            {/* Inputs */}
            <div className="space-y-5">
              
              {/* Property Price */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Property Price (₦)</label>
                  <span className="text-xs font-extrabold text-[#0B1F3A]">{formatNaira(propertyPrice)}</span>
                </div>
                <input
                  type="range"
                  min="20000000"
                  max="500000000"
                  step="5000000"
                  value={propertyPrice}
                  onChange={(e) => setPropertyPrice(Number(e.target.value))}
                  className="w-full accent-[#D4A84F] cursor-pointer"
                />
              </div>

              {/* Down Payment */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Down Payment ({downPaymentPercent}%)</label>
                  <span className="text-xs font-extrabold text-[#0B1F3A]">{formatNaira(downPaymentAmount)}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  step="5"
                  value={downPaymentPercent}
                  onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                  className="w-full accent-[#D4A84F] cursor-pointer"
                />
              </div>

              {/* Loan Tenure */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Loan Tenure ({loanTenureYears} Years)</label>
                  <span className="text-xs font-extrabold text-[#0B1F3A]">{loanTenureYears * 12} Months</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="25"
                  step="1"
                  value={loanTenureYears}
                  onChange={(e) => setLoanTenureYears(Number(e.target.value))}
                  className="w-full accent-[#D4A84F] cursor-pointer"
                />
              </div>

              {/* Interest Rate */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Annual Interest Rate (%)</label>
                  <span className="text-xs font-extrabold text-[#0B1F3A]">{interestRate}%</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="26"
                  step="0.5"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full accent-[#D4A84F] cursor-pointer"
                />
              </div>

            </div>

            {/* Results Display Card */}
            <div className="bg-[#0B1F3A] text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-[#D4A84F]/30 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#D4A84F] uppercase tracking-wider block mb-1">
                  Estimated Monthly Commitment
                </span>
                <h3 className="font-display text-3xl sm:text-4xl font-extrabold text-white mb-4">
                  {formatNaira(Math.round(monthlyRepayment))} <span className="text-xs font-normal text-slate-300">/ mo</span>
                </h3>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/10 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Principal Loan Amount:</span>
                  <strong className="text-white">{formatNaira(principalLoan)}</strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Total Down Payment:</span>
                  <strong className="text-white">{formatNaira(downPaymentAmount)}</strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Estimated Total Interest:</span>
                  <strong className="text-[#D4A84F]">{formatNaira(Math.round(totalInterest))}</strong>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10">
                <p className="text-[10px] text-slate-400 leading-normal">
                  *Figures are estimates for planning purposes. Galaxy partners with leading Nigerian mortgage banks and NHF providers to structure favorable financing.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
