interface CognitoConfig {
  UserPoolId: string;
  ClientId: string;
  Region: string;
}

const cognitoConfig: CognitoConfig = {
  UserPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID || '',
  ClientId: process.env.REACT_APP_COGNITO_CLIENT_ID || '',
  Region: process.env.REACT_APP_COGNITO_REGION || ''
};

export default cognitoConfig; 