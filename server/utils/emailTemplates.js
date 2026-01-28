export const orderConfirmationTemplate = (order) => {
    return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 5px; overflow: hidden;">
        <div style="background-color: #232f3e; padding: 20px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 24px;">ShopKart</h1>
        </div>
        <div style="padding: 20px; background-color: #fff;">
            <h2 style="color: #333; margin-top: 0;">Order Confirmed!</h2>
            <p style="color: #555;">Hello ${order.user.name},</p>
            <p style="color: #555;">Thank you for shopping with us. We'll send a confirmation when your items ship.</p>
            
            <div style="background-color: #f4f4f4; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <p style="margin: 0; color: #333;"><strong>Order ID:</strong> ${order._id}</p>
                <p style="margin: 5px 0 0; color: #333;"><strong>Total Amount:</strong> ₹${order.totalPrice}</p>
            </div>

            <h3 style="color: #333; border-bottom: 2px solid #fbbf24; padding-bottom: 5px;">Order Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
                ${order.orderItems.map(item => `
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 10px 0;">${item.name} (x${item.qty})</td>
                        <td style="padding: 10px 0; text-align: right;">₹${item.price * item.qty}</td>
                    </tr>
                `).join('')}
            </table>

            <div style="margin-top: 20px;">
                <p style="color: #555;"><strong>Shipping to:</strong><br/>
                ${order.shippingAddress.address}, ${order.shippingAddress.city}<br/>
                ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}</p>
            </div>
        </div>
        <div style="background-color: #fafff5; padding: 15px; text-align: center; font-size: 12px; color: #888;">
            &copy; ${new Date().getFullYear()} ShopKart. All rights reserved.
        </div>
    </div>
    `;
};

export const orderStatusTemplate = (order, status) => {
    const color = status === "Delivered" ? "#10b981" : "#3b82f6"; // Green for Delivered, Blue for Shipped
    const message = status === "Delivered"
        ? "Your package has been delivered successfully."
        : "Great news! Your package is on its way.";

    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 5px;">
        <div style="background-color: ${color}; padding: 20px; text-align: center;">
            <h1 style="color: #fff; margin: 0;">Order ${status}</h1>
        </div>
        <div style="padding: 20px;">
            <p style="font-size: 16px; color: #333;">Hi ${order.user.name || "Customer"},</p>
            <p style="font-size: 16px; color: #333;">${message}</p>
            
            <div style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 15px;">
                <p><strong>Order ID:</strong> ${order._id}</p>
                ${order.expectedDelivery ? `<p><strong>Expected Arrival:</strong> ${new Date(order.expectedDelivery).toDateString()}</p>` : ''}
            </div>

            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/order/${order._id}" 
               style="display: inline-block; background-color: #fbbf24; color: #000; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold;">
               Track Package
            </a>
        </div>
    </div>
    `;
};