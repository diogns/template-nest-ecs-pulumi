def getParameters(java.util.LinkedHashMap data){

    def parameters = [:]
    def searchAccount = data['config'].find{ it.key == 'aws:assumeRole' }?.value
    def regionToDeploy = data['config'].find{ it.key == 'aws:region' }?.value

    if(searchAccount){
        accountToDeploy = data['config']['aws:assumeRole'].split(':')[4]

        if(accountToDeploy && regionToDeploy){
            parameters.put("accountId",accountToDeploy)
            parameters.put("region",regionToDeploy)
        }
    }

    return parameters
}

def push(String fullRepositoryName, String accountToDeploy, String regionToDeploy){
    withAWS(credentials: 'aws-devops-iac', region: 'us-east-1') {
        withAWS(roleAccount: "${accountToDeploy}", role:'devops-jenkins-role-iac') {
            sh (returnStdout: false, script: "aws ecr get-login-password --region ${regionToDeploy} | docker login --username AWS --password-stdin ${accountToDeploy}.dkr.ecr.${regionToDeploy}.amazonaws.com", label: "Login ECR ...")
            sh (returnStdout: false, script: "docker push ${fullRepositoryName} -a", label: "Pushing image ...")
        }
    }
}

return this
