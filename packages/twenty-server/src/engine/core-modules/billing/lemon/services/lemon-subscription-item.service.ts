import { Injectable, Logger } from '@nestjs/common';

// import {
//   getAuthenticatedUser,
//   lemonSqueezySetup,
// } from "@lemonsqueezy/lemonsqueezy.js";
// import { isDefined } from 'twenty-shared/utils';


@Injectable()
export class LemonSubscriptionItemService {
  protected readonly logger = new Logger(LemonSubscriptionItemService.name);
  // private readonly lemon: Lemon;

  constructor(
    // private readonly twentyConfigService: TwentyConfigService,
    // private readonly lemonSDKService: LemonSDKService,
  ) {
    // const apiKey = import.meta.env.LEMON_SQUEEZY_API_KEY;

    // lemonSqueezySetup({
    //   apiKey,
    //   onError: (error) => console.error("Error!", error),
    // });

    // const { data, error } = await getAuthenticatedUser();

    // if (error) {
    //   console.log(error.message);
    // } else {
    //   console.log(data);
    // }
    // if (!this.twentyConfigService.get('IS_BILLING_ENABLED')) {
    //   return;
    // }
    // this.stripe = this.lemonSDKService.getStripe(
    //   this.twentyConfigService.get('BILLING_LEMON_API_KEY'),
    // );
  }

  // async updateSubscriptionItem(
  //   stripeItemId: string,
  //   updateData: Stripe.SubscriptionItemUpdateParams,
  // ) {
  //   await this.stripe.subscriptionItems.update(stripeItemId, updateData);
  // }

  // async createSubscriptionItem(
  //   stripeSubscriptionId: string,
  //   stripePriceId: string,
  //   quantity?: number,
  // ) {
  //   return this.stripe.subscriptionItems.create({
  //     subscription: stripeSubscriptionId,
  //     price: stripePriceId,
  //     ...(isDefined(quantity) ? { quantity } : {}),
  //   });
  // }

  // async deleteSubscriptionItem(stripeItemId: string, clearUsage = false) {
  //   return this.stripe.subscriptionItems.del(stripeItemId, {
  //     clear_usage: clearUsage,
  //   });
  // }
}
