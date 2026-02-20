import express, { Application, Request, Response } from "express";
import { IndexRoutes } from "./app/Routes";
import globalErrorHandler from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notfound";

const app: Application = express();

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use("/api/v1", IndexRoutes);

// middleware
app.use(globalErrorHandler);
app.use(notFound);

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to my Healthcare Backend!");
});

export default app;
