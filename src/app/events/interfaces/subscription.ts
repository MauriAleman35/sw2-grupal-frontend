export interface SubscriptionResponse {
    statusCode: number;
    message:    string;
    data:       Data;
}

export interface Data {
    total:         number;
    subscriptions: Subscription[];
}

export interface Subscription {
    id:         string;
    plan_type:  string;
    price:      string;
    duration:   null;
    is_active:  boolean;
    created_at: Date;
    updated_at: Date;
}

export interface SubscriptionPostParams {
    subscriptionId: string;
    name:           string;
    displayName:    string;
}
export interface SubscriptionPostResponse {
    statusCode: number;
    message:    string;
    data:       Data;
}

export interface Data {
    paymentStripe: PaymentStripe;
}

export interface PaymentStripe {
    id:                                   string;
    object:                               string;
    adaptive_pricing:                     AdaptivePricing;
    after_expiration:                     null;
    allow_promotion_codes:                null;
    amount_subtotal:                      number;
    amount_total:                         number;
    automatic_tax:                        AutomaticTax;
    billing_address_collection:           null;
    cancel_url:                           string;
    client_reference_id:                  null;
    client_secret:                        null;
    collected_information:                null;
    consent:                              null;
    consent_collection:                   null;
    created:                              number;
    currency:                             string;
    currency_conversion:                  null;
    custom_fields:                        any[];
    custom_text:                          CustomText;
    customer:                             null;
    customer_creation:                    string;
    customer_details:                     null;
    customer_email:                       null;
    discounts:                            any[];
    expires_at:                           number;
    invoice:                              null;
    invoice_creation:                     InvoiceCreation;
    livemode:                             boolean;
    locale:                               null;
    metadata:                             PaymentStripeMetadata;
    mode:                                 string;
    payment_intent:                       null;
    payment_link:                         null;
    payment_method_collection:            string;
    payment_method_configuration_details: PaymentMethodConfigurationDetails;
    payment_method_options:               PaymentMethodOptions;
    payment_method_types:                 string[];
    payment_status:                       string;
    permissions:                          null;
    phone_number_collection:              AdaptivePricing;
    recovered_from:                       null;
    saved_payment_method_options:         null;
    setup_intent:                         null;
    shipping_address_collection:          null;
    shipping_cost:                        null;
    shipping_options:                     any[];
    status:                               string;
    submit_type:                          null;
    subscription:                         null;
    success_url:                          string;
    total_details:                        TotalDetails;
    ui_mode:                              string;
    url:                                  string;
    wallet_options:                       null;
}

export interface AdaptivePricing {
    enabled: boolean;
}

export interface AutomaticTax {
    enabled:   boolean;
    liability: null;
    provider:  null;
    status:    null;
}

export interface CustomText {
    after_submit:                null;
    shipping_address:            null;
    submit:                      null;
    terms_of_service_acceptance: null;
}

export interface InvoiceCreation {
    enabled:      boolean;
    invoice_data: InvoiceData;
}

export interface InvoiceData {
    account_tax_ids:   null;
    custom_fields:     null;
    description:       null;
    footer:            null;
    issuer:            null;
    metadata:          InvoiceDataMetadata;
    rendering_options: null;
}

export interface InvoiceDataMetadata {
}

export interface PaymentStripeMetadata {
    displayName:    string;
    name:           string;
    subscriptionId: string;
    userId:         string;
}

export interface PaymentMethodConfigurationDetails {
    id:     string;
    parent: null;
}

export interface PaymentMethodOptions {
    card: Card;
}

export interface Card {
    request_three_d_secure: string;
}

export interface TotalDetails {
    amount_discount: number;
    amount_shipping: number;
    amount_tax:      number;
}

