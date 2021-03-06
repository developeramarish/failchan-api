import cookieParser from 'cookie-parser';
import express, { Application } from 'express';
import morgan from 'morgan';
import path from 'path';

export const configAppFactory = ({ port }) => (app: Application) => {
  app.set('port', port);
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));
};

export const errorConfigAppFactory = () => (app: Application) => {
  app.use((err, req, res, next) => {
    // tslint:disable-next-line: prefer-template
    console.error('Error: ' + err);
    res.status(res.statusCode).json({ error: err });
  });
};
