import Ajv, { type ValidateFunction } from 'ajv';

// Validates the *shape* of model JSON responses. Permissive (additional
// properties allowed) but guarantees the fields the UI depends on exist.
const ajv = new Ajv({ allErrors: true });

const analysisValidator = ajv.compile({
  type: 'object',
  required: ['summary', 'overallScore', 'patterns', 'communicationStyle', 'persona'],
  properties: {
    overallScore: { type: 'number' },
    patterns: { type: 'object' },
    communicationStyle: { type: 'object' },
    persona: {
      type: 'object',
      required: ['coreRules', 'expressionStyle'],
      properties: {
        coreRules: { type: 'array' },
        expressionStyle: { type: 'object' },
      },
      additionalProperties: true,
    },
  },
  additionalProperties: true,
});

const predictionValidator = ajv.compile({
  type: 'object',
  required: ['likelihood', 'predictedTone', 'likelyResponse', 'reasoning'],
  properties: {
    likelihood: { type: 'number' },
  },
  additionalProperties: true,
});

const imageValidator = ajv.compile({
  type: 'object',
  required: ['summary', 'overallRead'],
  additionalProperties: true,
});

function check(validator: ValidateFunction, data: unknown, label: string): void {
  if (!validator(data)) {
    throw new Error(`${label} response failed validation: ${ajv.errorsText(validator.errors)}`);
  }
}

export const validateAnalysis = (d: unknown) => check(analysisValidator, d, 'Analysis');
export const validatePrediction = (d: unknown) => check(predictionValidator, d, 'Prediction');
export const validateImage = (d: unknown) => check(imageValidator, d, 'Image analysis');
