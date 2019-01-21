ENV VARS:
CLUSTER_URL: 'http://192.168.99.101:8443'
CLUSTER_TOKEN: Authorization Bearer
CLUSTER_CA: certificate of cluster
CF_API_TOKEN: codefresh API token
CLUSTER_ID: cluster name from account's integration


docker build -t codefresh/cf-k8s-agent .
docker push codefresh/cf-k8s-agent
//docker run -d codefresh/cf-k8s-agent --port 9020:9020
//docker start cf-k8s-agent

kubectl apply -f agent-deployment.yaml
kubectl apply -f agent-service.yaml

kubectl delete -f agent-deployment.yaml

helm install ./chart/cf-k8s-agent --name agent --set CF_API_TOKEN=
helm install ./chart/cf-k8s-agent --name agent --set CLUSTER_ID=minikube
helm del --purge agent

minikube start --kubernetes-version=v1.7.0 --extra-config=apiserver.authorization-mode=RBAC
#kubectl create clusterrolebinding add-on-cluster-admin --clusterrole=cluster-admin --serviceaccount=kube-system:default
kubectl create clusterrolebinding binding1 --clusterrole=cluster-admin --user=system:serviceaccount:default:default
minikube dashboard
