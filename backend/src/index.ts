import express, {Request, Response} from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`The server is running at http://localhost:${PORT}`);
});