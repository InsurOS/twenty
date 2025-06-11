import { Module } from '@nestjs/common';

// import { StripeBillingMeterEventService } from 'src/engine/core-modules/billing/stripe/services/stripe-billing-meter-event.service';
// import { StripeBillingMeterService } from 'src/engine/core-modules/billing/stripe/services/stripe-billing-meter.service';
// import { StripeBillingPortalService } from 'src/engine/core-modules/billing/stripe/services/stripe-billing-portal.service';
// import { StripeCheckoutService } from 'src/engine/core-modules/billing/stripe/services/stripe-checkout.service';
// import { StripeCustomerService } from 'src/engine/core-modules/billing/stripe/services/stripe-customer.service';
// import { StripePriceService } from 'src/engine/core-modules/billing/stripe/services/stripe-price.service';
// import { StripeProductService } from 'src/engine/core-modules/billing/stripe/services/stripe-product.service';
// import { StripeSubscriptionItemService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-item.service';
// import { StripeSubscriptionService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription.service';
// import { StripeWebhookService } from 'src/engine/core-modules/billing/stripe/services/stripe-webhook.service';
// import { StripeSDKModule } from 'src/engine/core-modules/billing/stripe/stripe-sdk/stripe-sdk.module';
import { LemonSDKModule } from 'src/engine/core-modules/billing/lemon/lemon-sdk/lemon-sdk.module';
import { LemonSubscriptionItemService } from 'src/engine/core-modules/billing/lemon/services/lemon-subscription-item.service';
import { LemonSubscriptionService } from 'src/engine/core-modules/billing/lemon/services/lemon-subscription.service';
import { DomainManagerModule } from 'src/engine/core-modules/domain-manager/domain-manager.module';

@Module({
  imports: [DomainManagerModule, LemonSDKModule],
  providers: [
    LemonSubscriptionService,
    LemonSubscriptionItemService,
  ],
  exports: [
    LemonSubscriptionService,
    LemonSubscriptionItemService,
  ],
})
export class LemonModule {}
