import * as React from 'react';
import { match as RMatch } from 'react-router-dom';
import {
  DetailsPage,
  PageComponentProps,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk/api';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
// import { Cluster as AICluster, Host as AIHost } from 'openshift-assisted-ui-lib/dist/src/api';
import { Cluster as AICluster } from 'openshift-assisted-ui-lib/dist/src/api';
import { ClusterProgress } from 'openshift-assisted-ui-lib';

type ClusterInstallRef = {
  group: string;
  kind: string;
  version: string;
  name: string;
};

type ClusterDeploymentK8sResource = K8sResourceCommon & {
  spec?: {
    baseDomain: string;
    clusterInstallRef: ClusterInstallRef;
    clusterName: string;
    platform: {
      agentBaremetal: {
        agentSelector: any;
        // agentSelector: Selector;
      };
    };
  };
};

type AgentClusterInstallK8sResource = K8sResourceCommon & {
  spec?: {
    apiVip: string;
    ingressVip: string;
  };
};

type AgentK8sResource = K8sResourceCommon & {};

type ClusterDeploymentDetailsProps = {
  match: RMatch<{ name: string }>;
};

const ClusterDeploymentDetails: React.FC<ClusterDeploymentDetailsProps> = (props) => {
  const { match } = props;

  return (
    <DetailsPage
      {...props}
      kind="hive.openshift.io~v1~ClusterDeployment"
      name={match.params.name}
      namespace="assisted-installer"
      menuActions={[]}
      resources={[
        {
          kind: 'extensions.hive.openshift.io~v1beta1~AgentClusterInstall',
          prop: 'agentClusterInstall',
          name: 'test-agent-cluster-install',
          namespace: 'assisted-installer',
          isList: false,
          optional: false,
        },
      ]}
      pages={[
        {
          href: '',
          nameKey: 'Details',
          component: ClusterDetail,
        },
      ]}
    />
  );
};

export default ClusterDeploymentDetails;

// const getAIHosts = (agents: AgentK8sResource[]) => agents.map((agent): AIHost => ({
//   kind: '',
//   id:,
//   href:,
//   status:,
//   statusInfo:,
// });

const getAICluster = (
  clusterDeployment: ClusterDeploymentK8sResource,
  agentClusterInstall: AgentClusterInstallK8sResource,
  agents: AgentK8sResource[],
): AICluster => ({
  id: clusterDeployment.metadata.uid,
  kind: 'Cluster',
  href: '',
  name: clusterDeployment.spec.clusterName,
  baseDnsDomain: clusterDeployment.spec.baseDomain,
  apiVip: agentClusterInstall.spec.apiVip,
  ingressVip: agentClusterInstall.spec.ingressVip,
  status: 'installing',
  statusInfo: '',
  imageInfo: {},
  monitoredOperators: [],
  // hosts: getAIHosts(agents),
});

type DetailsTabProps = React.PropsWithChildren<PageComponentProps<ClusterDeploymentK8sResource>> & {
  agentClusterInstall: K8sResourceCommon;
};

export const ClusterDetail = (props: DetailsTabProps) => {
  console.log('props', props);
  const { obj: clusterDeployment, agentClusterInstall } = props;

  const [agents, agentsLoaded, agentsError] = useK8sWatchResource<AgentK8sResource[]>({
    kind: `agent-install.openshift.io~v1beta1~Agent`,
    isList: true,
    selector: clusterDeployment.spec.platform.agentBaremetal.agentSelector,
    namespaced: true,
  });

  if (agentsError) throw new Error(agentsError);

  if (agentsLoaded) {
    console.log('agents', agents);
    const cluster = getAICluster(clusterDeployment, agentClusterInstall, agents);
    return (
      <div className="co-m-pane__body">
        {/* <pre style={{ fontSize: 10 }}>{JSON.stringify(clusterDeployment, null, 2)}</pre>
      <pre style={{ fontSize: 10 }}>{JSON.stringify(agentClusterInstall, null, 2)}</pre> */}
        <ClusterProgress cluster={cluster} />
      </div>
    );
  }
};
