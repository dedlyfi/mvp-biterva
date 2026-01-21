import type { AWS } from '@serverless/typescript';

const serverlessConfiguration = {
  service: 'biterva-backend',
  frameworkVersion: '3',
  useDotenv: true,
  plugins: ['serverless-esbuild', 'serverless-offline', 'serverless-offline-sqs', 'serverless-auto-swagger'],
  provider: {
    name: 'aws',
    runtime: 'nodejs18.x',
    region: '${env:AWS_REGION}' as AWS['provider']['region'],
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_REGION: '${env:AWS_REGION}',
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      MONGODB_URI: '${env:MONGODB_URI, "mongodb://localhost:27017/biterva"}',
      LNBITS_API_URL: '${env:LNBITS_API_URL, "https://legend.lnbits.com"}',
      LNBITS_ADMIN_KEY: '${env:LNBITS_ADMIN_KEY}',
      LNBITS_INVOICE_KEY: '${env:LNBITS_INVOICE_KEY}',
      LNBITS_MASTER_WALLET_ADMIN_KEY: '${env:LNBITS_MASTER_WALLET_ADMIN_KEY}',
      TROKERA_API_URL: '${env:TROKERA_API_URL}',
      TROKERA_API_KEY: '${env:TROKERA_API_KEY}',
      TROKERA_SECRET_KEY: '${env:TROKERA_SECRET_KEY}',
      GAMIFICATION_QUEUE_URL: 'http://localhost:9324/queue/GamificationQueue',
    },
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: ['sqs:SendMessage', 'sqs:ReceiveMessage'],
            Resource: {
              'Fn::GetAtt': ['GamificationQueue', 'Arn'],
            },
          },
        ],
      },
    },
  },
  functions: {
    userLogin: {
      handler: 'src/adapters/primary/login.handler',
      events: [
        {
          http: {
            method: 'post',
            path: 'login',
            cors: {
              origin: '*',
              headers: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token'],
              allowCredentials: false
            },
            bodyType: 'LoginRequest',
            responseData: {
              200: {
                description: 'Login successful',
                bodyType: 'UserResponse',
              },
              401: {
                description: 'Unauthorized',
                bodyType: 'ErrorResponse',
              },
            },
          },
        },
      ],
    },
    getPrice: {
      handler: 'src/adapters/primary/getPrice.handler',
      timeout: 10,
      events: [
        {
          http: {
            method: 'get',
            path: 'prices',
            cors: {
              origin: '*',
              headers: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token'],
              allowCredentials: false
            },
          },
        },
      ],
    },
    getUser: {
      handler: 'src/adapters/primary/getUser.handler',
      timeout: 30,
      events: [
        {
          http: {
            method: 'get',
            path: 'user',
            cors: {
              origin: '*',
              headers: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token'],
              allowCredentials: false
            },
          },
        },
      ],
    },
    userSignup: {
      handler: 'src/adapters/primary/signup.handler',
      events: [
        {
          http: {
            method: 'post',
            path: 'signup',
            cors: {
              origin: '*',
              headers: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token'],
              allowCredentials: false
            },
            bodyType: 'SignupRequest',
            responseData: {
              201: {
                description: 'User created successfully',
                bodyType: 'UserResponse',
              },
              400: {
                description: 'Bad Request',
                bodyType: 'ErrorResponse',
              },
            },
          },
        },
      ],
    },
    gamificationWorker: {
      handler: 'src/adapters/primary/gamificationWorker.handler',
      events: [
        {
          sqs: {
            arn: {
              'Fn::GetAtt': ['GamificationQueue', 'Arn'],
            },
            batchSize: 1,
          },
        },
      ],
    },
    createInvoice: {
      handler: 'src/adapters/primary/createInvoice.handler',
      events: [
        {
          http: {
            method: 'post',
            path: 'invoice',
            cors: {
              origin: '*',
              headers: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token'],
              allowCredentials: false
            },
            bodyType: 'CreateInvoiceRequest',
            responseData: {
              200: {
                description: 'Invoice created successfully. Returns payment request and hash.',
                bodyType: 'CreateInvoiceResponse',
              },
              400: {
                description: 'Bad Request. Missing userId or amount.',
                bodyType: 'ErrorResponse',
              },
              404: {
                description: 'User not found.',
                bodyType: 'ErrorResponse',
              },
              500: {
                description: 'Internal Server Error',
                bodyType: 'ErrorResponse',
              },
            },
          },
        },
      ],
    },
    paymentWebhook: {
      handler: 'src/adapters/primary/paymentWebhook.handler',
      events: [
        {
          http: {
            method: 'post',
            path: 'webhook',
            cors: {
              origin: '*',
              headers: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token'],
              allowCredentials: false
            },
            bodyType: 'PaymentWebhookRequest',
            responseData: {
              200: {
                description: 'Webhook processed successfully.',
                bodyType: 'ErrorResponse',
              },
              500: {
                description: 'Internal Server Error',
                bodyType: 'ErrorResponse',
              },
            },
          },
        },
      ],
    },
    payInvoice: {
      handler: 'src/adapters/primary/payInvoice.handler',
      events: [
        {
          http: {
            method: 'post',
            path: 'pay',
            cors: {
              origin: '*',
              headers: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token'],
              allowCredentials: false
            },
            bodyType: 'PayInvoiceRequest',
            responseData: {
              200: {
                description: 'Payment successful.',
                bodyType: 'PayInvoiceResponse',
              },
              400: {
                description: 'Bad Request. Insufficient funds or invalid invoice.',
                bodyType: 'ErrorResponse',
              },
              404: {
                description: 'User not found.',
                bodyType: 'ErrorResponse',
              },
              500: {
                description: 'Internal Server Error',
                bodyType: 'ErrorResponse',
              },
            },
          },
        },
      ],
    },
    withdrawToNequi: {
      handler: 'src/adapters/primary/withdraw.handler',
      events: [
        {
          http: {
            method: 'post',
            path: 'withdraw-nequi',
            cors: {
              origin: '*',
              headers: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token'],
              allowCredentials: false
            },
            bodyType: 'WithdrawRequest',
            responseData: {
              200: {
                description: 'Withdrawal successful.',
                bodyType: 'WithdrawResponse',
              },
              400: {
                description: 'Bad Request.',
                bodyType: 'ErrorResponse',
              },
              404: {
                description: 'User not found.',
                bodyType: 'ErrorResponse',
              },
              502: {
                description: 'Trokera Error.',
                bodyType: 'ErrorResponse',
              },
              500: {
                description: 'Internal Server Error',
                bodyType: 'ErrorResponse',
              },
            },
          },
        },
      ],
    },
    withdrawWorker: {
      handler: 'src/adapters/primary/withdrawWorker.handler',
      events: [
        {
          sqs: {
            arn: {
              'Fn::GetAtt': ['WithdrawalQueue', 'Arn'],
            },
            batchSize: 1,
          },
        },
      ],
    },
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node18',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
    'serverless-offline': {
      httpPort: 3001,
      host: '0.0.0.0',
      noPreflight: false,
    },
    'serverless-offline-sqs': {
      autoCreate: true,
      apiVersion: '2012-11-05',
      endpoint: 'http://127.0.0.1:9324',
      region: '${env:AWS_REGION}',
      accessKeyId: 'root',
      secretAccessKey: 'root',
      skipCacheInvalidation: false,
    },
    autoswagger: {
      title: 'Biterva API',
      apiType: 'http',
      typefiles: ['./src/adapters/primary/api-types.ts'],
      host: 'localhost:3001',
      basePath: '/dev',
      schemes: ['http'],
      useStage: false,
    },
  },
  resources: {
    Resources: {
      GamificationQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'GamificationQueue',
        },
      },
      WithdrawalQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'WithdrawalQueue',
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
