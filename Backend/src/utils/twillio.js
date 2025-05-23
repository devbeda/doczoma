import twilio from 'twilio'
import dotenv from 'dotenv'
dotenv.config()

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

export const sendOtpSMS = async (phoneNo, otp) => {
  const message = `Your OTP is ${otp}. Do not share it with anyone.`

  await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phoneNo,
  })
}
