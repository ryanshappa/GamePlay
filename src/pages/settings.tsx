import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '~/contexts/AuthContext';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';

export default function SettingsPage() {
  const [privateAccount, setPrivateAccount] = useState(false);
  const router = useRouter();
  const { user, loading } = useAuth();

  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [reportSubject, setReportSubject] = useState('');
  const [reportDetails, setReportDetails] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/sign-in');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="min-h-screen bg-background text-gray-100 p-6 flex items-center justify-center">
      <p>Loading...</p>
    </div>; 
  }

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const response = await fetch('/api/deleteAccount', { 
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
    <div className="min-h-screen bg-background text-foreground p-6 pb-12">
      <div className="w-full max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        
        <section className="mb-8 bg-muted/50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Manage Account</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-base text-muted-foreground">Account control</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <div>
                <span className="text-base">Delete account</span>
                <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
              </div>
              <Button onClick={handleDeleteAccount} variant="destructive" size="sm">Delete</Button>
            </div>
          </div>
        </section>

        <section className="mb-8 bg-muted/50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">Contact</h2>
          <p className="text-sm text-muted-foreground mb-4">Contact the Creator</p>
          <div className="space-y-4">
            <div>
              <Label htmlFor="contact-subject" className="text-sm font-medium">Subject</Label>
              <Input
                id="contact-subject"
                placeholder="Enter subject"
                value={contactSubject}
                onChange={(e) => setContactSubject(e.target.value)}
                className="mt-1 bg-background text-foreground border-input"
              />
            </div>
            <div>
              <Label htmlFor="contact-message" className="text-sm font-medium">Message</Label>
              <Textarea
                id="contact-message"
                placeholder="Type your message here..."
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                className="mt-1 h-32 bg-background text-foreground border-input"
              />
            </div>
            <Button onClick={handleContactSubmit}>
              Send Message
            </Button>
          </div>
        </section>

        <section className="bg-muted/50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">Report</h2>
          <p className="text-sm text-muted-foreground mb-4">Report any bugs or inappropriate content</p>
          <div className="space-y-4">
            <div>
              <Label htmlFor="report-subject" className="text-sm font-medium">Subject</Label>
              <Input
                id="report-subject"
                placeholder="Enter subject"
                value={reportSubject}
                onChange={(e) => setReportSubject(e.target.value)}
                className="mt-1 bg-background text-foreground border-input"
              />
            </div>
            <div>
              <Label htmlFor="report-details" className="text-sm font-medium">Details</Label>
              <Textarea
                id="report-details"
                placeholder="Describe the issue here..."
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                className="mt-1 h-32 bg-background text-foreground border-input"
              />
            </div>
            <Button onClick={handleReportSubmit}>
              Submit Report
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}