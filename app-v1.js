import express from 'express';
import { notFound, mongoseErrors, developmentErrors, catchErrors, productionErrors } from './handlers/errorHandler.js';

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extebded: true }))

app.use(notFound);
app.use(mongoseErrors);
if (process.env.NODE_ENV === 'DEVELOPMENT') {
    app.use(developmentErrors);
} else {
    app.use(productionErrors)
}

