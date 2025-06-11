import { Injectable, Logger } from '@nestjs/common';

import { LemonSDKService } from 'src/engine/core-modules/billing/lemon/lemon-sdk/services/lemon-sdk.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class LemonSubscriptionService {
  protected readonly logger = new Logger(LemonSubscriptionService.name);
  // private readonly lemon: Lemon;

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly lemonSDKService: LemonSDKService,
  ) {
    if (!this.twentyConfigService.get('IS_BILLING_ENABLED')) {
      return;
    }
    // this.lemon = this.lemonSDKService.getLemon(
    //   this.twentyConfigService.get('BILLING_STRIPE_API_KEY'),
    // );
  }

  // async cancelSubscription(stripeSubscriptionId: string) {
  //   await this.lemon.subscriptions.cancel(stripeSubscriptionId);
  // }

  // async getStripeCustomerIdFromWorkspaceId(workspaceId: string) {
  //   const subscription = await this.lemon.subscriptions.search({
  //     query: `metadata['workspaceId']:'${workspaceId}'`,
  //     limit: 1,
  //   });
  //   const stripeCustomerId = subscription.data[0].customer
  //     ? String(subscription.data[0].customer)
  //     : undefined;

  //   return stripeCustomerId;
  // }

  // async collectLastInvoice(stripeSubscriptionId: string) {
  //   const subscription = await this.lemon.subscriptions.retrieve(
  //     stripeSubscriptionId,
  //     { expand: ['latest_invoice'] },
  //   );
  //   const latestInvoice = subscription.latest_invoice;

  //   if (
  //     !(
  //       latestInvoice &&
  //       typeof latestInvoice !== 'string' &&
  //       latestInvoice.status === 'draft'
  //     )
  //   ) {
  //     return;
  //   }
  //   await this.lemon.invoices.pay(latestInvoice.id);
  // }

  // async updateSubscriptionItems(
  //   stripeSubscriptionId: string,
  //   billingSubscriptionItems: BillingSubscriptionItem[],
  // ) {
  //   const stripeSubscriptionItemsToUpdate = billingSubscriptionItems.map(
  //     (item) => ({
  //       id: item.stripeSubscriptionItemId,
  //       price: item.stripePriceId,
  //       quantity: item.quantity === null ? undefined : item.quantity,
  //     }),
  //   );

  //   await this.lemon.subscriptions.update(stripeSubscriptionId, {
  //     items: stripeSubscriptionItemsToUpdate,
  //   });
  // }

  // async updateSubscription(
  //   stripeSubscriptionId: string,
  //   updateData: Stripe.SubscriptionUpdateParams,
  // ): Promise<Stripe.Subscription> {
  //   return this.lemon.subscriptions.update(stripeSubscriptionId, updateData);
  // }
}
