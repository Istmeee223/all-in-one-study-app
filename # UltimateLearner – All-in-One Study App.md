# UltimateLearner – All-in-One Study App

UltimateLearner is a free, open-source, all-in-one study app designed to help students and lifelong learners organize, study, and collaborate efficiently.  
**No monetization or freemium. 100% open source and free.**

## Features

- **Notes:** Rich text, audio, handwriting, markdown
- **Flashcards:** 


### 2. Install Dependencies

```sh
npm install
```

### 3. Environment Variables

Create a `.env` file in the `UltimateLearner/UltimateLearner` directory with the following:

```
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/<dbname>
OPENAI_API_KEY=sk-...
```

### 4. Database Migration

Run Drizzle migrations to set up the database schema:

```sh
npx drizzle-kit push
```

### 5. Development

#### Start the server (API + client in dev mode):

```sh
npm run dev
```

- The server runs on [http://localhost:5000](http://localhost:5000)
- The client is served via Vite middleware in development.

#### Build for Production

```sh
npm run build
```

- This builds the frontend into `dist/public`.

#### Start in Production

```sh
npm start
```

---

## Scripts

| Script         | Description                       |
| -------------- | --------------------------------- |
| `npm run dev`  | Start server & client (dev mode)  |
| `npm run build`| Build frontend for production     |
| `npm start`    | Start server (serves built client)|

---

## Technologies Used

- **Frontend:** React, Vite, Tailwind CSS, Radix UI, TanStack Query
- **Backend:** Express, Drizzle ORM, OpenAI, Multer (file uploads)
- **Database:** PostgreSQL
- **Other:** TypeScript, Zod (validation), Lucide Icons

---

## Contributing

1. Fork the repo and create your branch.
2. Make your changes.
3. Run `npm run lint` and `npm test` if available.
4. Submit a pull request!

---

## License

MIT

---

## Vision

See [copilot-instructions.md](copilot-instructions.md) for the full project vision and feature roadmap.