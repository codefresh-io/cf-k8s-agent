# K8S Agent

#### About
Service for monitoring cluster resources. Agent can be set as inside cluster as outside of it.

Agent starts streams for watching updates cluster resources and sends information about updated resources to [k8s-monitor](https://github.com/codefresh-io/cf-k8s-monitor) service.

The aim is to have actual state of cluster resources.

#### Content

* [Installing for using k8s-monitor on Codefresh side](#installing-for-using-k8s-monitor-on-codefresh-side)
  * [Install via helm for using with codefresh](#install-via-helm-for-using-with-codefresh)
* [Installing for standalone using](#installing-for-standalone-using)
  * [Install via helm](#install-via-helm)
* [Uninstalling agent via helm](#uninstalling-agent-via-helm)
* [Helm environment variables](#helm-environment-variables)

## Installing for using k8s-monitor on Codefresh side

For using when you want to use integration your k8s-monitor with Codefresh 

### Install via helm for using with Codefresh

1) Clone repo  
`git clone https://github.com/codefresh-io/cf-k8s-agent.git`

2) Go to dir with project  
`cd ./cf-k8s-agent` 

3) If you have one more cluster context, switch to needed with  
`kubectl config use-context <cluster_context>`  

   1) For **helm2**
   - Install **k8s-agent** chart on your cluster from this repo  
`helm upgrade k8s-agent ./k8s-agent --install --force --reset-values --set apiToken={token} --set clusterId={clusterId}`
   2) For **helm3**
   - Install **k8s-agent** chart on your cluster from this repo with helm3 support
`helm upgrade k8s-agent ./k8s-agent --install --force --reset-values --set apiToken={token} --set clusterId={clusterId} --set helm3=true`

In case if you want use configuration from UI , please use --set useConfig=true flag

Where: 
- `{token}` - API token from Codefresh (you can retrieve this from [Codefresh user settings](https://g.codefresh.io/user/settings))
- `{clusterId}` - cluster name from k8s integrations

[More helm environment variables](#helm-environment-variables)   

## Uninstalling agent via helm 
For uninstalling agent run command  
`helm del k8s-agent --purge`
