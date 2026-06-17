export class NotFoundError extends Error {
  constructor(message = 'Not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ConfigMissingError extends Error {
  constructor(message = 'No model provider is configured. Add one in Settings.') {
    super(message);
    this.name = 'ConfigMissingError';
  }
}
