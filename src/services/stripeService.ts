export interface CreateCheckoutParams {
  assessmentId: string;
  advisorEmail: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CheckoutSession {
  sessionId: string;
  url: string;
}

export const stripeService = {
  async createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutSession> {
    const response = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create checkout session');
    }

    const data = await response.json();
    return data;
  },

  async redirectToCheckout(params: CreateCheckoutParams): Promise<void> {
    try {
      const session = await this.createCheckoutSession(params);

      if (session.url) {
        window.location.href = session.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error redirecting to checkout:', error);
      throw error;
    }
  }
};
