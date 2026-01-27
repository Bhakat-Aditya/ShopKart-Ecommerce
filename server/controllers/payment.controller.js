import Razorpay from "razorpay";
import dotenv from 'dotenv';

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createRazorpayOrder = async (req, res) => {
  const { amount } = req.body;

  const options = {
    amount: Math.round(amount * 100),
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).send(error);
  }
};

export const getRazorpayKey = (req, res) => {
    res.json({ key: process.env.RAZORPAY_KEY_ID });
};