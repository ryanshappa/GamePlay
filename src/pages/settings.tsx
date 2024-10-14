import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@clerk/nextjs';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';

export default function SettingsPage() {
  const [privateAccount, setPrivateAccount] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const userId = user?.id;

  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [reportSubject, setReportSubject] = useState('');
  const [reportDetails, setReportDetails] = useState('');

  useEffect(() => {
    if (!userId) {
      router.push('/sign-in');
    }
  }, [userId, router]);

  if (!userId) {
    return null; 
  }

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const response = await fetch('/api/users/deleteAccount', { 
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          alert('Account deleted successfully.');
          router.push('/'); 
        } else {
          const data = await response.json();
          console.error('Failed to delete account:', data.error);
          alert(`Failed to delete account: ${data.error}`);
        }
      } catch (error) {
        console.error('Failed to delete account:', error);
        alert('An error occurred while deleting your account. Please try again.');
      }
    }
  };

  const handleContactSubmit = async () => {
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: contactSubject,
          message: contactMessage,
        }),
      });

      if (response.ok) {
        alert('Message sent successfully.');
        setContactSubject('');
        setContactMessage('');
      } else {
        const data = await response.json();
        alert(`Failed to send message: ${data.error}`);
      }
    } catch (error) {
      console.error('Error sending contact message:', error);
      alert('An error occurred while sending your message. Please try again.');
    }
  };

  const handleReportSubmit = async () => {
    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: reportSubject,
          details: reportDetails,
        }),
      });

      if (response.ok) {
        alert('Report submitted successfully.');
        setReportSubject('');
        setReportDetails('');
      } else {
        const data = await response.json();
        alert(`Failed to submit report: ${data.error}`);
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('An error occurred while submitting your report. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 p-6 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-lg p-8" style={{ marginRight: 'calc(25% - 10rem)' }}>
        <section className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Manage account</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xl">Account control</span>
            </div>
            <div className="flex justify-between items-center pt-4">
              <span className="text-xl">Delete account</span>
              <Button onClick={handleDeleteAccount} variant="destructive">Delete</Button>
            </div>
          </div>
        </section>

        <div className="border-t border-gray-700 my-8"></div>

        <section className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Contact</h2>
          <p className="text-sm text-gray-400 mb-4">Contact the Creator</p>
          <div className="space-y-2">
            <Label htmlFor="contact-subject">Subject</Label>
            <Input
              id="contact-subject"
              placeholder="Enter subject"
              value={contactSubject}
              onChange={(e) => setContactSubject(e.target.value)}
              className="bg-gray-700 text-gray-100 border-gray-600"
            />
            <Label htmlFor="contact-message">Message</Label>
            <Textarea
              id="contact-message"
              placeholder="Type your message here..."
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              className="h-32 bg-gray-700 text-gray-100 border-gray-600"
            />
            <Button className="mt-2" onClick={handleContactSubmit}>
              Send Message
            </Button>
          </div>
        </section>

        <div className="border-t border-gray-700 my-8"></div>

        <section>
          <h2 className="text-3xl font-bold mb-4">Report</h2>
          <p className="text-sm text-gray-400 mb-4">Report any bugs or inappropriate content</p>
          <div className="space-y-2">
            <Label htmlFor="report-subject">Subject</Label>
            <Input
              id="report-subject"
              placeholder="Enter subject"
              value={reportSubject}
              onChange={(e) => setReportSubject(e.target.value)}
              className="bg-gray-700 text-gray-100 border-gray-600"
            />
            <Label htmlFor="report-details">Details</Label>
            <Textarea
              id="report-details"
              placeholder="Describe the issue here..."
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              className="h-32 bg-gray-700 text-gray-100 border-gray-600"
            />
            <Button className="mt-2" onClick={handleReportSubmit}>
              Submit Report
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}