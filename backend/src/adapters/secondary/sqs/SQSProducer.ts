import { SQS } from 'aws-sdk';

export class SQSProducer {
  private static instance: SQSProducer;
  private readonly sqs: SQS;
  private readonly queueUrl: string;

  private constructor() {
    this.sqs = new SQS({
      region: process.env.AWS_REGION || 'us-east-2',
      endpoint: process.env.IS_OFFLINE ? 'http://127.0.0.1:9324' : undefined,
      maxRetries: 0, // Fail fast in dev
      httpOptions: { timeout: 5000 },
    });
    this.queueUrl = process.env.GAMIFICATION_QUEUE_URL || 'http://127.0.0.1:9324/queue/GamificationQueue';
  }

  public static getInstance(): SQSProducer {
    if (!SQSProducer.instance) {
      SQSProducer.instance = new SQSProducer();
    }
    return SQSProducer.instance;
  }

  async sendMessage(body: any): Promise<void> {
    try {
      await this.sqs
        .sendMessage({
          QueueUrl: this.queueUrl,
          MessageBody: JSON.stringify(body),
        })
        .promise();
      console.log('Message sent to SQS:', body);
    } catch (error) {
      console.error('Error sending message to SQS:', error);
      throw new Error('Failed to send SQS message');
    }
  }
}
