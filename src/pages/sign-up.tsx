import { SignUp } from '@clerk/nextjs';
import { GetServerSideProps } from 'next';
import { auth } from '@clerk/nextjs/server';

const SignUpPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded shadow">
        <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
      </div>
    </div>
  );
};

// Specify that this page should not use the global Layout
SignUpPage.getLayout = (page: React.ReactElement) => page;

export default SignUpPage;