var fs=require('fs');
const util = require('../../util');

module.exports={
    "SignupPermision":{
        "Type" : "AWS::Lambda::Permission",
        "Properties" : {
            "Action" : "lambda:InvokeFunction",
            "FunctionName" : {"Fn::GetAtt":["SignupLambda","Arn"]},
            "Principal" : "cognito-idp.amazonaws.com",
            "SourceArn" : {"Fn::GetAtt":["UserPool","Arn"]}
        }
    },
    "MessagePermision":{
        "Type" : "AWS::Lambda::Permission",
        "Properties" : {
            "Action" : "lambda:InvokeFunction",
            "FunctionName" : {"Fn::GetAtt":["MessageLambda","Arn"]},
            "Principal" : "cognito-idp.amazonaws.com",
            "SourceArn" : {"Fn::GetAtt":["UserPool","Arn"]}
        }
    },
    "MessageLambda": {
      "Type": "AWS::Lambda::Function",
      "Properties": {
        "Code": {
            "ZipFile":fs.readFileSync(__dirname+'/message.js','utf8')
        },
        "Handler": "index.handler",
        "MemorySize": "128",
        "Environment":{
            "Variables":{
                "APPROVED_DOMAIN":{"Fn::If":[
                    "Domain",
                    {"Ref":"ApprovedDomain"},
                    {"Ref":"AWS::NoValue"}
                ]}
            }
        },
        "Role": {
          "Fn::GetAtt": [
            "SignupLambdaRole",
            "Arn"
          ]
        },
        "Runtime": "nodejs12.x",
        "Timeout": 300,
        "VpcConfig" : {
            "Fn::If": [ "VPCEnabled", {
                "SubnetIds": {"Ref": "VPCSubnetIdList"},
                "SecurityGroupIds": {"Ref": "VPCSecurityGroupIdList"}
            }, {"Ref" : "AWS::NoValue"} ]
        },
        "TracingConfig" : {
            "Fn::If": [ "XRAYEnabled", {"Mode": "Active"},
                {"Ref" : "AWS::NoValue"} ]
        },
        "Tags":[{
            Key:"Type",
            Value:"Cognito"
        }]

      },
      "Metadata": util.cfnNag(["W92"])
    },
    "SignupLambda": {
      "Type": "AWS::Lambda::Function",
      "Properties": {
        "Code": {
            "ZipFile":fs.readFileSync(__dirname+'/signup.js','utf8')
        },
        "Handler": "index.handler",
        "MemorySize": "128",
        "Environment":{
            "Variables":{
                "APPROVED_DOMAIN":{"Fn::If":[
                    "Domain",
                    {"Ref":"ApprovedDomain"},
                    {"Ref":"AWS::NoValue"}
                ]}
            }
        },
        "Role": {
          "Fn::GetAtt": [
            "SignupLambdaRole",
            "Arn"
          ]
        },
        "Runtime": "nodejs12.x",
        "Timeout": 300,
        "VpcConfig" : {
            "Fn::If": [ "VPCEnabled", {
                "SubnetIds": {"Ref": "VPCSubnetIdList"},
                "SecurityGroupIds": {"Ref": "VPCSecurityGroupIdList"}
            }, {"Ref" : "AWS::NoValue"} ]
        },
        "TracingConfig" : {
            "Fn::If": [ "XRAYEnabled", {"Mode": "Active"},
                {"Ref" : "AWS::NoValue"} ]
        },
        "Tags":[{
            Key:"Type",
            Value:"Cognito"
        }]
      },
      "Metadata": util.cfnNag(["W92"])
    },
    "SignupLambdaRole": {
      "Type": "AWS::IAM::Role",
      "Properties": {
        "AssumeRolePolicyDocument": {
          "Version": "2012-10-17",
          "Statement": [
            {
              "Effect": "Allow",
              "Principal": {
                "Service": "lambda.amazonaws.com"
              },
              "Action": "sts:AssumeRole"
            }
          ]
        },
        "Path": "/",
        "Policies": [
          util.basicLambdaExecutionPolicy(),
          util.lambdaVPCAccessExecutionRole(),
          util.xrayDaemonWriteAccess(),
        ],
      },
      "Metadata": util.cfnNag(["W11", "W12"])
    }
};

