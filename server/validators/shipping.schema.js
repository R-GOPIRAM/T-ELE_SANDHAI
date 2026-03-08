const { z } = require('zod');

const createShipmentSchema = z.object({
    body: z.object({
        order_id: z.string({ required_error: 'Order ID is required' }),
        order_date: z.string({ required_error: 'Order date is required' }),
        pickup_location: z.string({ required_error: 'Pickup location is required' }),
        billing_customer_name: z.string({ required_error: 'Customer name is required' }),
        billing_last_name: z.string().optional(),
        billing_address: z.string({ required_error: 'Billing address is required' }),
        billing_city: z.string({ required_error: 'Billing city is required' }),
        billing_pincode: z.string({ required_error: 'Pincode is required' }),
        billing_state: z.string({ required_error: 'State is required' }),
        billing_country: z.string().default('India'),
        billing_email: z.string().email().optional(),
        billing_phone: z.string({ required_error: 'Phone number is required' }),
        shipping_is_billing: z.boolean().default(true),
        order_items: z.array(z.object({
            name: z.string(),
            sku: z.string(),
            units: z.number().min(1),
            selling_price: z.number().min(0)
        })),
        payment_method: z.enum(['Prepaid', 'COD']),
        sub_total: z.number().min(0),
        length: z.number().min(1),
        breadth: z.number().min(1),
        height: z.number().min(1),
        weight: z.number().min(0)
    })
});

const checkServiceabilitySchema = z.object({
    query: z.object({
        pickup_postcode: z.string({ required_error: 'Pickup postcode is required' }),
        delivery_postcode: z.string({ required_error: 'Delivery postcode is required' }),
        weight: z.string().optional(),
        cod: z.string().optional()
    })
});

module.exports = {
    createShipmentSchema,
    checkServiceabilitySchema
};
