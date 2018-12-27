ENV VARS:
CLUSTER_URL: 'http://192.168.99.101:8443'
CLUSTER_TOKEN: Authorization Bearer
CLUSTER_CA: certificate of cluster


docker build -t andriicodefresh/cf-k8s-agent .
docker push andriicodefresh/cf-k8s-agent
docker run -d andriicodefresh/cf-k8s-agent --port 9020:9020
docker start cf-k8s-agent

kubectl apply -f agent-deployment.yaml
kubectl apply -f agent-service.yaml

kubectl delete -f agent-deployment.yaml

minikube start --kubernetes-version=v1.7.0 --extra-config=apiserver.Authorization.Mode=RBAC
#kubectl create clusterrolebinding add-on-cluster-admin --clusterrole=cluster-admin --serviceaccount=kube-system:default
kubectl create clusterrolebinding binding1 --clusterrole=cluster-admin --user=system:serviceaccount:default:default
minikube dashboard
