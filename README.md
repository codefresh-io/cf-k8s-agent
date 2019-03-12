# K8S Agent
#### Pay attention! 
install this service only if you have already installed [k8s-monitor](https://github.com/codefresh-io/cf-k8s-monitor) to cluster, or you want to use Codefresh API  for serving cluster state.

#### About
Service for monitoring cluster resources. Agent can be set as inside cluster as outside of it.

Agent starts streams for watching updates cluster resources and sends information about updated resources to [k8s-monitor](https://github.com/codefresh-io/cf-k8s-monitor) service.

The aim is to have actual state of cluster resources.  

## Installing for standalone using

For using when all services located on your cluster

### Install via helm

1) Clone repo  
`git clone git@github.com:codefresh-io/cf-k8s-agent.git`

2) Go to dir with project  
`cd ./cf-k8s-agent` 

3) If you have one more cluster context, switch to needed with  
`kubectl config use-context <cluster_context>`  

4) Install **k8s-agent** chart on your cluster from this repo  
`helm upgrade k8s-agent ./k8s-agent --install --force --reset-values --set apiUrl=http://k8s-monitor:9016/api/monitor`, [more helm environment variables](#helm-environment-variables)  

### Uninstalling agent via helm 
For uninstalling agent run command  
`helm del k8s-agent --purge`

### Install via codefresh-cli

1) If you have one more codefresh auth context, switch to needed with
`codefresh auth use-context <name>`
2) Install agent  
`codefresh install-agent --cluster minikube --version 0.0.18 --set apiUrl=http://k8s-monitor:9016/api/monitor --set accountId=user`, [more cli arguments](#cli-arguments)

## Installing for using k8s-monitor on Codefresh side

For using when you want to use integration your k8s-monitor with Codefresh 

### Install via helm

1) Clone repo  
`git clone git@github.com:codefresh-io/cf-k8s-agent.git`

2) Go to dir with project  
`cd ./cf-k8s-agent` 

3) If you have one more cluster context, switch to needed with  
`kubectl config use-context <cluster_context>`  

4) Install **k8s-agent** chart on your cluster from this repo  
`helm upgrade k8s-agent ./k8s-agent --install --force --reset-values --set apiToken={token} --set clusterId={clusterId}`  
    
### Install via codefresh-cli
1) If you have one more codefresh auth context, switch to needed with
`codefresh auth use-context <name>`
2) Install agent  
* `codefresh install-agent --cluster {clusterId} --version 0.0.18`

Where: 
- `{token}` - API token from Codefresh (you can retrieve this from [Codefresh integration section](https://g.codefresh.io/account-admin/account-conf/tokens))
- `{clusterId}` - cluster name from k8s integrations


## Cli arguments
* `--cluster <name>` (name of cluster for Agent installing)
* `--release-name <name>` (optional, default: agent)  
* `--version <version>` (optional, default: latest version of agent chart)


## Helm environment variables
You can use this variables for cli and helm install. Use as **--set key=value** in helm install command
* `clusterId` - (id of your cluster, set name cluster, as your name cluster on Codefresh, if you use it)
* `apiUrl` - (default: `https://g.codefresh.io/api/k8s-monitor/events`) agent use this endpoint for all work with k8s-monitor 
* `port` - (default: `80`)
* `servicePort` - (default: `80`)
