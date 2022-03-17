import { IMiddleware, Middleware, Next, Req } from '@tsed/common';
import { MerchantAuthentication } from '../authorizenetServices/ChargeACreditCardTypes';

@Middleware()
export class AppendAuthorizeNetAuthentication implements IMiddleware {
  use(@Req() req: Req, @Next() next: Next) {
    const merchantAuthentication: MerchantAuthentication = {
      name: process.env.ANET_API_LOGIN_KEY,
      transactionKey: process.env.ANET_TRANSACTION_KEY
    }

    const createTransactionRequest = {
      createTransactionRequest: {
        merchantAuthentication: merchantAuthentication,
        transactionRequest: req.body
      }
    }

    req.app.locals.createTransactionRequest = createTransactionRequest
    next()
  }
}