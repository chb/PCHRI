const express = require("express");
const { existsSync } = require("fs");
const { resolve } = require("path");

const app = express();

app.set("view engine", "pug");
app.set("views", "templates");
app.enable("view cache");

app.get("/favicon.ico", (req, res) => res.status(404).end());

// app.get("/", (req, res) => res.redirect("/2007/"));

app.use(express.static("static", { extensions: ["html"] }));

app.use(/[^\.]+$/, (req, res, next) => {
    let path = req.originalUrl
    if (path.endsWith("/")) {
        path += "index"
    }
    path = `.${path}.pug`
    if (existsSync(resolve("templates", path) )) {
        res.render(path)
    } else {
        res.status(404).render("error.pug", { name: "Page Not Found", code: 404 });
    }
});

// Global error 404 handler
app.use(function (req, res) {
    res.status(404).render("error.pug", { name: "Page Not Found", code: 404 });
});

// Global error 500 handler
app.use(function (error, req, res, next) {
    console.error(error);
    
    if (!(error instanceof Error)) {
        return res.status(400).send(error);
    }

    const hideErrors = process.env.NODE_ENV !== "development";

    res.status(500);

    try {
        res.render("error.pug", {
            code : 500,
            name : hideErrors ? "Internal Server Error" : error.message,
            stack: hideErrors ? null : error.stack
        });
    } catch {
        res.send('Internal Server Error');
    }
});

// Start the server
const server = app.listen(+(process.env.PORT || 5550), () => {
    const addr = server.address();
    // @ts-ignore
    console.log(`Server listening at http://${addr.address}:${addr.port}`);
});
