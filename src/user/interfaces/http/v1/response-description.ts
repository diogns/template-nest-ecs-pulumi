export enum ResponseDescription {
  OK = 'The request was successful',
  BAD_REQUEST = 'The request is not valid',
  NOT_FOUND = 'No data found matching the given request',
  INTERNAL_SERVER_ERROR = 'An unexpected error occurred inside the server',
  TOO_MANY_REQUESTS = 'Too many requests failed',
  CONFLICT = 'Data is disable for the given request',
}
