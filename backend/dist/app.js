"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const connect_1 = __importDefault(require("./connect"));
// Routes
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const customer_route_1 = __importDefault(require("./routes/customer.route"));
const movie_route_1 = __importDefault(require("./routes/movie.route"));
const theater_route_1 = __importDefault(require("./routes/theater.route"));
const staff_route_1 = __importDefault(require("./routes/staff.route"));
const seat_route_1 = __importDefault(require("./routes/seat.route"));
const showtime_route_1 = __importDefault(require("./routes/showtime.route"));
const ticket_route_1 = __importDefault(require("./routes/ticket.route"));
const payment_route_1 = __importDefault(require("./routes/payment.route"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const admin_route_1 = __importDefault(require("./routes/admin.route"));
dotenv_1.default.config();
(0, connect_1.default)(process.env.MONGO_URI);
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: 'https://cors-test.codehappy.dev', // your allowed origin
    credentials: true // enable if using cookies or auth headers
}));
app.use((req, res, next) => {
    console.log(`Incoming ${req.method} request to ${req.url}`);
    next();
});
if (process.env.NODE_ENV === 'development') {
    // Dev mode root route message
    app.get('/', (req, res) => {
        res.send('Backend server is running!');
    });
}
else {
    const frontendPath = path_1.default.join(__dirname, '../../frontend/dist');
    console.log('Production mode - Frontend path:', frontendPath);
    // Check if the frontend build exists
    if (!require('fs').existsSync(frontendPath)) {
        console.error('Frontend build not found at:', frontendPath);
    }
    // Serve static files from the frontend build directory
    app.use(express_1.default.static(frontendPath));
    console.log('Static files being served from:', frontendPath);
}
// API Routes - these should take precedence over the catch-all route
app.use('/api/auth', auth_route_1.default);
app.use('/api/customer', customer_route_1.default);
app.use('/api/user', user_route_1.default);
app.use('/api/movies', movie_route_1.default);
app.use('/api/theaters', theater_route_1.default);
app.use('/api/staff', staff_route_1.default);
app.use('/api/seats', seat_route_1.default);
app.use('/api/showtimes', showtime_route_1.default);
app.use('/api/tickets', ticket_route_1.default);
app.use('/api/payments', payment_route_1.default);
app.use('/api/admin', admin_route_1.default);
// Catch-all route for frontend - this should be last
if (process.env.NODE_ENV !== 'development') {
    app.get('*', (req, res) => {
        const indexPath = path_1.default.join(__dirname, '../../frontend/dist', 'index.html');
        console.log('Serving index.html from:', indexPath);
        res.sendFile(indexPath);
    });
}
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});
exports.default = app;
