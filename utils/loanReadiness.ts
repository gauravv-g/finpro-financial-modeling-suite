
import { FinancialInputs, FinancialMetrics, YearProjection, BreakEvenPoint, LoanReadinessReport, DiagnosticMetric } from '../types';

export const calculateLoanReadiness = (
    inputs: FinancialInputs, 
    metrics: FinancialMetrics, 
    projections: YearProjection[],
    breakEven: BreakEvenPoint
): LoanReadinessReport => {

    const diagnostics: DiagnosticMetric[] = [];
    let totalScore = 0;
    const MAX_POSSIBLE_SCORE = 100;

    // --- 1. DEBT SERVICE COVERAGE RATIO (DSCR) [30 Points] ---
    // Benchmark: > 1.25 is Mandatory. > 1.5 is Excellent.
    let dscrScore = 0;
    let dscrStatus: 'Pass' | 'Warning' | 'Fail' = 'Fail';
    let dscrFeedback = "";
    let dscrFix = "";

    if (metrics.avgDscr >= 1.5) {
        dscrScore = 30;
        dscrStatus = 'Pass';
        dscrFeedback = "Excellent cash flow to service debt.";
    } else if (metrics.avgDscr >= 1.25) {
        dscrScore = 20;
        dscrStatus = 'Pass';
        dscrFeedback = "Meets minimum banking standards.";
    } else if (metrics.avgDscr >= 1.0) {
        dscrScore = 10;
        dscrStatus = 'Warning';
        dscrFeedback = "Cash flow is tight. High risk of default.";
        dscrFix = "Increase Loan Tenure or Reduce Loan Amount.";
    } else {
        dscrScore = 0;
        dscrStatus = 'Fail';
        dscrFeedback = "Project cannot repay loan from profits.";
        dscrFix = "Increase Equity, Reduce Loan, or Improve Margins.";
    }

    diagnostics.push({
        name: "DSCR (Repayment Capacity)",
        score: dscrScore,
        maxScore: 30,
        status: dscrStatus,
        valueDisplay: metrics.avgDscr.toFixed(2),
        benchmark: "> 1.25",
        feedback: dscrFeedback,
        fixAction: dscrFix
    });

    // --- 2. DEBT EQUITY RATIO (DER) [20 Points] ---
    // Benchmark: 2:1 is ideal. 3:1 is acceptable for MSME.
    const der = inputs.loanRequired / inputs.ownContribution;
    let derScore = 0;
    let derStatus: 'Pass' | 'Warning' | 'Fail' = 'Fail';
    let derFeedback = "";
    let derFix = "";

    if (der <= 1.5) {
        derScore = 20;
        derStatus = 'Pass';
        derFeedback = "Conservative leverage. Very safe.";
    } else if (der <= 2.5) {
        derScore = 15;
        derStatus = 'Pass';
        derFeedback = "Standard leverage ratio.";
    } else if (der <= 3.0) {
        derScore = 5;
        derStatus = 'Warning';
        derFeedback = "High leverage. Promoter stake is low.";
        derFix = "Increase Promoter Contribution.";
    } else {
        derScore = 0;
        derStatus = 'Fail';
        derFeedback = "Over-leveraged. Banks rarely fund > 3:1.";
        derFix = "Must inject more Own Capital.";
    }

    diagnostics.push({
        name: "Debt-Equity Ratio (Leverage)",
        score: derScore,
        maxScore: 20,
        status: derStatus,
        valueDisplay: der.toFixed(2),
        benchmark: "< 3.0",
        feedback: derFeedback,
        fixAction: derFix
    });

    // --- 3. BREAK-EVEN POINT (BEP) [15 Points] ---
    // Benchmark: < 60% is good.
    let bepScore = 0;
    let bepStatus: 'Pass' | 'Warning' | 'Fail' = 'Fail';
    let bepFeedback = "";

    if (breakEven.bepPercentage < 40) {
        bepScore = 15;
        bepStatus = 'Pass';
        bepFeedback = "Low risk. Profits start early.";
    } else if (breakEven.bepPercentage < 60) {
        bepScore = 10;
        bepStatus = 'Pass';
        bepFeedback = "Acceptable risk profile.";
    } else if (breakEven.bepPercentage < 75) {
        bepScore = 5;
        bepStatus = 'Warning';
        bepFeedback = "High BEP. Vulnerable to sales drop.";
    } else {
        bepScore = 0;
        bepStatus = 'Fail';
        bepFeedback = "Very risky. Requires high sales to survive.";
    }

    diagnostics.push({
        name: "Break-Even Point (Risk)",
        score: bepScore,
        maxScore: 15,
        status: bepStatus,
        valueDisplay: `${breakEven.bepPercentage.toFixed(0)}%`,
        benchmark: "< 60%",
        feedback: bepFeedback,
        fixAction: bepStatus !== 'Pass' ? "Reduce Fixed Costs (Overheads)" : undefined
    });

    // --- 4. PROMOTER CONTRIBUTION [15 Points] ---
    // Benchmark: 25% minimum usually.
    const promoterShare = (inputs.ownContribution / inputs.projectCost) * 100;
    let pcScore = 0;
    let pcStatus: 'Pass' | 'Warning' | 'Fail' = 'Fail';

    if (promoterShare >= 30) {
        pcScore = 15;
        pcStatus = 'Pass';
    } else if (promoterShare >= 25) {
        pcScore = 10;
        pcStatus = 'Pass';
    } else if (promoterShare >= 15) {
        pcScore = 5;
        pcStatus = 'Warning';
    } else {
        pcScore = 0;
        pcStatus = 'Fail';
    }

    diagnostics.push({
        name: "Promoter Contribution",
        score: pcScore,
        maxScore: 15,
        status: pcStatus,
        valueDisplay: `${promoterShare.toFixed(1)}%`,
        benchmark: "> 25%",
        feedback: pcStatus === 'Fail' ? "Skin in the game is too low." : "Adequate stake.",
        fixAction: pcStatus !== 'Pass' ? "Increase Own Capital." : undefined
    });

    // --- 5. COLLATERAL / ROI (Simulated) [20 Points] ---
    // Logic: If ROI > Interest Rate + 5%, it's economically viable.
    let roiScore = 0;
    const spread = metrics.roi - inputs.interestRate;
    
    if (spread > 10) {
        roiScore = 20;
    } else if (spread > 5) {
        roiScore = 15;
    } else if (spread > 0) {
        roiScore = 5;
    } else {
        roiScore = 0;
    }

    diagnostics.push({
        name: "Economic Viability (ROI Spread)",
        score: roiScore,
        maxScore: 20,
        status: spread > 5 ? 'Pass' : (spread > 0 ? 'Warning' : 'Fail'),
        valueDisplay: `${metrics.roi.toFixed(1)}%`,
        benchmark: `> ${inputs.interestRate + 5}%`,
        feedback: `Return is ${spread > 0 ? 'higher' : 'lower'} than cost of capital.`,
        fixAction: spread <= 0 ? "Improve Net Margins or Revenue." : undefined
    });

    // --- AGGREGATE ---
    totalScore = diagnostics.reduce((sum, d) => sum + d.score, 0);
    
    let readinessStatus: 'Approved' | 'Borderline' | 'Rejected' = 'Rejected';
    let probability = 0;
    let summary = "";

    if (totalScore >= 75) {
        readinessStatus = 'Approved';
        probability = 90;
        summary = "Highly Bankable Project. Meets or exceeds all major financial norms.";
    } else if (totalScore >= 50) {
        readinessStatus = 'Borderline';
        probability = 50;
        summary = "Viable but has weaknesses. May require additional collateral or guarantor.";
    } else {
        readinessStatus = 'Rejected';
        probability = 20;
        summary = "High Rejection Risk. Key financial ratios (DSCR/DER) are outside banking norms.";
    }

    return {
        totalScore,
        readinessStatus,
        probability,
        metrics: diagnostics,
        summary
    };
};