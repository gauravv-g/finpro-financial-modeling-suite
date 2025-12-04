
import { FinancialInputs, YearProjection, FinancialMetrics, ScenarioResult, AmortizationEntry, WorkingCapitalAssessment, BreakEvenPoint, RiskFlag } from '../types';

export const calculateAmortization = (inputs: FinancialInputs): AmortizationEntry[] => {
  const schedule: AmortizationEntry[] = [];
  let balance = inputs.loanRequired;
  const principalPerYear = inputs.loanRequired / inputs.loanTenure;

  for (let i = 1; i <= inputs.loanTenure; i++) {
    const interest = balance * (inputs.interestRate / 100);
    const principal = principalPerYear;
    const closing = Math.max(0, balance - principal);
    
    schedule.push({
      year: i,
      openingBalance: Math.round(balance * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      principal: Math.round(principal * 100) / 100,
      closingBalance: Math.round(closing * 100) / 100
    });
    
    balance = closing;
  }
  return schedule;
};

export const calculateWorkingCapital = (projections: YearProjection[], inputs: FinancialInputs): WorkingCapitalAssessment[] => {
  return projections.map(p => {
    // Assumptions:
    // Inventory: 1 month of Expenses (approx COGS)
    // Receivables: 1 month of Revenue
    // Payables: 1 month of Expenses
    const inventory = p.expense / 12;
    const receivables = p.revenue / 12;
    const payables = p.expense / 12;
    
    const netWorkingCapital = inventory + receivables - payables;
    
    // MPBF (Maximum Permissible Bank Finance) - Nayak Committee Norms
    // Generally 75% of Net Working Capital Gap is funded by Bank
    const bankFinance = netWorkingCapital * 0.75;
    
    return {
      year: p.year,
      inventory: Math.round(inventory * 100) / 100,
      receivables: Math.round(receivables * 100) / 100,
      payables: Math.round(payables * 100) / 100,
      netWorkingCapital: Math.round(netWorkingCapital * 100) / 100,
      bankFinance: Math.round(bankFinance * 100) / 100
    };
  });
};

export const calculateBreakEven = (inputs: FinancialInputs, year1Stats: YearProjection): BreakEvenPoint => {
  // Simplified BEP
  // Fixed Costs = Interest + Depreciation + 40% of Other Expenses (Assumption)
  const fixedCost = year1Stats.interest + year1Stats.depreciation + (year1Stats.expense * 0.4);
  
  // Contribution Margin = (Revenue - Variable Cost)
  // Variable Cost = 60% of Expenses
  const variableCost = year1Stats.expense * 0.6;
  const contribution = year1Stats.revenue - variableCost;
  const pvRatio = contribution / year1Stats.revenue;
  
  const bepRevenue = fixedCost / pvRatio;
  const bepPercentage = (bepRevenue / year1Stats.revenue) * 100;
  
  return {
    fixedCost: Math.round(fixedCost * 100) / 100,
    variableCostPerUnit: Math.round(variableCost * 100) / 100,
    bepRevenue: Math.round(bepRevenue * 100) / 100,
    bepPercentage: Math.round(bepPercentage * 100) / 100
  };
};

export const calculateProjections = (inputs: FinancialInputs): YearProjection[] => {
  const years = 5;
  const projections: YearProjection[] = [];
  
  let currentRevenue = inputs.year1Revenue;
  
  const annualDepreciation = 
    (inputs.buildingCost * (inputs.depreciationBuilding / 100)) + 
    (inputs.machineryCost * (inputs.depreciationMachinery / 100)) + 
    (inputs.otherCost * (inputs.depreciationOther / 100));

  const initialGrossBlock = inputs.landCost + inputs.buildingCost + inputs.machineryCost + inputs.otherCost;
  
  let loanBalance = inputs.loanRequired;
  let accumulatedReserves = 0;
  let accumulatedDepreciation = 0;
  
  for (let i = 1; i <= years; i++) {
    if (i > 1) {
      currentRevenue = currentRevenue * (1 + inputs.revenueGrowthRate / 100);
    }

    const projectedPat = currentRevenue * (inputs.netMargin / 100);
    const corporateTaxRate = inputs.incomeTaxRate / 100;
    
    const pbt = projectedPat / (1 - corporateTaxRate);
    const tax = pbt * corporateTaxRate;

    const interest = loanBalance * (inputs.interestRate / 100);
    const ebitda = pbt + interest + annualDepreciation;
    const expense = currentRevenue - ebitda;

    const principalRepayment = i <= inputs.loanTenure ? inputs.loanRequired / inputs.loanTenure : 0;
    
    const cashFlow = projectedPat + annualDepreciation - principalRepayment;

    const dscrNumerator = projectedPat + annualDepreciation + interest;
    const dscrDenominator = interest + principalRepayment;
    const dscr = dscrDenominator > 0 ? dscrNumerator / dscrDenominator : 0;

    loanBalance = Math.max(0, loanBalance - principalRepayment);
    accumulatedReserves += projectedPat;
    accumulatedDepreciation += annualDepreciation;

    const shareCapital = inputs.ownContribution;
    const reserves = accumulatedReserves;
    const longTermLoan = loanBalance;
    const totalLiabilities = shareCapital + reserves + longTermLoan;

    const netFixedAssets = Math.max(0, initialGrossBlock - accumulatedDepreciation);
    const currentAssets = totalLiabilities - netFixedAssets;
    const totalAssets = netFixedAssets + currentAssets;

    projections.push({
      year: i,
      revenue: Math.round(currentRevenue * 100) / 100,
      expense: Math.round(expense * 100) / 100,
      ebitda: Math.round(ebitda * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      depreciation: Math.round(annualDepreciation * 100) / 100,
      pbt: Math.round(pbt * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      pat: Math.round(projectedPat * 100) / 100,
      cashFlow: Math.round(cashFlow * 100) / 100,
      dscr: Math.round(dscr * 100) / 100,
      shareCapital: Math.round(shareCapital * 100) / 100,
      reserves: Math.round(reserves * 100) / 100,
      longTermLoan: Math.round(longTermLoan * 100) / 100,
      totalLiabilities: Math.round(totalLiabilities * 100) / 100,
      netFixedAssets: Math.round(netFixedAssets * 100) / 100,
      currentAssets: Math.round(currentAssets * 100) / 100,
      totalAssets: Math.round(totalAssets * 100) / 100
    });
  }

  return projections;
};

function calculateIRR(values: number[], guess = 0.1): number {
  const maxIter = 1000;
  const precision = 1e-5;
  let x = guess;

  for (let i = 0; i < maxIter; i++) {
    let fValue = 0;
    let fDerivative = 0;

    for (let j = 0; j < values.length; j++) {
      fValue += values[j] / Math.pow(1 + x, j);
      fDerivative += -j * values[j] / Math.pow(1 + x, j + 1);
    }

    if (Math.abs(fDerivative) < 1e-9) break;

    const newX = x - fValue / fDerivative;
    if (Math.abs(newX - x) < precision) return newX * 100;
    x = newX;
  }
  return x * 100;
}

function calculateNPV(rate: number, initialInvestment: number, cashFlows: number[]): number {
    let npv = -initialInvestment;
    for (let i = 0; i < cashFlows.length; i++) {
        npv += cashFlows[i] / Math.pow(1 + rate, i + 1);
    }
    return npv;
}

export const calculateMetrics = (projections: YearProjection[], inputs: FinancialInputs): FinancialMetrics => {
    const equityCashFlows = projections.map(p => p.cashFlow);
    const flowsForIRR = [-inputs.ownContribution, ...equityCashFlows];
    
    const irr = calculateIRR(flowsForIRR);
    const npv = calculateNPV(0.10, inputs.ownContribution, equityCashFlows);
    const totalDscr = projections.reduce((sum, p) => sum + p.dscr, 0);
    const avgDscr = totalDscr / projections.length;
    
    // Payback Period: Years until cumulative cash flow becomes positive
    let cumulativeCash = -inputs.ownContribution;
    let paybackPeriod = 5; // Default max
    for(let i=0; i<equityCashFlows.length; i++) {
        cumulativeCash += equityCashFlows[i];
        if (cumulativeCash >= 0) {
             // Precise calculation
             const prevBalance = cumulativeCash - equityCashFlows[i];
             const fraction = Math.abs(prevBalance) / equityCashFlows[i];
             paybackPeriod = i + fraction;
             break;
        }
    }
    
    const avgPat = projections.reduce((sum, p) => sum + p.pat, 0) / projections.length;
    const roi = (avgPat / inputs.projectCost) * 100;

    return {
        irr: Math.round(irr * 100) / 100,
        npv: Math.round(npv * 100) / 100,
        avgDscr: Math.round(avgDscr * 100) / 100,
        paybackPeriod: Math.round(paybackPeriod * 10) / 10,
        roi: Math.round(roi * 100) / 100
    };
};

export const calculateScenario = (baseInputs: FinancialInputs, type: 'Base' | 'Optimistic' | 'Pessimistic', modifiers: { growth: number, margin: number, interest: number }): ScenarioResult => {
    const inputs = { ...baseInputs };
    inputs.revenueGrowthRate = modifiers.growth;
    inputs.netMargin = modifiers.margin;
    inputs.interestRate = modifiers.interest;

    const projections = calculateProjections(inputs);
    const metrics = calculateMetrics(projections, inputs);

    return {
        type,
        inputs,
        projections,
        metrics
    };
};

export const assessFinancialRisks = (metrics: FinancialMetrics, projections: YearProjection[], inputs: FinancialInputs): RiskFlag[] => {
    const risks: RiskFlag[] = [];
    let idCounter = 1;

    // 1. DSCR Check
    if (metrics.avgDscr < 1.0) {
        risks.push({
            id: `R${idCounter++}`,
            level: 'CRITICAL',
            metric: 'Avg DSCR',
            value: metrics.avgDscr.toFixed(2),
            message: 'Debt Service Coverage Ratio is below 1.0. Project cannot service its debt obligations.'
        });
    } else if (metrics.avgDscr < 1.25) {
         risks.push({
            id: `R${idCounter++}`,
            level: 'HIGH',
            metric: 'Avg DSCR',
            value: metrics.avgDscr.toFixed(2),
            message: 'DSCR is below the bank benchmark of 1.25. Loan rejection likely.'
        });
    }

    // 2. Cash Flow Check
    const negativeCashYears = projections.filter(p => p.cashFlow < 0).length;
    if (negativeCashYears > 0) {
        risks.push({
            id: `R${idCounter++}`,
            level: 'HIGH',
            metric: 'Cash Flow',
            value: `${negativeCashYears} Yrs`,
            message: `Project has negative net cash flow for ${negativeCashYears} years. Liquidity crunch warning.`
        });
    }

    // 3. Debt to Equity Ratio Check
    // DER = Loan / Own Contribution
    const der = inputs.loanRequired / inputs.ownContribution;
    if (der > 3.0) {
         risks.push({
            id: `R${idCounter++}`,
            level: 'MEDIUM',
            metric: 'Debt/Equity',
            value: der.toFixed(2),
            message: 'High Leverage. Promoters contribution is low relative to debt.'
        });
    }

    // 4. ROI Check
    if (metrics.roi < inputs.interestRate) {
        risks.push({
            id: `R${idCounter++}`,
            level: 'MEDIUM',
            metric: 'ROI vs Interest',
            value: `${metrics.roi.toFixed(2)}%`,
            message: 'Return on Investment is lower than the Interest Rate. Project may not be economically efficient.'
        });
    }

    return risks;
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value * 100000); 
};

export const formatLakhs = (value: number) => {
    return `₹${value.toFixed(2)} Lakhs`;
}
