# GamePlay

An online platform that allows users to upload, share, and play games built with Unity and Godot engines directly in the browser.

## **Table of Contents**

- [About the Project](#about-the-project)
- [Features](#features)
- [Built With](#built-with)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Development](#development)
- [Deployment](#deployment)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## **About the Project**

This project is a web application that allows game developers to:

- Upload their Unity or Godot games packaged as zip files.
- Have their games processed and hosted for play directly in the browser.
- Share their games with others and receive feedback.

Players can:

- Browse and search for games.
- Play games directly in the browser without the need for additional downloads.
- Interact with the community by commenting and rating games.

## **Features**

- **User Authentication:** Secure sign-up and sign-in using Clerk (or Supabase, if migrated).
- **Game Uploads:** Support for uploading Unity and Godot games.
- **File Processing:** AWS Lambda function to process and extract game files.
- **Cloud Storage:** Amazon S3 for storing uploaded and processed game files.
- **Search Functionality:** Integrated with Algolia for fast and efficient game searching.
- **Responsive Design:** Mobile-friendly interface using modern UI components.

## **Built With**

- **Frontend:**
  - [Next.js](https://nextjs.org/) - React framework for server-rendered applications.
  - [TypeScript](https://www.typescriptlang.org/) - Typed superset of JavaScript.
  - [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework.
- **Backend:**
  - [Node.js](https://nodejs.org/) - JavaScript runtime environment.
  - [Prisma](https://www.prisma.io/) - ORM for database access.
  - [PostgreSQL](https://www.postgresql.org/) - Relational database.
  - [AWS Lambda](https://aws.amazon.com/lambda/) - Serverless computing service.
  - [AWS S3](https://aws.amazon.com/s3/) - Object storage service.
  - [Algolia](https://www.algolia.com/) - Search and discovery platform.
- **Authentication:**
  - [Clerk](https://clerk.dev/) - User management and authentication (or Supabase, if migrated).

## **Getting Started**

### **Prerequisites**

- **Node.js** (version 14 or later)
- **npm** (comes with Node.js) or **yarn**
- **PostgreSQL** database
- **AWS Account** with access to Lambda and S3
- **Algolia Account**

### **Installation**

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/ryanshappa/gameplay.git
   cd gameplay
