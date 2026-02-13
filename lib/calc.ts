export interface CalculatorInput {
  /** Price per client per month (₹) */
  pricePerClient: number | null;
  /** Variable cost to serve one client per month (₹) */
  costPerClient: number | null;
  /** Total fixed costs per month (₹) */
  fixedCost: number | null;
}

export type CalculatorField = keyof CalculatorInput;

export interface ValidationError {
  field: CalculatorField;
  message: string;
}

export interface CalculatorResult {
  isValid: boolean;
  errors: ValidationError[];

  // Core unit economics
  contributionPerClient: number | null;
  contributionMarginPct: number | null;

  // Break-even
  breakEvenClients: number | null;
  breakEvenRevenue: number | null;

  // Qualitative flags
  isViable: boolean;
  warnings: string[];
}

export function validateInput(input: CalculatorInput): ValidationError[] {
  const errors: ValidationError[] = [];

  if (input.pricePerClient == null || !isFinite(input.pricePerClient)) {
    errors.push({
      field: "pricePerClient",
      message: "Price per client is required.",
    });
  } else if (input.pricePerClient <= 0) {
    errors.push({
      field: "pricePerClient",
      message: "Price per client must be greater than 0.",
    });
  }

  if (input.costPerClient == null || !isFinite(input.costPerClient)) {
    errors.push({
      field: "costPerClient",
      message: "Cost to serve one client is required.",
    });
  } else if (input.costPerClient < 0) {
    errors.push({
      field: "costPerClient",
      message: "Cost to serve one client cannot be negative.",
    });
  }

  if (input.fixedCost == null || !isFinite(input.fixedCost)) {
    errors.push({
      field: "fixedCost",
      message: "Monthly fixed cost is required.",
    });
  } else if (input.fixedCost < 0) {
    errors.push({
      field: "fixedCost",
      message: "Monthly fixed cost cannot be negative.",
    });
  }

  return errors;
}

export function calculate(
  input: CalculatorInput,
  existingErrors?: ValidationError[],
): CalculatorResult {
  const validationErrors = existingErrors ?? validateInput(input);

  if (validationErrors.length > 0) {
    return {
      isValid: false,
      errors: validationErrors,
      contributionPerClient: null,
      contributionMarginPct: null,
      breakEvenClients: null,
      breakEvenRevenue: null,
      isViable: false,
      warnings: [],
    };
  }

  const price = input.pricePerClient as number;
  const cost = input.costPerClient as number;
  const fixed = input.fixedCost as number;

  const contributionPerClient = price - cost;
  const contributionMarginPct =
    price > 0 ? (contributionPerClient / price) * 100 : null;

  const warnings: string[] = [];
  let breakEvenClients: number | null = null;
  let breakEvenRevenue: number | null = null;
  let isViable = true;

  if (contributionPerClient <= 0) {
    // You lose money or break even per client → no finite break-even point
    isViable = false;
    warnings.push(
      "Your price is too low relative to your cost. You either break even or lose money on every client.",
    );
  } else {
    if (fixed === 0) {
      breakEvenClients = 0;
      breakEvenRevenue = 0;
    } else if (fixed > 0) {
      const rawClients = fixed / contributionPerClient;
      breakEvenClients = Math.ceil(rawClients);
      breakEvenRevenue = breakEvenClients * price;
    }
  }

  if (contributionMarginPct != null) {
    if (contributionMarginPct < 20) {
      warnings.push(
        "Very thin margin per client. Any scope creep or discounting will quickly destroy profitability.",
      );
    } else if (contributionMarginPct < 35) {
      warnings.push(
        "Margin is okay but not robust. Consider increasing prices or reducing delivery cost.",
      );
    }
  }

  if (breakEvenClients != null && breakEvenClients > 25) {
    warnings.push(
      "High break-even client count. Make sure your sales capacity and market size can realistically support this.",
    );
  }

  return {
    isValid: true,
    errors: validationErrors,
    contributionPerClient,
    contributionMarginPct,
    breakEvenClients,
    breakEvenRevenue,
    isViable,
    warnings,
  };
}

