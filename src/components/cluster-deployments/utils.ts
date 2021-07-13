import {
  AgentClusterInstallK8sResource,
  getClusterStatus,
} from 'openshift-assisted-ui-lib/dist/cim';

export const canEditCluster = (agentClusterInstall?: AgentClusterInstallK8sResource): boolean => {
  if (!agentClusterInstall) {
    return false;
  }
  const [status] = getClusterStatus(agentClusterInstall);
  return ['insufficient', 'ready', 'pending-for-input'].includes(status);
};
