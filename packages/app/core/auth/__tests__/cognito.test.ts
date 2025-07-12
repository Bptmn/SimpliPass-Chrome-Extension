import { initCognito } from '../cognito';
import { Amplify } from 'aws-amplify';
import { getCognitoConfig, validateCognitoConfig } from '@app/core/config/platform';

// Mock AWS Amplify
jest.mock('aws-amplify', () => ({
  Amplify: {
    configure: jest.fn(),
  },
}));

// Mock platform config
jest.mock('@app/core/config/platform', () => ({
  getCognitoConfig: jest.fn(),
  validateCognitoConfig: jest.fn(),
}));

describe('Cognito Initialization', () => {
  const mockConfigure = jest.mocked(Amplify.configure);
  const mockGetCognitoConfig = jest.mocked(getCognitoConfig);
  const mockValidateCognitoConfig = jest.mocked(validateCognitoConfig);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize Cognito with valid config', async () => {
    mockGetCognitoConfig.mockResolvedValue({
      userPoolId: 'test-user-pool-id',
      userPoolClientId: 'test-client-id',
      region: 'test-region',
    });
    mockValidateCognitoConfig.mockResolvedValue(true);

    await initCognito();
    
    expect(mockConfigure).toHaveBeenCalledWith({
      Auth: {
        Cognito: {
          userPoolId: 'test-user-pool-id',
          userPoolClientId: 'test-client-id',
          region: 'test-region',
        },
      },
    });
  });

  it('should throw error with invalid config', async () => {
    mockGetCognitoConfig.mockResolvedValue({
      userPoolId: '',
      userPoolClientId: '',
      region: '',
    });
    mockValidateCognitoConfig.mockRejectedValue(new Error('Cognito configuration is incomplete'));

    await expect(initCognito()).rejects.toThrow('Cognito configuration is incomplete');
  });

  it('should not initialize twice', async () => {
    mockGetCognitoConfig.mockResolvedValue({
      userPoolId: 'test-user-pool-id',
      userPoolClientId: 'test-client-id',
      region: 'test-region',
    });
    mockValidateCognitoConfig.mockResolvedValue(true);

    await initCognito();
    await initCognito();

    expect(mockConfigure).toHaveBeenCalledTimes(1);
  });
}); 