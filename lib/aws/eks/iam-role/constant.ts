export const iamRolePolicyPrefix = 'arn:aws:iam::aws:policy/';
export const policies: string[] = ['AmazonEKSClusterPolicy', 'AmazonEKSVPCResourceController'];
export const eksRolePolicyArns = policies.map((policy) => `${iamRolePolicyPrefix}${policy}`);
export const eksServiceIdentifier = 'eks.amazonaws.com';