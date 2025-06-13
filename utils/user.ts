import { CognitoUser, CognitoUserAttribute } from 'amazon-cognito-identity-js';

export function fetchUserSalt(cognitoUser: CognitoUser): Promise<string> {
  return new Promise((resolve, reject) => {
    cognitoUser.getUserAttributes((err: Error | null | undefined, attributes?: CognitoUserAttribute[]) => {
      if (err) {
        reject(err);
        return;
      }
      if (!attributes) {
        reject(new Error('No attributes returned'));
        return;
      }
      const saltAttr = attributes.find(attr => attr.getName() === 'custom:salt');
      if (saltAttr) {
        resolve(saltAttr.getValue());
      } else {
        reject(new Error('Salt attribute not found'));
      }
    });
  });
}
