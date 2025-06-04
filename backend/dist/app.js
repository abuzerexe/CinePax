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
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: ["http://localhost:3000"],
    credentials: true
}));
app.use((req, res, next) => {
    console.log(`Incoming ${req.method} request to ${req.url}`);
    next();
});
if (process.env.NODE_ENV === 'development') {
    app.get('/', (req, res) => {
        res.send('Backend server is running!');
    });
}
else {
    const frontendPath = path_1.default.join(__dirname, '../../frontend/dist');
    console.log('Production mode - Frontend path:', frontendPath);
    if (!require('fs').existsSync(frontendPath)) {
        console.error('Frontend build not found at:', frontendPath);
    }
    app.use(express_1.default.static(frontendPath, {
        setHeaders: (res, path) => {
            if (path.endsWith('.js')) {
                res.setHeader('Content-Type', 'application/javascript');
            }
            else if (path.endsWith('.css')) {
                res.setHeader('Content-Type', 'text/css');
            }
            else if (path.endsWith('.json')) {
                res.setHeader('Content-Type', 'application/json');
            }
            else if (path.endsWith('.webmanifest')) {
                res.setHeader('Content-Type', 'application/manifest+json');
            }
        }
    }));
    console.log('Static files being served from:', frontendPath);
}
app.use('/api/', auth_route_1.default);
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
if (process.env.NODE_ENV !== 'development') {
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api/')) {
            return next();
        }
        const indexPath = path_1.default.join(__dirname, '../../frontend/dist', 'index.html');
        console.log('Serving index.html from:', indexPath);
        res.sendFile(indexPath, (err) => {
            if (err) {
                console.error('Error sending index.html:', err);
                res.status(500).json({ message: 'Something went wrong!' });
            }
        });
    });
}
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});
exports.default = app;
