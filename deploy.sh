#!/bin/bash
# exit on error
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
timestamp=$(date +%s)

# text color settings.
yellow=`tput setaf 3`
reset=`tput sgr0`

# default settings.
projectId="deepq-dev"
clusterId="deepq-dev"
namespace=""

# read flags.
while getopts p:c:n: option
do
  case $option in
  p)  projectId=$OPTARG;;
  c)  clusterId=$OPTARG;;
  n)  namespace=$OPTARG;;
  ?)  echo "Usage: deploy.sh [-p projectId] [-c clusterId] [-i ip] [-n namespace]"
      exit 1
  esac
done

# show confirm prompt.
echo "${yellow}Prepare to deploy es-web to project:${projectId} cluster:${clusterId} ip:${ip} namespace:${namespace}, continue?${reset}"
select yn in "Yes" "No"; do
    case $yn in
        Yes ) break;;
        No ) exit;;
    esac
done

echo "${yellow}switch to project ${projectId}...${reset}"
gcloud config set project $projectId

echo "${yellow}get credentials for cluster ${clusterId}${reset}"
gcloud container clusters get-credentials $clusterId

echo "${yellow}start to build docker image...${reset}"
cd $DIR && docker build -t "gcr.io/$projectId/es-web:$timestamp" .

echo "${yellow}push the image to gcloud...${reset}"
cd $DIR && gcloud docker -- push "gcr.io/$projectId/es-web"

echo "${yellow}replace the image tag...${reset}"
cd $DIR && sed -i.bak "s#{image}#gcr.io/$projectId/es-web:$timestamp#g" deployment.yaml

echo "${yellow}deploy the web...${reset}"
cd $DIR && kubectl apply -f deployment.yaml -n $namespace

echo "${yellow}rollback the yaml...${reset}"
cd $DIR && mv deployment.yaml.bak deployment.yaml

echo "${yellow}deployment is done!!!${reset}"
