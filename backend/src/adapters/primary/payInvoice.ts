import { APIGatewayProxyHandler } from 'aws-lambda';
import { connectToDatabase } from '../../infrastructure/DbConfig';
import { MongoUserRepository } from '../secondary/mongo/MongoUserRepository';
import { MongoTransactionRepository } from '../secondary/mongo/MongoTransactionRepository';
import { LNBitsService } from '../secondary/lnbits/LNBitsService';
import { Transaction, TransactionStatus, TransactionType } from '../../core/entities/Transaction';
import { PayInvoiceRequest } from './api-types';
import { randomUUID } from 'crypto';

const lnBitsService = new LNBitsService();
const userRepository = new MongoUserRepository();
const transactionRepository = new MongoTransactionRepository();

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Pay Invoice Request:', event.body);
  try {
    await connectToDatabase();
    
    // Parse body safely
    const body: PayInvoiceRequest = JSON.parse(event.body || '{}');
    const { userId, invoice } = body;

    // Validate Input
    if (!userId || !invoice) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ message: 'Missing userId or invoice' }),
      };
    }

    // 1. Get User
    let user = await userRepository.findById(userId);
    if (!user && (userId.startsWith('btv_') || userId.includes('('))) {
        user = await userRepository.findByIdentity(userId);
    }
    
    if (!user) {
      return {
        statusCode: 404,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ message: 'User not found' }),
      };
    }

    // Check if user has wallet
    console.log(`User found: ${user.identity}, ID: ${user.id}`);
    console.log(`User Wallet keys:`, user.wallet);
    
    if (!user.wallet || !user.wallet.adminKey || !user.wallet.invoiceKey) {
        return {
            statusCode: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ message: 'User wallet not configured' }),
        };
    }

    // 2. Decode Invoice
    console.log(`Decoding invoice for user ${user.id}`);
    const decoded = await lnBitsService.decodeInvoice(user.wallet.invoiceKey, invoice);
    
    if (!decoded.amount || decoded.amount <= 0) {
         return {
            statusCode: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ message: 'Factura sin monto. Por favor usa una factura que especifique la cantidad a pagar.' }),
        };
    }
    
    console.log(`Invoice Amount: ${decoded.amount} sats`);

    // 3. Check Balance
    console.log(`User balance: ${user.balance} sats. Required: ${decoded.amount} sats`);
    if (user.balance < decoded.amount) {
        return {
            statusCode: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ 
                message: `Saldo insuficiente. Tienes ${user.balance} sats y el pago requiere ${decoded.amount} sats.` 
            }),
        };
    }

    // 4. Pay Invoice via LNBits
    console.log(`Paying invoice... using adminKey: ${user.wallet.adminKey.substring(0, 5)}...`);
    const payment = await lnBitsService.payInvoice(user.wallet.adminKey, invoice);
    console.log('Payment successful. Hash:', payment.paymentHash);

    // Parse body safely
    const bodyWithFiat: PayInvoiceRequest = JSON.parse(event.body || '{}');
    const { fiatAmount, fiatCurrency } = bodyWithFiat;

    // 5. Update Balance (Decrement)
    user.balance -= decoded.amount;
    await userRepository.save(user);

    // 6. Record Transaction
    // Permitimos guardar si no existe, o si existe pero con tipo diferente (ej. pago interno: INCOMING -> OUTGOING)
    const existingTx = await transactionRepository.findByPaymentHash(payment.paymentHash);
    console.log(`Checking existing transaction for hash ${payment.paymentHash}:`, existingTx ? { userId: existingTx.userId, type: existingTx.type } : 'Not found');
    
    const shouldSave = !existingTx || existingTx.type !== TransactionType.OUTGOING;

    if (shouldSave) {
        const transaction = new Transaction(
          randomUUID(),
          user.id!,
          payment.paymentHash,
          invoice, 
          decoded.amount, // <--- Amount POSITIVE, differentiated by type: OUTGOING
          'SAT',
          decoded.memo || 'Withdrawal',
          TransactionStatus.COMPLETED, 
          TransactionType.OUTGOING, // <--- New type field
          new Date(),
          new Date(),
          fiatAmount,
          fiatCurrency
        );

        await transactionRepository.save(transaction);
        console.log('Transaction saved:', transaction.id);
    } else {
        console.log('Transaction with hash already exists, skipping save.');
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        paymentHash: payment.paymentHash,
      }),
    };

  } catch (error: any) {
    console.error('Pay Invoice Error:', error.response?.data || error);
    // Extraemos el mensaje de error de LNBits o del error local
    const rawError = error.response?.data?.detail || error.response?.data?.message || error.message || "";
    const statusCode = error.response?.status || 500;
    
    // Mapeo de errores a mensajes amigables en español
    let friendlyMessage = rawError;

    // Buscamos palabras clave en todo el string del error (incluyendo errores envueltos)
    const errorString = rawError.toLowerCase();

    if (errorString.includes('only internal invoices')) {
        friendlyMessage = 'LNBits tiene restringidos los pagos externos en esta instancia. Intenta con una factura de Biterva (interna).';
    } else if (errorString.includes('already paid') || errorString.includes('already_paid')) {
        friendlyMessage = 'Esta factura ya ha sido pagada anteriormente.';
    } else if (errorString.includes('insufficient balance') || errorString.includes('not enough funds') || errorString.includes('insufficient_balance')) {
        friendlyMessage = 'Saldo insuficiente en tu billetera de Lightning.';
    } else if (errorString.includes('no route') || errorString.includes('no_route')) {
        friendlyMessage = 'No se encontró una ruta para realizar el pago. Este destino podría estar desconectado o ser inaccesible.';
    } else if (errorString.includes('expired')) {
        friendlyMessage = 'La factura ha expirado. Por favor genera una nueva.';
    } else if (errorString.includes('invalid') || errorString.includes('malformed')) {
        friendlyMessage = 'La factura Lightning no es válida.';
    }

    return {
      statusCode,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: friendlyMessage }),
    };
  }
};
