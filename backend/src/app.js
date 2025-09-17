const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const apiRoutes = require('./routes/api');

// Inisialisasi app
const app = express();

// Middleware dasar
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cookieParser());

// Middleware CSRF
const csrfProtection = csrf({ cookie: true });

// Public directory untuk file statis
app.use('/public', express.static(path.join(__dirname, '../public')));

// Rate limiting untuk mencegah abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // limit IP ke 100 request per window
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Tambahkan middleware khusus untuk webhook Midtrans (tanpa validasi CSRF)
// Penting: Routes ini HARUS didefinisikan SEBELUM routes dengan CSRF protection
app.post('/api/payment-notification', express.json(), apiRoutes);
app.post('/api/payment-callback', express.json(), apiRoutes);

// Exclude order and finance routes from CSRF protection (they use JWT auth)
app.use('/api/orders', express.json(), apiRoutes);
app.use('/api/finance', express.json(), apiRoutes);

// CSRF Protection
// - Hanya terapkan pada metode yang mengubah state (POST/PUT/PATCH/DELETE)
// - Lewati untuk endpoint publik/API yang tidak menggunakan cookie session
app.use((req, res, next) => {
  const unsafeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  const isUnsafe = unsafeMethods.includes(req.method);

  // Daftar prefix route yang harus di-skip dari CSRF (publik/JWT/webhook)
  const skipCSRFPrefixes = [
    // Webhook Midtrans dan callback
    '/api/payment-notification',
    '/api/payment-callback',

    // Order & Finance (JWT)
    '/api/orders',
    '/api/finance',

    // Embed (publik)
    '/api/embed',

    // Mitra dashboard APIs (JWT)
    '/api/store-products',
    '/api/store-profile',
    '/api/store-addons',

    // Endpoint publik (GET) – listing/detail
    '/api/status',
    '/api/products',
    '/api/services',
    '/api/stores',
    '/api/auctions',
    '/api/transactions',
    '/api/snap'
  ];

  const shouldSkipByPath = skipCSRFPrefixes.some(prefix => req.path.startsWith(prefix));
  const shouldSkip = !isUnsafe || shouldSkipByPath;

  if (shouldSkip) {
    return next();
  }

  // Terapkan CSRF hanya jika tidak termasuk pengecualian
  return csrfProtection(req, res, next);
});

// Semua route API lainnya dengan CSRF protection
app.use('/api', apiRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Handling CSRF token errors
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({
      status: 'error',
      message: 'Invalid CSRF token'
    });
  }
  
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
});

module.exports = app; 