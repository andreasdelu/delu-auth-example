require("dotenv").config();
// express boilerplate
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

// Import delu-auth
const auth = require("delu-auth");

// generate a random secret for JWT (NOTE: Not recommended for production, secrets should be stored in env variables)
const jwtSecret = auth.generateJWTSecret();

// init delu-auth
auth.init({
	jwtSecret,
});

// middleware
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

// cookie parser
app.use(cookieParser());

// body parser
app.use(bodyParser.urlencoded({ extended: false }));

// express json
app.use(express.json());

// CSS
app.use(express.static(__dirname + "/styles"));

// Place sessionHandler as last middleware if possible
app.use(auth.sessionHandler);

// routes
// Login route with redirect if user is already logged in
app.get("/login", (req, res) => {
	if (req.user) {
		return res.redirect("/");
	}
	return res.sendFile(__dirname + "/views/login.html");
});

// Protected route
app.get("/protected", auth.ensureAuth, (req, res) => {
	return res.sendFile(__dirname + "/views/protected.html");
});

// Public route
app.get("/public", (req, res) => {
	return res.sendFile(__dirname + "/views/public.html");
});

// Home route
app.get("/", (req, res) => {
	return res.sendFile(__dirname + "/views/index.html");
});

// Login post route
app.post("/login", async (req, res) => {
	// get password from request body
	const { password } = req.body;

	// hash password (NOTE: This should usually be fetched from a database)
	const hashedPassword = await auth.hashPassword(password);

	// set token content
	const tokenContent = {
		id: "123",
	};

	// authenticate user
	await auth.authenticate(req, res, password, hashedPassword, tokenContent);
});

// Logout route
app.post("/logout", auth.ensureAuth, auth.logout);

app.get("*", (req, res) => {
	return res.redirect("/");
});

app.listen(port, () => {
	console.log(`Server listening on ${port}`);
});
