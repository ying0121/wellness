# The Heights Wellness

A comprehensive medical wellness web application for The Heights Wellness Medical Service.

## Description

The Heights Wellness is a full-stack web application built with Node.js and Express, designed to provide medical services, patient management, and administrative functionality. The platform supports bilingual content (English/Spanish) and includes features for patient services, appointments, payments, education resources, and more.

## Features

- **Patient Portal**: Patient registration, authentication, and profile management
- **Admin Dashboard**: Comprehensive admin panel for managing clinic operations
- **Services Management**: Service listings and booking system
- **Payment Integration**: Stripe payment processing
- **Multi-language Support**: English and Spanish language support
- **Education Resources**: Educational documents and videos
- **Newsletter System**: Newsletter creation and distribution
- **Survey System**: Patient surveys and feedback collection
- **Vault System**: Secure document storage for patients
- **Contact Management**: Contact form and communication tracking
- **Letter Management**: Medical letter generation and management
- **Insurance Management**: Insurance information and processing
- **Staff & Doctor Management**: Staff and doctor profile management

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL with Sequelize ORM
- **Template Engine**: EJS
- **Authentication**: JWT, bcryptjs, express-session
- **Payment**: Stripe
- **Email**: Nodemailer
- **File Upload**: Multer
- **Other**: Twilio (SMS), QR Code generation, SVG Captcha

## Prerequisites

- Node.js (v14 or higher)
- MySQL database
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone git@github.com:ying0121/wellness.git
cd wellness
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
# Database Configuration
DB_HOST=your_db_host
DB_NAME=your_database_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Server Configuration
PORT=7000
SITE_URL=http://localhost:7000

# Session Configuration
SESSION_KEY=your_session_secret_key

# Stripe Configuration
STRIPE_PUBLIC_KEY=your_stripe_public_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# Email Configuration
EMAIL_HOST=your_email_host
EMAIL_PORT=your_email_port
EMAIL_USER=your_email_user
EMAIL_PASSWORD=your_email_password

# Encryption
ENCRYPT_PUBLIC_KEY=your_encryption_public_key

# Twilio (Optional - for SMS)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
```

4. Set up the database:
   - Create a MySQL database
   - Update the database connection details in `.env`
   - The application will connect to the database on startup

5. Run the application:
```bash
npm start
```

The application will be available at `http://localhost:7000` (or the port specified in your `.env` file).

## Project Structure

```
├── controllers/          # Route controllers
│   ├── admin/           # Admin panel controllers
│   └── ...              # Public controllers
├── models/              # Sequelize database models
├── routes/              # Express routes
│   ├── admin/          # Admin routes
│   └── ...             # Public routes
├── views/               # EJS templates
│   ├── admin/          # Admin panel views
│   ├── pages/          # Public pages
│   └── email/          # Email templates
├── public/              # Static assets
│   ├── assets/         # CSS, JS, images
│   └── ...
├── middlewares/         # Custom middleware
├── utils/              # Utility functions
├── index.js            # Application entry point
└── package.json        # Dependencies and scripts
```

## Available Scripts

- `npm start` - Start the development server with nodemon
- `npm test` - Run tests (currently not configured)

## Environment Variables

Make sure to configure all required environment variables in your `.env` file. See the Installation section for the list of required variables.

## Database

The application uses Sequelize ORM to interact with MySQL. Database models are defined in the `models/` directory. The application will connect to the database on startup.

## Security

- Passwords are hashed using bcryptjs
- Session-based authentication
- JWT tokens for API authentication
- Environment variables for sensitive configuration
- SVG Captcha for form protection

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

ISC

## Author

ying

## Version

2.0.0

