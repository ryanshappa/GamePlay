import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { subject, details } = req.body;

    if (!subject || !details) {
      return res.status(400).json({ error: 'Subject and details are required.' });
    }

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail', 
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, 
        subject: `Report Form Submission: ${subject}`,
        text: details,
      });

      res.status(200).json({ message: 'Report submitted successfully.' });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ error: 'Failed to submit report.' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed.' });
  }
}
