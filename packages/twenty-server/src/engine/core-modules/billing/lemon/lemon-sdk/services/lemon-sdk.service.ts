import { Injectable } from '@nestjs/common';

import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';

@Injectable()
export class LemonSDKService {
  getLemon(lemonAPIKey: string) {
    return lemonSqueezySetup({
      apiKey: lemonAPIKey,
      onError: (error) => console.error("Error!", error),
    });
  }
}
